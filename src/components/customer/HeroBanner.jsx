'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

// Fallback dummy banners using local images
const dummyBanners = [
  {
    id: 'dummy-1',
    image: '/dummy_banner/Gemini_Generated_Image_2av0jj2av0jj2av0.png',
    link: '/products?category=electronics',
    isActive: true
  },
  {
    id: 'dummy-2',
    image: '/dummy_banner/Gemini_Generated_Image_80b1kl80b1kl80b1.png',
    link: '/products?category=fashion',
    isActive: true
  },
  {
    id: 'dummy-3',
    image: '/dummy_banner/Gemini_Generated_Image_e5dhdke5dhdke5dh.png',
    link: '/products?category=home',
    isActive: true
  },
  {
    id: 'dummy-4',
    image: '/dummy_banner/Gemini_Generated_Image_m9c3f5m9c3f5m9c3.png',
    link: '/products',
    isActive: true
  },
  {
    id: 'dummy-5',
    image: '/dummy_banner/Gemini_Generated_Image_u4477mu4477mu447.png',
    link: '/deals',
    isActive: true
  }
]

export default function HeroBanner() {
  const [banners, setBanners] = useState(dummyBanners)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(true)
  const [loading, setLoading] = useState(true)

  // Fetch banners from admin panel
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch('/api/admin/banners')
        const data = await response.json()

        if (data.success && data.banners && data.banners.length > 0) {
          // Filter only active banners
          const activeBanners = data.banners.filter(banner => banner.isActive)
          if (activeBanners.length > 0) {
            setBanners(activeBanners)
          }
        }
      } catch (error) {
        console.log('Using dummy banners:', error)
        // Keep using dummy banners on error
      } finally {
        setLoading(false)
      }
    }

    fetchBanners()
  }, [])

  // Auto-play slideshow
  useEffect(() => {
    if (!isAutoPlay || banners.length <= 1) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length)
    }, 5000) // Change slide every 5 seconds

    return () => clearInterval(interval)
  }, [isAutoPlay, banners.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)
  }

  const goToSlide = (index) => {
    setCurrentSlide(index)
  }

  if (loading) {
    return (
      <section className="relative h-[400px] md:h-[500px] bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </section>
    )
  }

  if (banners.length === 0) {
    return null
  }

  return (
    <section className="relative h-[600px] md:h-[700px] overflow-hidden bg-white">
      {/* Banner Slides */}
      {banners.map((banner, index) => {
        const BannerContent = (
          <div
            key={banner.id || banner._id || index}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${index === currentSlide
                ? 'opacity-100 scale-100 z-10'
                : 'opacity-0 scale-105 z-0'
              }`}
          >
            <div className="relative h-full w-full">
              {/* Banner Image */}
              <img
                src={banner.image || banner.imageUrl}
                alt={banner.title || `Banner ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = '/dummy_banner/Gemini_Generated_Image_2av0jj2av0jj2av0.png'
                }}
              />


              {/* Optional: Display banner title/description if provided */}
              {(banner.title || banner.description) && (
                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="max-w-7xl mx-auto">
                    {banner.title && (
                      <h2 className="text-3xl md:text-5xl font-bold text-white mb-2">
                        {banner.title}
                      </h2>
                    )}
                    {banner.description && (
                      <p className="text-lg md:text-xl text-white/90 max-w-2xl">
                        {banner.description}
                      </p>
                    )}
                    {banner.buttonText && banner.link && (
                      <button className="mt-4 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all">
                        {banner.buttonText}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )

        // Wrap in Link if banner has a link
        return banner.link ? (
          <Link
            key={banner.id || banner._id || index}
            href={banner.link}
            className="cursor-pointer"
          >
            {BannerContent}
          </Link>
        ) : (
          <div key={banner.id || banner._id || index}>
            {BannerContent}
          </div>
        )
      })}

      {/* Navigation Arrows - Only show if more than 1 banner */}
      {banners.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.preventDefault()
              prevSlide()
            }}
            onMouseEnter={() => setIsAutoPlay(false)}
            onMouseLeave={() => setIsAutoPlay(true)}
            className="absolute left-4 md:left-6 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-md hover:bg-white/40 rounded-full p-2 md:p-3 transition-all duration-300 hover:scale-110 border border-white/30 z-20"
            aria-label="Previous slide"
          >
            <FiChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </button>

          <button
            onClick={(e) => {
              e.preventDefault()
              nextSlide()
            }}
            onMouseEnter={() => setIsAutoPlay(false)}
            onMouseLeave={() => setIsAutoPlay(true)}
            className="absolute right-4 md:right-6 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-md hover:bg-white/40 rounded-full p-2 md:p-3 transition-all duration-300 hover:scale-110 border border-white/30 z-20"
            aria-label="Next slide"
          >
            <FiChevronRight className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </button>
        </>
      )}

      {/* Dots Indicator - Only show if more than 1 banner */}
      {banners.length > 1 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 md:gap-3 z-20">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.preventDefault()
                goToSlide(index)
              }}
              className={`h-2 rounded-full transition-all duration-300 ${index === currentSlide
                  ? 'bg-white w-8 md:w-12'
                  : 'bg-white/50 w-2 hover:bg-white/70'
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}


    </section>
  )
}
