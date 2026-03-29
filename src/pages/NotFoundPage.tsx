import { Link } from "react-router"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function NotFoundPage() {
  return (
    <Card className="mx-auto max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Sayfa yok</CardTitle>
        <CardDescription>
          Bu adres uygulamada tanımlı değil.
        </CardDescription>
        <Button render={<Link to="/" />} className="mt-4 w-full sm:w-auto">
          Ana sayfaya git
        </Button>
      </CardHeader>
    </Card>
  )
}
