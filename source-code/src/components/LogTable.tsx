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
    <div className="card overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-slate-600 dark:text-slate-300">
            <th className="py-2 pr-4">Message</th>
            <th className="py-2 pr-4">
              <button className="inline-flex items-center gap-1" onClick={() => toggleSort('severity')}>
                Severity <ArrowUpDown className="h-4 w-4" />
              </button>
            </th>
            <th className="py-2 pr-4">
              <button className="inline-flex items-center gap-1" onClick={() => toggleSort('source')}>
                Source <ArrowUpDown className="h-4 w-4" />
              </button>
            </th>
            <th className="py-2 pr-4">
              <button className="inline-flex items-center gap-1" onClick={() => toggleSort('timestamp')}>
                Timestamp <ArrowUpDown className="h-4 w-4" />
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((log, idx) => (
            <tr key={log.id ?? idx} className={clsx('border-t border-slate-100 dark:border-slate-800', idx % 2 === 0 ? 'bg-white/50 dark:bg-slate-900/20' : '')}>
              <td className="py-2 pr-4 align-top text-slate-900 dark:text-slate-100">{log.message}</td>
              <td className="py-2 pr-4 align-top"><SeverityBadge value={log.severity} /></td>
              <td className="py-2 pr-4 align-top text-slate-700 dark:text-slate-300">{log.source}</td>
              <td className="py-2 pr-4 align-top text-slate-500">{format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss')}</td>
            </tr>
          ))}
          {sorted.length === 0 && (
            <tr><td colSpan={4} className="py-6 text-center text-slate-500">No logs match your filters.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}