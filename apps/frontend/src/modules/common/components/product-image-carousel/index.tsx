'use client'

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import Image from "next/image"

export interface ProductImageCarouselProps {
  images: {
    src: string
    alt: string
  }[]
  className?: string
  imageClassName?: string
}

export function ProductImageCarousel({
  images = [],
  className = '',
  imageClassName = '',
}: ProductImageCarouselProps) {
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)
  const [count, setCount] = React.useState(0)
  const [isReady, setIsReady] = React.useState(false)


  React.useEffect(() => {
    if (!api) {
      return
    }

    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap())
    setIsReady(true)

    const handleSelect = () => {
      setCurrent(api.selectedScrollSnap())
    }

    api.on("select", handleSelect)

    return () => {
      api.off("select", handleSelect)
    }
  }, [api])

  // Initialize ready state when images change
  React.useEffect(() => {
    if (images.length > 0 && !api) {
      setIsReady(false)
    }
  }, [images.length, api])



  return (
    <div className={className}>
      <Carousel
        className="w-full relative"
        setApi={setApi}
        opts={{
          align: "start",
          loop: true,
          startIndex: 0,
        }}
        role="region"
        aria-label="Product images"
      >
        <CarouselContent className={isReady ? 'opacity-100' : 'opacity-0 transition-opacity duration-300'}>
          {images.map((image, index) => (
            <CarouselItem key={`${image.src}-${index}`} className="flex justify-center">
              <div className="p-1 w-full max-w-[600px]">
                <Card className="border-none shadow-none bg-transparent">
                  <CardContent className="flex relative   aspect-[29/34] items-center justify-center p-0 overflow-hidden rounded-lg">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      className={`object-cover transition-opacity duration-300 ${imageClassName || ''}`}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority={index === 0}
                      loading={index === 0 ? 'eager' : 'lazy'}
                    />
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {images.length > 1 && (
          <>
            <CarouselPrevious
              className="left-2 h-8 w-8 bg-background/80 hover:bg-background/90"
              variant="outline"
            />
            <CarouselNext
              className="right-2 h-8 w-8 bg-background/80 hover:bg-background/90"
              variant="outline"
            />
          </>
        )}
      </Carousel>
      {images.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {images.map((_, index) => (
            <button
              key={index}
              className={`h-2 w-2 rounded-full transition-colors ${
                current === index ? "bg-foreground" : "bg-muted-foreground/50"
              }`}
              onClick={() => api?.scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
