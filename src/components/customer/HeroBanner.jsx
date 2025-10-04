// components/customer/HeroBanner.jsx
'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import Button from '../ui/Button'

const banners = [
  {
    id: 1,
    title: "Mega Sale 2025",
    subtitle: "Up to 70% OFF on Electronics",
    description: "Don't miss out on incredible deals from top sellers",
    image: "/images/banner-1.jpg",
    ctaText: "Shop Now",
    ctaLink: "/products?category=electronics",
    bgGradient: "from-blue-600 to-purple-600"
  },
  {
    id: 2,
    title: "Fashion Fest",
    subtitle: "Latest Trends Just Arrived",
    description: "Discover the newest fashion collections from premium brands",
    image: "/images/banner-2.jpg",
    ctaText: "Explore Fashion",
    ctaLink: "/products?category=fashion",
    bgGradient: "from-pink-500 to-orange-500"
  },
  {
    id: 3,
    title: "Home & Living",
    subtitle: "Transform Your Space",
    description: "Beautiful furniture and decor items at unbeatable prices",
    image: "/images/banner-3.jpg",
    ctaText: "Shop Home",
    ctaLink: "/products?category=home",
    bgGradient: "from-green-500 to-teal-500"
  }
]

export default function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(true)

  useEffect(() => {
    if (!isAutoPlay) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlay])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)
  }

  return (
    <section className="relative h-[500px] md:h-[600px] overflow-hidden">
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
            index === currentSlide ? 'translate-x-0' : 
            index < currentSlide ? '-translate-x-full' : 'translate-x-full'
          }`}
        >
          <div className={`h-full bg-gradient-to-r ${banner.bgGradient} relative`}>
            <div className="absolute inset-0 bg-black bg-opacity-30" />
            <div className="relative h-full flex items-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div className="text-white space-y-6">
                    <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                      {banner.title}
                    </h1>
                    <h2 className="text-xl md:text-2xl font-medium opacity-90">
                      {banner.subtitle}
                    </h2>
                    <p className="text-lg opacity-80 max-w-lg">
                      {banner.description}
                    </p>
                    <Link href={banner.ctaLink}>
                      <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
                        {banner.ctaText}
                      </Button>
                    </Link>
                  </div>
                  <div className="hidden lg:block">
                    <Image
                      src={banner.image}
                      alt={banner.title}
                      width={600}
                      height={400}
                      className="rounded-lg shadow-2xl"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        onMouseEnter={() => setIsAutoPlay(false)}
        onMouseLeave={() => setIsAutoPlay(true)}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-all"
      >
        <FiChevronLeft className="w-6 h-6 text-white" />
      </button>
      <button
        onClick={nextSlide}
        onMouseEnter={() => setIsAutoPlay(false)}
        onMouseLeave={() => setIsAutoPlay(true)}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-all"
      >
        <FiChevronRight className="w-6 h-6 text-white" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'
            }`}
          />
        ))}
      </div>
    </section>
  )
}
