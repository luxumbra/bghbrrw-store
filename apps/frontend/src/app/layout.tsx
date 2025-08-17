import { ebGaramond, quattrocentoSans, lato } from "@lib/fonts"
import { getBaseURL } from "@lib/util/env"
import type { Metadata } from "next"
import "@styles/globals.css"
import "@styles/theme.css"
import { RegionProvider } from "@/providers/region"
import ClientDiscountWrapper from "@/components/common/client-discount-wrapper"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  title: {
    default: "Bough & Burrow Shop",
    template: "%s | Bough & Burrow",
  },
  description:
    "A shop for Bough & Burrow, a small business that sells handmade products.",
  twitter: {
    card: "summary_large_image",
    title: "Bough & Burrow Shop",
    description:
      "A shop for Bough & Burrow, a small business that sells handmade products.",
  },
  openGraph: {
    title: "Bough & Burrow Shop",
    description:
      "A shop for Bough & Burrow, a small business that sells handmade products.",
  },
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${lato.variable} ${quattrocentoSans.variable} ${ebGaramond.variable}`}
    >
      <body data-mode="light">
        <RegionProvider>
          {/* <ClientDiscountWrapper> */}
            <main className="relative">{props.children}</main>
          {/* </ClientDiscountWrapper> */}
        </RegionProvider>
      </body>
    </html>
  )
}
