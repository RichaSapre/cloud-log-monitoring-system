================================================================================
                    CLOUD LOG MONITORING SYSTEM
================================================================================

================================================================================
📖 PROBLEM STATEMENT
================================================================================

Modern web applications and servers generate large volumes of log data—such as 
error logs, user requests, and performance metrics. Manually collecting, storing, 
and analyzing these logs from distributed systems is inefficient, error-prone, 
and time-consuming.

Organizations need a centralized, cloud-based solution that can:
  ✓ Collect logs from multiple sources in real time
  ✓ Store and analyze these logs securely
  ✓ Provide dashboards and alerts for better monitoring and faster issue resolution


================================================================================
💡 SOLUTION OVERVIEW
================================================================================

The Cloud Log Monitoring System is a fully serverless, event-driven web 
application that leverages Google Cloud Platform services to collect, process, 
store, and visualize logs in real time with automatic alerting capabilities.


================================================================================
🏗️  SYSTEM ARCHITECTURE (Following Project Proposal Flow)
================================================================================

┌──────────────────┐
│ External Client  │
│  Applications    │  (Web servers, APIs, microservices)
└────────┬─────────┘
         │
         │ Step 1: POST /api/logs (Log Collection)
         ▼
┌─────────────────┐
│   Cloud Run     │  Centralized REST API Endpoint
│      API        │  • Validates log format
│                 │  • Accepts from any source
│    api.py       │
└────────┬────────┘
         │
         │ Step 2: Publish (Log Streaming)
         ▼
┌─────────────────────┐
│    Pub/Sub Topic    │  Google Cloud Pub/Sub
│   (logs-topic)      │  • Message streaming service
│                     │  • Decouples ingestion from processing
└──────┬──────────────┘
       │
       │ Step 3: Trigger (Processing Layer)
       ▼
┌─────────────────────┐
│  Cloud Function     │  Serverless Compute
│ (process-log-       │  • Transforms & processes logs
│  function)          │  • Extracts metadata
│                     │  
│  function.py        │
└─────┬───────────┬───┘
      │           │
      │           │ Step 6: Critical alerts
      │           ▼
      │      ┌────────────┐
      │      │   Gmail    │  Cloud Notifications
      │      │   SMTP     │  • Email alerts for ERROR/CRITICAL
      │      └────────────┘
      │
      │ Step 4: Store (NoSQL Storage)
      ▼
┌─────────────┐
│  Firestore  │  Google Firestore (NoSQL)
│  Database   │  • Scalable storage
│             │  • Fast retrieval
└──────┬──────┘
       │
       │ Step 5: Query & Display
       ▼
┌─────────────────────┐
│  Web Dashboard      │  Visualization Dashboard
│                     │  
│  dashboard.html     │  Features:
│                     │  • Real-time metrics
│                     │  • Filter by source, severity
│                     │  • Interactive charts
│                     │  • Auto-refresh
└─────────────────────┘


COMPLETE FLOW (AS PER PROJECT PROPOSAL):
-----------------------------------------
1. Log Collection: Client apps → POST /api/logs → API validates
2. Log Streaming: API → publishes to Pub/Sub topic
3. Processing Layer: Cloud Function triggered → transforms logs
4. Storage: Processed logs → stored in Firestore (NoSQL)
5. Visualization: Dashboard queries Firestore → displays real-time
6. Alerts: Cloud Function sends email for ERROR/CRITICAL logs


================================================================================
📁 PROJECT FILES
================================================================================

Core Application Files:
-----------------------
1. api.py              - Flask REST API for log ingestion & querying
2. dashboard.html      - Web dashboard with real-time visualization
3. client_example.py   - Example client showing how to push logs to API
4. function.py         - Cloud Function for log processing (optional GCP pipeline)

Configuration Files:
--------------------
5. requirements.txt    - Python dependencies
6. Dockerfile          - Container configuration for Cloud Run
7. README.txt          - This file (project documentation)
8. DEPLOYMENT_INFO.txt - Deployment details and live URLs
9. API_USAGE.md        - Comprehensive API documentation


================================================================================
🛠️  TECHNOLOGIES USED
================================================================================

Frontend:
  • HTML5, CSS3, JavaScript (Vanilla)
  • Chart.js - Data visualization (doughnut charts)

Backend:
  • Python 3.10
  • Flask - REST API framework
  • Flask-CORS - Cross-origin resource sharing

Google Cloud Platform Services:
  • Cloud Logging - Centralized log collection
  • Pub/Sub - Message streaming and event triggers
  • Cloud Functions - Serverless log processing
  • Firestore - NoSQL database for log storage
  • Cloud Run - Containerized API deployment
  • Cloud Storage - Static website hosting
  • IAM - Identity and access management

Additional Services:
  • Gmail SMTP - Email alert notifications
  • Docker - Containerization
  • GitHub - Version control


================================================================================
✨ KEY FEATURES IMPLEMENTED
================================================================================

✅ Real-Time Log Collection
   - Centralized logging from multiple sources
   - Automatic log ingestion via Cloud Logging API

