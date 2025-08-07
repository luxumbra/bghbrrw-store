"use client"

import LocalizedClientLink from "../localized-client-link";
import Image from "next/image";
export interface BrandHeadingProps {
    size?: "small" | "medium" | "large" | "xlarge"
    className?: string
    showLogo?: boolean
    showText?: boolean
}

export const BrandHeading: React.FC<BrandHeadingProps> = ({ size = "small", className = "", showLogo = false, showText = true }) => {
    const sizeClass = {
        small: {
            tw: "size-12",
            num: 12,
            text: "text-lg lg:text-xl"
        },
        medium: {
            tw: "size-20",
            num: 20,
            text: "text-xl lg:text-2xl"
        },
        large: {
            tw: "size-28",
            num: 28,
            text: "text-2xl lg:text-3xl"
        },
        xlarge: {
            tw: "size-48",
            num: 48,
            text: "text-3xl lg:text-4xl"
        }
    }
    return (
        <LocalizedClientLink
            href="/"
            className={`uppercase font-bold font-heading ${sizeClass[size].text} text-copy-color hover:text-ui-fg-base"
            data-testid="nav-store-link`}
        >
            {showLogo && <Image src={"https://cdn.boughandburrow.uk/static/FullLogo.svg"} alt="Bough & Burrow Logo" className={`${sizeClass[size].tw}`} width={sizeClass[size].num} height={sizeClass[size].num} placeholder="empty" />} {showText ? "Bough & Burrow" : "   "}
        </LocalizedClientLink>
    )
}
