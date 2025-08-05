import { EB_Garamond, Lato, Quattrocento_Sans } from "next/font/google"

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

const lato = Lato({
  weight: ["100", "300", "400", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-lato",
})

export { ebGaramond, lato, quattrocentoSans }
