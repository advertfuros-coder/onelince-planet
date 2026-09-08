'use client'
import { useState, useEffect } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import ProductCard from './ProductCard'

export default function TrendingNow() {
    const [trendingProducts, setTrendingProducts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchTrendingProducts()
    }, [])

    const fetchTrendingProducts = async () => {
        try {
            const response = await fetch('/api/trending-products')
            const data = await response.json()
            setTrendingProducts(data.products || [])
        } catch (error) {
            console.error('Error fetching trending products:', error)
            setTrendingProducts(getDummyProducts())
        } finally {
            setLoading(false)
        }
    }

    const getDummyProducts = () => [
        {
            _id: '1',
            name: 'Nature Medica Glutathione Brightening Foaming FaceWash – 120ml',
            pricing: {
                salePrice: 699,
                basePrice: 799
            },
            images: [{ url: 'https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?auto=format&fit=crop&q=80&w=400' }],
            ratings: {
                average: 0,
                count: 0
            },
            deliveryDate: 'Jan 28 - Feb 6'
        },
        {
            _id: '2',
            name: 'Premium Wireless Headphones - Deep Bass Edition',
            pricing: {
                salePrice: 2999,
                basePrice: 4999
            },
            images: [{ url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400' }],
            ratings: {
                average: 4.5,
                count: 12
            },
            deliveryDate: 'Jan 28 - Feb 6'
        },
        {
            _id: '3',
            name: 'Smart Watch Series 7 Pro Max',
            pricing: {
                salePrice: 3499,
                basePrice: 5999
            },
            images: [{ url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400' }],
            ratings: {
                average: 4.8,
                count: 85
            },
            deliveryDate: 'Jan 28 - Feb 6'
        },
        {
            _id: '4',
            name: 'Laptop Backpack Pro - Waterproof',
            pricing: {
                salePrice: 1299,
                basePrice: 2499
            },
            images: [{ url: 'https://images.unsplash.com/photo-1553062407-98eeb94c6a62?auto=format&fit=crop&q=80&w=400' }],
            ratings: {
                average: 4.7,
                count: 18
            },
            deliveryDate: 'Jan 28 - Feb 6'
        },
        {
            _id: '5',
            name: 'Gaming Console Ultra HD 4K',
            pricing: {
                salePrice: 39999,
                basePrice: 49999
            },
            images: [{ url: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80&w=400' }],
            ratings: {
                average: 4.9,
                count: 154
            },
            deliveryDate: 'Jan 28 - Feb 6'
        },
    ]

    if (loading) {
        return (
            <section className="py-8 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="animate-pulse space-y-4">
                        <div className="h-40 bg-purple-50 rounded-[40px]"></div>
                    </div>
                </div>
            </section>
        )
    }

    return (
        <section className="  bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto  ">
                <div className="  rounded-2xl p-5 md:p-8 relative">
                    {/* Header Section */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
                                Trending now
                            </h2>
                            <p className="text-sm text-gray-500 mt-0.5">
                                Popular picks with great prices
                            </p>
                        </div>
                    </div>

                    {/* Carousel Container */}
                    <div className="relative pb-4">
                        <Swiper
                            modules={[Navigation, Autoplay]}
                            spaceBetween={20}
                            slidesPerView={1.2}
                            navigation={{
                                nextEl: '.trending-next',
                                prevEl: '.trending-prev',
                            }}
                            breakpoints={{
                                640: { slidesPerView: 2 },
                                768: { slidesPerView: 3 },
                                1024: { slidesPerView: 4 },
                            }}
                            className="!overflow-visible"
                        >
                            {trendingProducts.map((product) => (
                                <SwiperSlide key={product._id}>
                                    <ProductCard product={product} />
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>

                    {/* Custom Navigation */}
                    <div className="hidden md:block">
                        <button className="trending-prev absolute left-2 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all border border-gray-100 -ml-6 border-none">
                            <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button className="trending-next absolute right-2 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all border border-gray-100 -mr-6 border-none">
                            <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
}
