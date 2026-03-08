import React, { useEffect, useMemo, useState } from 'react'
import Header from '@/components/Header'
import Filters from '@/components/Filters'
import LogTable from '@/components/LogTable'
import TrendsChart from '@/components/TrendsChart'
import StatsCards from '@/components/StatsCards'
import AddLogModal from '@/components/AddLogModal'
import AlertsPanel from '@/components/AlertsPanel'
import AlertToaster from '@/components/AlertToaster'
import { evaluateAndNotify } from '@/lib/alerts'
import { fetchLogs, isDemoMode } from '@/lib/api'
import type { LogRecord } from '@/types'

function uniq<T>(arr: T[]): T[] { return Array.from(new Set(arr)) }

export default function App() {
  const [allLogs, setAllLogs] = useState<LogRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastRefreshed, setLastRefreshed] = useState<string | undefined>(undefined)

  const [selectedSeverities, setSelectedSeverities] = useState<Set<string>>(new Set(['DEBUG','INFO','WARN','ERROR','FATAL']))
  const [source, setSource] = useState('')
  const [query, setQuery] = useState('')
  const [from, setFrom] = useState<string | undefined>(undefined)
  const [to, setTo] = useState<string | undefined>(undefined)

  const [autoRefresh, setAutoRefresh] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [showAlerts, setShowAlerts] = useState(false)
  const [alertEvents, setAlertEvents] = useState<any[]>([])

  const refresh = async () => {
    setLoading(true); setError(null)
    try {
      const logs = await fetchLogs()
      setAllLogs(logs)
      setLastRefreshed(new Date().toISOString())
      try {
        const events = await evaluateAndNotify(logs)
        if (events.length) setAlertEvents(prev => [...events, ...prev].slice(0, 5))
      } catch {}
    } catch (err:any) {
      setError(err.message || 'Failed to fetch logs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [])
  useEffect(() => {
    if (!autoRefresh) return
    const interval = Number(import.meta.env.VITE_POLL_INTERVAL_MS ?? 10000)
    const id = setInterval(refresh, interval)
    return () => clearInterval(id)
  }, [autoRefresh])

  const severities = useMemo(() => ['DEBUG','INFO','WARN','ERROR','FATAL'], [])
  const sources = useMemo(() => uniq(allLogs.map(l => l.source)).sort(), [allLogs])

  const filtered = useMemo(() => {
    return allLogs.filter(l => {
      if (!selectedSeverities.has(l.severity.toString().toUpperCase())) return false
      if (source && !l.source.toLowerCase().includes(source.toLowerCase())) return false
      if (query) {
        const q = query.toLowerCase()
        if (!l.message.toLowerCase().includes(q) && !l.source.toLowerCase().includes(q)) return false
      }
      const t = new Date(l.timestamp).getTime()
      if (from && t < new Date(from).getTime()) return false
      if (to && t > new Date(to).getTime()) return false
      return true
    })
  }, [allLogs, selectedSeverities, source, query, from, to])

  const clearFilters = () => {
    setSelectedSeverities(new Set(['DEBUG','INFO','WARN','ERROR','FATAL']))
    setSource('')
    setQuery('')
    setFrom(undefined)
    setTo(undefined)
  }

  return (
    <div className="min-h-screen bg-transparent">
      <Header onRefresh={refresh} onOpenAdd={() => setShowAdd(true)} onOpenAlerts={() => setShowAlerts(true)} lastRefreshed={lastRefreshed} autoRefresh={autoRefresh} setAutoRefresh={setAutoRefresh} />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-6">
        {isDemoMode && (
          <div className="rounded-2xl border border-brand-500/20 bg-brand-500/5 p-4 text-brand-100 flex items-center gap-4 shadow-glass backdrop-blur-md">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-500/20 flex items-center justify-center border border-brand-500/30">
              <span className="text-xl">🚀</span>
            </div>
            <div>
              <span className="font-semibold text-white tracking-wide">Showcase Mode Active</span>
              <span className="text-brand-200/80 ml-2 text-sm">— Displaying live simulated logs from 10 microservices. In production, this connects to GCP Pub/Sub &amp; Firestore.</span>
            </div>
          </div>
        )}
        {error && !isDemoMode && <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-200 backdrop-blur-md shadow-glass">{error}</div>}
        <StatsCards logs={filtered} />
        <TrendsChart logs={filtered} bucketMinutes={60} />
        <Filters
          severities={severities}
          selectedSeverities={selectedSeverities}
          setSelectedSeverities={setSelectedSeverities}
          sources={sources}
          source={source}
          setSource={setSource}
          query={query}
          setQuery={setQuery}
          from={from}
          to={to}
          setFrom={setFrom}
          setTo={setTo}
          onClear={clearFilters}
        />
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-500">{loading ? 'Loading…' : `Showing ${filtered.length} of ${allLogs.length} logs`}</div>
        </div>
        <LogTable logs={filtered} />
      </main>

      <AlertToaster events={alertEvents} onDismiss={(id)=>setAlertEvents(evts=>evts.filter(e=>e.id!==id))} />

      <AddLogModal open={showAdd} onClose={() => setShowAdd(false)} onAdded={(l) => setAllLogs(prev => [l, ...prev])} />
      <AlertsPanel open={showAlerts} onClose={() => setShowAlerts(false)} />
    </div>
  )
}