✅ Intelligent Log Streaming
   - Pub/Sub topic for event-driven architecture
   - Log filtering (severity >= WARNING)
   - Zero message loss with managed service

✅ Serverless Processing
   - Automatic scaling with Cloud Functions
   - Event-triggered execution (no idle resources)
   - Parallel processing capability

✅ Persistent Storage
   - Firestore NoSQL database
   - Indexed queries for fast retrieval
   - Automatic backups and replication

✅ Interactive Dashboard
   - Real-time statistics (total logs, error/warning/info counts)
   - Visual log distribution chart
   - Filterable log table by severity
   - Auto-refresh every 10 seconds
   - Responsive design

✅ Automated Alerting
   - Email notifications for ERROR-level logs
   - Immediate delivery via Gmail SMTP
   - Configurable recipients

✅ RESTful API
   - `POST /api/logs` - Ingest logs from client applications (NEW)
   - `GET /api/logs` - Retrieve logs with filtering & pagination
   - `GET /api/stats` - Get log distribution statistics
   - CORS-enabled for cross-origin requests
   - Input validation and error handling

✅ Production Deployment
   - Containerized API on Cloud Run
   - Static dashboard on Cloud Storage
   - HTTPS endpoints
   - Scalable and highly available


================================================================================
🚀 DEPLOYMENT GUIDE
================================================================================

Prerequisites:
--------------
• Google Cloud Platform account
• gcloud CLI installed and configured
• Python 3.10+
• Gmail account with App Password (for alerts)

Step 1: Create Pub/Sub Topic (Log Streaming)
---------------------------------------------
gcloud pubsub topics create logs-topic \
  --project=sacred-augury-478923-i9

Step 2: Deploy Cloud Function (Processing Layer)
-------------------------------------------------
gcloud functions deploy process-log-function \
  --runtime python310 \
  --trigger-topic logs-topic \
  --entry-point process_log \
  --source . \
  --set-env-vars SENDER_EMAIL=your-email@gmail.com,RECEIVER_EMAIL=alert-recipient@gmail.com,EMAIL_PASSWORD=your-app-password \
  --region=us-central1 \
  --project=sacred-augury-478923-i9

Step 3: Deploy API to Cloud Run (Log Collection Endpoint)
----------------------------------------------------------
# Build and deploy container
gcloud run deploy log-monitoring-api \
  --source . \
  --region=us-central1 \
  --allow-unauthenticated \
  --set-env-vars GCP_PROJECT=sacred-augury-478923-i9 \
  --project=sacred-augury-478923-i9

Step 4: Deploy Dashboard to Cloud Storage (Visualization)
----------------------------------------------------------
# Create bucket and upload dashboard
gsutil mb -p sacred-augury-478923-i9 gs://log-dashboard-bucket
gsutil cp dashboard.html gs://log-dashboard-bucket/index.html
gsutil iam ch allUsers:objectViewer gs://log-dashboard-bucket
# Update API_URL in dashboard.html to your Cloud Run URL

Step 5: Start Sending Logs (Client Integration)
------------------------------------------------
# Use the example client
python client_example.py

# Or integrate with your application
curl -X POST https://your-api-url/api/logs \
  -H "Content-Type: application/json" \
  -d '{"severity":"INFO","message":"Application started","source":"my-app"}'


SYSTEM FLOW VERIFICATION:
--------------------------
1. Send log via API → Check: API returns 202 Accepted with message_id
2. Log published to Pub/Sub → Check: gcloud pubsub topics list
3. Cloud Function processes → Check: Function logs show processing
4. Stored in Firestore → Check: Firestore console shows new document
5. Dashboard displays → Check: Open dashboard and see log
6. Email sent for errors → Check: Inbox for alert emails


================================================================================
▶️  RUNNING LOCALLY
================================================================================

Terminal 1: Start API Server
------------------------------
python api.py
# API runs on http://localhost:8080

Terminal 2: Send Logs from Client
----------------------------------
python client_example.py
# Sends sample logs to the API

Terminal 3: Open Dashboard
---------------------------
open dashboard.html
# Or visit the dashboard in your browser
# Note: Update API_URL in dashboard.html to http://localhost:8080 for local testing


================================================================================
🌐 LIVE DEPLOYMENT
================================================================================

Dashboard: https://storage.googleapis.com/log-dashboard-sacred-augury/index.html
API Base URL: https://log-monitoring-api-941728631592.us-central1.run.app

API Endpoints:
--------------
• POST /api/logs
  - Ingest logs from client applications
  - Body: {"severity": "ERROR", "message": "...", "source": "app-name", "timestamp": "..."}
  - Returns: {"status": "success", "log_id": "...", "severity": "..."}
  
• GET /api/logs?limit=50&severity=ERROR
  - Retrieve logs with optional filtering
  - Parameters: limit (default: 100), severity (INFO/WARNING/ERROR/CRITICAL/DEBUG)
  
• GET /api/stats
  - Get log distribution statistics
  - Returns total count and breakdown by severity
