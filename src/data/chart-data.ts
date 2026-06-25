export const INTERVALS = [
  "1m",
  "5m",
  "15m",
  "30m",
  "1h",
  "4h",
  "1D",
  "1W",
] as const

export type Interval = (typeof INTERVALS)[number]

export interface CandlePoint {
  time: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

// Her zaman aralığı için format, sayı ve adım bilgisi
export const INTERVAL_META: Record<
  Interval,
  { count: number; stepMs: number; fmt: (d: Date) => string }
> = {
  "1m": { count: 60, stepMs: 60_000, fmt: hhmm },
  "5m": { count: 60, stepMs: 5 * 60_000, fmt: hhmm },
  "15m": { count: 48, stepMs: 15 * 60_000, fmt: hhmm },
  "30m": { count: 48, stepMs: 30 * 60_000, fmt: hhmm },
  "1h": { count: 48, stepMs: 3_600_000, fmt: hhmm },
  "4h": { count: 42, stepMs: 4 * 3_600_000, fmt: ddHH },
  "1D": { count: 90, stepMs: 86_400_000, fmt: mmdd },
  "1W": { count: 52, stepMs: 7 * 86_400_000, fmt: mmdd },
}

function hhmm(d: Date) {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}
function ddHH(d: Date) {
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)} ${pad(d.getHours())}:00`
}
function mmdd(d: Date) {
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`
}
function pad(n: number) {
  return n.toString().padStart(2, "0")
}