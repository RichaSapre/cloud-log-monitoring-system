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
    <header className="sticky top-0 z-10 bg-gray-950/60 backdrop-blur-xl border-b border-white/5">
      <div className="mx-auto max-w-7xl px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <span className="bg-gradient-to-br from-brand-400 to-indigo-500 bg-clip-text text-transparent">Nexus</span>
            <span className="text-gray-300 font-medium">Log Analytics</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {lastRefreshed ? <>Status: Live • Last synced <time dateTime={lastRefreshed}>{new Date(lastRefreshed).toLocaleTimeString()}</time></> : '—'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onOpenAlerts}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 hover:bg-white/10 text-gray-200 transition-all shadow-sm">
            Rules
          </button>
          <label className="flex items-center gap-2 text-sm text-gray-300 px-2 cursor-pointer hover:text-white transition-colors">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-700 bg-gray-800 text-brand-500 focus:ring-brand-500/50"
              checked={autoRefresh}
              onChange={e => setAutoRefresh(e.target.checked)}
            />
            Stream
          </label>
          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 border border-white/5 text-gray-100 px-4 py-2 hover:bg-white/20 transition-all shadow-sm">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button
            onClick={onOpenAdd}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white px-4 py-2 hover:from-brand-400 hover:to-brand-500 shadow-glow transition-all">
            <PlusCircle className="h-5 w-5" />
            Simulate
          </button>
        </div>
      </div>
    </header>
  )
}