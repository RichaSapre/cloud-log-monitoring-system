import type { LogRecord } from '@/types'
import { generateDemoLogs, generateSingleLog } from '@/lib/demoData'

const API_BASE = 'https://punch-log-941728631592.us-west2.run.app'

/** Tracks whether the app is currently serving demo data */
export let isDemoMode = false

/** In-memory store for demo logs so they persist across refreshes within a session */
let _demoLogs: LogRecord[] | null = null

function getDemoLogs(): LogRecord[] {
  if (!_demoLogs) {
    _demoLogs = generateDemoLogs(150, 72)
  }
  // Simulate live activity: ~30% chance of a new log appearing each refresh
  if (Math.random() < 0.3) {
    const newLog = generateSingleLog()
    _demoLogs = [newLog, ..._demoLogs].slice(0, 300) // cap at 300
  }
  return _demoLogs
}

export async function fetchLogs(): Promise<LogRecord[]> {
  try {
    const res = await fetch(`${API_BASE}/api/logs`, { signal: AbortSignal.timeout(5000) })
    if (!res.ok) throw new Error(`${res.status}`)
    const data = await res.json()
    const logs = Array.isArray(data) ? data : (data.logs ?? data.data ?? [])
    if (!Array.isArray(logs)) throw new Error('Invalid response')
    isDemoMode = false
    return logs.map(normalize)
  } catch {
    // Backend unreachable — fall back to demo data
    isDemoMode = true
    return getDemoLogs()
  }
}

export async function addLog(payload: LogRecord): Promise<LogRecord> {
  if (isDemoMode) {
    // In demo mode, just add to the in-memory store
    const log: LogRecord = {
      id: `demo-added-${Date.now()}`,
      severity: (payload.severity ?? 'INFO').toString().toUpperCase(),
      message: payload.message ?? '',
      source: payload.source ?? 'unknown',
      timestamp: payload.timestamp ?? new Date().toISOString(),
    }
    if (_demoLogs) _demoLogs = [log, ..._demoLogs]
    return log
  }

  const res = await fetch(`${API_BASE}/api/logs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Failed to add log: ${res.status} ${res.statusText} ${text}`)
  }
  const data = await res.json().catch(() => ({}))
  return normalize({ ...payload, ...data })
}

function normalize(x: any): LogRecord {
  return {
    id: x.id ?? `${x.source ?? 'unknown'}-${x.timestamp ?? Date.now()}`,
    severity: (x.severity ?? 'INFO').toString().toUpperCase(),
    message: x.message ?? '',
    source: x.source ?? 'unknown',
    timestamp: typeof x.timestamp === 'string' ? x.timestamp : new Date().toISOString()
  }
}