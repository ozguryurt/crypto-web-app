import { Fragment, useState } from "react"
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  XAxis,
  YAxis,
} from "recharts"
import { ChartArea, ChartCandlestick, Loader2, AlertTriangle } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  INTERVALS,
  type Interval,
  type CandlePoint,
} from "@/data/chart-data"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useLiveChart } from "@/hooks/useLiveChart"

type ChartType = "area" | "candle"

const BULL = "oklch(0.65 0.19 145)"
const BEAR = "oklch(0.65 0.22 25)"

const chartConfig = {
  close: { label: "Kapanış", color: "var(--chart-1)" },
  volume: { label: "Hacim", color: "var(--chart-3)" },
  candleBody: { label: "OHLC", color: "var(--chart-1)" },
} satisfies ChartConfig

interface PriceChartProps {
  symbol: string
}

// Özel mum şekli
function CandleShape(props: Record<string, unknown>) {
  const { x, y, width, height, payload } = props as {
    x: number
    y: number
    width: number
    height: number
    payload: CandlePoint
  }
  if (!payload) return null

  const { open, close, high, low } = payload
  const bullish = close >= open
  const bodyHigh = Math.max(open, close)
  const bodyLow = Math.min(open, close)
  const color = bullish ? BULL : BEAR
  const centerX = x + width / 2
  const bodyWidth = Math.max(width * 0.65, 3)
  const absH = Math.abs(height)
  const bodyRange = bodyHigh - bodyLow

  let wickTopY = y
  let wickBottomY = y + absH

  if (bodyRange > 0.001 && absH > 0.5) {
    const scale = absH / bodyRange
    wickTopY = y - (high - bodyHigh) * scale
    wickBottomY = y + absH + (bodyLow - low) * scale
  }

  return (
    <g>
      <line
        x1={centerX}
        y1={wickTopY}
        x2={centerX}
        y2={wickBottomY}
        stroke={color}
        strokeWidth={1.5}
      />
      <rect
        x={centerX - bodyWidth / 2}
        y={y}
        width={bodyWidth}
        height={Math.max(absH, 1)}
        fill={color}
        stroke={color}
        rx={1}
      />
    </g>
  )
}

// Mum grafiği için OHLC tooltip
function CandleTooltipContent({ active, payload }: Record<string, unknown>) {
  if (!active || !Array.isArray(payload) || !payload.length) return null
  const d = (payload as { payload?: CandlePoint }[])[0]?.payload
  if (!d) return null

  const fmt = (v: number) => v.toLocaleString("tr-TR")
  const bullish = d.close >= d.open

  const rows: [string, string, string?][] = [
    ["Açılış", fmt(d.open)],
    ["Yüksek", fmt(d.high)],
    ["Düşük", fmt(d.low)],
    [
      "Kapanış",
      fmt(d.close),
      bullish
        ? "text-emerald-600 dark:text-emerald-400"
        : "text-red-500 dark:text-red-400",
    ],
    ["Hacim", fmt(d.volume)],
  ]

  return (
    <div className="rounded-lg border border-border/50 bg-background px-3 py-2 text-xs shadow-xl">
      <p className="mb-1.5 font-medium">{d.time}</p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {rows.map(([label, value, cls]) => (
          <Fragment key={label}>
            <span className="text-muted-foreground">{label}</span>
            <span
              className={cn(
                "text-right tabular-nums",
                cls ?? "text-foreground",
              )}
            >
              {value}
            </span>
          </Fragment>
        ))}
      </div>
    </div>
  )
}

