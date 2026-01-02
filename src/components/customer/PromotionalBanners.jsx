'use client'
import Link from 'next/link'
import { FiCheck } from 'react-icons/fi'

export default function PromotionalBanners() {
    return (
        <section className="py-6 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Banner 1 - Red/Coral Theme */}
                    <div className="relative bg-gradient-to-br from-red-400 via-red-500 to-rose-600 rounded-3xl overflow-hidden shadow-lg group hover:shadow-2xl transition-all duration-300">
                        {/* Decorative Elements */}
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-4 right-4 w-32 h-32 bg-white rounded-full blur-2xl"></div>
                            <div className="absolute bottom-4 left-4 w-24 h-24 bg-white rounded-full blur-xl"></div>
                        </div>

                        <div className="relative p-8 md:p-10 flex items-center justify-between">
                            <div className="flex-1">
                                <h3 className="text-white text-3xl md:text-4xl font-black mb-2 leading-tight">
                                    Get Electronics
                                </h3>
                                <p className="text-white text-xl md:text-2xl font-bold mb-1">
                                    at <span className="inline-flex items-center justify-center w-12 h-12 bg-white text-red-600 rounded-full text-2xl font-black mx-1">₹0</span> Convenience Fee
                                </p>
                                <p className="text-white/90 text-sm md:text-base mb-6">
                                    Get gadgets & accessories at best prices
                                </p>

                                <Link
                                    href="/products?category=electronics"
                                    className="inline-block px-8 py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                                >
                                    Order now
                                </Link>
                            </div>

                            {/* Product Images */}
                            <div className="hidden md:flex items-center gap-2 ml-4">
                                <div className="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-2xl p-2 transform group-hover:scale-110 transition-transform duration-300">
                                    <img
                                        src="/products/electronics-promo.png"
                                        alt="Electronics"
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                            e.target.style.display = 'none'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Banner 2 - Purple Theme */}
                    <div className="relative bg-gradient-to-br from-purple-300 via-purple-400 to-indigo-500 rounded-3xl overflow-hidden shadow-lg group hover:shadow-2xl transition-all duration-300">
                        {/* Decorative Elements */}
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-4 left-4 w-32 h-32 bg-white rounded-full blur-2xl"></div>
                            <div className="absolute bottom-4 right-4 w-24 h-24 bg-white rounded-full blur-xl"></div>
                        </div>

                        <div className="relative p-8 md:p-10">
                            <div className="text-center mb-6">
                                <h3 className="text-purple-900 text-sm md:text-base font-black tracking-wider mb-4">
                                    ALL <span className="text-white">NEW</span> SHOPPING EXPERIENCE
                                </h3>

                                <div className="flex items-center justify-center gap-4 mb-6">
                                    <div className="bg-white rounded-2xl p-4 shadow-lg">
                                        <div className="flex items-center gap-2">
                                            <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                                                <span className="text-white text-2xl font-black">S</span>
                                            </div>
                                            <div className="text-left">
                                                <p className="text-purple-900 text-3xl font-black leading-none">₹0 FEES</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-2xl p-4 shadow-lg">
                                        <div className="flex items-center gap-2">
                                            <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                                                <span className="text-2xl">💰</span>
                                            </div>
                                            <div className="text-left">
                                                <p className="text-purple-900 text-xs font-bold">EVERYDAY</p>
                                                <p className="text-purple-900 text-sm font-black">LOWEST PRICES</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Features */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-3 py-2">
                                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                        <FiCheck className="w-3 h-3 text-white" />
                                    </div>
                                    <span className="text-white text-xs md:text-sm font-semibold">₹0 Handling Fee</span>
                                </div>

                                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-3 py-2">
                                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                        <FiCheck className="w-3 h-3 text-white" />
                                    </div>
                                    <span className="text-white text-xs md:text-sm font-semibold">₹0 Delivery Fee*</span>
                                </div>

                                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-3 py-2">
                                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                        <FiCheck className="w-3 h-3 text-white" />
                                    </div>
                                    <span className="text-white text-xs md:text-sm font-semibold">₹0 Rain & Surge Fee</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
