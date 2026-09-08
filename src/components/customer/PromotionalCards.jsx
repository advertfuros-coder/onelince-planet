'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

export default function PromotionalCards() {
    const [currentSlide, setCurrentSlide] = useState(0)
    const [isPaused, setIsPaused] = useState(false)
    const [brands, setBrands] = useState([])
    const [loading, setLoading] = useState(true)

    // Fetch featured brands from API
    useEffect(() => {
        fetchFeaturedBrands()
    }, [])

    const fetchFeaturedBrands = async () => {
        try {
            const res = await fetch('/api/admin/homepage/featured-brands')
            const data = await res.json()
            if (data.success && data.brands) {
                // Filter only active brands
                const activeBrands = data.brands.filter(brand => brand.active)
                setBrands(activeBrands)
            }
        } catch (error) {
            console.error('Error fetching featured brands:', error)
        } finally {
            setLoading(false)
        }
    }

    const nextSlide = useCallback(() => {
        setBrands(prevBrands => {
            if (prevBrands.length === 0) return prevBrands;
            const first = prevBrands[0];
            return [...prevBrands.slice(1), first];
        });
    }, []);

    const prevSlide = useCallback(() => {
        setBrands(prevBrands => {
            if (prevBrands.length === 0) return prevBrands;
            const last = prevBrands[prevBrands.length - 1];
            return [last, ...prevBrands.slice(0, -1)];
        });
    }, []);

    useEffect(() => {
        if (isPaused) return
        const timer = setInterval(nextSlide, 3000)
        return () => clearInterval(timer)
    }, [nextSlide, isPaused])

    // Don't render if no brands or still loading
    if (loading || brands.length === 0) return null

    return (
        <section className="py-8 md:py-16 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Title */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
                            Featured brands
                        </h2>
                        <p className="text-sm text-gray-500 mt-0.5">
                            Top sellers, curated for you
                        </p>
                    </div>
                </div>

                {/* Unified Slider Layout */}
                <div
                    className="relative pr-6"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    <div className="overflow-visible">
                        <motion.div 
                            className="flex gap-6"
                            initial={false}
                        >
                            <AnimatePresence mode='popLayout'>
                                {brands.map((brand, index) => (
                                    <motion.div
                                        key={brand._id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9, x: 20 }}
                                        animate={{ opacity: 1, scale: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.9, x: -20 }}
                                        transition={{ 
                                            type: "spring", 
                                            stiffness: 300, 
                                            damping: 30,
                                            opacity: { duration: 0.2 }
                                        }}
                                        className="min-w-full md:min-w-[calc(50%-12px)] flex-shrink-0"
                                    >
                                        <Card brand={brand} />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    )
}

function Card({ brand }) {
    return (
        <Link
            href={brand.redirectUrl}
            className="group relative block w-full h-[200px] md:h-[400px] overflow-hidden rounded-2xl bg-gray-100 transition-all duration-500 hover:shadow-xl"
        >
            <img
                src={brand.image}
                alt={brand.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-transparent" />

            <div className="absolute bottom-5 left-5 z-10">
                <span className="px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-semibold tracking-wide">
                    {brand.title}
                </span>
            </div>
        </Link>
    )
}
