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
            // Fetch featured products from the new API
            const response = await fetch(`/api/admin/featured-products?section=todays_best_deals&limit=10`)
            const data = await response.json()

            console.log('TodaysBestDeals - Featured products API response:', data)

            // Use featured products if available, otherwise use fallback
            if (data.success && data.products && data.products.length > 0) {
                console.log('TodaysBestDeals - Using featured products:', data.products.length)
                console.log('TodaysBestDeals - Raw product data:', data.products)
                
                // Transform API data to match ProductCard expected format
                const transformedProducts = data.products.map(product => {
                    if (!product.price || product.price === 0) {
                        console.warn('TodaysBestDeals - Product has no price:', product.name, product)
                    }
                    
                    return {
                        ...product,
                        _id: product._id || product.id,
                        price: product.price || 0,
                        originalPrice: product.originalPrice || product.price || 0,
                        pricing: {
                            basePrice: product.originalPrice || product.price || 0,
                            salePrice: product.price || 0
                        },
                        ratings: {
                            average: product.rating || 4,
                            totalReviews: product.reviewCount || 0
                        },
                        images: product.images?.length > 0
                            ? product.images.map(img => ({ url: typeof img === 'string' ? img : img.url }))
                            : [{ url: `https://picsum.photos/seed/${product._id}/400/400` }]
                    }
                })
                console.log('TodaysBestDeals - Transformed featured products:', transformedProducts)
                setProducts(transformedProducts)
            } else {
                console.log('TodaysBestDeals - No featured products, using fallback')
                // Fallback to regular products if no featured products
                const fallbackResponse = await fetch(`/api/products?limit=10&country=${region.code}`)
                const fallbackData = await fallbackResponse.json()
                
                if (fallbackData.products && fallbackData.products.length > 0) {
                    console.log('TodaysBestDeals - Using regular products fallback')
                    const transformedProducts = fallbackData.products.map(product => ({
                        ...product,
                        pricing: {
                            basePrice: product.originalPrice || product.price,
                            salePrice: product.price
                        },
                        ratings: {
                            average: product.rating || 4,
                            totalReviews: product.reviewCount || 0
                        },
                        images: product.images?.length > 0
                            ? product.images.map(img => ({ url: typeof img === 'string' ? img : img.url }))
                            : [{ url: `https://picsum.photos/seed/${product._id}/400/400` }]
                    }))
                    setProducts(transformedProducts)
                } else {
                    console.log('TodaysBestDeals - Using dummy data fallback')
                    // Use dummy data as last resort
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
                        images: product.images?.length > 0
                            ? product.images.map(img => ({ url: img }))
                            : [{ url: `https://picsum.photos/seed/${product._id}/400/400` }]
                    }))
                    setProducts(transformedDummyData)
                }
            }
        } catch (error) {
            console.error('TodaysBestDeals - Error fetching products:', error)
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
                images: product.images?.length > 0
                    ? product.images.map(img => ({ url: img }))
                    : [{ url: `https://picsum.photos/seed/${product._id}/400/400` }]
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
            <section className="py-8 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
        <section className="py-8 bg-white">
            <div className="max-w-8xl mx-auto px-4  ">
                {/* Header - 100% Replication of Promotional Style */}
                <div className="flex flex-col items-center justify-center text-center mb-6">
                    {/* Top Pill - Yellow Badge */}
                    <div className="z-10 bg-[#FFD66B] px-5 py-1.5 rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.08)] -mb-4">
                        <span className="text-[13px] text-[#FFD66B] font-extrabold md:text-[16px]   text-black uppercase tracking-widest whitespace-nowrap">
                            TODAY'S BEST
                        </span>
                    </div>

                    {/* Main Title - Purple DEALS with Glow/Outline */}
                    <div className="relative">
                        <h2
                            className="text-6xl md:text-[110px] font-[1000] text-[#9281FF] uppercase tracking-tighter leading-none"
                            style={{
                                textShadow: '0 0 20px rgba(146, 129, 255, 0.2)',
                                WebkitTextStroke: '2px #FFFFFF'
                            }}
                        >
                            DEALS
                        </h2>

                        {/* Star Decorations (4-pointed) */}
                        <div className="absolute top-2 -right-8 md:-right-16 animate-pulse">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="#FFD66B">
                                <path d="M12 0L13.5 10.5L24 12L13.5 13.5L12 24L10.5 13.5L0 12L10.5 10.5L12 0Z" />
                            </svg>
                        </div>
                        <div className="absolute bottom-4 -left-8 md:-left-16 animate-bounce-slow opacity-80 scale-75">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="#50E3C2">
                                <path d="M12 0L13.5 10.5L24 12L13.5 13.5L12 24L10.5 13.5L0 12L10.5 10.5L12 0Z" />
                            </svg>
                        </div>
                    </div>

                    {/* Subtitle with Chevron Circle */}
                    <Link
                        href="/products"
                        className="mt6 flex items-center gap-3 group transition-transform hover:scale-105"
                    >
                        <span className="text-xl md:text-[32px] font-extrabold text-[#1a1a1b] tracking-tight">
                            For You!
                        </span>
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-black flex items-center justify-center text-white shadow-lg transition-colors group-hover:bg-[#0066FF]">
                            <FiChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                    </Link>
                </div>

                {/* Products Scrollable Row / Grid */}
                <div className="flex md:grid md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-6 overflow-x-auto md:overflow-visible no-scrollbar snap-x snap-mandatory  px-4 md:mx-0 md:px-0">
                    {products.slice(0, 10).map((product) => (
                        <div
                            key={product._id}
                            className="min-w-[36%] sm:min-w-[30%] md:min-w-0 snap-start"
                        >
                            <ProductCard
                                product={product}
                                isWishlisted={wishlist.has(product._id)}
                                onToggleWishlist={toggleWishlist}
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
