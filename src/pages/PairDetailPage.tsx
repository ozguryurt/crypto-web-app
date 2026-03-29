import { Link, useParams } from "react-router"
import { ArrowLeft } from "lucide-react"

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
import { getMarketById } from "@/data/markets"

export function PairDetailPage() {
  const { pairId } = useParams<{ pairId: string }>()
  const market = pairId ? getMarketById(pairId) : undefined

  if (!market) {
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
              Aradığınız işlem çifti bu demoda yok. Ana sayfadan bir çift
              seçin.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button render={<Link to="/" />} variant="outline" size="sm" className="w-fit gap-2">
          <ArrowLeft className="size-4" aria-hidden />
          Piyasalara dön
        </Button>
        <Badge variant="outline" className="w-fit">
          Statik veri
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-2xl sm:text-3xl">{market.symbol}</CardTitle>
            <Badge>{market.base}</Badge>
          </div>
          <CardDescription className="text-base">{market.tagline}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            {market.description}
          </p>
          <Separator />
          <div>
            <h2 className="mb-3 text-sm font-medium text-foreground">
              Örnek piyasa özeti
            </h2>
            <dl className="grid gap-4 sm:grid-cols-2">
              {(
                [
                  ["Son fiyat", `${market.stats.lastPrice} ${market.quote}`],
                  ["24s değişim", market.stats.change24h],
                  ["24s en yüksek", `${market.stats.high24h} ${market.quote}`],
                  ["24s en düşük", `${market.stats.low24h} ${market.quote}`],
                  ["24s hacim", market.stats.volume24h],
                ] as const
              ).map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-lg border border-border/80 bg-muted/30 px-4 py-3"
                >
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className="mt-1 font-medium tabular-nums">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
