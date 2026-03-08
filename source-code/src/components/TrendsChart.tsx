import React, { useMemo, useState, useRef, useEffect } from 'react'
import type { LogRecord } from '@/types'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts'
import { format, subMinutes, startOfMinute } from 'date-fns'

type Props = { logs: LogRecord[]; bucketMinutes?: number }

function bucketize(logs: LogRecord[], bucketMinutes: number, numBuckets: number = 24) {
  const data = []
  const now = startOfMinute(new Date()).getTime()
  const bucketMs = bucketMinutes * 60 * 1000
  
  // Initialize fixed buckets for a consistent X-axis
  for (let i = numBuckets - 1; i >= 0; i--) {
    const time = now - (i * bucketMs)
    data.push({
      time,
      DEBUG: 0,
      INFO: 0,
      WARN: 0,
      ERROR: 0,
      FATAL: 0
    })
  }

  // Fill buckets with logs
  for (const l of logs) {
    const t = new Date(l.timestamp).getTime()
    const bucketIndex = Math.floor((t - (now - (numBuckets - 1) * bucketMs)) / bucketMs)
    
    if (bucketIndex >= 0 && bucketIndex < numBuckets) {
      const sev = (l.severity || 'INFO').toString().toUpperCase()
      const rec = data[bucketIndex]
      if (sev in rec) (rec as any)[sev]++
      else rec.INFO++
    }
  }
  
  return data
}

export default function TrendsChart({ logs, bucketMinutes: defaultBucket=60 }: Props) {
  const [bucket, setBucket] = useState(defaultBucket)
  const [yScale, setYScale] = useState(1.2) // Default multiplier for Y-axis domain
  const [isResizing, setIsResizing] = useState(false)
  const startY = useRef(0)
  const startYScale = useRef(1.2)
  
  const data = useMemo(() => bucketize(logs, bucket), [logs, bucket])
  
  // Calculate max value for Y-axis domain control
  const maxDataVal = useMemo(() => {
    let max = 0
    data.forEach(d => {
      const sum = d.DEBUG + d.INFO + d.WARN + d.ERROR + d.FATAL
      if (sum > max) max = sum
    })
    return max || 10
  }, [data])

  const options = [
    { label: '5m', value: 5 },
    { label: '15m', value: 15 },
    { label: '1h', value: 60 },
    { label: '2h', value: 120 },
  ]

  // Y-Axis resize logic
  const onMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true)
    startY.current = e.clientY
    startYScale.current = yScale
    document.body.style.cursor = 'ns-resize'
  }

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isResizing) return
      const delta = startY.current - e.clientY
      const newScale = Math.max(0.5, startYScale.current + (delta / 100))
      setYScale(newScale)
    }

    const onMouseUp = () => {
      setIsResizing(false)
      document.body.style.cursor = 'default'
    }

    if (isResizing) {
      window.addEventListener('mousemove', onMouseMove)
      window.addEventListener('mouseup', onMouseUp)
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [isResizing])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel p-3 shadow-glow !bg-gray-900/90 border-white/10">
          <p className="text-gray-300 text-[10px] mb-2 font-mono uppercase tracking-widest">
            {format(new Date(Number(label)), 'HH:mm:ss')} (UTC)
          </p>
          {payload.map((p: any) => (
            <div key={p.dataKey} className="flex items-center justify-between gap-4 text-xs font-medium mb-1 last:mb-0">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }} />
                <span className="text-gray-400">{p.dataKey}</span>
              </div>
              <span className="text-white font-bold">{p.value}</span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="card h-96 relative group select-none">
      <div className="absolute inset-0 bg-brand-500/5 blur-3xl rounded-[3rem] -z-10 group-hover:bg-brand-500/10 transition-colors"></div>
      
      <div className="flex items-center justify-between mb-6">
        <div className="text-sm text-gray-400 font-medium tracking-wide uppercase flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse shadow-[0_0_8px_rgba(14,165,233,0.5)]"></div>
          Infrastructure Pulse
        </div>
        
        <div className="flex items-center gap-4">
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
          <button 
            onClick={() => setYScale(1.2)}
            className="text-[10px] text-gray-500 hover:text-brand-400 font-bold uppercase tracking-widest transition-colors"
          >
            Reset Scale
          </button>
        </div>
      </div>

      <div className="relative w-full h-[75%] mt-4">
        {/* Y-Axis Handle Area for Resizing */}
        <div 
          onMouseDown={onMouseDown}
          className="absolute left-0 top-0 bottom-0 w-12 z-20 cursor-ns-resize group/axis"
          title="Drag up/down to scale Y-axis"
        >
          <div className="absolute inset-y-0 left-8 w-[1px] bg-white/0 group-hover/axis:bg-brand-500/30 transition-colors" />
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
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
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
            <XAxis 
              dataKey="time" 
              tickFormatter={(v) => format(new Date(v), 'HH:mm')} 
              stroke="rgba(255,255,255,0.1)" 
              tick={{ fill: '#4B5563', fontSize: 10, fontWeight: 600 }} 
              dy={10} 
              interval={2} // Show fewer ticks to avoid clutter
            />
            <YAxis 
              domain={[0, Math.ceil(maxDataVal * yScale)]}
              allowDecimals={false} 
              stroke="rgba(255,255,255,0.1)" 
              tick={{ fill: '#4B5563', fontSize: 10, fontWeight: 600 }} 
              dx={-5} 
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(56, 189, 248, 0.2)', strokeWidth: 2 }} />
            <Legend iconType="circle" wrapperStyle={{ paddingTop: '30px', fontSize: '11px', color: '#6B7280', fontWeight: 500 }} />
            <Area isAnimationActive={false} type="monotone" dataKey="DEBUG" stackId="1" stroke="#9CA3AF" fill="url(#colorDebug)" strokeWidth={1.5} activeDot={{ r: 4, strokeWidth: 0, fill: '#9CA3AF' }} />
            <Area isAnimationActive={false} type="monotone" dataKey="INFO" stackId="1" stroke="#38bdf8" fill="url(#colorInfo)" strokeWidth={1.5} activeDot={{ r: 4, strokeWidth: 0, fill: '#38bdf8' }} />
            <Area isAnimationActive={false} type="monotone" dataKey="WARN" stackId="1" stroke="#fbbf24" fill="url(#colorWarn)" strokeWidth={1.5} activeDot={{ r: 4, strokeWidth: 0, fill: '#fbbf24' }} />
            <Area isAnimationActive={false} type="monotone" dataKey="ERROR" stackId="1" stroke="#f43f5e" fill="url(#colorError)" strokeWidth={1.5} activeDot={{ r: 4, strokeWidth: 0, fill: '#f43f5e' }} />
            <Area isAnimationActive={false} type="monotone" dataKey="FATAL" stackId="1" stroke="#9f1239" fill="url(#colorFatal)" strokeWidth={1.5} activeDot={{ r: 4, strokeWidth: 0, fill: '#9f1239' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}