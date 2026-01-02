'use client'
import { useState } from 'react'
import Link from 'next/link'
import { FiHeart, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { FaHeart, FaStar } from 'react-icons/fa'
import { useRegion } from '@/context/RegionContext'

export default function SpecialOfferBanner() {
    const { region } = useRegion()
    const [wishlist, setWishlist] = useState(new Set())

    // Featured products for the banner
    const featuredProducts = [
        {
            _id: 'promo-1',
            name: 'Xiaomi Redmi 10A Ultra 128GB Storage',
            image: '/products/xiaomi-phone.jpg',
            rating: 4.5,
            reviews: 12,
            originalPrice: 299.00,
            salePrice: 199.00,
            badge: 'Sale'
        },
        {
            _id: 'promo-2',
            name: 'Apple Watch Series 7 GPS 41mm',
            image: '/products/apple-watch.jpg',
            rating: 5.0,
            reviews: 89,
            originalPrice: 599.00,
            salePrice: 399.00,
            badge: 'Sale'
        },
        {
            _id: 'promo-3',
            name: 'Samsung Galaxy S23 FE 256GB',
            image: '/products/samsung-s23.jpg',
            rating: 4.8,
            reviews: 156,
            originalPrice: 899.00,
            salePrice: 679.00,
            badge: 'Sale'
        },
        {
            _id: 'promo-4',
            name: 'Oppo Reno8 Pro 5G 256GB',
            image: '/products/oppo-reno.jpg',
            rating: 4.6,
            reviews: 78,
            originalPrice: 549.00,
            salePrice: 419.00,
            badge: 'Sale'
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

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(price)
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
                        {/* Promotional Box - Exact Match */}
                        <div className="flex-shrink-0 w-[280px] h-[320px] bg-[#2B4ECC] rounded-2xl p-6 flex flex-col justify-between items-center shadow-lg">
                            {/* Top Section */}
                            <div className="w-full text-center pt-4">
                                <p className="text-white text-[11px] font-semibold mb-3 tracking-wider opacity-90">SAVE UP TO</p>
                                <div className="flex items-center justify-center gap-1">
                                    <span className="text-white text-[28px] font-black">↓</span>
                                    <h3 className="text-white text-[72px] font-black leading-none tracking-tight">80%</h3>
                                </div>
                            </div>

                            {/* Bottom Section - Date Box */}
                            <div className="w-full mb-4">
                                <div className="bg-white rounded-xl py-5 px-6 shadow-md">
                                    <p className="text-[#2B4ECC] text-[56px] font-black leading-none tracking-tight">12.12</p>
                                </div>
                            </div>
                        </div>

                        {/* Product Cards */}
                        {featuredProducts.map((product) => {
                            const isInWishlist = wishlist.has(product._id)
                            const discount = Math.round(((product.originalPrice - product.salePrice) / product.originalPrice) * 100)

                            return (
                                <div
                                    key={product._id}
                                    className="flex-shrink-0 w-[220px] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300"
                                >
                                    {/* Product Image */}
                                    <div className="relative aspect-square bg-gray-50 p-4">
                                        <Link href={`/products/${product._id}`}>
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="w-full h-full object-contain"
                                                onError={(e) => {
                                                    e.target.src = '/placeholder-product.png'
                                                }}
                                            />
                                        </Link>

                                        {/* Badge */}
                                        {product.badge && (
                                            <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded">
                                                {product.badge}
                                            </span>
                                        )}

                                        {/* Wishlist */}
                                        <button
                                            onClick={() => toggleWishlist(product._id)}
                                            className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-all"
                                        >
                                            {isInWishlist ? (
                                                <FaHeart className="w-4 h-4 text-red-500" />
                                            ) : (
                                                <FiHeart className="w-4 h-4 text-gray-600" />
                                            )}
                                        </button>
                                    </div>

                                    {/* Product Info */}
                                    <div className="p-4">
                                        <Link href={`/products/${product._id}`}>
                                            <h4 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2 hover:text-blue-600 transition-colors min-h-[40px]">
                                                {product.name}
                                            </h4>
                                        </Link>

                                        {/* Rating */}
                                        <div className="flex items-center gap-1 mb-3">
                                            <div className="flex text-yellow-400">
                                                {[...Array(5)].map((_, i) => (
                                                    i < Math.floor(product.rating) ? (
                                                        <FaStar key={i} className="w-3 h-3" />
                                                    ) : (
                                                        <FaStar key={i} className="w-3 h-3 text-gray-300" />
                                                    )
                                                ))}
                                            </div>
                                            <span className="text-[10px] text-gray-500">({product.reviews})</span>
                                        </div>

                                        {/* Price */}
                                        <div className="space-y-1">
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-blue-600 text-lg font-black">
                                                    ${formatPrice(product.salePrice)}
                                                </span>
                                                <span className="text-gray-400 text-xs line-through">
                                                    ${formatPrice(product.originalPrice)}
                                                </span>
                                            </div>
                                            {discount > 0 && (
                                                <p className="text-red-500 text-xs font-semibold">
                                                    Save {discount}%
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
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
