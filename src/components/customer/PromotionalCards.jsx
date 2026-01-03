'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

export default function PromotionalCards() {
    const [currentSlide, setCurrentSlide] = useState(0)
    const [isPaused, setIsPaused] = useState(false)

    const banners = [
        {
            id: 1,
            image: '/dummy/home/image.png',
            link: '/category/groceries',
            title: 'Fresh Vegetables'
        },
        {
            id: 2,
            image: '/dummy/home/image copy.png',
            link: '/category/electronics',
            title: 'Samsung Galaxy S24 FE'
        },
        {
            id: 3,
            image: '/dummy/home/image copy 2.png',
            link: '/category/groceries',
            title: 'Daily Essentials'
        }
    ]

    const nextSlide = useCallback(() => {
        setCurrentSlide((prev) => (prev + 1) % banners.length)
    }, [banners.length])

    const prevSlide = useCallback(() => {
        setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)
    }, [banners.length])

    useEffect(() => {
        if (isPaused) return
        const timer = setInterval(nextSlide, 3000)
        return () => clearInterval(timer)
    }, [nextSlide, isPaused])

    return (
        <section className="py-8 md:py-12 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8">

                {/* Desktop Grid Layout (Hidden on Mobile) */}
                <div className="hidden md:grid grid-cols-3 gap-6">
                    {banners.map((banner) => (
                        <Card key={banner.id} banner={banner} />
                    ))}
                </div>

                {/* Mobile Slider Layout - Smooth Ribbon Approach */}
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
                            {banners.map((banner) => (
                                <div key={banner.id} className="min-w-full flex-shrink-0 p-1 aspect-square">
                                    <Card banner={banner} />
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Dot Indicators */}
                    <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2">
                        {banners.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    setCurrentSlide(idx);
                                    setIsPaused(true);
                                    setTimeout(() => setIsPaused(false), 5000);
                                }}
                                className={`h-1.5 transition-all duration-500 rounded-full shadow-lg ${currentSlide === idx ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/70'
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

function Card({ banner }) {
    return (
        <Link
            href={banner.link}
            className="relative block w-full h-full overflow-hidden rounded-[32px] group transition-transform duration-500 hover:scale-[1.01] shadow-lg"
        >
            <img
                src={banner.image}
                alt={banner.title}
                className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Soft Overlay */}
            <div className="absolute inset-0 bg-black/[0.04] group-hover:bg-black/[0.08] transition-colors duration-300"></div>

            {/* Shop Now Button Overlay */}
            <div className="absolute bottom-6 left-6">
                <span className={`px-6 py-2.5 rounded-full text-xs font-semibold shadow-lg transition-all duration-300 group-hover:px-8 group-hover:bg-opacity-100 ${banner.id === 3 ? 'bg-yellow-400 text-black' :
                    banner.id === 2 ? 'bg-black text-white' :
                        'bg-[#450a0a] border border-white text-white'
                    }`}
                >
                    Shop now
                </span>
            </div>
        </Link>
    )
}

