'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

export default function HeroBanner({ banners: externalBanners = null, previewBanner = null }) {
  const [banners, setBanners] = useState([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [loading, setLoading] = useState(!externalBanners && !previewBanner)

  const defaultBanners = [
    {
      id: 'def-1',
      type: 'main',
      productImage: 'https://www.contentgrip.com/content/images/size/w2000/2025/09/Apple-goes-full-blockbuster-to-market-the-iPhone-17-Pro---s-durability.webp',
      title: 'iPhone 17 Pro Max',
      subtitle: 'From AED 4,999*',
      description: 'A18 chip. Superfast. Supersmart. History. Biggest Price Drop',
      buttonText: 'Shop Now',
      buttonLink: '/products/iphone-17-pro-max',
      bgColor: 'from-blue-900 via-blue-800 to-indigo-900',
      textColor: 'text-white',
      textAlign: { vertical: 'center', horizontal: 'left' },
      imagePosition: { horizontal: 'right', vertical: 'center' }
    }
  ]

  const defaultSaleCards = [
    {
      id: 'def-sale-1',
      type: 'sale',
      title: 'SALE',
      subtitle: 'UP TO',
      description: 'OFF',
      discount: '50%',
      productImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
      bgColor: 'from-cyan-400 to-blue-500',
      textColor: 'text-white'
    }
  ]

  useEffect(() => {
    if (externalBanners || previewBanner) {
      let baseBanners = externalBanners ? [...externalBanners] : []

      // If we have a preview banner, we replace it in the list if it matches an id,
      // or we use it as the primary preview source
      if (previewBanner) {
        const isMain = previewBanner.type === 'main'

        // Filter base banners to remove any that would be overridden by preview
        // In simple preview mode, we might just want to show the preview and one of the other type
        const otherType = isMain ? 'sale' : 'main'
        const others = baseBanners.filter(b => b.type === otherType)
        const sameType = baseBanners.filter(b => b.type === (isMain ? 'main' : 'sale') && b._id !== previewBanner._id)

        // Construct the new list
        const newList = [previewBanner, ...sameType, ...others]

        // Ensure we always have at least one of each for the grid layout
        const hasMain = newList.some(b => b.type === 'main')
        const hasSale = newList.some(b => b.type === 'sale')

        const finalBanners = [
          ...(hasMain ? newList.filter(b => b.type === 'main') : defaultBanners),
          ...(hasSale ? newList.filter(b => b.type === 'sale') : defaultSaleCards)
        ]

        setBanners(finalBanners)
      } else {
        setBanners(baseBanners.length > 0 ? baseBanners : [...defaultBanners, ...defaultSaleCards])
      }
      setLoading(false)
      return
    }

    const fetchBanners = async () => {
      try {
        const response = await fetch('/api/banners')
        const data = await response.json()
        if (data.success && data.banners?.length > 0) {
          setBanners(data.banners)
        } else {
          setBanners([...defaultBanners, ...defaultSaleCards])
        }
      } catch (error) {
        console.error('Error fetching banners:', error)
        setBanners([...defaultBanners, ...defaultSaleCards])
      } finally {
        setLoading(false)
      }
    }

    fetchBanners()
  }, [externalBanners, previewBanner])

  useEffect(() => {
    if (banners.length <= 1) return
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % mainBanners.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [banners])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % mainBanners.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + mainBanners.length) % mainBanners.length)
  }

  const mainBanners = banners.filter(b => b.type === 'main')
  const saleBanners = banners.filter(b => b.type === 'sale')

  const currentBanner = mainBanners[currentSlide] || defaultBanners[0]
  const currentSale = saleBanners[currentSlide % (saleBanners.length || 1)] || defaultSaleCards[0]

  if (loading) return <div className="w-full md:h-[400px] bg-gray-100 animate-pulse rounded-3xl" />

  const getAlignmentClasses = (align) => {
    const v = align?.vertical || 'center'
    const h = align?.horizontal || 'left'

    let classes = 'flex '
    if (v === 'top') classes += 'items-start '
    else if (v === 'bottom') classes += 'items-end '
    else classes += 'items-center '

    if (h === 'left') classes += 'justify-start '
    else if (h === 'right') classes += 'justify-end '
    else classes += 'justify-center '

    return classes
  }

  const getTextAlignClasses = (h) => {
    if (h === 'left') return 'text-left'
    if (h === 'right') return 'text-right'
    return 'text-center'
  }

  const getImagePositionStyle = (pos) => {
    const h = pos?.horizontal || 'right'
    const v = pos?.vertical || 'center'
    return `${h} ${v}`
  }

  return (
    <section className="relative w-full bg-white py-4 md:py-6">
      <div className="max-w-8xl mx-auto px-4 ">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">

          {/* Main Card */}
          <div 
            className={`md:col-span-2 relative rounded-3xl overflow-hidden group h-[280px] md:h-[400px] ${currentBanner.buttonLink ? 'cursor-pointer' : ''}`} 
            style={{ backgroundColor: currentBanner.containerBg || 'transparent' }}
          >
            {currentBanner.buttonLink && (
              <Link href={currentBanner.buttonLink} className="absolute inset-0 z-20" />
            )}
            <div className={`absolute inset-0 bg-gradient-to-br ${currentBanner.bgColor} transition-all duration-1000 group-hover:scale-105`}></div>

            <div
              className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"
              style={{
                backgroundImage: `url('${currentBanner.productImage}')`,
                backgroundSize: 'cover',
                backgroundPosition: getImagePositionStyle(currentBanner.imagePosition),
                backgroundRepeat: 'no-repeat',
              }}
            ></div>

            <div className={`relative h-full p-6 md:p-16 ${getAlignmentClasses(currentBanner.textAlign)}`}>
              <div
                className={`z-10 md:w-[400px] w-[250px] md:max-w-xl ${currentBanner.textColor || (!currentBanner.customTextColor ? 'text-white' : '')} space-y-3 md:space-y-6 ${getTextAlignClasses(currentBanner.textAlign?.horizontal)}`}
                style={currentBanner.customTextColor ? { color: currentBanner.customTextColor } : {}}
              >
                {(currentBanner.showTitle !== false || currentBanner.showSubtitle !== false) && (
                  <div className="space-y-1 md:space-y-2">
                    {currentBanner.showTitle !== false && (
                      <h2 className="text-2xl md:text-4xl font-semibold tracking-tight opacity-90">
                        {currentBanner.title}
                      </h2>
                    )}
                    {currentBanner.showSubtitle !== false && (
                      <p className="text-md md:text-2xl font-semibold leading-tight">
                        {currentBanner.subtitle}
                      </p>
                    )}
                  </div>
                )}

                {/* {currentBanner.showDescription !== false && (
                  <p className="text-[10px] md:text-base opacity-80 max-w-md leading-tight md:leading-relaxed line-clamp-3">
                    {currentBanner.description}
                  </p>
                )} */}

                {currentBanner.showButton !== false && (
                  <div className={`pt-2 md:pt-4 flex ${
                    currentBanner.buttonStyle?.align === 'center' ? 'justify-center' : 
                    currentBanner.buttonStyle?.align === 'right' ? 'justify-end' : 
                    'justify-start'
                  }`}>
                    <Link
                      href={currentBanner.buttonLink || '#'}
                      className="inline-block px-4 md:px-6 py-2 md:py-3 rounded-full font-semibold text-xs md:text-sm hover:scale-105 transition-all duration-300 shadow-xl"
                      style={{
                        backgroundColor: currentBanner.buttonStyle?.bgColor || (currentBanner.textColor === 'text-white' ? '#FFFFFF' : '#111827'),
                        color: currentBanner.buttonStyle?.textColor || (currentBanner.textColor === 'text-white' ? '#111827' : '#FFFFFF')
                      }}
                    >
                      {currentBanner.buttonText}
                    </Link>
                  </div>
                )}
              </div>

              {mainBanners.length > 1 && (
                <>
                  <button onClick={prevSlide} className="hidden md:flex absolute left-4 w-10 h-10 items-center justify-center bg-white/20 hover:bg-white/40 rounded-full text-white transition-all backdrop-blur-sm">
                    <FiChevronLeft size={24} />
                  </button>
                  <button onClick={nextSlide} className="hidden md:flex absolute right-4 w-10 h-10 items-center justify-center bg-white/20 hover:bg-white/40 rounded-full text-white transition-all backdrop-blur-sm">
                    <FiChevronRight size={24} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Sale Card */}
          <div className={` md:block relative rounded-3xl overflow-hidden group h-[400px] ${currentSale.buttonLink ? 'cursor-pointer' : ''}`}>
            {currentSale.buttonLink && (
              <Link href={currentSale.buttonLink} className="absolute inset-0 z-20" />
            )}
            <div className={`absolute inset-0 bg-gradient-to-br ${currentSale.bgColor} transition-all duration-1000 group-hover:scale-105`}></div>
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-3xl -ml-24 -mb-24"></div>
            </div>

            <div className="relative h-full flex flex-col items-center justify-center text-center px-6 space-y-6">
              {(currentSale.showTitle !== false || currentSale.showSubtitle !== false) && (
                <div className="space-y-2">
                  {currentSale.showTitle !== false && (
                    <h3 className={`text-2xl md:text-3xl font-semibold tracking-wider ${currentSale.textColor || 'text-white'}`} style={currentSale.customTextColor ? { color: currentSale.customTextColor } : {}}>
                      {currentSale.title}
                    </h3>
                  )}
                  {currentSale.showSubtitle !== false && (
                    <p className={`text-sm md:text-base font-semibold uppercase tracking-widest ${currentSale.textColor || 'text-white'} opacity-90`} style={currentSale.customTextColor ? { color: currentSale.customTextColor } : {}}>
                      {currentSale.subtitle}
                    </p>
                  )}
                </div>
              )}

              <div className="relative">
                {currentSale.discount && (
                  <div className={`text-7xl md:text-8xl font-semibold leading-none ${currentSale.textColor || 'text-white'}`} style={currentSale.customTextColor ? { color: currentSale.customTextColor } : {}}>
                    {currentSale.discount}
                  </div>
                )}
                {currentSale.showDescription !== false && (
                  <div className={`text-xl md:text-2xl font-semibold mt-2 ${currentSale.textColor || 'text-white'} opacity-90`} style={currentSale.customTextColor ? { color: currentSale.customTextColor } : {}}>
                    {currentSale.description}
                  </div>
                )}
              </div>

              <div
                className="absolute inset-0 transition-transform duration-700 group-hover:scale-105 opacit y-30 pointer-events-none"
                style={{
                  backgroundImage: `url('${currentSale.productImage}')`,
                  backgroundSize: 'cover',
                  backgroundPosition: getImagePositionStyle(currentSale.imagePosition),
                  backgroundRepeat: 'no-repeat',
                 }}
              ></div>
            </div>
          </div>
        </div>

        {mainBanners.length > 1 && (
          <div className="flex justify-center gap-2 mt-4 md:mt-6">
            {mainBanners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 transition-all duration-300 rounded-full ${currentSlide === idx ? 'w-8 bg-blue-600' : 'w-2 bg-gray-300'}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
