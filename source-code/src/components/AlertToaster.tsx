import React from 'react'
import type { AlertEvent } from '@/types'
import { BellRing, X } from 'lucide-react'

type Props = { events: AlertEvent[]; onDismiss: (id: string) => void }

export default function AlertToaster({ events, onDismiss }: Props) {
  if (events.length === 0) return null
  return (
    <div className="fixed top-4 right-4 z-50 space-y-3">
      {events.map(ev => (
        <div key={ev.id} className="rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-900/30 dark:border-amber-700 p-3 shadow">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <BellRing className="h-5 w-5 text-amber-600" />
              <div>
                <div className="font-medium text-amber-800 dark:text-amber-200">Alert: {ev.ruleName}</div>
                <div className="text-sm text-amber-700 dark:text-amber-300">
                  {ev.matchedCount} match(es) between {new Date(ev.windowStart).toLocaleTimeString()}–{new Date(ev.windowEnd).toLocaleTimeString()}
                </div>
                {ev.latestLog && <div className="mt-1 text-sm text-slate-700 dark:text-slate-200"><span className="font-semibold">{ev.latestLog.source}</span>: {ev.latestLog.message}</div>}
              </div>
            </div>
            <button onClick={()=>onDismiss(ev.id)} className="rounded-md p-1 hover:bg-amber-100 dark:hover:bg-amber-800">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}