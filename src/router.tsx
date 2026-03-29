import { createBrowserRouter } from "react-router"

import { RootLayout } from "@/components/layout/RootLayout"
import { HomePage } from "@/pages/HomePage"
import { NotFoundPage } from "@/pages/NotFoundPage"
import { PairDetailPage } from "@/pages/PairDetailPage"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "pair/:pairId", element: <PairDetailPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
])
