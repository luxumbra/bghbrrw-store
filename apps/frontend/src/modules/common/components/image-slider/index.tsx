"use client"

import { clx } from "@medusajs/ui"
import React, { useState, useEffect, useCallback, useRef } from "react"
import ChevronLeft from "@modules/common/icons/chevron-left"
import ChevronRight from "@modules/common/icons/chevron-right"

export interface SlideImage {
  src: string
  alt: string
  title?: string
  description?: string
}

interface ImageSliderProps {
  images: SlideImage[]
  autoPlay?: boolean
  autoPlayInterval?: number
  showDots?: boolean
  showArrows?: boolean
  className?: string
  aspectRatio?: "square" | "wide" | "tall" | "auto"
  "data-testid"?: string
}

const ImageSlider: React.FC<ImageSliderProps> = ({
  images,
  autoPlay = false,
  autoPlayInterval = 5000,
  showDots = true,
  showArrows = true,
  className,
  aspectRatio = "wide",
  "data-testid": dataTestId,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null)

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50

  const nextSlide = useCallback(() => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    )
    setTimeout(() => setIsTransitioning(false), 300)
  }, [images.length, isTransitioning])

  const prevSlide = useCallback(() => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    )
    setTimeout(() => setIsTransitioning(false), 300)
  }, [images.length, isTransitioning])

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning || index === currentIndex) return
    setIsTransitioning(true)
    setCurrentIndex(index)
    setTimeout(() => setIsTransitioning(false), 300)
  }, [currentIndex, isTransitioning])

  // Auto-play functionality
  useEffect(() => {
    if (autoPlay && images.length > 1) {
      autoPlayRef.current = setInterval(nextSlide, autoPlayInterval)
      return () => {
        if (autoPlayRef.current) {
          clearInterval(autoPlayRef.current)
        }
      }
    }
  }, [autoPlay, autoPlayInterval, nextSlide, images.length])

  // Pause auto-play on hover
  const handleMouseEnter = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current)
    }
  }

  const handleMouseLeave = () => {
    if (autoPlay && images.length > 1) {
      autoPlayRef.current = setInterval(nextSlide, autoPlayInterval)
    }
  }

  // Touch handlers for mobile swipe
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      nextSlide()
    } else if (isRightSwipe) {
      prevSlide()
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        prevSlide()
      } else if (e.key === "ArrowRight") {
        nextSlide()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [nextSlide, prevSlide])

  if (!images || images.length === 0) {
    return null
  }

  const aspectRatioClasses = {
    square: "aspect-square",
    wide: "aspect-[16/9]",
    tall: "aspect-[3/4]",
    auto: "aspect-auto"
  }

  return (
    <div
      data-testid={dataTestId}
      className={clx(
        "relative w-full overflow-hidden rounded-lg bg-gray-100",
        aspectRatioClasses[aspectRatio],
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Image container */}
      <div
        className="flex h-full transition-transform duration-300 ease-in-out"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
          width: `${images.length * 100}%`
        }}
      >
        {images.map((image, index) => (
          <div
            key={index}
            className="relative w-full h-full flex-shrink-0"
            style={{ width: `${100 / images.length}%` }}
          >
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover"
              loading={index === 0 ? "eager" : "lazy"}
            />
            {(image.title || image.description) && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 text-white">
                {image.title && (
                  <h3 className="text-lg font-semibold mb-1">{image.title}</h3>
                )}
                {image.description && (
                  <p className="text-sm opacity-90">{image.description}</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation arrows */}
      {showArrows && images.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            disabled={isTransitioning}
            className={clx(
              "absolute left-2 top-1/2 -translate-y-1/2 z-10",
              "bg-white/80 hover:bg-white text-gray-800",
              "rounded-full p-2 shadow-lg transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "sm:left-4 sm:p-3"
            )}
            aria-label="Previous image"
          >
            <ChevronLeft size="20" className="sm:w-6 sm:h-6" />
          </button>
          <button
            onClick={nextSlide}
            disabled={isTransitioning}
            className={clx(
              "absolute right-2 top-1/2 -translate-y-1/2 z-10",
              "bg-white/80 hover:bg-white text-gray-800",
              "rounded-full p-2 shadow-lg transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "sm:right-4 sm:p-3"
            )}
            aria-label="Next image"
          >
            <ChevronRight size="20" className="sm:w-6 sm:h-6" />
          </button>
        </>
      )}

      {/* Dots indicator */}
      {showDots && images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              disabled={isTransitioning}
              className={clx(
                "w-2 h-2 rounded-full transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                "disabled:cursor-not-allowed",
                "sm:w-3 sm:h-3",
                {
                  "bg-white shadow-lg": index === currentIndex,
                  "bg-white/50 hover:bg-white/70": index !== currentIndex,
                }
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Screen reader only current slide indicator */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Slide {currentIndex + 1} of {images.length}
        {images[currentIndex].title && `: ${images[currentIndex].title}`}
      </div>
    </div>
  )
}

export default ImageSlider
