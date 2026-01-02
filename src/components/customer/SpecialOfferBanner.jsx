'use client'
import { useState } from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import ProductCard from './ProductCard'
import { useRegion } from '@/context/RegionContext'

export default function SpecialOfferBanner() {
    const { region } = useRegion()
    const [wishlist, setWishlist] = useState(new Set())

    // Featured products for the banner
    const featuredProducts = [
        {
            _id: 'promo-1',
            name: 'Xiaomi Redmi 10A Ultra 128GB Storage',
            images: [{ url: '/products/xiaomi-phone.jpg' }],
            pricing: {
                basePrice: 299.00,
                salePrice: 199.00
            },
            ratings: {
                average: 4.5,
                totalReviews: 12
            }
        },
        {
            _id: 'promo-2',
            name: 'Apple Watch Series 7 GPS 41mm',
            images: [{ url: '/products/apple-watch.jpg' }],
            pricing: {
                basePrice: 599.00,
                salePrice: 399.00
            },
            ratings: {
                average: 5.0,
                totalReviews: 89
            },
            isTopRated: true
        },
        {
            _id: 'promo-3',
            name: 'Samsung Galaxy S23 FE 256GB',
            images: [{ url: '/products/samsung-s23.jpg' }],
            pricing: {
                basePrice: 899.00,
                salePrice: 679.00
            },
            ratings: {
                average: 4.8,
                totalReviews: 156
            },
            isBestSeller: true
        },
        {
            _id: 'promo-4',
            name: 'Oppo Reno8 Pro 5G 256GB',
            images: [{ url: '/products/oppo-reno.jpg' }],
            pricing: {
                basePrice: 549.00,
                salePrice: 419.00
            },
            ratings: {
                average: 4.6,
                totalReviews: 78
            },
            isNewArrival: true
        }
    ]

    const toggleWishlist = (productId) => {
        setWishlist(prev => {
            const newSet = new Set(prev)
            if (newSet.has(productId)) {
                newSet.delete(productId)
            } else {
                newSet.add(productId)
            }
            return newSet
        })
    }

    const scroll = (direction) => {
        const container = document.getElementById('promo-scroll')
        if (container) {
            const scrollAmount = 300
            container.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            })
        }
    }

    return (
        <section className="py-6 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative">
                    {/* Navigation Buttons */}
                    <button
                        onClick={() => scroll('left')}
                        className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200"
                        aria-label="Scroll left"
                    >
                        <FiChevronLeft className="w-5 h-5 text-gray-700" />
                    </button>

                    <button
                        onClick={() => scroll('right')}
                        className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200"
                        aria-label="Scroll right"
                    >
                        <FiChevronRight className="w-5 h-5 text-gray-700" />
                    </button>

                    {/* Scrollable Container */}
                    <div
                        id="promo-scroll"
                        className="flex gap-4 overflow-x-auto overflow-y-hidden scroll-smooth pb-2"
                        style={{
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                            WebkitOverflowScrolling: 'touch'
                        }}
                    >
                        {/* Promotional Box */}
                        <div className="flex-shrink-0 w-[280px] bg-green-700 rounded-2xl p-8 flex flex-col justify-center items-center text-center shadow-lg relative overflow-hidden">
                            {/* Decorative circles */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-green-600 rounded-full opacity-30 -mr-16 -mt-16"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-green-800 rounded-full opacity-30 -ml-12 -mb-12"></div>

                            <div className="relative z-10">
                                <p className="text-white text-xs font-medium mb-1 opacity-90 tracking-wide">SAVE UP TO</p>
                                <h3 className="text-white text-7xl font-black mb-1 leading-none">
                                    <span className="text-5xl align-top">↓</span>80%
                                </h3>
                                <p className="text-white text-xs mb-8 opacity-75 tracking-wide">On selected items</p>

                                <div className="bg-white rounded-xl px-8 py-4 shadow-lg">
                                    <p className="text-green-700 text-5xl font-black tracking-tight leading-none">12.12</p>
                                </div>
                            </div>
                        </div>

                        {/* Product Cards */}
                        {featuredProducts.map((product) => (
                            <div key={product._id} className="flex-shrink-0 w-[280px]">
                                <ProductCard
                                    product={product}
                                    isWishlisted={wishlist.has(product._id)}
                                    onToggleWishlist={toggleWishlist}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style jsx>{`
                #promo-scroll::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </section>
    )
}
