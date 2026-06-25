// Dinamik sembol seçimi nedeniyle statik tanımlara gerek kalmadı

export interface MarketPair {
  symbol: string
  baseAsset: string
  quoteAsset: string
}

export const DEFAULT_TRACKED_SYMBOLS = ["BTCUSDT", "ETHUSDT", "SOLUSDT"]