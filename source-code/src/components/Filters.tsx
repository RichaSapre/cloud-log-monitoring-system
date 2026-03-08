import React from 'react'
import { formatISO } from 'date-fns'
import { clsx } from 'clsx'

type Props = {
  severities: string[]
  selectedSeverities: Set<string>
  setSelectedSeverities: (s: Set<string>) => void
  sources: string[]
  source: string
  setSource: (v: string) => void
  query: string
  setQuery: (v: string) => void
  from?: string
  to?: string
  setFrom: (v?: string) => void
  setTo: (v?: string) => void
  onClear: () => void
}

const Toggle = ({ active, children, onClick }:{active:boolean, children:React.ReactNode, onClick:()=>void}) => (
  <button onClick={onClick}
    className={clsx('px-3 py-1 rounded-full border text-sm', active ? 'bg-slate-900 text-white border-slate-900' : 'bg-white dark:bg-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700')}>
    {children}
  </button>
)

export default function Filters(props: Props) {
  const { severities, selectedSeverities, setSelectedSeverities, sources, source, setSource, query, setQuery, from, to, setFrom, setTo, onClear } = props

  const toggleSeverity = (s: string) => {
    const next = new Set(selectedSeverities)
    if (next.has(s)) { next.delete(s) } else { next.add(s) }
    setSelectedSeverities(next)
  }

  return (
    <div className="card">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          {severities.map(s => (
            <Toggle key={s} active={selectedSeverities.has(s)} onClick={() => toggleSeverity(s)}>{s}</Toggle>
          ))}
        </div>
        <input
          value={source}
          onChange={e => setSource(e.target.value)}
          placeholder="Filter by source (e.g., payment-service)"
          className="flex-1 min-w-[16rem] rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
        />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search message or source"
          className="flex-1 min-w-[16rem] rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
        />
        <input
          type="datetime-local"
          value={from ?? ''}
          onChange={e => setFrom(e.target.value ? formatISO(new Date(e.target.value)) : undefined)}
          className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
        />
        <span className="text-slate-500">to</span>
        <input
          type="datetime-local"
          value={to ?? ''}
          onChange={e => setTo(e.target.value ? formatISO(new Date(e.target.value)) : undefined)}
          className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
        />
        <button onClick={onClear} className="rounded-xl border px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700">Clear</button>
      </div>
    </div>
  )
}