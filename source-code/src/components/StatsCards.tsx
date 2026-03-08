import React, { useMemo } from 'react'
import type { LogRecord } from '@/types'
import { formatDistanceToNow } from 'date-fns'

type CardProps = { label: string, value: string }
const StatCard = ({label, value}: CardProps) => (
  <div className="card">
    <div className="text-slate-500 text-sm">{label}</div>
    <div className="text-2xl font-semibold mt-1 text-slate-900 dark:text-white">{value}</div>
  </div>
)

export default function StatsCards({ logs }: { logs: LogRecord[] }) {
  const stats = useMemo(() => {
    const total = logs.length
    const errors = logs.filter(l => ['ERROR','FATAL'].includes(l.severity.toString().toUpperCase()))
    const last24 = errors.filter(l => (Date.now() - new Date(l.timestamp).getTime()) < 24*3600*1000).length
    const sources = new Set(logs.map(l => l.source))
    const last = logs.reduce<number>((acc, l) => Math.max(acc, new Date(l.timestamp).getTime()), 0)
    return { total, last24, uniqueSources: sources.size, lastUpdate: last }
  }, [logs])

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard label="Total Logs" value={String(stats.total)} />
      <StatCard label="Errors (24h)" value={String(stats.last24)} />
      <StatCard label="Unique Sources" value={String(stats.uniqueSources)} />
      <StatCard label="Most Recent" value={stats.lastUpdate ? formatDistanceToNow(stats.lastUpdate, { addSuffix: true }) : '—'} />
    </div>
  )
}