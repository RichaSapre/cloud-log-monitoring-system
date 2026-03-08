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
import { fetchLogs } from '@/lib/api'
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
    <div className="min-h-screen">
      <Header onRefresh={refresh} onOpenAdd={() => setShowAdd(true)} onOpenAlerts={() => setShowAlerts(true)} lastRefreshed={lastRefreshed} autoRefresh={autoRefresh} setAutoRefresh={setAutoRefresh} />
      <main className="mx-auto max-w-7xl px-6 py-6 space-y-4">
        {error && <div className="rounded-xl border border-red-300 bg-red-50 p-3 text-red-800">{error}</div>}
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