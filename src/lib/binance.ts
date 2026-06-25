// Binance genel API ve WebSocket servisi (API anahtarı gerekmez)

export interface Ticker24h {
    symbol: string
    lastPrice: string
    priceChangePercent: string
    highPrice: string
    lowPrice: string
    volume: string
    quoteVolume: string
}

export interface Kline {
    openTime: number
    open: string
    high: string
    low: string
    close: string
    volume: string
    closeTime: number
}

export interface MiniTicker {
    e: "24hrMiniTicker"
    E: number
    s: string
    c: string
    o: string
    h: string
    l: string
    v: string
    q: string
}

const REST_BASE = "https://api.binance.com/api/v3"
const WS_BASE = "wss://stream.binance.com:9443/ws"

export const DEFAULT_SYMBOLS = ["BTCUSDT", "ETHUSDT", "SOLUSDT"]

export interface BinanceSymbolInfo {
    symbol: string
    baseAsset: string
    quoteAsset: string
    status: string
}

interface ExchangeInfoResponse {
    symbols: BinanceSymbolInfo[]
}

let cachedSymbols: BinanceSymbolInfo[] | null = null

// Binance'teki tüm USDT paritelerini çeker (hafızada tutulur)
export async function fetchUsdtSymbols(): Promise<BinanceSymbolInfo[]> {
    if (cachedSymbols) return cachedSymbols

    const data = await fetchJSON<ExchangeInfoResponse>(`${REST_BASE}/exchangeInfo`)
    cachedSymbols = data.symbols.filter(
        (s) =>
            s.quoteAsset === "USDT" &&
            s.status === "TRADING" &&
            !s.symbol.includes("DOWN") &&
            !s.symbol.includes("UP"),
    )
    return cachedSymbols
}

async function fetchJSON<T>(url: string): Promise<T> {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
    return res.json() as Promise<T>
}

// Verilen sembollerin 24 saatlik fiyat özetlerini getirir
export async function fetch24hTickers(symbols: string[]): Promise<Ticker24h[]> {
    if (symbols.length === 0) return []
    const params = new URLSearchParams({
        symbols: JSON.stringify(symbols),
    })
    return fetchJSON<Ticker24h[]>(`${REST_BASE}/ticker/24hr?${params}`)
}

// Tek bir sembolün 24 saatlik özetini getirir
export async function fetch24hTicker(symbol: string): Promise<Ticker24h> {
    return fetchJSON<Ticker24h>(
        `${REST_BASE}/ticker/24hr?symbol=${symbol}`,
    )
}

// Binance kline verisi dizi dizidir, bu yüzden elle eşleştiriyoruz
type RawKlineTuple = [
    number,
    string,
    string,
    string,
    string,
    string,
    number,
    string,
    number,
    string,
    string,
    string,
]

// Mum grafik verisini getirir
export async function fetchKlines(
    symbol: string,
    interval: string,
    limit = 100,
): Promise<Kline[]> {
    const params = new URLSearchParams({
        symbol,
        interval,
        limit: String(limit),
    })
    const raw = await fetchJSON<RawKlineTuple[]>(`${REST_BASE}/klines?${params}`)
    return raw.map((k) => ({
        openTime: k[0],
        open: k[1],
        high: k[2],
        low: k[3],
        close: k[4],
        volume: k[5],
        closeTime: k[6],
    }))
}

type MiniTickerCallback = (ticker: MiniTicker) => void

// Seçili semboller için canlı mini ticker akışı açar
export function connectMiniTickerStream(
    symbols: string[],
    onTicker: MiniTickerCallback,
): () => void {
    if (symbols.length === 0) return () => { }
    const streams = symbols.map((s) => `${s.toLowerCase()}@miniTicker`).join("/")
    const url = `${WS_BASE}/${streams}`
    const ws = new WebSocket(url)

    ws.onmessage = (event: MessageEvent) => {
        try {
            const data = JSON.parse(event.data as string) as MiniTicker
            if (data.e === "24hrMiniTicker") {
                onTicker(data)
            }
        } catch {
            // bozuk mesaj, yok say
        }
    }

    ws.onerror = () => {
        // sessizce devam et
    }

    return () => {
        ws.close()
    }
}