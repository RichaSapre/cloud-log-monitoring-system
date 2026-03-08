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

export default function TrendsChart({ logs, bucketMinutes=60 }: Props) {
  const data = useMemo(() => bucketize(logs, bucketMinutes), [logs, bucketMinutes])
  return (
    <div className="card h-80">
      <div className="text-sm text-slate-500 mb-2">Logs over time (bucket: {bucketMinutes} min)</div>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" tickFormatter={(v) => format(new Date(v), 'MM-dd HH:mm')} />
          <YAxis allowDecimals={false} />
          <Tooltip labelFormatter={(v) => format(new Date(Number(v)), 'PPpp')} />
          <Legend />
          <Area type="monotone" dataKey="DEBUG" stackId="1" />
          <Area type="monotone" dataKey="INFO" stackId="1" />
          <Area type="monotone" dataKey="WARN" stackId="1" />
          <Area type="monotone" dataKey="ERROR" stackId="1" />
          <Area type="monotone" dataKey="FATAL" stackId="1" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}