// an object that contains metadata for the page
import type { Metadata } from "next"
import { getBaseURL } from "@lib/util/env"

export const metadata: Metadata = {
    metadataBase: new URL(getBaseURL()),
    title: "Bough & Burrow Shop",
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
}
