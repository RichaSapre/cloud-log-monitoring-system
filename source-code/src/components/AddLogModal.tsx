import React, { useState } from 'react'
import type { LogRecord } from '@/types'
import { addLog } from '@/lib/api'
import { X, ShieldAlert, Terminal, Clock, Send } from 'lucide-react'

type Props = { open: boolean; onClose: () => void; onAdded: (log: LogRecord) => void }

const severities = ['DEBUG','INFO','WARN','ERROR','FATAL']

export default function AddLogModal({ open, onClose, onAdded }: Props) {
  const [severity, setSeverity] = useState('ERROR')
  const [message, setMessage] = useState('Critical system failure detected')
  const [source, setSource] = useState('auth-service')
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
      setError(err.message || 'Failed to simulate log')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] bg-gray-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-xl rounded-3xl bg-gray-900 border border-white/10 p-8 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-500 to-indigo-500"></div>
        
        <button onClick={onClose} className="absolute top-6 Right-6 text-gray-500 hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-2xl bg-brand-500/10 text-brand-400 border border-brand-500/20 shadow-glow">
            <Terminal className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Simulate Cloud Event</h2>
            <p className="text-gray-400 text-sm">Create a mock log entry to test monitoring rules</p>
          </div>
        </div>

        {error && <div className="mb-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300 backdrop-blur-sm animate-in fade-in slide-in-from-top-2">{error}</div>}

        <form className="space-y-6" onSubmit={submit}>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Event Severity</label>
            <div className="grid grid-cols-5 gap-2">
              {severities.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSeverity(s)}
                  className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${
                    severity === s 
                    ? 'bg-brand-500 text-white border-brand-400 shadow-glow scale-[1.02]' 
                    : 'bg-white/5 text-gray-500 border-white/5 hover:border-white/10 hover:text-gray-300'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Event Message</label>
            <div className="relative group">
              <input 
                value={message} 
                onChange={e => setMessage(e.target.value)} 
                placeholder="e.g., Connection timeout while fetching user profile"
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-sm text-white placeholder-gray-600 focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20 focus:bg-black/60 transition-all outline-none" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1 flex items-center gap-2">
                <ShieldAlert className="w-3 h-3" /> Service Origin
              </label>
              <input 
                value={source} 
                onChange={e => setSource(e.target.value)} 
                placeholder="payment-gateway"
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-sm text-white placeholder-gray-600 focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20 transition-all outline-none" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1 flex items-center gap-2">
                <Clock className="w-3 h-3" /> Incident Time (UTC)
              </label>
              <input
                type="datetime-local"
                value={new Date(timestamp).toISOString().slice(0,16)}
                onChange={e => {
                  const v = e.target.value
                  const local = new Date(v)
                  const corrected = new Date(local.getTime() - local.getTimezoneOffset()*60000).toISOString()
                  setTimestamp(corrected)
                }}
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-sm text-white focus:border-brand-500/50 transition-all outline-none [color-scheme:dark]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-6 py-3 rounded-2xl text-sm font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button 
              disabled={submitting} 
              className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 text-white text-sm font-bold hover:from-brand-400 hover:to-brand-500 shadow-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95"
            >
              {submitting ? (
                <>Simulating...</>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Emit Event
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}