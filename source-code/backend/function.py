# Cloud Function - processes logs automatically
import base64
import json
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from google.cloud import firestore
from flask import Request

db = firestore.Client()

def process_log(request: Request):
    """HTTP Cloud Function that processes Pub/Sub messages"""
    try:
        # Parse the Pub/Sub message from the request
        envelope = request.get_json()
        
        if not envelope:
            return 'Bad Request: no JSON', 400
        
        # Decode the Pub/Sub message
        if not isinstance(envelope, dict) or 'message' not in envelope:
            return 'Bad Request: missing message', 400
        
        pubsub_message = envelope['message']
        
        # Decode the base64 data
        if isinstance(pubsub_message, dict) and 'data' in pubsub_message:
            data = base64.b64decode(pubsub_message['data']).decode('utf-8')
        else:
            return 'Bad Request: missing data', 400
        
        log = json.loads(data)
        
        # Extract data (supports both formats)
        severity = log.get('severity', 'UNKNOWN')
        message = log.get('textPayload') or log.get('message', 'No message')
        timestamp = log.get('timestamp', '')
        source = log.get('source', 'unknown')
        
        # Handle nested labels if present
        if 'labels' in log and 'source' in log['labels']:
            source = log['labels']['source']
        
        # Step 4: Save to Firestore (Storage as per proposal)
        db.collection('logs').add({
            'severity': severity,
            'message': message,
            'source': source,
            'timestamp': timestamp,
            'created_at': firestore.SERVER_TIMESTAMP
        })
        
        # Step 6: Send email for critical issues (Alerts as per proposal)
        if severity in ['ERROR', 'CRITICAL']:
            send_email(severity, message, source, timestamp)
        
        return 'Done', 204
    
    except json.JSONDecodeError as e:
        print(f"JSON decode error: {str(e)}")
        return 'Bad Request: invalid JSON', 400
    except Exception as e:
        print(f"Error processing log: {str(e)}")
        return f'Error: {str(e)}', 500

def send_email(severity, message, source, timestamp):
    sender = os.environ.get('SENDER_EMAIL')
    receiver = os.environ.get('RECEIVER_EMAIL')
    password = os.environ.get('EMAIL_PASSWORD')
    
    if not all([sender, receiver, password]):
        print(f"Email credentials not configured, skipping alert")
        return
    
    email = MIMEMultipart()
    email['From'] = sender
    email['To'] = receiver
    email['Subject'] = f'🚨 Alert: {severity} Log from {source}'
    
    body = f"""Alert: {severity} level log detected

Source: {source}
Time: {timestamp}
Severity: {severity}
Message: {message}

---
Cloud Log Monitoring System
"""
    email.attach(MIMEText(body, 'plain'))
    
    try:
        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.starttls()
            server.login(sender, password)
            server.send_message(email)
            print(f"Email alert sent for {severity} from {source}")
    except Exception as e:
        print(f"Failed to send email: {str(e)}")
