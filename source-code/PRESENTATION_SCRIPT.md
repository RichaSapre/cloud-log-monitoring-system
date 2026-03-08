# Cloud Log Monitoring System - Presentation Script

**Presenters:** Shreya Kumari (fd6317) & Richa Sapre (ee9498)  
**Course:** Cloud Computing  
**Duration:** ~15 minutes

---

## SLIDE 1: Title Slide

Hello everyone.

Welcome to our presentation on the Cloud Log Monitoring System.

This project is presented by Shreya Kumari, student ID fd6317, and Richa Sapre, student ID ee9498, for the Cloud Computing course.

Today we will walk you through our complete cloud-based solution for monitoring and analyzing logs from distributed systems.

---

## SLIDE 2: Problem Statement

Let us begin with the problem we are solving.

Modern applications generate massive volumes of log data. Think about web servers, APIs, databases, microservices - each of these produces thousands of log entries every day.

Manual log collection is inefficient and error-prone. When you have logs scattered across multiple servers and services, it becomes nearly impossible to track everything manually. You might miss critical errors, waste hours searching through files, or fail to identify patterns.

Organizations today need three essential capabilities:

First, real-time log collection. Logs should flow automatically from all sources to one central location. No manual copying, no delays.

Second, secure storage and analysis. Logs contain sensitive information and must be stored safely. We also need the ability to search and analyze them quickly.

Third, alerts for faster issue resolution. When something breaks in production, the team should know immediately - not hours later when a user complains.

Our Cloud Log Monitoring System addresses all three of these requirements.

---

## SLIDE 3: Cloud Architecture Overview

Now let me give you an overview of our cloud architecture.

Our system is Serverless, Event-Driven, and works in Real-Time. It is built entirely on Google Cloud Platform.

Let me walk you through each component shown in the diagram.

Starting from the left, we have Log Sources. These are your applications, APIs, servers, and services. They send logs to our system through a REST API endpoint.

Next is Cloud Pub/Sub. This is Google's real-time message streaming service. It acts as a buffer between log collection and processing. When a log comes in, Pub/Sub holds it and triggers the next step. This event-driven approach means we never lose any logs, even during high traffic.

Then we have Cloud Functions. This is our serverless log processing layer. It automatically runs when Pub/Sub receives a new message. The best part? It auto-scales. If 10 logs come in, one instance handles them. If 10,000 logs come in, multiple instances spin up automatically.

The processed logs go to Cloud Firestore. This is Google's NoSQL database. It stores all our logs with indexing for fast queries. You can search millions of logs in seconds.

For visualization, we built a React Dashboard. This provides real-time visualization and analytics with an interactive user interface. The dashboard shows statistics, charts, and a searchable log table.

Finally, we have Cloud Notifications for automated critical alerts. When an ERROR or CRITICAL log is detected, the system sends alerts through email, and can be extended to SMS or push notifications.

The key features of this architecture are:

- Serverless Architecture - no servers to manage
- Event-Driven Processing - automatic triggers
- Real-time Log Analysis - instant visibility
- Auto-Scaling and Cost-Effective - pay only for what you use

The data flow is simple: Collect, Stream, Process, Store, then Visualize and Alert.

---

## SLIDE 4: Solution Overview

Let me summarize our solution.

We built a fully serverless, event-driven Cloud Log Monitoring System.

What does serverless mean? It means we do not provision or manage any servers. Google Cloud handles all the infrastructure. We focus only on our code and business logic.

What does event-driven mean? It means our system reacts automatically to events. When a log arrives, it triggers a chain reaction - publishing, processing, storing, alerting - all without manual intervention.

The system is built on Google Cloud Platform, which gives us enterprise-grade reliability and security.

The core capabilities are:

- Collects logs from any source through our REST API
- Processes logs automatically using Cloud Functions
- Stores everything in Firestore for persistence
- Visualizes data in real-time through our dashboard
- Includes automated alerting for critical logs so issues are caught immediately

This approach eliminates the traditional overhead of log management while providing more capabilities than manual systems.

---

## SLIDE 5: System Architecture - Steps

Now let me explain the system architecture step by step.

**Step 1:** Clients post logs to our Cloud Run API. This is our api.py file. Any application can send a log by making a simple POST request with the severity level, message, and source. The API validates the data and accepts it.

**Step 2:** The API publishes logs to Pub/Sub. Once validated, the log is published to our topic called logs-topic. This happens instantly. The API returns a success response to the client without waiting for processing to complete. This is called asynchronous processing.

**Step 3:** Cloud Function processes log events. Pub/Sub automatically triggers our Cloud Function whenever a new message arrives. The function decodes the message, extracts all the relevant fields, and prepares the data for storage.

**Step 4:** Logs are stored in Firestore NoSQL database. The Cloud Function writes each processed log to Firestore. We store the severity, message, source, timestamp, and a server-generated created_at field. Firestore indexes these for fast retrieval.

