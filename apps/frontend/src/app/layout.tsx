import { ebGaramond, quattrocentoSans } from "@lib/fonts"
import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import "@styles/globals.css"
import "@styles/theme.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${quattrocentoSans.variable} ${ebGaramond.variable}`}
    >
      <body data-mode="light">
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}
