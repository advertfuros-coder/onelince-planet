'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

export default function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const bannerImages = [
    {
      id: 1,
      productImage: 'https://www.contentgrip.com/content/images/size/w2000/2025/09/Apple-goes-full-blockbuster-to-market-the-iPhone-17-Pro---s-durability.webp',
      title: 'iPhone 17 Pro Max',
      subtitle: 'From AED 4,999*',
      description: 'A18 chip. Superfast. Supersmart. History. Biggest Price Drop',
      buttonText: 'Shop Now',
      buttonLink: '/products/iphone-17-pro-max',
      bgColor: 'from-blue-900 via-blue-800 to-indigo-900',
      textColor: 'text-white'
    },
    {
      id: 2,
      productImage: 'https://scontent.flko13-1.fna.fbcdn.net/v/t39.30808-6/561640733_1437571778372113_6448301416542452017_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=833d8c&_nc_ohc=tYubpuOMFu0Q7kNvwEz1Suf&_nc_oc=AdmIuEj2ptw5gzAHLjd207JdZw2n6svNRYO3ApiYmZJV-_UL-IbSU8ea_JTCJmFxjsPoiyuF2hq6r5tP2WQ5qj5i&_nc_zt=23&_nc_ht=scontent.flko13-1.fna&_nc_gid=yj1gaAjdLaItsNWMMUpRBw&oh=00_AfqxtjiM8I3M2COBt2b4vLyLz-vEsriadkGRMFKabMhsNw&oe=695D4AF6',
      title: 'MacBook Pro',
      subtitle: 'From AED 7,999',
      description: 'M3 chip. Supercharged for pros.',
      buttonText: 'Learn More',
      buttonLink: '/products/macbook-pro',
      bgColor: 'from-black via-gray-900 to-gray-800',
      textColor: 'text-white'
    },
    {
      id: 3,
      productImage: 'https://d1ncau8tqf99kp.cloudfront.net/converted/108740_original_local_1200x1050_v3_converted.webp',
      title: 'Sony Premium Headphones',
      subtitle: 'From AED 899',
      description: 'Industry-leading noise cancellation',
      buttonText: 'Discover',
      buttonLink: '/products/sony-headphones',
      bgColor: 'from-green-800 via-emerald-700 to-teal-800',
      textColor: 'text-white'
    },
    {
      id: 4,
      productImage: 'https://shop.stc.com.bh/image/cache/catalog/001-galaxy-watch-ultra-titaniumgray-front-542x399.webp',
      title: 'Samsung Watch Ultra',
      subtitle: 'From AED 1,999',
      description: 'Ultimate fitness companion',
      buttonText: 'Explore',
      buttonLink: '/products/samsung-watch-ultra',
      bgColor: 'from-gray-200 via-gray-100 to-white',
      textColor: 'text-gray-900'
    }
  ]

  const saleCards = [
    {
      id: 1,
      title: 'SALE',
      subtitle: 'UP TO',
      discount: '50%',
      description: 'OFF',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
      bgColor: 'from-cyan-400 to-blue-500'
    },
    {
      id: 2,
      title: 'NEW',
      subtitle: 'ARRIVALS',
      discount: '30%',
      description: 'OFF',
      image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800',
      bgColor: 'from-purple-500 to-pink-500'
    }
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerImages.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % bannerImages.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + bannerImages.length) % bannerImages.length)
  }

  const currentBanner = bannerImages[currentSlide]
  const currentSale = saleCards[currentSlide % saleCards.length]

  return (
    <section className="relative w-full bg-white py-4 md:py-6">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        {/* Main Grid - 2/3 and 1/3 split */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">

          {/* Left Card - 2/3 width - Main Product Banner */}
          <div className="md:col-span-2 relative rounded-3xl overflow-hidden group h-[300px] md:h-[350px]">
            {/* Animated Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${currentBanner.bgColor} transition-all duration-1000`}></div>

            {/* Content Container */}
            <div className="relative h-full flex items-center justify-between px-8 md:px-16">

              {/* Left Text Content */}
              <div className={`z-10 max-w-md ${currentBanner.textColor} space-y-4 md:space-y-6`}>
                <div className="space-y-2">
                  <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
                    {currentBanner.title}
                  </h2>
                  <p className="text-2xl md:text-4xl font-bold opacity-90">
                    {currentBanner.subtitle}
                  </p>
                </div>

                <p className="text-sm md:text-base opacity-80 max-w-xs leading-relaxed">
                  {currentBanner.description}
                </p>

                <Link
                  href={currentBanner.buttonLink}
                  className={`inline-block px-8 py-3 ${currentBanner.textColor === 'text-white' ? 'bg-white text-gray-900' : 'bg-gray-900 text-white'} rounded-full font-bold text-sm hover:scale-105 transition-transform duration-300 shadow-lg`}
                >
                  {currentBanner.buttonText}
                </Link>

                <p className="text-xs opacity-60 pt-2">*Incl. All Offers</p>
              </div>

              {/* Right Product Image */}
              <div className="hidden md:block relative w-[45%] h-full">
                <img
                  src={currentBanner.productImage}
                  alt={currentBanner.title}
                  className="absolute right-0 top-1/2 -translate-y-1/2 h-[90%] w-auto object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>

            {/* Navigation Arrows */}
            <div className="absolute bottom-6 left-8 flex items-center gap-3 z-20">
              <button
                onClick={prevSlide}
                className={`w-10 h-10 rounded-full ${currentBanner.textColor === 'text-white' ? 'bg-white/20 hover:bg-white/30' : 'bg-black/20 hover:bg-black/30'} backdrop-blur-md flex items-center justify-center transition-all duration-300 hover:scale-110`}
              >
                <FiChevronLeft className={`w-5 h-5 ${currentBanner.textColor}`} />
              </button>
              <button
                onClick={nextSlide}
                className={`w-10 h-10 rounded-full ${currentBanner.textColor === 'text-white' ? 'bg-white/20 hover:bg-white/30' : 'bg-black/20 hover:bg-black/30'} backdrop-blur-md flex items-center justify-center transition-all duration-300 hover:scale-110`}
              >
                <FiChevronRight className={`w-5 h-5 ${currentBanner.textColor}`} />
              </button>
            </div>

            {/* Slide Indicators */}
            <div className="absolute bottom-6 right-8 flex items-center gap-2 z-20">
              {bannerImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${index === currentSlide
                    ? `w-8 ${currentBanner.textColor === 'text-white' ? 'bg-white' : 'bg-gray-900'}`
                    : `w-1.5 ${currentBanner.textColor === 'text-white' ? 'bg-white/40' : 'bg-gray-900/40'}`
                    }`}
                />
              ))}
            </div>
          </div>

          {/* Right Card - 1/3 width - Sale/Promo Card */}
          <div className="relative rounded-3xl overflow-hidden group h-[300px] md:h-[350px]">
            {/* Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${currentSale.bgColor} transition-all duration-1000`}></div>

            {/* Decorative Elements */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-3xl -ml-24 -mb-24"></div>
            </div>

            {/* Content */}
            <div className="relative h-full flex flex-col items-center justify-center text-center px-6 space-y-6">
              <div className="space-y-2">
                <h3 className="text-2xl md:text-3xl font-black text-white tracking-wider">
                  {currentSale.title}
                </h3>
                <p className="text-sm md:text-base font-bold text-white/90 uppercase tracking-widest">
                  {currentSale.subtitle}
                </p>
              </div>

              <div className="relative">
                <div className="text-7xl md:text-8xl font-black text-white leading-none">
                  {currentSale.discount}
                </div>
                <div className="text-xl md:text-2xl font-black text-white/90 mt-2">
                  {currentSale.description}
                </div>
              </div>

              {/* Product Image Overlay */}
              <div className="absolute bottom-0 left-0 right-0 h-1/2 opacity-30">
                <img
                  src={currentSale.image}
                  alt="Sale product"
                  className="w-full h-full object-cover object-center"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
