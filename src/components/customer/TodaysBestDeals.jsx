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
            <section className="py-12 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="animate-pulse space-y-6">
                        <div className="h-8 bg-gray-200 rounded w-64"></div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-96 bg-gray-200 rounded-2xl"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        )
    }

    return (
        <section className="py-6 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl md:text-2xl font-black text-gray-900">
                        Today's Best Deals For You!
                    </h2>
                    <Link
                        href="/products"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm md:text-base transition-colors group"
                    >
                        View All
                        <FiChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                    {products.slice(0, 5).map((product) => (
                        <ProductCard
                            key={product._id}
                            product={product}
                            isWishlisted={wishlist.has(product._id)}
                            onToggleWishlist={toggleWishlist}
                        />
                    ))}
                </div>

                {/* Empty State */}
                {products.length === 0 && !loading && (
                    <div className="text-center py-16">
                        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                            <FiStar className="w-12 h-12 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Deals Available</h3>
                        <p className="text-gray-600">Check back soon for amazing deals!</p>
                    </div>
                )}
            </div>
        </section>
    )
}
