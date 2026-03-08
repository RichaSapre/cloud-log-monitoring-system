import React, { useMemo } from 'react'
import type { LogRecord } from '@/types'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts'
import { format } from 'date-fns'

type Props = { logs: LogRecord[]; bucketMinutes?: number }

function bucketize(logs: LogRecord[], bucketMinutes: number) {
  const map = new Map<string, { time: number, DEBUG: number, INFO: number, WARN: number, ERROR: number, FATAL: number }>()
  const bucketMs = bucketMinutes * 60 * 1000
  for (const l of logs) {
    const t = new Date(l.timestamp).getTime()
    const bucket = Math.floor(t / bucketMs) * bucketMs
    const key = String(bucket)
    if (!map.has(key)) map.set(key, { time: bucket, DEBUG:0, INFO:0, WARN:0, ERROR:0, FATAL:0 })
    const rec = map.get(key)!
    const sev = (l.severity || 'INFO').toString().toUpperCase()
    if (sev in rec) (rec as any)[sev]++
    else (rec as any)['INFO']++
  }
  return Array.from(map.values()).sort((a,b)=>a.time-b.time)
}

export default function TrendsChart({ logs, bucketMinutes: defaultBucket=60 }: Props) {
  const [bucket, setBucket] = React.useState(defaultBucket)
  const data = useMemo(() => bucketize(logs, bucket), [logs, bucket])
  
  const options = [
    { label: '5m', value: 5 },
    { label: '15m', value: 15 },
    { label: '1h', value: 60 },
    { label: '2h', value: 120 },
  ]

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel p-3 shadow-glow !bg-gray-900/90 border-white/10">
          <p className="text-gray-300 text-xs mb-2">{format(new Date(Number(label)), 'PPpp')}</p>
          {payload.map((p: any) => (
            <div key={p.dataKey} className="flex items-center gap-2 text-sm font-medium">
              <div className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: p.color, color: p.color }} />
              <span className="text-gray-100">{p.dataKey}:</span>
              <span className="text-white">{p.value}</span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="card h-96 relative group">
      <div className="absolute inset-0 bg-brand-500/5 blur-3xl rounded-[3rem] -z-10 group-hover:bg-brand-500/10 transition-colors"></div>
      
      <div className="flex items-center justify-between mb-6">
        <div className="text-sm text-gray-400 font-medium tracking-wide uppercase flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></div>
          Log Volume Trends
        </div>
        
        <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 backdrop-blur-sm">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setBucket(opt.value)}
              className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                bucket === opt.value 
                ? 'bg-brand-500 text-white shadow-glow' 
                : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height="80%">
        <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="colorDebug" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#9CA3AF" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#9CA3AF" stopOpacity={0.0}/>
            </linearGradient>
            <linearGradient id="colorInfo" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0}/>
            </linearGradient>
            <linearGradient id="colorWarn" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.0}/>
            </linearGradient>
            <linearGradient id="colorError" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0}/>
            </linearGradient>
            <linearGradient id="colorFatal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#9f1239" stopOpacity={0.5}/>
              <stop offset="95%" stopColor="#9f1239" stopOpacity={0.0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="time" tickFormatter={(v) => format(new Date(v), 'HH:mm')} stroke="rgba(255,255,255,0.2)" tick={{ fill: '#9CA3AF', fontSize: 12 }} dy={10} />
          <YAxis allowDecimals={false} stroke="rgba(255,255,255,0.2)" tick={{ fill: '#9CA3AF', fontSize: 12 }} dx={-10} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2, fill: 'rgba(255,255,255,0.02)' }} />
          <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px', color: '#D1D5DB' }} />
          <Area type="monotone" dataKey="DEBUG" stackId="1" stroke="#9CA3AF" fill="url(#colorDebug)" strokeWidth={2} activeDot={{ r: 6, strokeWidth: 0, fill: '#9CA3AF' }} />
          <Area type="monotone" dataKey="INFO" stackId="1" stroke="#38bdf8" fill="url(#colorInfo)" strokeWidth={2} activeDot={{ r: 6, strokeWidth: 0, fill: '#38bdf8' }} />
          <Area type="monotone" dataKey="WARN" stackId="1" stroke="#fbbf24" fill="url(#colorWarn)" strokeWidth={2} activeDot={{ r: 6, strokeWidth: 0, fill: '#fbbf24' }} />
          <Area type="monotone" dataKey="ERROR" stackId="1" stroke="#f43f5e" fill="url(#colorError)" strokeWidth={2} activeDot={{ r: 6, strokeWidth: 0, fill: '#f43f5e' }} />
          <Area type="monotone" dataKey="FATAL" stackId="1" stroke="#9f1239" fill="url(#colorFatal)" strokeWidth={2} activeDot={{ r: 6, strokeWidth: 0, fill: '#9f1239' }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}