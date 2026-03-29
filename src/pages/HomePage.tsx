import { Link } from "react-router"
import { ArrowUpRight } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MARKETS } from "@/data/markets"

export function HomePage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
          Piyasalar
        </h1>
        <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
          BTC, ETH ve SOL USDT çiftleri listelenir. Bir çifte tıklayarak statik
          detay sayfasına gidebilirsiniz.
        </p>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MARKETS.map((m) => (
          <li key={m.id}>
            <Link
              to={`/pair/${m.id}`}
              className="group block rounded-xl outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Card className="h-full transition-[box-shadow,transform] duration-200 group-hover:shadow-md group-hover:ring-1 group-hover:ring-foreground/10 group-active:scale-[0.99]">
                <CardHeader className="border-b border-border/60 pb-4">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg">{m.symbol}</CardTitle>
                    <Badge variant="secondary" className="shrink-0">
                      {m.base}
                    </Badge>
                  </div>
                  <CardDescription>{m.tagline}</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <dl className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                    <div>
                      <dt className="text-muted-foreground">Son fiyat</dt>
                      <dd className="font-medium tabular-nums">
                        {m.stats.lastPrice} {m.quote}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">24s değişim</dt>
                      <dd
                        className={
                          m.stats.change24h.startsWith("-")
                            ? "font-medium text-destructive tabular-nums"
                            : "font-medium text-emerald-600 dark:text-emerald-400 tabular-nums"
                        }
                      >
                        {m.stats.change24h}
                      </dd>
                    </div>
                  </dl>
                </CardContent>
                <CardFooter className="justify-between text-xs text-muted-foreground sm:text-sm">
                  <span>Detayı aç</span>
                  <ArrowUpRight
                    className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </CardFooter>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
