import { EB_Garamond, Quattrocento_Sans } from "next/font/google"

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-eb-garamond",
})
const quattrocentoSans = Quattrocento_Sans({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-quattrocento-sans",
})

export { ebGaramond, quattrocentoSans }
