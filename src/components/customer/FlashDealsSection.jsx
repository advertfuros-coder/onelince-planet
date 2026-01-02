'use client'
import { useState, useEffect } from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import ProductCard from './ProductCard'
import { useRegion } from '@/context/RegionContext'

export default function FlashDealsSection() {
    const { region } = useRegion()
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [wishlist, setWishlist] = useState(new Set())

    // Dummy flash deals data
    const flashDealsData = [
        {
            _id: 'flash-1',
            name: 'Wireless Bluetooth Headphones with Noise Cancellation',
            images: [{ url: '/products/headphones.jpg' }],
            pricing: {
                basePrice: 199.99,
                salePrice: 89.99
            },
            ratings: {
                average: 4.5,
                totalReviews: 234
            },
            isBestSeller: true
        },
        {
            _id: 'flash-2',
            name: 'Smart Watch Series 8 with Health Monitoring',
            images: [{ url: '/products/smartwatch.jpg' }],
            pricing: {
                basePrice: 399.99,
                salePrice: 249.99
            },
            ratings: {
                average: 4.8,
                totalReviews: 567
            },
            isTopRated: true
        },
        {
            _id: 'flash-3',
            name: 'Portable Power Bank 20000mAh Fast Charging',
            images: [{ url: '/products/powerbank.jpg' }],
            pricing: {
                basePrice: 79.99,
                salePrice: 39.99
            },
            ratings: {
                average: 4.3,
                totalReviews: 189
            }
        },
        {
            _id: 'flash-4',
            name: 'USB-C Hub 7-in-1 Multi-Port Adapter',
            images: [{ url: '/products/usb-hub.jpg' }],
            pricing: {
                basePrice: 59.99,
                salePrice: 29.99
            },
            ratings: {
                average: 4.6,
                totalReviews: 423
            },
            isNewArrival: true
        },
        {
            _id: 'flash-5',
            name: 'Mechanical Gaming Keyboard RGB Backlit',
            images: [{ url: '/products/keyboard.jpg' }],
            pricing: {
                basePrice: 149.99,
                salePrice: 79.99
            },
            ratings: {
                average: 4.7,
                totalReviews: 312
            }
        },
        {
            _id: 'flash-6',
            name: 'Wireless Gaming Mouse with Precision Sensor',
            images: [{ url: '/products/mouse.jpg' }],
            pricing: {
                basePrice: 89.99,
                salePrice: 49.99
            },
            ratings: {
                average: 4.4,
                totalReviews: 278
            },
            isBestSeller: true
        }
    ]

    useEffect(() => {
        // Simulate loading
        setTimeout(() => {
            setProducts(flashDealsData)
            setLoading(false)
        }, 500)
    }, [])

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
        const container = document.getElementById('flash-deals-scroll')
        if (container) {
            const scrollAmount = 300
            const newPosition = direction === 'left'
                ? container.scrollLeft - scrollAmount
                : container.scrollLeft + scrollAmount

            container.scrollTo({
                left: newPosition,
                behavior: 'smooth'
            })
        }
    }

    if (loading) {
        return (
            <section className="py-6 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-32 mb-4"></div>
                        <div className="flex gap-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="w-64 h-96 bg-gray-200 rounded-2xl flex-shrink-0"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        )
    }

    return (
        <section className="py-6 bg-white border-t border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Mobile Header */}
                <div className="md:hidden mb-4">
                    <h2 className="text-xl font-black text-gray-900">Flash Deals</h2>
                </div>

                <div className="flex gap-4">
                    {/* Vertical Label - Desktop Only */}
                    <div className="hidden md:flex items-center justify-center bg-gradient-to-b from-blue-600 to-indigo-700 rounded-2xl px-4 py-8 min-w-[100px] flex-shrink-0 shadow-lg">
                        <h2 className="text-white font-black text-2xl tracking-wider transform -rotate-90 whitespace-nowrap">
                            FLASH DEALS
                        </h2>
                    </div>

                    {/* Products Container */}
                    <div className="flex-1 min-w-0 relative">
                        {/* Navigation Buttons - Desktop Only */}
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

                        {/* Scrollable Products */}
                        <div
                            id="flash-deals-scroll"
                            className="flex gap-4 overflow-x-auto overflow-y-hidden scroll-smooth pb-2"
                            style={{
                                scrollbarWidth: 'none',
                                msOverflowStyle: 'none',
                                WebkitOverflowScrolling: 'touch'
                            }}
                        >
                            {products.map((product) => (
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
            </div>

            <style jsx>{`
                #flash-deals-scroll::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </section>
    )
}
