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

          {/* Left Card - Main Product Banner */}
          <div className="md:col-span-2 relative rounded-3xl overflow-hidden group h-[280px] md:h-[400px]">
            {/* Animated Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${currentBanner.bgColor} transition-all duration-1000`}></div>

            {/* Product Image as Background - Right Aligned */}
            <div
              className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"
              style={{
                backgroundImage: `url('${currentBanner.productImage}')`,
                backgroundSize: 'contain',
                backgroundPosition: 'right center',
                backgroundRepeat: 'no-repeat',
                filter: 'drop-shadow(0 25px 50px rgba(0, 0, 0, 0.3))'
              }}
            >
            </div>

            {/* Content Container */}
            <div className="relative h-full flex items-center px-6 md:px-16">

              {/* Text Content - Full Width */}
              <div className={`z-10 w-full md:max-w-xl ${currentBanner.textColor} space-y-3 md:space-y-6`}>
                <div className="space-y-1 md:space-y-2">
                  <h2 className="text-2xl md:w-full w-60 md:text-4xl font-semibold tracking-tight opacity-90">
                    {currentBanner.title}
                  </h2>
                  <p className="text-xl md:text-3xl font-semibold leading-tight">
                    {currentBanner.subtitle}
                  </p>
                </div>

                <p className="text-[10px] md:text-base opacity-80 max-w-[180px] md:max-w-xs leading-tight md:leading-relaxed line-clamp-2 md:line-clamp-none">
                  {currentBanner.description}
                </p>

                <div className="pt-2 md:pt-4">
                  <Link
                    href={currentBanner.buttonLink}
                    className={`inline-block px-6 md:px-10 py-2 md:py-4 ${currentBanner.textColor === 'text-white' ? 'bg-white text-gray-900' : 'bg-gray-900 text-white'} rounded-full font-bold text-xs md:text-base hover:scale-105 transition-all duration-300 shadow-xl`}
                  >
                    {currentBanner.buttonText}
                  </Link>
                </div>

                <p className="hidden md:block text-xs opacity-60 pt-2">*Incl. All Offers</p>
              </div>

              {/* Navigation Arrows (Desktop Only) */}
              <button
                onClick={prevSlide}
                className="hidden md:flex absolute left-4 w-10 h-10 items-center justify-center bg-white/20 hover:bg-white/40 rounded-full text-white transition-all backdrop-blur-sm"
              >
                <FiChevronLeft size={24} />
              </button>
              <button
                onClick={nextSlide}
                className="hidden md:flex absolute right-4 w-10 h-10 items-center justify-center bg-white/20 hover:bg-white/40 rounded-full text-white transition-all backdrop-blur-sm"
              >
                <FiChevronRight size={24} />
              </button>
            </div>
          </div>

          {/* Right Card - 1/3 width - Sale/Promo Card (Hidden on Mobile) */}
          <div className="hidden md:block relative rounded-3xl overflow-hidden group h-[400px]">
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

        {/* Pagination Dots */}
        <div className="flex justify-center gap-2 mt-4 md:mt-6">
          {bannerImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 transition-all duration-300 rounded-full ${currentSlide === idx ? 'w-8 bg-blue-600' : 'w-2 bg-gray-300'}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
