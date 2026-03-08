import React from 'react'
import { clsx } from 'clsx'
import type { Severity } from '@/types'

const colors: Record<string, string> = {
  DEBUG: 'bg-gray-500/10 text-gray-400 border border-gray-500/20 shadow-[0_0_10px_-3px_rgba(156,163,175,0.2)]',
  INFO:  'bg-brand-500/10 text-brand-400 border border-brand-500/20 shadow-[0_0_10px_-3px_rgba(14,165,233,0.3)]',
  WARN:  'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_10px_-3px_rgba(245,158,11,0.3)]',
  ERROR: 'bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-[0_0_10px_-3px_rgba(244,63,94,0.3)]',
  FATAL: 'bg-rose-600/20 text-rose-300 border border-rose-500/40 shadow-[0_0_15px_-3px_rgba(225,29,72,0.4)] animate-pulse',
}

export default function SeverityBadge({ value }: { value: Severity }) {
  const key = (value || 'INFO').toString().toUpperCase()
  return (
    <span className={clsx('badge backdrop-blur-sm', colors[key] ?? colors.INFO)}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
      {key}
    </span>
  )
}