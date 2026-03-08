import type { LogRecord } from '@/types'

export async function fetchLogs(): Promise<LogRecord[]> {
  const res = await fetch('https://punch-log-941728631592.us-west2.run.app/api/logs')
  if (!res.ok) throw new Error(`Failed to fetch logs: ${res.status} ${res.statusText}`)
  const data = await res.json()
  const logs = Array.isArray(data) ? data : (data.logs ?? data.data ?? [])
  if (!Array.isArray(logs)) return []
  return logs.map(normalize)
}

export async function addLog(payload: LogRecord): Promise<LogRecord> {
  const res = await fetch('https://punch-log-941728631592.us-west2.run.app/api/logs', {
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