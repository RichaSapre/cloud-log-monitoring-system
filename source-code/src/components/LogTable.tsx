import React, { useMemo, useState } from 'react'
import SeverityBadge from './SeverityBadge'
import type { LogRecord } from '@/types'
import { ArrowUpDown } from 'lucide-react'
import { format } from 'date-fns'
import { clsx } from 'clsx'

type Props = { logs: LogRecord[] }
type SortKey = 'timestamp' | 'severity' | 'source'
type SortDir = 'asc' | 'desc'

export default function LogTable({ logs }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('timestamp')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const sorted = useMemo(() => {
    const copy = [...logs]
    copy.sort((a,b) => {
      let av:any, bv:any
      switch (sortKey) {
        case 'timestamp':
          av = new Date(a.timestamp).getTime(); bv = new Date(b.timestamp).getTime(); break
        case 'severity':
          const order = ['DEBUG','INFO','WARN','ERROR','FATAL']
          av = order.indexOf(a.severity.toString().toUpperCase()); bv = order.indexOf(b.severity.toString().toUpperCase()); break
        case 'source':
          av = a.source; bv = b.source; break
      }
      const comp = av < bv ? -1 : av > bv ? 1 : 0
      return sortDir === 'asc' ? comp : -comp
    })
    return copy
  }, [logs, sortKey, sortDir])

  const toggleSort = (k: SortKey) => {
    if (k === sortKey) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(k); setSortDir('desc') }
  }

  return (
    <div className="card overflow-x-auto !p-0 border-white/5">
      <table className="min-w-full text-sm font-medium">
        <thead>
          <tr className="text-left text-gray-400 bg-gray-900/50 border-b border-white/10 uppercase tracking-wider text-xs">
            <th className="py-4 px-6 font-semibold">Message</th>
            <th className="py-4 px-6 font-semibold">
              <button className="inline-flex items-center gap-1 hover:text-white transition-colors" onClick={() => toggleSort('severity')}>
                Severity <ArrowUpDown className="h-4 w-4 opacity-50" />
              </button>
            </th>
            <th className="py-4 px-6 font-semibold">
              <button className="inline-flex items-center gap-1 hover:text-white transition-colors" onClick={() => toggleSort('source')}>
                Source <ArrowUpDown className="h-4 w-4 opacity-50" />
              </button>
            </th>
            <th className="py-4 px-6 font-semibold">
              <button className="inline-flex items-center gap-1 hover:text-white transition-colors" onClick={() => toggleSort('timestamp')}>
                Timestamp <ArrowUpDown className="h-4 w-4 opacity-50" />
              </button>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {sorted.map((log, idx) => (
            <tr key={log.id ?? idx} className={clsx('transition-colors hover:bg-white/5 group', idx % 2 === 0 ? 'bg-transparent' : 'bg-gray-900/20')}>
              <td className="py-4 px-6 align-top text-gray-200">
                <div className="font-mono text-xs opacity-0 group-hover:opacity-100 transition-opacity absolute -ml-4 text-brand-500">›</div>
                {log.message}
              </td>
              <td className="py-4 px-6 align-top"><SeverityBadge value={log.severity} /></td>
              <td className="py-4 px-6 align-top text-brand-300 font-mono text-xs">{log.source}</td>
              <td className="py-4 px-6 align-top text-gray-500 font-mono text-xs">{format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss')}</td>
            </tr>
          ))}
          {sorted.length === 0 && (
            <tr><td colSpan={4} className="py-12 text-center text-gray-500">No logs match your filters.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}