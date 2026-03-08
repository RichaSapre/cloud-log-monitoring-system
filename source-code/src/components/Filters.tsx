import React from 'react'
import { formatISO } from 'date-fns'
import { clsx } from 'clsx'
import { Filter, Search } from 'lucide-react'

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
    className={clsx('px-4 py-1.5 rounded-full border text-sm transition-all tracking-wide font-medium', 
    active ? 'bg-brand-500/20 text-brand-300 border-brand-500/50 shadow-[0_0_10px_-2px_rgba(14,165,233,0.3)]' : 'bg-white/5 text-gray-400 border-white/5 hover:border-white/20 hover:text-white')}>
    {children}
  </button>
)

export default function Filters(props: Props) {
  const { severities, selectedSeverities, setSelectedSeverities, source, setSource, query, setQuery, from, to, setFrom, setTo, onClear } = props

  const toggleSeverity = (s: string) => {
    const next = new Set(selectedSeverities)
    if (next.has(s)) { next.delete(s) } else { next.add(s) }
    setSelectedSeverities(next)
  }

  return (
    <div className="glass-panel p-5">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-gray-400 text-sm font-medium flex items-center gap-2 mr-2"><Filter className="w-4 h-4" /> Filters</span>
          {severities.map(s => (
            <Toggle key={s} active={selectedSeverities.has(s)} onClick={() => toggleSeverity(s)}>{s}</Toggle>
          ))}
          <div className="flex-1"></div>
          <button onClick={onClear} className="rounded-xl border border-white/10 text-gray-400 px-4 py-1.5 text-sm hover:bg-white/5 hover:text-white transition-all transition-colors backdrop-blur-sm">Clear All</button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[16rem]">
            <input
              value={source}
              onChange={e => setSource(e.target.value)}
              placeholder="Filter by source (e.g., payment-service)"
              className="w-full rounded-xl border border-white/10 bg-black/20 focus:bg-black/40 px-4 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition-all outline-none"
            />
          </div>
          <div className="relative flex-1 min-w-[16rem]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search message or trace ID"
              className="w-full rounded-xl border border-white/10 bg-black/20 focus:bg-black/40 pl-10 pr-4 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition-all outline-none"
            />
          </div>
          <input
            type="datetime-local"
            value={from ? new Date(from).toISOString().slice(0,16) : ''}
            onChange={e => setFrom(e.target.value ? formatISO(new Date(e.target.value)) : undefined)}
            className="rounded-xl border border-white/10 bg-black/20 focus:bg-black/40 px-4 py-2.5 text-sm text-gray-300 focus:border-brand-500/50 transition-all outline-none [color-scheme:dark]"
          />
          <span className="text-gray-600">—</span>
          <input
            type="datetime-local"
            value={to ? new Date(to).toISOString().slice(0,16) : ''}
            onChange={e => setTo(e.target.value ? formatISO(new Date(e.target.value)) : undefined)}
            className="rounded-xl border border-white/10 bg-black/20 focus:bg-black/40 px-4 py-2.5 text-sm text-gray-300 focus:border-brand-500/50 transition-all outline-none [color-scheme:dark]"
          />
        </div>
      </div>
    </div>
  )
}