export function PriceChart({ symbol }: PriceChartProps) {
  const [interval, setInterval] = useState<Interval>("1h")
  const [chartType, setChartType] = useState<ChartType>("area")
  const { data: rawData, loading, error, refetch } = useLiveChart(symbol, interval)

  const data = rawData.map((d) => ({
    ...d,
    candleBody: [Math.min(d.open, d.close), Math.max(d.open, d.close)] as [
      number,
      number,
    ],
  }))

  const allPrices = data.flatMap((d) => [d.high, d.low])
  const minPrice = Math.min(...allPrices)
  const maxPrice = Math.max(...allPrices)
  const pricePad =
    allPrices.length > 0 ? (maxPrice - minPrice) * 0.08 : 0
  const domainLow = +(minPrice - pricePad).toFixed(2)
  const domainHigh = +(maxPrice + pricePad).toFixed(2)

  const trending =
    data.length >= 2 && data[data.length - 1].close >= data[0].close
  const areaColor = trending ? BULL : BEAR

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <CardTitle>{symbol} Grafik</CardTitle>
            <CardDescription>
              Zaman aralığı:{" "}
              <span className="font-medium text-foreground">{interval}</span>
              {" · "}
              {chartType === "area" ? "Alan" : "Mum"}
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ToggleGroup
              value={[chartType]}
              onValueChange={(val) => {
                if (val.length > 0)
                  setChartType(val[val.length - 1] as ChartType)
              }}
            >
              <ToggleGroupItem
                value="area"
                aria-label="Alan grafik"
                className="px-2"
              >
                <ChartArea className="size-4" />
              </ToggleGroupItem>
              <ToggleGroupItem
                value="candle"
                aria-label="Mum grafik"
                className="px-2"
              >
                <ChartCandlestick className="size-4" />
              </ToggleGroupItem>
            </ToggleGroup>
            <ToggleGroup
              className="flex-wrap"
              value={[interval]}
              onValueChange={(val) => {
                if (val.length > 0)
                  setInterval(val[val.length - 1] as Interval)
              }}
            >
              {INTERVALS.map((iv) => (
                <ToggleGroupItem
                  key={iv}
                  value={iv}
                  aria-label={`${iv} aralığı`}
                  className="px-2.5 text-xs sm:px-3 sm:text-sm"
                >
                  {iv}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-6 text-sm text-destructive">
            <AlertTriangle className="size-5" />
            <span>{error}</span>
            <button
              onClick={refetch}
              className="mt-1 text-xs underline underline-offset-2 hover:text-destructive/80"
            >
              Tekrar dene
            </button>
          </div>
        )}

        {loading && !error && (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            <span>Grafik verisi yükleniyor…</span>
          </div>
        )}

        {!loading && !error && data.length === 0 && (
          <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
            Bu aralık için veri bulunamadı.
          </div>
        )}

        {!loading && !error && data.length > 0 && (
          <ChartContainer config={chartConfig} className="aspect-[2/1] w-full">
            <ComposedChart
              data={data}
              margin={{ top: 8, right: 4, bottom: 0, left: 4 }}
            >
              <defs>
                <linearGradient id="fillClose" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={areaColor} stopOpacity={0.3} />
                  <stop
                    offset="95%"
                    stopColor={areaColor}
                    stopOpacity={0.02}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="time"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                fontSize={11}
              />
              <YAxis
                yAxisId="price"
                orientation="right"
                domain={[domainLow, domainHigh]}
                tickLine={false}
                axisLine={false}
                tickMargin={4}
                fontSize={11}
                tickFormatter={(v: number) => v.toLocaleString("tr-TR")}
              />
              <YAxis yAxisId="vol" orientation="left" hide />
              <ChartTooltip
                content={
                  chartType === "candle" ? (
                    <CandleTooltipContent />
                  ) : (
                    <ChartTooltipContent
                      labelFormatter={(label) => `Zaman: ${label}`}
                      formatter={(value, name) => {
                        const n =
                          typeof value === "number"
                            ? value.toLocaleString("tr-TR")
                            : value
                        const l = name === "close" ? "Kapanış" : "Hacim"
                        return (
                          <span>
                            {l}: <strong>{String(n)}</strong>
                          </span>
                        )
                      }}
                    />
                  )
                }
              />
              <Bar
                yAxisId="vol"
                dataKey="volume"
                fill="var(--color-volume)"
                opacity={0.25}
                radius={[2, 2, 0, 0]}
              />
              {chartType === "area" ? (
                <Area
                  yAxisId="price"
                  dataKey="close"
                  type="monotone"
                  stroke={areaColor}
                  strokeWidth={2}
                  fill="url(#fillClose)"
                />
              ) : (
                <Bar
                  yAxisId="price"
                  dataKey="candleBody"
                  shape={<CandleShape />}
                  activeBar={false}
                  isAnimationActive={false}
                />
              )}
            </ComposedChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}