**Step 5:** Dashboard queries Firestore. Our React dashboard makes API calls to retrieve logs and statistics. It displays everything in a user-friendly interface with filtering and search capabilities.

**Step 6:** Gmail SMTP alerts for ERROR and CRITICAL logs. If the Cloud Function detects a high-severity log, it sends an email alert via Gmail SMTP. The team receives an immediate notification with all the details - what went wrong, where, and when.

This six-step flow ensures reliable, real-time log processing from collection to alerting.

---

## SLIDE 6: Technologies Used - Flow Diagram

This slide shows the complete technology flow in our system.

At the top, clients POST their logs to our Cloud Run API. This is our Flask-based api.py running in a Docker container on Cloud Run.

The API then publishes logs to Pub/Sub logs-topic. Pub/Sub is Google's managed message queue that guarantees delivery.

When a message arrives, the Cloud Function is triggered and processes the log events. This is our function.py running in serverless mode.

The processed logs are stored in Firestore NoSQL database. Firestore gives us flexible document storage with real-time sync capabilities.

Our Dashboard queries Firestore to display the logs. Users can see all their logs, filter by severity, and view analytics.

For critical situations, Gmail SMTP alerts are sent via the Cloud Function. This ensures ERROR and CRITICAL logs are never missed.

The flow is vertical and straightforward - each component has one job, making the system easy to maintain and debug.

---

## SLIDE 7: Tech Stack

Let me detail our complete tech stack.

**Frontend:**

- HTML, CSS, and JavaScript form the base
- We used React with TypeScript for a modern, type-safe interface
- Tailwind CSS for styling
- Chart.js handles our data visualization - the pie charts and bar graphs you see on the dashboard

**Backend:**

- Python 3.10 is our programming language
- Flask is our web framework for building the REST API
- Flask-CORS enables cross-origin requests so the frontend can talk to the backend
- Docker containerizes our application
- Cloud Run hosts and runs our container

**Google Cloud Services:**

- Cloud Logging for centralized log collection
- Pub/Sub for message streaming between components
- Cloud Functions for serverless processing
- Firestore for NoSQL database storage
- Cloud Storage for hosting static files
- IAM for Identity and Access Management, ensuring secure access

**Other Tools:**

- Gmail SMTP sends our alert emails
- GitHub manages our version control

This stack gives us a modern, scalable, and maintainable system.

---

## SLIDE 8: Key Features Implemented

Let me walk through the nine key features we implemented.

**Feature 1:** Real-time log collection. Logs flow from applications to our system instantly. No batching, no delays.

**Feature 2:** Pub/Sub event-driven streaming. Every log triggers automatic processing. The system is reactive by design.

**Feature 3:** Serverless Cloud Function processing. No servers to manage. Automatic scaling. Pay only when processing happens.

**Feature 4:** Firestore NoSQL persistent storage. All logs are stored permanently with indexing for fast queries.

**Feature 5:** Interactive dashboard with auto-refresh. The dashboard updates every 10 seconds automatically. No need to manually refresh.

**Feature 6:** Chart.js visualizations. We have visual charts showing log distribution by severity. See at a glance if errors are spiking.

**Feature 7:** RESTful API with three endpoints:

- POST /api/logs for ingesting new logs
- GET /api/logs for retrieving logs with filtering
- GET /api/stats for getting statistics and distribution

**Feature 8:** Automated email alerts for ERROR logs. When critical issues occur, the team gets notified immediately via email.

**Feature 9:** Production deployment using Cloud Run and Cloud Storage. The entire system is deployed on Google Cloud with HTTPS endpoints, ready for production use.

These features together provide a complete log monitoring solution that is production-ready and enterprise-grade.

---

## SLIDE 9: Thank You

Thank you for your attention.

This concludes our presentation on the Cloud Log Monitoring System.

We demonstrated how we built a serverless, event-driven solution on Google Cloud Platform that collects, processes, stores, visualizes, and alerts on log data in real time.

We are happy to answer any questions you may have.

Thank you.

---

## Timing Guide

| Slide | Topic | Time | Cumulative |
|-------|-------|------|------------|
| 1 | Title | 0:30 | 0:30 |
| 2 | Problem Statement | 2:00 | 2:30 |
| 3 | Architecture Overview | 3:00 | 5:30 |
| 4 | Solution Overview | 1:30 | 7:00 |
| 5 | System Architecture Steps | 2:30 | 9:30 |
| 6 | Technologies Flow | 1:30 | 11:00 |
| 7 | Tech Stack | 2:00 | 13:00 |
| 8 | Key Features | 2:00 | 15:00 |
| 9 | Thank You | 0:30 | 15:30 |

---

## Tips for Recording

1. Speak slowly and clearly
2. Pause for 2-3 seconds when changing slides
3. Point to diagrams when explaining architecture
4. Emphasize key terms like Serverless, Event-Driven, Real-Time
5. Practice once before final recording

