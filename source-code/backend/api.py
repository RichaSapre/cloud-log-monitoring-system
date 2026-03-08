# REST API - retrieve and ingest logs
from flask import Flask, jsonify, request
from flask_cors import CORS
from google.cloud import firestore
from google.cloud import pubsub_v1
from datetime import datetime
import json
import os

app = Flask(__name__)
CORS(app)

# Initialize clients lazily to avoid startup issues
_db = None
_publisher = None
_topic_path = None

def get_firestore_client():
    global _db
    if _db is None:
        _db = firestore.Client()
    return _db

def get_pubsub_publisher():
    global _publisher, _topic_path
    if _publisher is None:
        _publisher = pubsub_v1.PublisherClient()
        project_id = os.environ.get('GCP_PROJECT') or os.environ.get('GOOGLE_CLOUD_PROJECT') or os.environ.get('GCLOUD_PROJECT')
        if not project_id:
            raise ValueError("GCP_PROJECT environment variable not set")
        topic_name = 'log-topic'
        _topic_path = _publisher.topic_path(project_id, topic_name)
    return _publisher, _topic_path

@app.route('/api/logs', methods=['GET', 'POST'])
def handle_logs():
    # POST - Ingest logs from client applications
    if request.method == 'POST':
        try:
            data = request.get_json()
            
            # Validate required fields
            if not data:
                return jsonify({'error': 'No data provided'}), 400
            
            severity = data.get('severity', 'INFO').upper()
            message = data.get('message', '')
            source = data.get('source', 'unknown')
            timestamp = data.get('timestamp', datetime.utcnow().isoformat())
            
            # Validate severity level
            valid_severities = ['INFO', 'WARNING', 'ERROR', 'CRITICAL', 'DEBUG']
            if severity not in valid_severities:
                return jsonify({'error': f'Invalid severity. Must be one of: {valid_severities}'}), 400
            
            if not message:
                return jsonify({'error': 'Message is required'}), 400
            
            # Step 2: Publish to Pub/Sub (Log Streaming as per proposal)
            log_entry = {
                'severity': severity,
                'textPayload': message,
                'source': source,
                'timestamp': timestamp,
                'labels': {
                    'source': source
                }
            }
            
            # Publish message to Pub/Sub topic
            publisher, topic_path = get_pubsub_publisher()
            message_data = json.dumps(log_entry).encode('utf-8')
            future = publisher.publish(topic_path, message_data)
            message_id = future.result()  # Wait for publish to complete
            
            # Log will be processed by Cloud Function (Step 3)
            # Cloud Function will store to Firestore (Step 4)
            
            return jsonify({
                'status': 'success',
                'message': 'Log published to streaming service',
                'message_id': message_id,
                'severity': severity,
                'flow': 'API → Pub/Sub → Cloud Function → Firestore'
            }), 202  # 202 Accepted (async processing)
            
        except Exception as e:
            return jsonify({'error': f'Failed to ingest log: {str(e)}'}), 500
    
    # GET - Retrieve logs
    else:
        try:
            db = get_firestore_client()
            limit = int(request.args.get('limit', 100))
            severity = request.args.get('severity')
            
            query = db.collection('logs')
            if severity:
                query = query.where('severity', '==', severity)
            query = query.order_by('created_at', direction=firestore.Query.DESCENDING).limit(limit)
            
            logs = []
            for doc in query.stream():
                data = doc.to_dict()
                data['id'] = doc.id
                logs.append(data)
            
            return jsonify({'logs': logs, 'count': len(logs)})
        except Exception as e:
            return jsonify({'error': f'Failed to retrieve logs: {str(e)}'}), 500

@app.route('/api/stats', methods=['GET'])
def get_stats():
    try:
        db = get_firestore_client()
        all_logs = list(db.collection('logs').stream())
        
        stats = {'ERROR': 0, 'WARNING': 0, 'INFO': 0, 'CRITICAL': 0, 'DEBUG': 0}
        for doc in all_logs:
            severity = doc.to_dict().get('severity', '')
            if severity in stats:
                stats[severity] += 1
        
        return jsonify({'total': len(all_logs), 'distribution': stats})
    except Exception as e:
        return jsonify({'error': f'Failed to get stats: {str(e)}'}), 500

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint for Cloud Run"""
    return jsonify({'status': 'healthy'}), 200

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    # Use gunicorn in production
    import sys
    if 'gunicorn' in sys.modules:
        app  # Gunicorn will handle this
    else:
        app.run(host='0.0.0.0', port=port, threaded=True)
