/**
 * Demo data generator for the Cloud Log Monitoring Dashboard.
 * Produces realistic, dynamic log entries so the dashboard
 * looks alive even without the GCP backend running.
 */
import type { LogRecord } from '@/types'

const SOURCES = [
  'payment-service',
  'auth-gateway',
  'user-service',
  'order-processor',
  'api-gateway',
  'notification-service',
  'inventory-service',
  'search-engine',
  'analytics-pipeline',
  'cdn-edge-node',
]

const MESSAGES: Record<string, string[]> = {
  DEBUG: [
    'Cache hit ratio: 94.2% — within expected range',
    'Database connection pool stats: 12/50 active connections',
    'Request tracing enabled for user session #a8f291',
    'Garbage collection completed in 45ms, freed 128MB',
    'WebSocket heartbeat acknowledged from client 10.0.3.42',
    'Config reload triggered — no changes detected',
  ],
  INFO: [
    'Successfully processed 1,247 transactions in batch #7821',
    'New user registered: richasapre@example.com',
    'Deployment v2.14.3 rolled out to production cluster',
    'SSL certificate renewed — expires 2027-03-07',
    'Health check passed: all 8 microservices operational',
    'CDN cache purged for /api/v2/* endpoints',
    'Backup completed: 4.2GB written to gs://backups/daily/',
    'Rate limiter reset: 0 blocked requests in last window',
  ],
  WARN: [
    'Response time degraded: avg 1,240ms (threshold: 800ms)',
    'Disk usage at 78% on /dev/sda1 — approaching limit',
    'API rate limit approaching: 4,500/5,000 requests used',
    'Memory usage spike detected: 3.8GB / 4GB allocated',
    'Retry attempt 2/3 for downstream service order-processor',
    'Deprecated API v1 endpoint called 312 times today',
    'Connection pool nearing capacity: 45/50 connections active',
  ],
  ERROR: [
    'Payment processing failed: Stripe returned 402 — card declined',
    'Database query timeout after 30s on users_table JOIN orders',
    'Authentication token expired for session #b4e829 — forced logout',
    'Failed to connect to Redis cluster at 10.0.1.15:6379',
    'Unhandled exception in /api/v2/checkout: NullPointerException',
    'Email delivery failed: SMTP connection refused by mx.gmail.com',
  ],
  FATAL: [
    'CRITICAL: Primary database node unreachable — failover initiated',
    'Out of memory: process killed by OOM killer on node-03',
    'Cascading failure detected: 3 services unresponsive',
    'Data corruption detected in partition 7 of events_stream',
  ],
}

// Weighted distribution: most logs are INFO/DEBUG, fewer are ERROR/FATAL
const SEVERITY_WEIGHTS: [string, number][] = [
  ['DEBUG', 0.20],
  ['INFO', 0.40],
  ['WARN', 0.22],
  ['ERROR', 0.14],
  ['FATAL', 0.04],
]

function pickWeighted(weights: [string, number][]): string {
  const r = Math.random()
  let cumulative = 0
  for (const [value, weight] of weights) {
    cumulative += weight
    if (r <= cumulative) return value
  }
  return weights[weights.length - 1][0]
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/**
 * Generate a set of realistic demo logs spread across the last N hours.
 * Logs are more frequent in "business hours" to look realistic.
 */
export function generateDemoLogs(count: number = 150, hoursBack: number = 72): LogRecord[] {
  const now = Date.now()
  const logs: LogRecord[] = []

  for (let i = 0; i < count; i++) {
    const severity = pickWeighted(SEVERITY_WEIGHTS)
    const messages = MESSAGES[severity] || MESSAGES['INFO']
    const message = pickRandom(messages)
    const source = pickRandom(SOURCES)

    // Spread timestamps across the time range with some clustering
    const hoursAgo = Math.random() * hoursBack
    const timestamp = new Date(now - hoursAgo * 60 * 60 * 1000).toISOString()

    logs.push({
      id: `demo-${i}-${Math.random().toString(36).slice(2, 8)}`,
      severity,
      message,
      source,
      timestamp,
    })
  }

  // Sort by timestamp descending (newest first)
  logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return logs
}

/**
 * Generate a single new log entry (for simulating live streaming).
 */
export function generateSingleLog(): LogRecord {
  const severity = pickWeighted(SEVERITY_WEIGHTS)
  const messages = MESSAGES[severity] || MESSAGES['INFO']

  return {
    id: `demo-live-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    severity,
    message: pickRandom(messages),
    source: pickRandom(SOURCES),
    timestamp: new Date().toISOString(),
  }
}
