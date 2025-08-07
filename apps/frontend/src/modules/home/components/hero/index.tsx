import { Button, Heading } from "@medusajs/ui"
import Image from "next/image"
import Link from "next/link"

import HeroImage from "~public/images/tlh-010.jpg"

const Hero = () => {
  return (
    <div className="h-[75vh] w-full border-b border-ui-border-base relative bg-ui-bg-subtle">
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-6 p-10 text-center small:p-32">
        <span>
          <Heading
            level="h1"
            className="text-4xl font-bold leading-10 font-heading lg:text-7xl"
          >
            Bough & Burrow
          </Heading>
          <Heading
            level="h2"
            className="text-2xl font-normal leading-10 tracking-widest text-shadow-md/70 text-shadow-black lg:text-2xl"
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
          className="relative z-0 object-cover w-screen h-[75vh]"
          placeholder="blur"
          fill
          priority
        />
      </div>
    </div>
  )
}

export default Hero
