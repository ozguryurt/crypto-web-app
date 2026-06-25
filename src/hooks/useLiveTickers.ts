import { useState, useEffect, useCallback, useRef } from "react"
import {
    fetch24hTickers,
    connectMiniTickerStream,
    type Ticker24h,
    type MiniTicker,
} from "@/lib/binance"

// İlk yüklemede REST, sonrasında WebSocket ile canlı fiyat akışı sağlar
export function useLiveTickers(symbols: string[]) {
    const [tickers, setTickers] = useState<Record<string, Ticker24h>>({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const symbolKey = symbols.join(",")
    const wsRef = useRef<(() => void) | null>(null)

    // REST ile ilk veriyi çek
    useEffect(() => {
        let cancelled = false
        async function load() {
            if (symbols.length === 0) {
                if (!cancelled) {
                    setTickers({})
                    setLoading(false)
                }
                return
            }
            try {
                const data = await fetch24hTickers(symbols)
                if (cancelled) return
                const map: Record<string, Ticker24h> = {}
                for (const t of data) {
                    map[t.symbol] = t
                }
                setTickers(map)
                setError(null)
            } catch (e) {
                if (!cancelled) {
                    setError(e instanceof Error ? e.message : "Veri alınamadı")
                }
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        load()
        return () => {
            cancelled = true
        }
    }, [symbolKey])

    // Sembol listesi değişince WebSocket'i yeniden bağla
    useEffect(() => {
        if (wsRef.current) {
            wsRef.current()
            wsRef.current = null
        }

        if (symbols.length === 0) return

        const disconnect = connectMiniTickerStream(symbols, (mini: MiniTicker) => {
            setTickers((prev) => {
                const existing = prev[mini.s]
                const updated: Ticker24h = {
                    symbol: mini.s,
                    lastPrice: mini.c,
                    priceChangePercent: existing?.priceChangePercent ?? "0",
                    highPrice: mini.h,
                    lowPrice: mini.l,
                    volume: mini.v,
                    quoteVolume: mini.q,
                }
                return { ...prev, [mini.s]: updated }
            })
        })
        wsRef.current = disconnect

        return () => {
            disconnect()
            wsRef.current = null
        }
    }, [symbolKey])

    const getTicker = useCallback(
        (symbol: string) => tickers[symbol] ?? null,
        [tickers],
    )

    return { tickers, loading, error, getTicker } as const
}