'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function CountdownBanner() {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 27,
        seconds: 58
    })

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                let { days, hours, minutes, seconds } = prev

                if (seconds > 0) {
                    seconds--
                } else {
                    seconds = 59
                    if (minutes > 0) {
                        minutes--
                    } else {
                        minutes = 59
                        if (hours > 0) {
                            hours--
                        } else {
                            hours = 23
                            if (days > 0) {
                                days--
                            }
                        }
                    }
                }

                return { days, hours, minutes, seconds }
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [])

    return (
        <section className="py-4 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-200 rounded-2xl shadow-md overflow-hidden">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-6 md:px-8 py-4">
                        {/* Left Side - Text */}
                        <div className="flex items-center gap-3">
                            <h3 className="text-gray-900 text-base md:text-lg font-bold whitespace-nowrap">
                                Flash Sale ends in:
                            </h3>

                            {/* Countdown Timer */}
                            <div className="flex items-center gap-2">
                                <div className="bg-white rounded-lg px-3 py-2 min-w-[50px] text-center shadow-sm">
                                    <span className="text-gray-900 text-xl md:text-2xl font-black leading-none">
                                        {String(timeLeft.days).padStart(2, '0')}
                                    </span>
                                </div>
                                <span className="text-gray-900 font-black text-xl">:</span>
                                <div className="bg-white rounded-lg px-3 py-2 min-w-[50px] text-center shadow-sm">
                                    <span className="text-gray-900 text-xl md:text-2xl font-black leading-none">
                                        {String(timeLeft.hours).padStart(2, '0')}
                                    </span>
                                </div>
                                <span className="text-gray-900 font-black text-xl">:</span>
                                <div className="bg-white rounded-lg px-3 py-2 min-w-[50px] text-center shadow-sm">
                                    <span className="text-gray-900 text-xl md:text-2xl font-black leading-none">
                                        {String(timeLeft.minutes).padStart(2, '0')}
                                    </span>
                                </div>
                                <span className="text-gray-900 font-black text-xl">:</span>
                                <div className="bg-white rounded-lg px-3 py-2 min-w-[50px] text-center shadow-sm">
                                    <span className="text-gray-900 text-xl md:text-2xl font-black leading-none">
                                        {String(timeLeft.seconds).padStart(2, '0')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Right Side - CTA */}
                        <div className="flex items-center gap-4">
                            <p className="text-gray-700 text-sm hidden md:block">
                                Discover our latest offers and save big!
                            </p>
                            <Link
                                href="/products?sale=true"
                                className="bg-gray-900 hover:bg-black text-white font-bold text-sm px-6 py-2.5 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl whitespace-nowrap"
                            >
                                Shop Now →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
