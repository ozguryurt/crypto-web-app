import { Link, Outlet } from "react-router"

import { Separator } from "@/components/ui/separator"

export function RootLayout() {
  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b bg-card/40 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link
            to="/"
            className="font-heading text-lg font-semibold tracking-tight text-foreground transition-opacity hover:opacity-80"
          >
            Crypto Spot
          </Link>
          <span className="text-xs text-muted-foreground sm:text-sm">
            USDT çiftleri (demo)
          </span>
        </div>
        <Separator />
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
        <Outlet />
      </main>
    </div>
  )
}
