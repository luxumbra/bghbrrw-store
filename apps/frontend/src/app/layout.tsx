import { ebGaramond, quattrocentoSans, lato } from "@lib/fonts"
import { getBaseURL } from "@lib/util/env"
import type { Metadata } from "next"
import "@styles/globals.css"
import "@styles/theme.css"

export const metadata: Metadata = {
    metadataBase: new URL(getBaseURL()),
    title: {
        default: "Bough & Burrow Shop",
        template: "%s | Bough & Burrow",
    },
    description: "A shop for Bough & Burrow, a small business that sells handmade products.",
    twitter: {
        card: "summary_large_image",
        title: "Bough & Burrow Shop",
        description: "A shop for Bough & Burrow, a small business that sells handmade products.",
    },
    openGraph: {
        title: "Bough & Burrow Shop",
        description: "A shop for Bough & Burrow, a small business that sells handmade products.",
    },
    viewport: {
        width: "device-width",
        initialScale: 1,
        maximumScale: 1,
    },

}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${lato.variable} ${quattrocentoSans.variable} ${ebGaramond.variable}`}
    >
      <body data-mode="light">
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}
