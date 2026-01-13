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
        setCurrentSlide((prev) => (prev + 1) % brands.length)
    }, [brands.length])

    const prevSlide = useCallback(() => {
        setCurrentSlide((prev) => (prev - 1 + brands.length) % brands.length)
    }, [brands.length])

    useEffect(() => {
        if (isPaused) return
        const timer = setInterval(nextSlide, 3000)
        return () => clearInterval(timer)
    }, [nextSlide, isPaused])

    // Don't render if no brands or still loading
    if (loading || brands.length === 0) return null

    return (
        <section className="py-8 md:py-12 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8">
                {/* Section Title */}
                <div className="flex flex-col items-center mb-8">
                    <h2
                        className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-none bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 bg-clip-text text-transparent"
                        style={{
                            textShadow: `
                                3px 3px 0px #FF1493,
                                6px 6px 0px #FF69B4,
                                9px 9px 0px rgba(255,20,147,0.3)
                            `
                        }}
                    >
                        FEATURED BRANDS
                    </h2>
                </div>

                {/* Desktop Grid Layout (Hidden on Mobile) - Show only first 3 brands */}
                <div className="hidden md:grid grid-cols-3 gap-6">
                    {brands.slice(0, 3).map((brand) => (
                        <Card key={brand._id} brand={brand} />
                    ))}
                </div>

                {/* Mobile Slider Layout - Show 1 card at a time */}
                <div
                    className="md:hidden relative"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                    onTouchStart={() => setIsPaused(true)}
                    onTouchEnd={() => setIsPaused(false)}
                >
                    <div className="overflow-hidden rounded-[32px]">
                        <motion.div
                            className="flex"
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.4}
                            onDragEnd={(e, { offset, velocity }) => {
                                const swipeThreshold = 50;
                                const velocityThreshold = 500;

                                if (offset.x < -swipeThreshold || velocity.x < -velocityThreshold) {
                                    nextSlide();
                                } else if (offset.x > swipeThreshold || velocity.x > velocityThreshold) {
                                    prevSlide();
                                }
                                // Reset pause state after interaction
                                setTimeout(() => setIsPaused(false), 3000);
                            }}
                            animate={{ x: `-${currentSlide * 100}%` }}
                            transition={{
                                x: { type: "spring", stiffness: 200, damping: 25, mass: 0.8 }
                            }}
                        >
                            {brands.map((brand) => (
                                <div key={brand._id} className="min-w-full flex-shrink-0 px-1">
                                    <Card brand={brand} />
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Dot Indicators */}
                    <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2">
                        {brands.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    setCurrentSlide(idx);
                                    setIsPaused(true);
                                    setTimeout(() => setIsPaused(false), 5000);
                                }}
                                className={`h-1.5 transition-all duration-500 rounded-full shadow-lg ${currentSlide === idx ? 'w-8 bg-gray-800' : 'w-2 bg-gray-400 hover:bg-gray-600'
                                    }`}
                                aria-label={`Go to slide ${idx + 1}`}
                            />
                        ))}
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
            className="relative block w-full h-[100px] md:h-[300px] overflow-hidden rounded-[32px] group transition-transform duration-500 hover:scale-[1.01] shadow-lg"
        >
            <img
                src={brand.image}
                alt={brand.title}
                className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Soft Overlay */}
            <div className="absolute inset-0 bg-black/[0.04] group-hover:bg-black/[0.08] transition-colors duration-300"></div>


        </Link>
    )
}
