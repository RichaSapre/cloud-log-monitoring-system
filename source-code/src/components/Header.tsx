import React from 'react'
import { RefreshCw, PlusCircle } from 'lucide-react'

type Props = {
  onRefresh: () => void
  onOpenAdd: () => void
  onOpenAlerts: () => void
  lastRefreshed?: string
  autoRefresh: boolean
  setAutoRefresh: (v: boolean) => void
}

export default function Header({ onRefresh, onOpenAdd, onOpenAlerts, lastRefreshed, autoRefresh, setAutoRefresh }: Props) {
  return (
    <header className="sticky top-0 z-10 backdrop-blur bg-slate-50/70 dark:bg-slate-900/70 border-b border-slate-200 dark:border-slate-800">
      <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Cloud Monitoring Dashboard</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {lastRefreshed ? <>Last updated <time dateTime={lastRefreshed}>{lastRefreshed}</time></> : '—'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenAlerts}
            className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700">
            Alerts
          </button>
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={autoRefresh}
              onChange={e => setAutoRefresh(e.target.checked)}
            />
            Auto-refresh
          </label>
          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white px-4 py-2 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white transition">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button
            onClick={onOpenAdd}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 text-white px-4 py-2 hover:bg-brand-700 transition">
            <PlusCircle className="h-5 w-5" />
            Add Log
          </button>
        </div>
      </div>
    </header>
  )
}