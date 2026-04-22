import type { MarketId } from "./markets"

export const INTERVALS = [
  "1m",
  "5m",
  "15m",
  "30m",
  "1h",
  "2h",
  "3h",
  "4h",
  "1D",
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

const INTERVAL_META: Record<Interval, { count: number; stepMs: number; fmt: (d: Date) => string }> = {
  "1m":  { count: 60,  stepMs: 60_000,           fmt: hhmm },
  "5m":  { count: 60,  stepMs: 5 * 60_000,       fmt: hhmm },
  "15m": { count: 48,  stepMs: 15 * 60_000,      fmt: hhmm },
  "30m": { count: 48,  stepMs: 30 * 60_000,      fmt: hhmm },
  "1h":  { count: 48,  stepMs: 3_600_000,        fmt: hhmm },
  "2h":  { count: 48,  stepMs: 2 * 3_600_000,    fmt: ddHH },
  "3h":  { count: 40,  stepMs: 3 * 3_600_000,    fmt: ddHH },
  "4h":  { count: 42,  stepMs: 4 * 3_600_000,    fmt: ddHH },
  "1D":  { count: 90,  stepMs: 86_400_000,       fmt: mmdd },
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

const BASE_PRICES: Record<MarketId, number> = {
  btc: 98_400,
  eth: 3_245,
  sol: 178,
}

function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

function generateCandles(
  marketId: MarketId,
  interval: Interval,
): CandlePoint[] {
  const { count, stepMs, fmt } = INTERVAL_META[interval]
  const basePrice = BASE_PRICES[marketId]
  const volatility = basePrice * 0.003

  const seed =
    marketId.charCodeAt(0) * 1000 +
    interval.charCodeAt(0) * 100 +
    interval.length * 17
  const rand = seededRandom(seed)

  const now = Date.now()
  const startTime = now - count * stepMs
  const candles: CandlePoint[] = []
  let prev = basePrice

  for (let i = 0; i < count; i++) {
    const t = new Date(startTime + i * stepMs)
    const change = (rand() - 0.48) * volatility
    const open = prev
    const close = open + change
    const high = Math.max(open, close) + rand() * volatility * 0.5
    const low = Math.min(open, close) - rand() * volatility * 0.5
    const volume = 100 + rand() * 900

    candles.push({
      time: fmt(t),
      open: +open.toFixed(2),
      high: +high.toFixed(2),
      low: +low.toFixed(2),
      close: +close.toFixed(2),
      volume: +volume.toFixed(0),
    })
    prev = close
  }
  return candles
}

type CacheKey = `${MarketId}_${Interval}`
const cache = new Map<CacheKey, CandlePoint[]>()

export function getChartData(
  marketId: MarketId,
  interval: Interval,
): CandlePoint[] {
  const key: CacheKey = `${marketId}_${interval}`
  let data = cache.get(key)
  if (!data) {
    data = generateCandles(marketId, interval)
    cache.set(key, data)
  }
  return data
}
