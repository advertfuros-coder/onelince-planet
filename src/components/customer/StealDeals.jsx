'use client'
import { useState, useEffect } from 'react'
import ProductCard from './ProductCard'

export default function StealDeals() {
    // Mock data for demonstration - in real app, fetch from API
    const [products, setProducts] = useState([
        {
            _id: 'steal-1',
            name: 'Pampers Premium Care Pants Medium Size',
            images: [{ url: 'https://images.unsplash.com/photo-1544126592-807daa2b565b?w=400' }],
            quantity: '4 Pieces',
            pricing: { salePrice: 9, basePrice: 99 },
            stealDealProgress: 40,
            moreToClaim: 191
        },
        {
            _id: 'steal-2',
            name: 'Avatar Protein Wafer Bar 10g Protein',
            images: [{ url: 'https://images.unsplash.com/photo-1622484211148-71e3d7454f7a?w=400' }],
            quantity: '40 g',
            pricing: { salePrice: 22, basePrice: 80 },
            stealDealProgress: 60,
            moreToClaim: 191
        },
        {
            _id: 'steal-3',
            name: 'GNC Protein Wafer Bar Peanut Butter',
            images: [{ url: 'https://images.unsplash.com/photo-1622484211148-71e3d7454f7a?w=400' }],
            quantity: '40 g',
            pricing: { salePrice: 29, basePrice: 60 },
            stealDealProgress: 30,
            moreToClaim: 191
        },
        {
            _id: 'steal-4',
            name: 'MuscleBlaze Biozyme Performance Whey',
            images: [{ url: 'https://images.unsplash.com/photo-1593095191050-8adeb814040a?w=400' }],
            quantity: '1 kg',
            pricing: { salePrice: 199, basePrice: 499 },
            stealDealProgress: 15,
            moreToClaim: 2500
        }
    ])

    return (
        <section className="py-8 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4">
                <div className="bg-[#F8F3FF] rounded-[40px] p-4 md:p-10 relative border border-purple-100">
                    {/* Header */}
                    <div className="flex flex-col items-center mb-6">
                        <div className="relative flex items-center justify-center gap-2">
                            <h2
                                className="text-3xl md:text-5xl font-[1000] text-[#7C3AED] uppercase tracking-tighter leading-none"
                                style={{ WebkitTextStroke: '1px #FFFFFF' }}
                            >
                                STEAL DEALS
                            </h2>
                            <div className="bg-[#7C3AED] p-2 rounded-xl rotate-12 shadow-lg">
                                <span className="text-white text-2xl font-black">%</span>
                            </div>

                            {/* Decorative Sparkle */}
                            <div className="absolute -top-4 -right-12 text-[#A78BFA] animate-pulse">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" /></svg>
                            </div>
                        </div>
                    </div>

                    {/* Products Scrollable Row - Using ProductCard Component */}
                    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-6 snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0">
                        {products.map((product) => (
                            <div
                                key={product._id}
                                className="min-w-[36%] sm:min-w-[30%] md:min-w-[260px] flex flex-col snap-start"
                            >
                                <ProductCard
                                    product={product}
                                    variant="steal"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
