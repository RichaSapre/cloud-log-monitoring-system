import React, { useState } from 'react'
import type { LogRecord } from '@/types'
import { addLog } from '@/lib/api'

type Props = { open: boolean; onClose: () => void; onAdded: (log: LogRecord) => void }

const severities = ['DEBUG','INFO','WARN','ERROR','FATAL']

export default function AddLogModal({ open, onClose, onAdded }: Props) {
  const [severity, setSeverity] = useState('ERROR')
  const [message, setMessage] = useState('Log is ')
  const [source, setSource] = useState('payment-service')
  const [timestamp, setTimestamp] = useState(new Date().toISOString())
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true); setError(null)
    try {
      const created = await addLog({ severity, message, source, timestamp })
      onAdded(created)
      onClose()
    } catch (err:any) {
      setError(err.message || 'Failed to add log')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-xl">
        <div className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Add Log</div>
        {error && <div className="mb-3 rounded-lg border border-red-300 bg-red-50 p-2 text-sm text-red-800">{error}</div>}
        <form className="space-y-3" onSubmit={submit}>
          <div>
            <label className="block text-sm text-slate-600 dark:text-slate-300">Severity</label>
            <select value={severity} onChange={e => setSeverity(e.target.value)} className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2">
              {severities.map(s=><option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-600 dark:text-slate-300">Message</label>
            <input value={message} onChange={e => setMessage(e.target.value)} className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-slate-600 dark:text-slate-300">Source</label>
              <input value={source} onChange={e => setSource(e.target.value)} className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-slate-600 dark:text-slate-300">Timestamp</label>
              <input
                type="datetime-local"
                value={new Date(timestamp).toISOString().slice(0,16)}
                onChange={e => {
                  const v = e.target.value
                  const local = new Date(v)
                  const corrected = new Date(local.getTime() - local.getTimezoneOffset()*60000).toISOString()
                  setTimestamp(corrected)
                }}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2"
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-xl border px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700">Cancel</button>
            <button disabled={submitting} className="rounded-xl bg-brand-600 px-4 py-2 text-white hover:bg-brand-700 disabled:opacity-50">
              {submitting ? 'Adding…' : 'Add Log'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}