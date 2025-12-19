// components/customer/HeroBanner.jsx
'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { FiChevronLeft, FiChevronRight, FiMapPin, FiTruck, FiShield, FiZap } from 'react-icons/fi'

const banners = [
  {
    id: 1,
    badge: "SPECIAL EDITION",
    title: "Best Choice of the Year",
    subtitle: "Premium Electronics & Gadgets",
    description: "Discover cutting-edge technology from verified sellers across India & UAE",
    image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&h=400&fit=crop",
    ctaText: "Shop Now",
    ctaLink: "/products?category=electronics",
    bgGradient: "from-[#1a237e] via-[#283593] to-[#3949ab]",
    accentColor: "#ffd700"
  },
  {
    id: 2,
    badge: "TRENDING NOW",
    title: "Fashion Redefined",
    subtitle: "Latest Collections from Top Sellers",
    description: "Curated fashion from premium brands and local artisans",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=500&h=400&fit=crop",
    ctaText: "Explore Fashion",
    ctaLink: "/products?category=fashion",
    bgGradient: "from-[#4a148c] via-[#6a1b9a] to-[#8e24aa]",
    accentColor: "#ff6f00"
  },
  {
    id: 3,
    badge: "HOME ESSENTIALS",
    title: "Transform Your Space",
    subtitle: "Premium Home & Living",
    description: "Beautiful furniture and decor from trusted vendors",
    image: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=500&h=400&fit=crop",
    ctaText: "Shop Home",
    ctaLink: "/products?category=home",
    bgGradient: "from-[#004d40] via-[#00695c] to-[#00897b]",
    accentColor: "#ffab00"
  }
]

export default function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(true)
  const [location, setLocation] = useState('India')

  useEffect(() => {
    if (!isAutoPlay) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length)
    }, 6000)

    return () => clearInterval(interval)
  }, [isAutoPlay])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)
  }

  return (
    <section className="relative h-[600px] md:h-[700px] overflow-hidden">
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-all duration-700 ease-in-out ${index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
        >
          <div className={`h-full bg-gradient-to-br ${banner.bgGradient} relative overflow-hidden`}>
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            {/* Content Container */}
            <div className="relative h-full flex items-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  {/* Left Content */}
                  <div className="text-white space-y-6 z-10">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 animate-fade-in">
                      <FiZap className="w-4 h-4" style={{ color: banner.accentColor }} />
                      <span className="text-sm font-semibold tracking-wide">{banner.badge}</span>
                    </div>

                    {/* Main Title */}
                    <h1 className="text-5xl md:text-7xl font-bold leading-tight animate-fade-in">
                      {banner.title}
                    </h1>

                    {/* Subtitle */}
                    <h2 className="text-2xl md:text-3xl font-medium opacity-95 animate-fade-in delay-100">
                      {banner.subtitle}
                    </h2>

                    {/* Description */}
                    <p className="text-lg md:text-xl opacity-90 max-w-xl animate-fade-in delay-200">
                      {banner.description}
                    </p>

                    {/* CTA Button */}
                    <div className="flex items-center gap-4 animate-fade-in delay-300">
                      <Link href={banner.ctaLink}>
                        <button
                          className="px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                          style={{
                            backgroundColor: banner.accentColor,
                            color: '#000'
                          }}
                        >
                          {banner.ctaText}
                        </button>
                      </Link>
                      <Link href="/sellers">
                        <button className="px-8 py-4 rounded-xl font-semibold text-lg bg-white/10 backdrop-blur-md border-2 border-white/30 hover:bg-white/20 transition-all duration-300">
                          Become a Seller
                        </button>
                      </Link>
                    </div>

                    {/* Trust Indicators */}
                    <div className="flex flex-wrap gap-6 pt-4 animate-fade-in delay-400">
                      <div className="flex items-center gap-2">
                        <FiTruck className="w-5 h-5" style={{ color: banner.accentColor }} />
                        <span className="text-sm font-medium">Fast Delivery</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiShield className="w-5 h-5" style={{ color: banner.accentColor }} />
                        <span className="text-sm font-medium">Secure Payment</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiMapPin className="w-5 h-5" style={{ color: banner.accentColor }} />
                        <span className="text-sm font-medium">India & UAE</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Content - Product Image */}
                  <div className="hidden lg:flex justify-center items-center relative">
                    <div className="relative w-full max-w-lg animate-float">
                      {/* Glassmorphic Card */}
                      <div className="absolute inset-0 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl transform rotate-3" />
                      <div className="relative bg-white/5 backdrop-blur-lg rounded-3xl border border-white/20 p-8 shadow-2xl">
                        <img
                          src={banner.image}
                          alt={banner.title}
                          width={500}
                          height={400}
                          className="w-full h-auto drop-shadow-2xl"
                          onError={(e) => {
                            e.target.src = '/images/placeholder-product.png'
                          }}
                        />

                        {/* Floating Price Tag */}
                        <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl px-6 py-4 shadow-2xl animate-bounce-slow">
                          <p className="text-sm text-gray-600 font-medium">Starting from</p>
                          <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            ₹999
                          </p>
                        </div>
                      </div>
                    </div>
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
        className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-md hover:bg-white/30 rounded-full p-3 transition-all duration-300 hover:scale-110 border border-white/30"
      >
        <FiChevronLeft className="w-6 h-6 text-white" />
      </button>
      <button
        onClick={nextSlide}
        onMouseEnter={() => setIsAutoPlay(false)}
        onMouseLeave={() => setIsAutoPlay(true)}
        className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-md hover:bg-white/30 rounded-full p-3 transition-all duration-300 hover:scale-110 border border-white/30"
      >
        <FiChevronRight className="w-6 h-6 text-white" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-white w-12' : 'bg-white/50 w-2 hover:bg-white/70'
              }`}
          />
        ))}
      </div>
    </section>
  )
}

// Add these animations to your globals.css
const styles = `
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

@keyframes bounce-slow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

.animate-bounce-slow {
  animation: bounce-slow 3s ease-in-out infinite;
}

.delay-100 {
  animation-delay: 100ms;
}

.delay-200 {
  animation-delay: 200ms;
}

.delay-300 {
  animation-delay: 300ms;
}

.delay-400 {
  animation-delay: 400ms;
}

.delay-1000 {
  animation-delay: 1000ms;
}
`
