import React, { useEffect, useState } from 'react'
import { addRule, getRules, removeRule, setEnabled } from '@/lib/alerts'
import type { AlertRule } from '@/types'
import { Trash2, Bell, X, Activity, Zap, Shield } from 'lucide-react'

type Props = { open: boolean; onClose: () => void }
const SEVS = ['DEBUG','INFO','WARN','ERROR','FATAL']

export default function AlertsPanel({ open, onClose }: Props) {
  const [rules, setRules] = useState<AlertRule[]>([])
  const [name, setName] = useState('Critical Error Spike')
  const [severities, setSeverities] = useState<string[]>(['ERROR','FATAL'])
  const [sourceIncludes, setSourceIncludes] = useState('')
  const [messageIncludes, setMessageIncludes] = useState('')
  const [threshold, setThreshold] = useState(5)
  const [windowMinutes, setWindowMinutes] = useState(5)
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
    <div className="fixed inset-0 z-[100] bg-gray-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-gray-950 border border-white/10 shadow-2xl relative">
        <div className="sticky top-0 z-10 bg-gray-950/80 backdrop-blur-xl border-b border-white/5 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Active Rules</h2>
              <p className="text-sm text-gray-500">Configure triggers for automated notifications</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 space-y-10">
          <section>
            <div className="flex items-center gap-2 mb-6 ml-1">
              <Zap className="w-4 h-4 text-brand-400" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Create Monitoring Trigger</h3>
            </div>
            
            <form className="glass-panel p-6 space-y-6" onSubmit={create}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Rule Name</label>
                  <input value={name} onChange={e => setName(e.target.value)} className="w-full rounded-xl border border-white/5 bg-black/30 px-4 py-3 text-sm text-white focus:border-brand-500/50 outline-none" placeholder="e.g., Auth failures" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Threshold</label>
                  <div className="flex gap-2">
                    <div className="flex-1 space-y-1">
                      <div className="text-[10px] text-gray-500 ml-1 italic">Emit when count ≥</div>
                      <input type="number" min={1} value={threshold} onChange={e=>setThreshold(parseInt(e.target.value||'1'))} className="w-full rounded-xl border border-white/5 bg-black/30 px-4 py-3 text-sm text-white focus:border-brand-500/50 outline-none" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="text-[10px] text-gray-500 ml-1 italic">Within window (min)</div>
                      <input type="number" min={1} value={windowMinutes} onChange={e=>setWindowMinutes(parseInt(e.target.value||'1'))} className="w-full rounded-xl border border-white/5 bg-black/30 px-4 py-3 text-sm text-white focus:border-brand-500/50 outline-none" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Target Severities</label>
                <div className="flex flex-wrap gap-2">
                  {SEVS.map(s => (
                    <button 
                      key={s} 
                      type="button"
                      onClick={() => toggleSev(s)}
                      className={`px-4 py-1.5 rounded-full border text-xs font-bold transition-all ${
                        severities.includes(s) 
                        ? 'bg-brand-500/20 text-brand-300 border-brand-500/50 shadow-glow' 
                        : 'bg-white/5 text-gray-500 border-white/5 hover:border-white/10'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Source Filter</label>
                  <input value={sourceIncludes} onChange={e=>setSourceIncludes(e.target.value)} className="w-full rounded-xl border border-white/5 bg-black/30 px-4 py-3 text-sm text-white focus:border-brand-500/50 outline-none" placeholder="All sources if empty" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Message Pattern</label>
                  <input value={messageIncludes} onChange={e=>setMessageIncludes(e.target.value)} className="w-full rounded-xl border border-white/5 bg-black/30 px-4 py-3 text-sm text-white focus:border-brand-500/50 outline-none" placeholder="Substring match" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Webhook Notification</label>
                <input value={webhookUrl} onChange={e=>setWebhookUrl(e.target.value)} className="w-full rounded-xl border border-white/5 bg-black/30 px-4 py-3 text-sm text-white focus:border-brand-500/50 outline-none" placeholder="https://api.slack.com/services/..." />
              </div>

              <div className="flex justify-end pt-2">
                <button className="px-8 py-3 rounded-2xl bg-brand-500 text-white font-bold hover:bg-brand-400 transition-all shadow-glow text-sm">Deploy Rule</button>
              </div>
            </form>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-6 ml-1">
              <Shield className="w-4 h-4 text-brand-400" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Deployed Watchers</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {rules.length === 0 && (
                <div className="py-12 flex flex-col items-center justify-center text-gray-600 border border-dashed border-white/5 rounded-3xl">
                  <Activity className="w-8 h-8 mb-2 opacity-20" />
                  <p className="text-sm">No active monitoring rules</p>
                </div>
              )}
              {rules.map(r => (
                <div key={r.id} className="group glass-panel p-5 flex items-center justify-between hover:border-brand-500/30 transition-all">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${r.enabled ? 'bg-emerald-500 animate-pulse' : 'bg-gray-700'}`}></span>
                      <h4 className="font-bold text-white group-hover:text-brand-400 transition-colors">{r.name}</h4>
                      <div className="flex gap-1">
                        {r.severities?.map(s => (
                          <span key={s} className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/5 text-gray-500 font-mono">{s}</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-400">
                      If <span className="text-brand-300">count(source ≈ "{r.sourceIncludes || '*'}")</span> ≥ <span className="text-white">{r.threshold}</span> within last <span className="text-white">{r.windowMinutes}m</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => toggleEnabled(r)}
                      className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${r.enabled ? 'bg-emerald-500/40' : 'bg-gray-800'}`}
                    >
                      <div className={`absolute top-1 left-1 w-3 h-3 rounded-full bg-white transition-transform duration-300 ${r.enabled ? 'translate-x-5 shadow-[0_0_8px_rgba(16,185,129,1)]' : 'translate-x-0'}`} />
                    </button>
                    <button onClick={()=>remove(r.id)} className="p-2.5 rounded-xl hover:bg-rose-500/10 text-gray-500 hover:text-rose-400 transition-all border border-transparent hover:border-rose-500/20">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}