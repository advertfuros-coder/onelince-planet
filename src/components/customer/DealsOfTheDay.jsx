'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FiChevronRight, FiStar } from 'react-icons/fi'
import { useRegion } from '@/context/RegionContext'
import ProductCard from './ProductCard'
import dummyDealsData from '@/data/todaysBestDeals.json'

export default function TodaysBestDeals() {
    const { region } = useRegion()
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [wishlist, setWishlist] = useState(new Set())

    useEffect(() => {
        fetchProducts()
    }, [region])

    const fetchProducts = async () => {
        try {
            setLoading(true)
            const response = await fetch(`/api/products?limit=10&country=${region.code}`)
            const data = await response.json()

            // Use API data if available, otherwise use dummy data
            if (data.products && data.products.length > 0) {
                // Transform API data to match ProductCard expected format
                const transformedProducts = data.products.map(product => ({
                    ...product,
                    pricing: {
                        basePrice: product.originalPrice || product.price,
                        salePrice: product.price
                    },
                    ratings: {
                        average: product.rating || 4,
                        totalReviews: product.reviewCount || 0
                    },
                    images: product.images?.map(img => ({ url: img })) || []
                }))
                setProducts(transformedProducts)
            } else {
                // Transform dummy data to match ProductCard expected format
                const transformedDummyData = dummyDealsData.products.map(product => ({
                    ...product,
                    pricing: {
                        basePrice: product.originalPrice || product.price,
                        salePrice: product.price
                    },
                    ratings: {
                        average: product.rating || 4,
                        totalReviews: product.reviewCount || 0
                    },
                    images: product.images?.map(img => ({ url: img })) || []
                }))
                setProducts(transformedDummyData)
            }
        } catch (error) {
            console.error('Error fetching products:', error)
            // Transform dummy data on error
            const transformedDummyData = dummyDealsData.products.map(product => ({
                ...product,
                pricing: {
                    basePrice: product.originalPrice || product.price,
                    salePrice: product.price
                },
                ratings: {
                    average: product.rating || 4,
                    totalReviews: product.reviewCount || 0
                },
                images: product.images?.map(img => ({ url: img })) || []
            }))
            setProducts(transformedDummyData)
        } finally {
            setLoading(false)
        }
    }

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

    if (loading) {
        return (
            <section className="py-8  bg-white overflow-hidden">
                <div className="max-w-8xl mx-auto px-4  ">
                    <div className="animate-pulse space-y-6">
                        <div className="h-6 bg-gray-200 rounded w-48"></div>
                        <div className="flex gap-4 overflow-hidden">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="min-w-[36%] md:min-w-[200px] h-64 bg-gray-100 rounded-2xl"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        )
    }

    return (
        <section className="py-8 bg-gradient-to-b from-white to-red-200/40 overflow-hidden">
            <div className="max-w-8xl mx-auto px-4  ">
                {/* Header - 100% Replication of Promotional Style */}
                {/* <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-8">
                     <div className="flex items-center gap-4">
                        <div className="relative leading-tight">
                            <h2 
                                className="text-4xl md:text-6xl font-[#1000] font-semibold italic tracking-tighter text-white"
                                style={{ 
                                    WebkitTextStroke: '2px #1e293b',
                                    textShadow: `
                                        3px 3px 0px #7c3aed,
                                        4px 4px 0px #7c3aed,
                                        5px 5px 0px #7c3aed
                                    `
                                }}
                            >
                                DEALS OF<br />THE DAY
                            </h2>
                        </div>
                        
                         <div className="relative -rotate-12 transform hover:rotate-0 transition-transform duration-300">
                              <div className="absolute top-0 right-0 w-3 h-3 bg-[#7c3aed] rounded-full z-10 -mr-1 -mt-1 shadow-sm"></div>
                              <div className="bg-[#fbbf24] border-2 border-[#1e293b] rounded-lg px-2 py-1 shadow-[4px_4px_0px_#1e293b]">
                                 <span className="text-3xl md:text-4xl font-semibold text-[#1e293b]">%</span>
                             </div>
                        </div>
                    </div>

                 
                </div> */}

                {/* Infinite Marquee Strips */}
                <div className="relative py-4 overflow--hidden ">
                    {/* Red Strip (20 deg) */}
                    <div className="absolute top-1/2 left-1/2 w-[150%] -translate-x-1/2 -translate-y-1/2 rotate-[5deg] bg-[#ff0000] py-1 border-y-2 border-white/30 z-20 shadow-2xl">
                        <div className="flex whitespace-nowrap animate-marquee">
                            {[...Array(10)].map((_, i) => (
                                <span key={i} className="text-white text-xl md:text-3xl font-semibold  uppercase tracking-tighter flex items-center shrink-0">
                                    <span className="mx-4 italic text-sm md:text-xl font-semibold">Price Drop Alert</span>
                                    <span className="text-2xl md:text-4xl">⚠️</span>
                                </span>
                            ))}
                            {[...Array(10)].map((_, i) => (
                                <span key={i+10} className="text-white text-xl md:text-3xl font-semibold  uppercase tracking-tighter flex items-center shrink-0">
                                    <span className="mx-4 italic text-sm md:text-xl font-semibold">Price Drop Alert</span>
                                    <span className="text-2xl md:text-4xl">⚠️</span>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Black Strip (-20 deg) */}
                    <div className="absolute top-1/2 left-1/2 w-[150%] -translate-x-1/2 -translate-y-1/2 -rotate-[8deg] bg-black py-1 border-y-2 border-white/10 z-10 shadow-2xl opacity-100">
                        <div className="flex whitespace-nowrap animate-marquee-reverse">
                            {[...Array(10)].map((_, i) => (
                                <span key={i} className="text-white text-xl md:text-3xl font-semibold  uppercase tracking-tighter flex items-center shrink-0">
                                    <span className="mx-4 italic text-sm md:text-xl font-semibold">Price Drop Alert</span>
                                    <span className="text-2xl md:text-4xl">⚠️</span>
                                </span>
                            ))}
                            {[...Array(10)].map((_, i) => (
                                <span key={i+10} className="text-white text-xl md:text-3xl font-semibold   uppercase tracking-tighter flex items-center shrink-0">
                                    <span className="mx-4 italic text-sm md:text-xl font-semibold">Price Drop Alert</span>
                                    <span className="text-2xl md:text-4xl">⚠️</span>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <style jsx>{`
                    @keyframes marquee {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-50%); }
                    }
                    @keyframes marquee-reverse {
                        0% { transform: translateX(-50%); }
                        100% { transform: translateX(0); }
                    }
                    .animate-marquee {
                        animation: marquee 20s linear infinite;
                    }
                    .animate-marquee-reverse {
                        animation: marquee-reverse 20s linear infinite;
                    }
                    .no-scrollbar::-webkit-scrollbar {
                        display: none;
                    }
                `}</style>                {/* Products Scrollable Row / Grid */}
                <div className="flex mt-16 md:grid md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-6 overflow-x-auto md:overflow-visible no-scrollbar snap-x snap-mandatory  px-4 md:mx-0 md:px-0">
                    {products.slice(0, 10).map((product) => (
                        <div
                            key={product._id}
                            className="min-w-[36%] sm:min-w-[30%] md:min-w-0 snap-start"
                        >
                            <ProductCard
                                product={product}
                                isWishlisted={wishlist.has(product._id)}
                                onToggleWishlist={toggleWishlist}
                                minimal={true}
                            />
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {products.length === 0 && !loading && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                            <FiStar className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">No Deals Available</h3>
                        <p className="text-sm text-gray-600">Check back soon for amazing deals!</p>
                    </div>
                )}
            </div>
        </section>
    )
}
