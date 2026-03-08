import type { LogRecord, AlertRule, AlertEvent } from '@/types'

const STORAGE_KEY = 'cms-alert-rules'
const LAST_FIRED_KEY = 'cms-alert-last-fired'
const DEFAULT_COOLDOWN_MIN = Number(import.meta.env.VITE_ALERT_COOLDOWN_MIN ?? 5)
const ENV_WEBHOOK = import.meta.env.VITE_ALERT_WEBHOOK_URL

function nowISO() { return new Date().toISOString() }

export function getRules(): AlertRule[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch {
    return []
  }
}

export function saveRules(rules: AlertRule[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rules))
}

export function addRule(partial: Partial<AlertRule>): AlertRule {
  const rule: AlertRule = {
    id: crypto.randomUUID(),
    name: partial.name || 'New rule',
    severities: partial.severities || [],
    sourceIncludes: partial.sourceIncludes?.trim() || '',
    messageIncludes: partial.messageIncludes?.trim() || '',
    threshold: Math.max(1, Number(partial.threshold ?? 1)),
    windowMinutes: Math.max(1, Number(partial.windowMinutes ?? 10)),
    enabled: partial.enabled ?? true,
    webhookUrl: partial.webhookUrl?.trim()
  }
  const rules = getRules()
  rules.push(rule)
  saveRules(rules)
  return rule
}

export function removeRule(id: string) {
  const rules = getRules().filter(r => r.id !== id)
  saveRules(rules)
}

export function setEnabled(id: string, enabled: boolean) {
  const rules = getRules().map(r => r.id === id ? { ...r, enabled } : r)
  saveRules(rules)
}

function withinWindow(logTime: number, windowEnd: number, windowMin: number) {
  const windowStart = windowEnd - windowMin * 60 * 1000
  return logTime >= windowStart && logTime <= windowEnd
}

function matchesRule(log: LogRecord, rule: AlertRule): boolean {
  const sevOk = !rule.severities || rule.severities.length === 0
    ? true
    : rule.severities.map(s => s.toUpperCase()).includes((log.severity || '').toString().toUpperCase())

  const srcOk = rule.sourceIncludes
    ? (log.source || '').toLowerCase().includes(rule.sourceIncludes.toLowerCase())
    : true

  const msgOk = rule.messageIncludes
    ? (log.message || '').toLowerCase().includes(rule.messageIncludes.toLowerCase())
    : true

  return sevOk && srcOk && msgOk
}

function getLastFiredMap(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(LAST_FIRED_KEY) || '{}')
  } catch {
    return {}
  }
}
function setLastFired(ruleId: string, iso: string) {
  const m = getLastFiredMap()
  m[ruleId] = iso
  localStorage.setItem(LAST_FIRED_KEY, JSON.stringify(m))
}

function shouldCooldown(ruleId: string, cooldownMin: number): boolean {
  const m = getLastFiredMap()
  const last = m[ruleId]
  if (!last) return false
  const dt = Date.now() - new Date(last).getTime()
  return dt < cooldownMin * 60 * 1000
}

async function sendWebhook(event: AlertEvent, rule: AlertRule) {
  const url = rule.webhookUrl || ENV_WEBHOOK
  if (!url) return
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'cloud-monitoring.alert',
        ruleId: event.ruleId,
        ruleName: event.ruleName,
        matchedCount: event.matchedCount,
        windowStart: event.windowStart,
        windowEnd: event.windowEnd,
        latestLog: event.latestLog,
        createdAt: event.createdAt
      })
    })
  } catch (e) {
    console.warn('Webhook failed', e)
  }
}

async function notifyBrowser(event: AlertEvent) {
  try {
    if (!('Notification' in window)) return
    if (Notification.permission === 'granted') {
      new Notification(`Alert: ${event.ruleName}`, {
        body: `${event.matchedCount} match(es). Latest: ${event.latestLog?.message ?? ''}`
      })
    } else if (Notification.permission !== 'denied') {
      const res = await Notification.requestPermission()
      if (res === 'granted') {
        new Notification(`Alert: ${event.ruleName}`, {
          body: `${event.matchedCount} match(es). Latest: ${event.latestLog?.message ?? ''}`
        })
      }
    }
  } catch {}
}

export async function evaluateAndNotify(logs: LogRecord[]): Promise<AlertEvent[]> {
  const rules = getRules().filter(r => r.enabled)
  const events: AlertEvent[] = []
  const windowEnd = Date.now()
  for (const rule of rules) {
    if (shouldCooldown(rule.id, DEFAULT_COOLDOWN_MIN)) continue
    const windowStart = windowEnd - rule.windowMinutes * 60 * 1000
    const matched = logs.filter(l => {
      const t = new Date(l.timestamp).getTime()
      return withinWindow(t, windowEnd, rule.windowMinutes) && matchesRule(l, rule)
    })
    if (matched.length >= (rule.threshold || 1)) {
      const event: AlertEvent = {
        id: crypto.randomUUID(),
        ruleId: rule.id,
        ruleName: rule.name,
        matchedCount: matched.length,
        windowStart: new Date(windowStart).toISOString(),
        windowEnd: new Date(windowEnd).toISOString(),
        latestLog: matched.sort((a,b)=>new Date(b.timestamp).getTime()-new Date(a.timestamp).getTime())[0],
        createdAt: nowISO()
      }
      events.push(event)
      setLastFired(rule.id, event.createdAt)
      notifyBrowser(event)
      sendWebhook(event, rule)
    }
  }
  return events
}