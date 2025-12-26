'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FiClock, FiShoppingCart, FiHeart } from 'react-icons/fi'

export default function DealOfTheDay({ products = [] }) {
    const [timeLeft, setTimeLeft] = useState({
        hours: 23,
        minutes: 59,
        seconds: 59
    })

    // Countdown timer
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev.seconds > 0) {
                    return { ...prev, seconds: prev.seconds - 1 }
                } else if (prev.minutes > 0) {
                    return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
                } else if (prev.hours > 0) {
                    return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
                }
                return { hours: 23, minutes: 59, seconds: 59 }
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [])

    if (!products || products.length === 0) return null

    const deal = products[0]
    const discount = deal?.pricing?.discount || 50

    return (
        <section className="py-16 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-200/30 to-pink-200/30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-red-200/30 to-yellow-200/30 rounded-full blur-3xl"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-bold text-sm mb-3 animate-pulse">
                            <FiClock className="w-4 h-4" />
                            <span>DEAL OF THE DAY</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-gray-900">
                            Today's Special Offer
                        </h2>
                    </div>
                </div>

                {/* Deal Card */}
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                    <div className="grid md:grid-cols-2 gap-8 p-8 md:p-12">
                        {/* Product Image */}
                        <div className="relative">
                            {/* Discount Badge */}
                            <div className="absolute top-4 left-4 z-10">
                                <div className="bg-gradient-to-br from-red-500 to-pink-500 text-white px-4 py-2 rounded-xl font-black text-xl shadow-lg">
                                    -{discount}%
                                </div>
                            </div>

                            {/* Image */}
                            <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden group">
                                <img
                                    src={deal?.images?.[0]?.url || '/placeholder-product.png'}
                                    alt={deal?.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    onError={(e) => {
                                        e.target.src = '/placeholder-product.png'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Product Details */}
                        <div className="flex flex-col justify-center">
                            {/* Category */}
                            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                {deal?.category || 'Featured Product'}
                            </span>

                            {/* Title */}
                            <h3 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
                                {deal?.name || 'Amazing Product Deal'}
                            </h3>

                            {/* Description */}
                            <p className="text-gray-600 mb-6 line-clamp-3">
                                {deal?.description || 'Limited time offer! Don\'t miss out on this incredible deal.'}
                            </p>

                            {/* Pricing */}
                            <div className="flex items-baseline gap-3 mb-6">
                                <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">
                                    ${deal?.pricing?.salePrice || deal?.pricing?.basePrice || '99.99'}
                                </span>
                                {deal?.pricing?.basePrice && (
                                    <span className="text-2xl font-semibold text-gray-400 line-through">
                                        ${deal.pricing.basePrice}
                                    </span>
                                )}
                            </div>

                            {/* Countdown Timer */}
                            <div className="mb-8">
                                <p className="text-sm font-semibold text-gray-700 mb-3">Hurry! Offer ends in:</p>
                                <div className="flex gap-4">
                                    {[
                                        { label: 'Hours', value: timeLeft.hours },
                                        { label: 'Minutes', value: timeLeft.minutes },
                                        { label: 'Seconds', value: timeLeft.seconds }
                                    ].map((item, index) => (
                                        <div key={index} className="flex-1">
                                            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-4 text-center">
                                                <div className="text-3xl md:text-4xl font-black text-white mb-1">
                                                    {String(item.value).padStart(2, '0')}
                                                </div>
                                                <div className="text-xs text-gray-400 uppercase font-semibold">
                                                    {item.label}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <Link
                                    href={`/products/${deal?._id}`}
                                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 px-6 rounded-xl font-bold hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                                >
                                    <FiShoppingCart className="w-5 h-5" />
                                    <span>Buy Now</span>
                                </Link>
                                <button className="bg-gray-100 hover:bg-gray-200 text-gray-900 p-4 rounded-xl transition-colors">
                                    <FiHeart className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Trust Badge */}
                            <div className="mt-6 flex items-center gap-2 text-sm text-gray-600">
                                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span className="font-semibold">In Stock • Free Shipping • 30-Day Returns</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
