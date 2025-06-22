import { Button, Heading } from "@medusajs/ui"
import Image from "next/image"
import Link from "next/link"

import HeroImage from "@public/images/tlh-010.jpg"

const Hero = () => {
  return (
    <div className="h-[75vh] w-full border-b border-ui-border-base relative bg-ui-bg-subtle">
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-6 text-center small:p-32">
        <span>
          <Heading
            level="h1"
            className="font-normal leading-10 font-heading text-7xl"
          >
            Bough & Burrow
          </Heading>
          <Heading
            level="h2"
            className="text-2xl font-normal leading-10 tracking-widest"
          >
            Hand-crafted | Sustainable | Nature-Inspired
          </Heading>
        </span>
        <Link href="/store" prefetch>
          <Button className="" size="xlarge" variant="transparent">
            Shop
          </Button>
        </Link>
      </div>
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-ui-bg-subtle to-transparent" />
        <Image
          src={HeroImage}
          alt="Hero Image"
          className="z-0 object-cover w-full h-full"
          placeholder="blur"
          loading="eager"
          fill
        />
      </div>
    </div>
  )
}

export default Hero
