'use client'
import React, { useState } from 'react'
import { FiCopy, FiCheck } from 'react-icons/fi'

export default function CouponBanner() {
    const [copied, setCopied] = useState(false)
    const code = 'PLANET300'

    const handleCopy = () => {
        navigator.clipboard.writeText(code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <section className="py- bg-white overflow-hidden">
            <div className="max-w-8xl mx-auto px-4  ">
                <div
                    className="relative  group cursor-pointer transition-transform duration-300 hover:scale-[1.01]"
                    onClick={handleCopy}
                >
                    {/* Main Ticket Background with Paper Texture */}
                    <div
                        className="relative py-20 h-28 md:h-32 bg-[#92C7CF] flex items-center justify-between px-8 md:px-16 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] overflow-hidden border border-black/5"
                        style={{
                            backgroundImage: `url("https://www.transparenttextures.com/patterns/natural-paper.png")`,
                        }}
                    >
                        {/* Ticket Cutouts - Left and Right */}
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-10 bg-white rounded-r-full -ml-1 border-r border-black/5"></div>
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-10 bg-white rounded-l-full -mr-1 border-l border-black/5"></div>

                        <div className="flex flex-1 items-center justify-between gap-4 md:gap-12">

                            {/* Offer Text: FLAT ₹300 OFF */}
                            <div className="flex flex-col">
                                <h2 className="text-4xl md:text-[80px] font-[1000] text-[#FFD66B] italic uppercase tracking-tighter leading-none select-none"
                                    style={{
                                        textShadow: '3px 3px 0px rgba(0,0,0,0.1), 0 0 10px rgba(255, 214, 107, 0.3)',
                                        WebkitTextStroke: '1.5px rgba(0,0,0,0.05)'
                                    }}>
                                    FLAT <span className="text-3xl md:text-5xl align-middle">₹</span>300 OFF
                                </h2>
                            </div>

                            {/* Central Lightning Bolt - Improved SVG */}
                            <div className="hidden lg:block transform hover:rotate-12 transition-transform duration-500">
                                <svg width="64" height="64" viewBox="0 0 24 24" className="filter drop-shadow-[0_4px_10px_rgba(255,214,107,0.4)]">
                                    <path
                                        d="M13 2L3 14h8V22l10-12h-8V2z"
                                        fill="#FFD66B"
                                        stroke="#1a1a1b"
                                        strokeWidth="1.2"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </div>

                            {/* Right Side: Promo Code Section */}
                            <div className="flex flex-col items-center md:items-end">
                                <p className="text-sm md:text-xl font-semibold text-[#1a1a1b] mb-1 italic tracking-tight opacity-90">
                                    Use Code:
                                </p>
                                <div className="relative">
                                    <div className="bg-[#FFD66B] px-6 md:px-10 py-2 md:py-3 rounded-2xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] border border-black/10 flex items-center gap-3 active:scale-95 transition-all">
                                        <span className="text-lg md:text-3xl font-[1000] text-black tracking-tighter">
                                            {code}
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
                                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-semibold px-3 py-1.5 rounded-full animate-bounce">
                                            COPIED!
                                        </div>
                                    )}
                                </div>
                                <p className="text-[10px] md:text-xs font-semibold text-[#1a1a1b]/40 mt-2 uppercase tracking-[0.2em]">
                                    T&C Apply
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
