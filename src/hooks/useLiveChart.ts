import { useState, useEffect, useCallback } from "react"
import { fetchKlines, type Kline } from "@/lib/binance"
import { type CandlePoint, type Interval, INTERVAL_META } from "@/data/chart-data"

// Arayüz zaman aralığını Binance kline koduna çevirir
function toBinanceInterval(interval: Interval): string {
    const map: Record<Interval, string> = {
        "1m": "1m",
        "5m": "5m",
        "15m": "15m",
        "30m": "30m",
        "1h": "1h",
        "4h": "4h",
        "1D": "1d",
        "1W": "1w",
    }
    return map[interval]
}

// Binance kline dizisini CandlePoint biçimine dönüştürür
function klinesToCandles(k: Kline[], interval: Interval): CandlePoint[] {
    const meta = INTERVAL_META[interval]
    return k.map((c) => ({
        time: meta.fmt(new Date(c.openTime)),
        open: parseFloat(c.open),
        high: parseFloat(c.high),
        low: parseFloat(c.low),
        close: parseFloat(c.close),
        volume: parseFloat(c.volume),
    }))
}

// Seçili sembol ve zaman aralığı için canlı mum verisi çeker
export function useLiveChart(symbol: string, interval: Interval) {
    const [data, setData] = useState<CandlePoint[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const load = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const binanceInterval = toBinanceInterval(interval)
            const count = INTERVAL_META[interval].count
            const klines = await fetchKlines(symbol, binanceInterval, count)
            const candles = klinesToCandles(klines, interval)
            setData(candles)
            setError(null)
        } catch (e) {
            setError(e instanceof Error ? e.message : "Grafik verisi alınamadı")
        } finally {
            setLoading(false)
        }
    }, [symbol, interval])

    useEffect(() => {
        load()
    }, [load])

    return { data, loading, error, refetch: load } as const
}