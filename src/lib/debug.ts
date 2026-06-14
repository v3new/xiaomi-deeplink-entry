import {writable} from 'svelte/store'

export type DebugLevel = 'error' | 'info' | 'ok' | 'warn'

export type DebugEntry = {
  details?: string
  id: number
  level: DebugLevel
  message: string
  scope: string
  time: string
}

const MAX_LOGS = 120

let nextId = 1

export const debugEnabled =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug') === '1'

export const debugLogs = writable<DebugEntry[]>([])

function stringifyDetails(details: unknown): string | undefined {
  if (details === undefined || details === null) return undefined
  if (details instanceof Error) return details.message
  if (typeof details === 'string') return details

  try {
    return JSON.stringify(details)
  } catch (_e) {
    return String(details)
  }
}

function timeStamp(): string {
  return new Date().toLocaleTimeString('en-GB', {hour12: false})
}

export function clearDebugLogs(): void {
  debugLogs.set([])
}

export function debugLog(scope: string, message: string, level: DebugLevel = 'info', details?: unknown): void {
  if (!debugEnabled) return

  const entry: DebugEntry = {
    details: stringifyDetails(details),
    id: nextId,
    level,
    message,
    scope,
    time: timeStamp(),
  }
  nextId += 1

  debugLogs.update(logs => [...logs, entry].slice(-MAX_LOGS))

  const prefix = `[dbg:${scope}] ${message}`
  if (level === 'error') console.error(prefix, details ?? '')
  else if (level === 'warn') console.warn(prefix, details ?? '')
  else console.info(prefix, details ?? '')
}
