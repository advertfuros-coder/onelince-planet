'use client'
import React, { useState, useEffect } from 'react'
import { FiCopy, FiCheck, FiChevronLeft, FiChevronRight } from 'react-icons/fi'

export default function CouponBanner() {
    const [copied, setCopied] = useState(false)
    const [banners, setBanners] = useState([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchBanners()
    }, [])

    // Auto-slide every 5 seconds if multiple banners
    useEffect(() => {
        if (banners.length > 1) {
            const interval = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % banners.length)
            }, 5000)
            return () => clearInterval(interval)
        }
    }, [banners.length])

    const fetchBanners = async () => {
        try {
            const response = await fetch('/api/admin/coupon-banners')
            const data = await response.json()
            if (data.success && data.banners) {
                setBanners(data.banners)
            }
        } catch (error) {
            console.error('Error fetching banners:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleCopy = (code) => {
        navigator.clipboard.writeText(code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)
    }

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % banners.length)
    }

    if (loading || banners.length === 0) {
        return null // Don't show anything if no banners
    }

    const currentBanner = banners[currentIndex]

    return (
        <section className="py- bg-white overflow-hidden">
            <div className="max-w-8xl mx-auto px-4">
                <div className="relative">
                    {/* Main Banner */}
                    <div
                        className="relative group cursor-pointer transition-transform duration-300 hover:scale-[1.01]"
                        onClick={() => handleCopy(currentBanner.code)}
                    >
                        {/* Main Ticket Background with Paper Texture */}
                        <div
                            className="relative py-0 h-20 md:h-28 flex items-center justify-between px-8 md:px-16 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] overflow-hidden border border-black/5"
                            style={{
                                backgroundColor: currentBanner.backgroundColor,
                                backgroundImage: `url("https://www.transparenttextures.com/patterns/natural-paper.png")`,
                            }}
                        >
                            {/* Ticket Cutouts - Left and Right */}
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-10 bg-white rounded-r-full -ml-1 border-r border-black/5"></div>
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-10 bg-white rounded-l-full -mr-1 border-l border-black/5"></div>

                            <div className="flex flex-1 items-center justify-between gap-4 md:gap-12">
                                {/* Offer Text */}
                                <div className="flex flex-col">
                                    <h2
                                        className="text-3xl md:text-[80px] font-[1000] italic uppercase tracking-tighter leading-none select-none"
                                        style={{
                                            color: currentBanner.textColor,
                                            textShadow: '3px 3px 0px rgba(0,0,0,0.1), 0 0 10px rgba(255, 214, 107, 0.3)',
                                            WebkitTextStroke: '1.5px rgba(0,0,0,0.05)'
                                        }}
                                    >
                                        {currentBanner.title || `${currentBanner.discountType === 'flat' ? 'FLAT ₹' : ''}${currentBanner.discount}${currentBanner.discountType === 'percentage' ? '% ' : ' '}OFF`}
                                    </h2>
                                </div>

                                {/* Central Lightning Bolt */}
                                <div className="hidden lg:block transform hover:rotate-12 transition-transform duration-500">
                                    <svg width="64" height="64" viewBox="0 0 24 24" className="filter drop-shadow-[0_4px_10px_rgba(255,214,107,0.4)]">
                                        <path
                                            d="M13 2L3 14h8V22l10-12h-8V2z"
                                            fill={currentBanner.textColor}
                                            stroke="#1a1a1b"
                                            strokeWidth="1.2"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </div>

                                {/* Right Side: Promo Code Section */}
                                <div className="flex flex-col items-center md:items-end">
                                   
                                    <div className="relative">
                                        <div
                                            className="px-6 md:px-10 py-2 md:py-3 rounded-2xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] border border-black/10 flex items-center gap-3 active:scale-95 transition-all"
                                            style={{ backgroundColor: currentBanner.textColor }}
                                        >
                                            <span className="text-lg md:text-3xl font-[1000] text-black tracking-tighter">
                                                {currentBanner.code}
                                            </span>
                                            <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center">
                                                {copied ? (
                                                    <FiCheck className="text-green-700 w-5 h-5" />
                                                ) : (
                                                    <FiCopy className="text-black/60 w-5 h-5 group-hover:text-black transition-colors" />
                                                )}
                                            </div>
                                        </div>

                                        {/* Floating Feedback */}
                                        {copied && (
                                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-semibold px-3 py- 1.5 rounded-full animate-bounce">
                                                COPIED!
                                            </div>
                                        )}
                                    </div>
                                    
                                </div>
                            </div>
                        </div>
                    </div>

                  
                </div>
            </div>
        </section>
    )
}
