'use client'
import { useState, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// Composant Carousel modernisé - Extrait de ParishSiteClient
export default function Carousel({ children, className = "" }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const scrollContainerRef = useRef(null)

  const itemsCount = Array.isArray(children) ? children.length : 1
  const maxIndex = Math.max(0, itemsCount - 3) // 3 cartes visibles

  const scrollTo = (index) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const itemWidth = 384 // Largeur d'une carte + gap
      container.scrollTo({
        left: itemWidth * index,
        behavior: 'smooth'
      })
      setCurrentIndex(index)
    }
  }

  const handlePrev = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (currentIndex > 0) {
      scrollTo(currentIndex - 1)
    }
  }

  const handleNext = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (currentIndex < maxIndex) {
      scrollTo(currentIndex + 1)
    }
  }

  const showArrows = itemsCount > 3

  return (
    <div className={`relative ${className}`}>
      {showArrows && (
        <>
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`absolute -left-6 top-1/2 -translate-y-1/2 z-20 bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-xl transition-all ${
              currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'opacity-100 hover:scale-110 hover:bg-white'
            }`}
          >
            <ChevronLeft className="w-6 h-6 text-gray-900" />
          </button>

          <button
            onClick={handleNext}
            disabled={currentIndex >= maxIndex}
            className={`absolute -right-6 top-1/2 -translate-y-1/2 z-20 bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-xl transition-all ${
              currentIndex >= maxIndex ? 'opacity-50 cursor-not-allowed' : 'opacity-100 hover:scale-110 hover:bg-white'
            }`}
          >
            <ChevronRight className="w-6 h-6 text-gray-900" />
          </button>
        </>
      )}

      <div className="overflow-hidden">
        <div
          ref={scrollContainerRef}
          className="flex gap-8 overflow-x-auto scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}