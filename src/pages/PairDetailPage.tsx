import { Link, useParams } from "react-router"
import { ArrowLeft, Loader2, AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PriceChart } from "@/components/PriceChart"
import { useLiveTickers } from "@/hooks/useLiveTickers"

function formatPrice(value: string | number): string {
  const n = typeof value === "string" ? parseFloat(value) : value
  if (isNaN(n)) return "—"
  if (n >= 1000) return n.toLocaleString("tr-TR", { maximumFractionDigits: 2 })
  if (n >= 1) return n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return n.toLocaleString("tr-TR", { minimumFractionDigits: 4, maximumFractionDigits: 6 })
}

function formatPercent(value: string | number): string {
  const n = typeof value === "string" ? parseFloat(value) : value
  if (isNaN(n)) return "—"
  const sign = n >= 0 ? "+" : ""
  return `${sign}${n.toFixed(2)}%`
}

function formatVolume(value: string | number): string {
  const n = typeof value === "string" ? parseFloat(value) : value
  if (isNaN(n)) return "—"
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`
  return n.toFixed(0)
}

export function PairDetailPage() {
  const { pairId } = useParams<{ pairId: string }>()
  const symbol = pairId?.toUpperCase() ?? ""

  // Geçerli bir Binance sembolü mü?
  const isValidSymbol = /^[A-Z0-9]+$/.test(symbol) && symbol.length >= 4

  const { tickers, loading, error } = useLiveTickers(
    isValidSymbol ? [symbol] : [],
  )

  if (!isValidSymbol) {
    return (
      <div className="space-y-6">
        <Button render={<Link to="/" />} variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="size-4" aria-hidden />
          Listeye dön
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Çift bulunamadı</CardTitle>
            <CardDescription>
              Aradığınız işlem çifti geçersiz. Ana sayfadan bir çift seçin.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const t = tickers[symbol]
  const lastPrice = t ? parseFloat(t.lastPrice) : null
  const changePercent = t ? parseFloat(t.priceChangePercent) : null
  const high24h = t ? parseFloat(t.highPrice) : null
  const low24h = t ? parseFloat(t.lowPrice) : null
  const volume24h = t ? parseFloat(t.quoteVolume) : null

  // BTCUSDT → BTC
  const baseAsset = symbol.replace(/USDT$/i, "")

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button render={<Link to="/" />} variant="outline" size="sm" className="w-fit gap-2">
          <ArrowLeft className="size-4" aria-hidden />
          Piyasalara dön
        </Button>
        <Badge variant="outline" className="w-fit">
          {loading ? "Yükleniyor…" : "Canlı veri · Binance"}
        </Badge>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertTriangle className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <PriceChart symbol={symbol} />

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-2xl sm:text-3xl">{baseAsset}</CardTitle>
            <Badge>USDT</Badge>
          </div>
          <CardDescription className="text-base">
            {symbol} · Binance canlı piyasa verisi
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            {baseAsset}/USDT işlem çifti için canlı fiyat, 24 saatlik istatistikler ve
            interaktif grafik.
          </p>
          <Separator />
          <div>
            <h2 className="mb-3 text-sm font-medium text-foreground">
              {loading ? (
                <span className="inline-flex items-center gap-1.5">
                  <Loader2 className="size-3.5 animate-spin" />
                  Piyasa özeti yükleniyor…
                </span>
              ) : (
                "Canlı piyasa özeti"
              )}
            </h2>
            <dl className="grid gap-4 sm:grid-cols-2">
              {(
                [
                  ["Son fiyat", lastPrice !== null ? `$${formatPrice(lastPrice)}` : "—"],
                  ["24s değişim", changePercent !== null ? formatPercent(changePercent) : "—"],
                  [
                    "24s en yüksek",
                    high24h !== null ? `$${formatPrice(high24h)}` : "—",
                  ],
                  [
                    "24s en düşük",
                    low24h !== null ? `$${formatPrice(low24h)}` : "—",
                  ],
                  [
                    "24s hacim",
                    volume24h !== null ? `${formatVolume(volume24h)} USDT` : "—",
                  ],
                ] as const
              ).map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-lg border border-border/80 bg-muted/30 px-4 py-3"
                >
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd
                    className={
                      label === "24s değişim" && changePercent !== null && changePercent < 0
                        ? "mt-1 font-medium tabular-nums text-destructive"
                        : label === "24s değişim"
                          ? "mt-1 font-medium tabular-nums text-emerald-600 dark:text-emerald-400"
                          : "mt-1 font-medium tabular-nums"
                    }
                  >
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}