import React, { useMemo } from 'react'
import type { LogRecord } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { Activity, AlertTriangle, Server, Clock } from 'lucide-react'

type CardProps = { label: string, value: string, icon: React.ReactNode, color: string }
const StatCard = ({label, value, icon, color}: CardProps) => (
  <div className="card group relative overflow-hidden">
    <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl opacity-10 transition-opacity group-hover:opacity-30 pointer-events-none ${color}`}></div>
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 shadow-sm ${color.replace('bg-', 'text-').replace('500', '400')}`}>
        {icon}
      </div>
      <div>
        <div className="text-gray-400 text-sm font-medium">{label}</div>
        <div className="text-2xl font-bold mt-0.5 text-white tracking-tight">{value}</div>
      </div>
    </div>
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard label="Total Logs (24h)" value={String(stats.total)} icon={<Activity className="w-5 h-5" />} color="bg-brand-500" />
      <StatCard label="Critical Errors" value={String(stats.last24)} icon={<AlertTriangle className="w-5 h-5" />} color="bg-rose-500" />
      <StatCard label="Active Microservices" value={String(stats.uniqueSources)} icon={<Server className="w-5 h-5" />} color="bg-emerald-500" />
      <StatCard label="Latest Sync" value={stats.lastUpdate ? formatDistanceToNow(stats.lastUpdate, { addSuffix: true }) : '—'} icon={<Clock className="w-5 h-5" />} color="bg-indigo-500" />
    </div>
  )
}