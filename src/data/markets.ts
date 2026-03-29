export type MarketId = "btc" | "eth" | "sol"

export interface MarketPair {
  id: MarketId
  /** Örn. BTC/USDT */
  symbol: string
  base: string
  quote: string
  /** Detay sayfası için statik özet */
  tagline: string
  description: string
  /** Gösterim amaçlı sabit değerler */
  stats: {
    lastPrice: string
    change24h: string
    high24h: string
    low24h: string
    volume24h: string
  }
}

export const MARKETS: readonly MarketPair[] = [
  {
    id: "btc",
    symbol: "BTC/USDT",
    base: "Bitcoin",
    quote: "USDT",
    tagline: "Dijital altın",
    description:
      "Bitcoin, merkeziyetsiz bir defter üzerinde çalışan ilk büyük kripto paradır. Bu sayfada gördüğünüz fiyat ve hacim verileri örnek amaçlıdır; gerçek piyasa verisi bağlanmamıştır.",
    stats: {
      lastPrice: "98.432,50",
      change24h: "+1,24%",
      high24h: "99.100,00",
      low24h: "96.800,00",
      volume24h: "42,8B USDT",
    },
  },
  {
    id: "eth",
    symbol: "ETH/USDT",
    base: "Ethereum",
    quote: "USDT",
    tagline: "Akıllı sözleşmeler",
    description:
      "Ethereum, akıllı sözleşmeler ve merkeziyetsiz uygulamalar için bir platformdur. Aşağıdaki istatistikler statiktir ve canlı borsa verisi yansıtmaz.",
    stats: {
      lastPrice: "3.245,80",
      change24h: "-0,38%",
      high24h: "3.312,00",
      low24h: "3.198,50",
      volume24h: "18,2B USDT",
    },
  },
  {
    id: "sol",
    symbol: "SOL/USDT",
    base: "Solana",
    quote: "USDT",
    tagline: "Yüksek işlem hızı",
    description:
      "Solana, düşük gecikme ve yüksek işlem hacmi hedefleyen bir ağdır. Bu ekrandaki rakamlar demo içindir.",
    stats: {
      lastPrice: "178,42",
      change24h: "+2,91%",
      high24h: "182,10",
      low24h: "171,05",
      volume24h: "3,1B USDT",
    },
  },
] as const

const byId = Object.fromEntries(MARKETS.map((m) => [m.id, m])) as Record<
  MarketId,
  MarketPair
>

export function isMarketId(id: string): id is MarketId {
  return id in byId
}

export function getMarketById(id: string): MarketPair | undefined {
  return isMarketId(id) ? byId[id] : undefined
}
