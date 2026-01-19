'use client'
import { useState, useEffect } from 'react'
import ProductCard from './ProductCard'

export default function StealDeals() {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDeals()
    }, [])

    const fetchDeals = async () => {
        try {
            const response = await fetch('/api/admin/steal-deals')
            const data = await response.json()
            if (data.success && data.deals) {
                setProducts(data.deals)
            }
        } catch (error) {
            console.error('Error fetching steal deals:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <section className="py-8 bg-white overflow-hidden">
                <div className="max-w-8xl mx-auto px-4">
                    <div className="bg-[#F8F3FF] rounded-[40px] p-4 md:p-10 relative border border-purple-100">
                        <div className="animate-pulse space-y-6">
                            <div className="h-12 bg-purple-200 rounded w-64 mx-auto" />
                            <div className="flex gap-4">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="min-w-[260px] h-80 bg-purple-100 rounded-2xl" />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        )
    }

    if (products.length === 0) {
        return null // Don't show section if no deals
    }

    return (
        <section className="py-8 bg-white overflow-hidden">
            <div className="max-w-8xl mx-auto px-4">
                <div className="bg-[#F8F3FF] rounded-[40px] p-4 md:p-10 relative border border-purple-100">
                    {/* Header */}
                    <div className="flex flex-col items-center mb-6">
                        <div className="relative flex items-center justify-center gap-2">
                            <h2
                                className="text-3xl md:text-5xl font-[1000] text-[#7C3AED] uppercase tracking-tighter leading-none"
                                style={{ WebkitTextStroke: '1px #FFFFFF' }}
                            >
                                STEAL DEA LS
                            </h2>
                            <div className="bg-[#7C3AED] p-2 rounded-xl rotate-12 shadow-lg">
                                <span className="text-white text-2xl font-semibold">%</span>
                            </div>

                            {/* Decorative Sparkle */}
                            <div className="absolute -top-4 -right-12 text-[#A78BFA] animate-pulse">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" /></svg>
                            </div>
                        </div>
                        <p className="text-sm md:text-base text-purple-600 font-semibold mt-2">
                            Massive price drops you can't miss!
                        </p>
                    </div>

                    {/* Products Scrollable Row */}
                    <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 overflow-x-auto no-scrollbar pb-6 snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0">
                        {products.map((product) => (
                            <div
                                key={product._id}
                                className="min-w-[36%] sm:min-w-[30%] md:min-w-[260px] flex flex-col snap-start"
                            >
                                <ProductCard
                                    product={product}
                                    showDiscountBadge={true}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
