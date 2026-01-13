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
            <div className="max-w-8xl mx-auto px-4">
                {/* Section Title */}
                <div className="flex flex-col items-center mb-10 overflow-visible relative">
                    <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#2D1B14 1px, transparent 1px)', size: '20px 20px' }} />
                    <div className="relative flex items-center justify-center gap-8">
                        <h2
                            className="text-4xl md:text-8xl font-[1000] uppercase tracking-tighter leading-none text-[#FFF5E1] relative z-10 select-none"
                            style={{ 
                                textShadow: `
                                    1px 1px 0px #2D1B14,
                                    2px 2px 0px #2D1B14,
                                    3px 3px 0px #2D1B14,
                                    4px 4px 0px #2D1B14,
                                    5px 5px 0px #2D1B14,
                                    6px 6px 0px #2D1B14,
                                    7px 7px 0px #2D1B14,
                                    8px 8px 0px #2D1B14,
                                    9px 9px 0px #2D1B14,
                                    10px 10px 0px #2D1B14
                                `,
                                WebkitTextStroke: '2px #2D1B14'
                            }}
                        >
                            FEATURED BRANDS
                        </h2>
                        
                        {/* Decorative Wavy Lines (Postmark style) */}
                        <div className="hidden md:block opacity-40 select-none pointer-events-none">
                            <svg width="120" height="60" viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M0 10C15 10 20 20 35 20C50 20 55 10 70 10C85 10 90 20 105 20" stroke="#2D1B14" strokeWidth="2.5" strokeLinecap="round" />
                                <path d="M0 20C15 20 20 30 35 30C50 30 55 20 70 20C85 20 90 30 105 30" stroke="#2D1B14" strokeWidth="2.5" strokeLinecap="round" />
                                <path d="M0 30C15 30 20 40 35 40C50 40 55 30 70 30C85 30 90 40 105 40" stroke="#2D1B14" strokeWidth="2.5" strokeLinecap="round" />
                                <path d="M0 40C15 40 20 50 35 50C50 50 55 40 70 40C85 40 90 50 105 50" stroke="#2D1B14" strokeWidth="2.5" strokeLinecap="round" />
                            </svg>
                        </div>
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
            className="group relative block w-full h-[200px] md:h-[450px] overflow-hidden rounded bg-stone-50 transition-all duration-700 hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)]"
        >
            <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10" />
            
            <img
                src={brand.image}
                alt={brand.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            />
            
            {/* Soft Glass Overlay */}
            <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors duration-500" />
            
            {/* Bottom Glow */}
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            {/* Branding Indicator (Subtle) */}
            <div className="absolute bottom-8 left-8 z-20 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                <div className="px-5 py-2 rounded-full bg-white/90 backdrop-blur-md text-black text-xs font-bold tracking-widest uppercase shadow-xl">
                    Discover {brand.title}
                </div>
            </div>

            {/* Edge Light */}
            <div className="absolute inset-0 border border-white/0 group-hover:border-white/20 rounded-[40px] transition-colors duration-700 pointer-events-none z-30" />
        </Link>
    )
}
