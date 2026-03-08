# Cloud Monitoring Dashboard (Frontend) — with Alerts

A React + Vite + TypeScript + Tailwind dashboard for your Cloud Run log service.
- Fetches logs from `GET /api/logs`
- Filters/searches
- Trends & stats
- Add logs via `POST /api/logs`
- **NEW:** In-app Alerts (rules, browser notifications, optional webhook)

## Quick Start
```bash
npm install
npm run dev
```
Open the URL (usually http://localhost:5173).

The dev server proxies `/api/*` to your Cloud Run service so no CORS needed in dev.

## Configure (optional)
Create `.env`:
```bash
# Direct calls (skip dev proxy)
VITE_API_BASE_URL=https://punch-log-941728631592.us-west2.run.app

# Dev proxy target (used when API base is empty)
VITE_PROXY_TARGET=https://punch-log-941728631592.us-west2.run.app

# Auto-refresh interval (ms)
VITE_POLL_INTERVAL_MS=10000

# Alerts
VITE_ALERT_WEBHOOK_URL=   # e.g., Slack webhook; optional
VITE_ALERT_COOLDOWN_MIN=5 # suppress repeat firings in minutes
```

## Alerts
Click **Alerts** in the header to create rules. Rules are stored in `localStorage` and evaluated on each refresh.
Fields:
- Name
- Severities (leave empty = any)
- Source includes / Message includes
- Threshold (count)
- Window (minutes)
- Optional Webhook URL (overrides env)

On match:
- A toaster pops in the UI.
- Browser notification (if permission granted).
- POST to webhook if configured.

## Build & preview
```bash
npm run build
npm run preview
```
For production hosting (Netlify/Vercel/S3), set `VITE_API_BASE_URL` to the Cloud Run base URL or reverse-proxy `/api`.

MIT