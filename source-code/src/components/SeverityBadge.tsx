import React from 'react'
import { clsx } from 'clsx'
import type { Severity } from '@/types'

const colors: Record<string, string> = {
  DEBUG: 'bg-slate-100 text-slate-800 ring-1 ring-slate-300',
  INFO: 'bg-blue-100 text-blue-800 ring-1 ring-blue-300',
  WARN: 'bg-yellow-100 text-yellow-800 ring-1 ring-yellow-300',
  ERROR: 'bg-red-100 text-red-800 ring-1 ring-red-300',
  FATAL: 'bg-purple-100 text-purple-900 ring-1 ring-purple-300',
}

export default function SeverityBadge({ value }: { value: Severity }) {
  const key = (value || 'INFO').toString().toUpperCase()
  return (
    <span className={clsx('badge', colors[key] ?? colors.INFO)}>
      {key}
    </span>
  )
}