import React, { useEffect, useState } from 'react'
import { addRule, getRules, removeRule, setEnabled } from '@/lib/alerts'
import type { AlertRule } from '@/types'
import { Trash2, Bell } from 'lucide-react'

type Props = { open: boolean; onClose: () => void }
const SEVS = ['DEBUG','INFO','WARN','ERROR','FATAL']

export default function AlertsPanel({ open, onClose }: Props) {
  const [rules, setRules] = useState<AlertRule[]>([])
  const [name, setName] = useState('Error spike')
  const [severities, setSeverities] = useState<string[]>(['ERROR','FATAL'])
  const [sourceIncludes, setSourceIncludes] = useState('payment-service')
  const [messageIncludes, setMessageIncludes] = useState('')
  const [threshold, setThreshold] = useState(3)
  const [windowMinutes, setWindowMinutes] = useState(10)
  const [webhookUrl, setWebhookUrl] = useState('')

  useEffect(() => { if (open) setRules(getRules()) }, [open])

  const create = (e: React.FormEvent) => {
    e.preventDefault()
    const rule = addRule({ name, severities, sourceIncludes, messageIncludes, threshold, windowMinutes, enabled: true, webhookUrl: webhookUrl || undefined })
    setRules(prev => [...prev, rule])
  }
  const toggleSev = (s: string) => setSeverities(prev => prev.includes(s) ? prev.filter(x=>x!==s) : [...prev, s])
  const remove = (id: string) => { removeRule(id); setRules(prev => prev.filter(r=>r.id!==id)) }
  const toggleEnabled = (r: AlertRule) => { setEnabled(r.id, !r.enabled); setRules(prev => prev.map(x=>x.id===r.id?{...x,enabled:!x.enabled}:x)) }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2"><Bell className="h-5 w-5" /> Alerts</div>
          <button onClick={onClose} className="rounded-xl border px-3 py-1 hover:bg-slate-50 dark:hover:bg-slate-700">Close</button>
        </div>

        <div className="card">
          <div className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-3">Create rule</div>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end" onSubmit={create}>
            <div>
              <label className="block text-sm text-slate-600 dark:text-slate-300">Name</label>
              <input value={name} onChange={e => setName(e.target.value)} className="w-full rounded-xl border px-3 py-2 dark:bg-slate-900 dark:border-slate-700" />
            </div>
            <div>
              <label className="block text-sm text-slate-600 dark:text-slate-300">Severities</label>
              <div className="flex flex-wrap gap-2">
                {SEVS.map(s => (
                  <label key={s} className={"px-3 py-1 rounded-full border cursor-pointer " + (severities.includes(s) ? "bg-slate-900 text-white border-slate-900" : "dark:bg-slate-900 dark:text-slate-200")}>
                    <input type="checkbox" checked={severities.includes(s)} onChange={() => toggleSev(s)} className="mr-2" />
                    {s}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-600 dark:text-slate-300">Source includes</label>
              <input value={sourceIncludes} onChange={e=>setSourceIncludes(e.target.value)} className="w-full rounded-xl border px-3 py-2 dark:bg-slate-900 dark:border-slate-700" placeholder="e.g., payment-service" />
            </div>
            <div>
              <label className="block text-sm text-slate-600 dark:text-slate-300">Message includes</label>
              <input value={messageIncludes} onChange={e=>setMessageIncludes(e.target.value)} className="w-full rounded-xl border px-3 py-2 dark:bg-slate-900 dark:border-slate-700" placeholder="optional" />
            </div>
            <div>
              <label className="block text-sm text-slate-600 dark:text-slate-300">Threshold (count)</label>
              <input type="number" min={1} value={threshold} onChange={e=>setThreshold(parseInt(e.target.value||'1'))} className="w-full rounded-xl border px-3 py-2 dark:bg-slate-900 dark:border-slate-700" />
            </div>
            <div>
              <label className="block text-sm text-slate-600 dark:text-slate-300">Window (minutes)</label>
              <input type="number" min={1} value={windowMinutes} onChange={e=>setWindowMinutes(parseInt(e.target.value||'1'))} className="w-full rounded-xl border px-3 py-2 dark:bg-slate-900 dark:border-slate-700" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-slate-600 dark:text-slate-300">Webhook URL (optional)</label>
              <input value={webhookUrl} onChange={e=>setWebhookUrl(e.target.value)} className="w-full rounded-xl border px-3 py-2 dark:bg-slate-900 dark:border-slate-700" placeholder="Override env VITE_ALERT_WEBHOOK_URL" />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <button className="rounded-xl bg-brand-600 text-white px-4 py-2 hover:bg-brand-700">Add Rule</button>
            </div>
          </form>
        </div>

        <div className="space-y-3">
          <div className="text-sm font-medium text-slate-700 dark:text-slate-200">Your rules</div>
          {rules.length === 0 && <div className="text-sm text-slate-500">No rules yet. Create one above.</div>}
          {rules.map(r => (
            <div key={r.id} className="card flex items-center justify-between">
              <div>
                <div className="font-medium text-slate-900 dark:text-white">{r.name}</div>
                <div className="text-sm text-slate-600 dark:text-slate-300">
                  {(r.severities && r.severities.length>0) ? r.severities.join(', ') : 'Any severity'} ·
                  source includes “{r.sourceIncludes || '—'}” ·
                  msg includes “{r.messageIncludes || '—'}” ·
                  ≥ {r.threshold} in last {r.windowMinutes}m
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-slate-700 dark:text-slate-200 flex items-center gap-2">
                  <input type="checkbox" checked={r.enabled} onChange={()=>toggleEnabled(r)} />
                  Enabled
                </label>
                <button onClick={()=>remove(r.id)} className="rounded-xl border px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700" title="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}