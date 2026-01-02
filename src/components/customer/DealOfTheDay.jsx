'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FiClock, FiShoppingCart, FiHeart, FiStar } from 'react-icons/fi'
import { useRegion } from '@/context/RegionContext'
import { formatPrice } from '@/lib/utils'

export default function DealOfTheDay({ products = [] }) {
    const { region } = useRegion()
    const [timeLeft, setTimeLeft] = useState({
        hours: 23,
        minutes: 59,
        seconds: 59
    })

    // Countdown timer logic
    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date()
            const endOfDay = new Date(now)
            endOfDay.setHours(23, 59, 59, 999)
            const difference = endOfDay - now

            if (difference > 0) {
                setTimeLeft({
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                })
            }
        }
        calculateTimeLeft()
        const timer = setInterval(calculateTimeLeft, 1000)
        return () => clearInterval(timer)
    }, [])

    if (!products || products.length === 0) return null

    const deal = products[0]
    const discount = Math.round(((deal?.pricing?.basePrice - deal?.pricing?.salePrice) / deal?.pricing?.basePrice) * 100) || 0
    const originalPrice = deal?.pricing?.basePrice
    const salePrice = deal?.pricing?.salePrice || originalPrice

    return (
        <section className="py-16 bg-white relative overflow-hidden">
            {/* Subtle background decoration */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gray-50 -skew-x-12 translate-x-1/2"></div>

            <div className="max-w-[1400px] mx-auto px-4 md:px-6 relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div className="flex items-center gap-3">
                        <div className="bg-yellow-400 p-2.5 rounded-xl shadow-lg shadow-yellow-100">
                            <FiStar className="w-6 h-6 text-yellow-900 fill-yellow-900" />
                        </div>
                        <div>
                            <span className="text-yellow-600 font-bold text-[9px] uppercase tracking-widest mb-0.5 block">LIMITED TIME SPECIAL</span>
                            <h2 className="text-xl md:text-3xl font-black text-gray-900 tracking-tight">
                                Deal of the Day
                            </h2>
                        </div>
                    </div>

                    {/* Countdown Timer - Matching FlashSales style */}
                    <div className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl shadow-lg">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ends in:</span>
                        <div className="flex items-center gap-1.5">
                            {[
                                { value: timeLeft.hours, label: 'h' },
                                { value: timeLeft.minutes, label: 'm' },
                                { value: timeLeft.seconds, label: 's' }
                            ].map((item, index) => (
                                <div key={index} className="flex items-center gap-1">
                                    <span className="bg-white/10 backdrop-blur-md text-white px-2 py-1 rounded-lg text-base font-black min-w-[34px] text-center border border-white/5">
                                        {String(item.value).padStart(2, '0')}
                                    </span>
                                    <span className="text-[9px] font-bold text-gray-500">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Deal Content */}
                <div className="group relative bg-gray-50 rounded-[40px] overflow-hidden transition-all duration-500 hover:shadow-2xl">
                    <div className="grid lg:grid-cols-2 gap-0">
                        {/* Image Side */}
                        <div className="relative h-[400px] md:h-[500px] lg:h-[600px] bg-white overflow-hidden">
                            {/* Discount Badge */}
                            {discount > 0 && (
                                <div className="absolute top-8 left-8 z-20">
                                    <div className="bg-red-600 text-white px-6 py-2.5 rounded-2xl font-black text-2xl shadow-xl shadow-red-200 rotate-[-5deg]">
                                        -{discount}%
                                    </div>
                                </div>
                            )}

                            <Link href={`/products/${deal?._id}`} className="block h-full w-full">
                                <img
                                    src={deal?.images?.[0]?.url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'}
                                    alt={deal?.name}
                                    className="w-full h-full object-contain p-8 md:p-12 group-hover:scale-105 transition-transform duration-700"
                                    onError={(e) => {
                                        e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'
                                    }}
                                />
                            </Link>

                            {/* Wishlist Button */}
                            <button className="absolute top-8 right-8 z-20 w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg text-gray-400 hover:text-red-500 hover:scale-110 transition-all duration-300">
                                <FiHeart className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Details Side */}
                        <div className="flex flex-col justify-center p-8 md:p-12 lg:p-16">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                    {deal?.category || 'Best Seller'}
                                </span>
                                <div className="flex items-center text-yellow-400">
                                    <FiStar className="fill-current w-4 h-4" />
                                    <span className="text-gray-900 font-bold text-sm ml-1">4.9</span>
                                    <span className="text-gray-400 text-sm ml-1">(2.5k reviews)</span>
                                </div>
                            </div>

                            <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-3 leading-tight group-hover:text-blue-600 transition-colors">
                                {deal?.name || 'Exclusive Premium Product Deal'}
                            </h3>

                            <p className="text-gray-500 text-sm mb-4 leading-relaxed max-w-xl">
                                {deal?.description || 'Upgrade your lifestyle with our premium selection.'}
                            </p>

                            {/* Price Section */}
                            <div className="flex items-center gap-6 mb-6">
                                <div className="flex flex-col">
                                    <span className="text-3xl md:text-4xl font-black text-gray-900 tracking-tighter">
                                        {formatPrice(salePrice, region)}
                                    </span>
                                    {originalPrice > salePrice && (
                                        <span className="text-base font-bold text-gray-400 line-through">
                                            {formatPrice(originalPrice, region)}
                                        </span>
                                    )}
                                </div>
                                <div className="h-16 w-[1px] bg-gray-200 hidden md:block"></div>
                                <div className="hidden md:flex flex-col">
                                    <span className="text-green-600 font-bold text-sm">Save {formatPrice(originalPrice - salePrice, region)}</span>
                                    <span className="text-gray-400 text-xs font-medium italic">Incl. all taxes</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                                <Link
                                    href={`/products/${deal?._id}`}
                                    className="flex-[2] bg-blue-600 text-white py-3 px-6 rounded-xl font-bold text-sm hover:bg-blue-700 shadow-xl shadow-blue-100 hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2"
                                >
                                    <FiShoppingCart className="w-4 h-4" />
                                    <span>Add to Cart</span>
                                </Link>
                                <Link
                                    href={`/products/${deal?._id}`}
                                    className="flex-1 bg-white text-gray-900 border border-gray-100 py-3 px-6 rounded-xl font-bold text-sm hover:border-gray-200 hover:bg-gray-50 transition-all duration-300 flex items-center justify-center"
                                >
                                    Details
                                </Link>
                            </div>

                            {/* Features */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-8 border-t border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                    </div>
                                    <span className="text-xs font-bold text-gray-700">Free Shipping</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    </div>
                                    <span className="text-xs font-bold text-gray-700">24h Delivery</span>
                                </div>
                                <div className="flex items-center gap-3 hidden md:flex">
                                    <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                                    </div>
                                    <span className="text-xs font-bold text-gray-700">1 Year Warranty</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
