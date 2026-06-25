import { useState, useEffect, useMemo } from "react"
import { Link } from "react-router"
import {
  ArrowUpRight,
  Loader2,
  AlertTriangle,
  Search,
  X,
  ChevronDown,
  Plus,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useLiveTickers } from "@/hooks/useLiveTickers"
import {
  fetchUsdtSymbols,
  DEFAULT_SYMBOLS,
  type BinanceSymbolInfo,
} from "@/lib/binance"

// Sayı biçimlendiriciler

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

// Aranabilir sembol seçici
function SymbolSelector({
  allSymbols,
  selected,
  onToggle,
  loadingAll,
}: {
  allSymbols: BinanceSymbolInfo[]
  selected: string[]
  onToggle: (sym: string) => void
  loadingAll: boolean
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return allSymbols.filter(
      (s) =>
        s.symbol.toLowerCase().includes(q) ||
        s.baseAsset.toLowerCase().includes(q),
    )
  }, [allSymbols, query])

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setOpen(!open)}
        className="w-full justify-between gap-2 font-normal sm:w-80"
        disabled={loadingAll}
      >
        {loadingAll ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            <span className="text-muted-foreground">Semboller yükleniyor…</span>
          </>
        ) : (
          <>
            <Search className="size-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {selected.length > 0
                ? `${selected.length} sembol seçili`
                : "Sembol ara…"}
            </span>
          </>
        )}
        <ChevronDown className="size-4 text-muted-foreground" />
      </Button>

      {open && !loadingAll && (
        <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-lg border border-border bg-background shadow-lg sm:w-80">
          <div className="flex items-center border-b border-border px-3 py-2">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              type="text"
              placeholder="BTC, ETH…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              className="ml-2 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="shrink-0 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
          <ul className="max-h-64 overflow-y-auto p-1">
            {filtered.length === 0 && (
              <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                Sonuç bulunamadı
              </li>
            )}
            {filtered.slice(0, 100).map((s) => {
              const isSelected = selected.includes(s.symbol)
              return (
                <li key={s.symbol}>
                  <button
                    type="button"
                    onClick={() => {
                      onToggle(s.symbol)
                      setQuery("")
                    }}
                    className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted ${isSelected
                      ? "bg-primary/10 font-medium"
                      : ""
                      }`}
                  >
                    <span className="font-medium tabular-nums">
                      {s.baseAsset}
                    </span>
                    <span className="text-muted-foreground">
                      /{s.quoteAsset}
                    </span>
                    {isSelected && (
                      <span className="ml-auto shrink-0 text-xs text-primary">
                        Seçili
                      </span>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
          <div className="border-t border-border px-3 py-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-full rounded-md py-1 text-center text-xs text-muted-foreground hover:text-foreground"
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function HomePage() {
  const [allSymbols, setAllSymbols] = useState<BinanceSymbolInfo[]>([])
  const [loadingAll, setLoadingAll] = useState(true)
  const [symbolsError, setSymbolsError] = useState<string | null>(null)

  const [trackedSymbols, setTrackedSymbols] = useState<string[]>(
    () =>
      JSON.parse(
        localStorage.getItem("crypto-tracked-symbols") ??
        JSON.stringify(DEFAULT_SYMBOLS),
      ) as string[],
  )

  // Seçili sembolleri tarayıcıda sakla
  useEffect(() => {
    localStorage.setItem(
      "crypto-tracked-symbols",
      JSON.stringify(trackedSymbols),
    )
  }, [trackedSymbols])

  // Binance'ten tüm USDT paritelerini çek
  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const data = await fetchUsdtSymbols()
        if (!cancelled) {
          setAllSymbols(data)
          setLoadingAll(false)
        }
      } catch (e) {
        if (!cancelled) {
          setSymbolsError(
            e instanceof Error ? e.message : "Sembol listesi alınamadı",
          )
          setLoadingAll(false)
        }
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const { tickers, loading, error } = useLiveTickers(trackedSymbols)

  const toggleSymbol = (sym: string) => {
    setTrackedSymbols((prev) =>
      prev.includes(sym)
        ? prev.filter((s) => s !== sym)
        : [...prev, sym],
    )
  }

  const removeSymbol = (sym: string) => {
    setTrackedSymbols((prev) => prev.filter((s) => s !== sym))
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
          Piyasalar
        </h1>
        <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
          Binance'ten{" "}
          <span className="font-medium text-foreground">canlı</span>{" "}
          USDT çiftlerini seçip takip edin.
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <SymbolSelector
            allSymbols={allSymbols}
            selected={trackedSymbols}
            onToggle={toggleSymbol}
            loadingAll={loadingAll}
          />

          {trackedSymbols.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTrackedSymbols([])}
              className="h-9 text-xs text-muted-foreground hover:text-destructive"
            >
              Tümünü kaldır
            </Button>
          )}
        </div>

        {trackedSymbols.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {trackedSymbols.map((sym) => {
              const info = allSymbols.find(
                (s) => s.symbol === sym,
              )
              return (
                <Badge
                  key={sym}
                  variant="secondary"
                  className="cursor-pointer gap-1 pr-1 text-xs"
                  onClick={() => removeSymbol(sym)}
                >
                  {info?.baseAsset ?? sym}
                  <X className="size-3" />
                </Badge>
              )
            })}
          </div>
        )}
      </div>

      {symbolsError && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertTriangle className="size-4 shrink-0" />
          <span>{symbolsError}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertTriangle className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading && !error && trackedSymbols.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          <span>Piyasa verileri yükleniyor…</span>
        </div>
      )}

      {trackedSymbols.length === 0 && !loadingAll && (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-16 text-center">
          <Plus className="size-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            Takip etmek istediğiniz sembolleri yukarıdan seçin.
          </p>
        </div>
      )}

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {trackedSymbols.map((sym) => {
          const info = allSymbols.find((s) => s.symbol === sym)
          const t = tickers[sym]
          const lastPrice = t ? parseFloat(t.lastPrice) : null
          const changePercent = t
            ? parseFloat(t.priceChangePercent)
            : null
          const volume24h = t ? parseFloat(t.quoteVolume) : null

          return (
            <li key={sym}>
              <Link
                to={`/pair/${sym}`}
                className="group block rounded-xl outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <Card className="h-full transition-[box-shadow,transform] duration-200 group-hover:shadow-md group-hover:ring-1 group-hover:ring-foreground/10 group-active:scale-[0.99]">
                  <CardHeader className="border-b border-border/60 pb-4">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg">
                        {info?.baseAsset ?? sym}
                      </CardTitle>
                      <Badge
                        variant="secondary"
                        className="shrink-0"
                      >
                        USDT
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <dl className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                      <div>
                        <dt className="text-muted-foreground">
                          Son fiyat
                        </dt>
                        <dd className="font-medium tabular-nums">
                          {lastPrice !== null
                            ? `$${formatPrice(lastPrice)}`
                            : loading
                              ? "…"
                              : "—"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">
                          24s değişim
                        </dt>
                        <dd
                          className={
                            changePercent !==
                              null &&
                              changePercent < 0
                              ? "font-medium text-destructive tabular-nums"
                              : "font-medium text-emerald-600 dark:text-emerald-400 tabular-nums"
                          }
                        >
                          {changePercent !== null
                            ? formatPercent(
                              changePercent,
                            )
                            : loading
                              ? "…"
                              : "—"}
                        </dd>
                      </div>
                      <div className="col-span-2">
                        <dt className="text-muted-foreground">
                          24s hacim
                        </dt>
                        <dd className="font-medium tabular-nums">
                          {volume24h !== null
                            ? `${formatVolume(volume24h)} $`
                            : loading
                              ? "…"
                              : "—"}
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
          )
        })}
      </ul>
    </div>
  )
}