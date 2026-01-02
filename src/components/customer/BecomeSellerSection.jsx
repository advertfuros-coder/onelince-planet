'use client'
import Link from 'next/link'
import { FiTrendingUp, FiUsers, FiDollarSign, FiArrowRight, FiPlay } from 'react-icons/fi'

export default function BecomeSellerSection() {
    return (
        <section className="py-12 bg-gradient-to-br from-orange-50 via-white to-blue-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    {/* Left Side - Content */}
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-4">
                                Fueling Brands<br />
                                for the <span className="text-orange-500">Digital</span><br />
                                Age.
                            </h2>
                            <p className="text-gray-600 text-base md:text-lg max-w-xl">
                                Empower your business through strategy, design, and technology to help your brand grow, engage and lead.
                            </p>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-wrap items-center gap-4">
                            <Link
                                href="/seller/register"
                                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3.5 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                            >
                                Get Started
                                <FiArrowRight className="w-5 h-5" />
                            </Link>
                            <button className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-900 font-semibold px-8 py-3.5 rounded-full border-2 border-gray-200 transition-all duration-300 shadow-md hover:shadow-lg">
                                <FiPlay className="w-5 h-5" />
                                Watch Video
                            </button>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                            {/* Stat 1 - Transactions */}
                            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 text-white relative overflow-hidden shadow-xl">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="flex -space-x-2">
                                            <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-xs font-bold">A</div>
                                            <div className="w-8 h-8 rounded-full bg-purple-500 border-2 border-white flex items-center justify-center text-xs font-bold">B</div>
                                            <div className="w-8 h-8 rounded-full bg-pink-500 border-2 border-white flex items-center justify-center text-xs font-bold">C</div>
                                            <div className="w-8 h-8 rounded-full bg-orange-500 border-2 border-white flex items-center justify-center text-xs font-bold">D</div>
                                        </div>
                                    </div>
                                    <p className="text-3xl md:text-4xl font-black mb-1">305K+</p>
                                    <p className="text-white/80 text-sm font-medium">Happy sellers and successful transactions</p>
                                </div>
                            </div>

                            {/* Stat 2 - Clients */}
                            <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl p-6 text-white relative overflow-hidden shadow-xl">
                                <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full -ml-10 -mb-10"></div>
                                <div className="relative z-10">
                                    <FiUsers className="w-10 h-10 mb-3 opacity-90" />
                                    <p className="text-3xl md:text-4xl font-black mb-1">600K+</p>
                                    <p className="text-white/90 text-sm font-medium">Clients</p>
                                </div>
                            </div>

                            {/* Stat 3 - Contributions */}
                            <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl p-6 text-white relative overflow-hidden shadow-xl">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8"></div>
                                <div className="relative z-10">
                                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mb-3">
                                        <FiDollarSign className="w-6 h-6" />
                                    </div>
                                    <p className="text-3xl md:text-4xl font-black mb-1">50K</p>
                                    <p className="text-white/90 text-sm font-medium">All Contributions to Sellers</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Image/Illustration */}
                    <div className="relative">
                        <div className="relative bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl overflow-hidden shadow-2xl">
                            {/* Decorative elements */}
                            <div className="absolute top-4 right-4 w-32 h-32 bg-orange-400/20 rounded-full blur-3xl"></div>
                            <div className="absolute bottom-4 left-4 w-24 h-24 bg-blue-400/20 rounded-full blur-2xl"></div>

                            {/* Main Image Container */}
                            <div className="relative p-8 md:p-12">
                                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                                    <img
                                        src="/seller-dashboard-preview.jpg"
                                        alt="Seller Dashboard"
                                        className="w-full h-auto object-cover"
                                        onError={(e) => {
                                            e.target.style.display = 'none'
                                            e.target.nextElementSibling.style.display = 'flex'
                                        }}
                                    />
                                    {/* Fallback placeholder */}
                                    <div className="hidden w-full aspect-[4/3] bg-gradient-to-br from-blue-400 to-indigo-500 items-center justify-center flex-col gap-4 p-8">
                                        <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                                            <FiTrendingUp className="w-10 h-10 text-white" />
                                        </div>
                                        <div className="text-center text-white">
                                            <p className="text-4xl font-black mb-2">₹15,340.00</p>
                                            <p className="text-sm opacity-80">Your Monthly Revenue</p>
                                        </div>
                                        {/* Mini chart illustration */}
                                        <div className="w-full max-w-xs h-24 bg-white/10 rounded-xl backdrop-blur-sm p-4 flex items-end gap-2">
                                            <div className="flex-1 bg-white/40 rounded-t" style={{ height: '40%' }}></div>
                                            <div className="flex-1 bg-white/40 rounded-t" style={{ height: '60%' }}></div>
                                            <div className="flex-1 bg-white/60 rounded-t" style={{ height: '80%' }}></div>
                                            <div className="flex-1 bg-white/80 rounded-t" style={{ height: '100%' }}></div>
                                            <div className="flex-1 bg-white rounded-t" style={{ height: '70%' }}></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Floating Stats Card */}
                                <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl shadow-2xl p-4 border border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl flex items-center justify-center">
                                            <FiTrendingUp className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium">Monthly Growth</p>
                                            <p className="text-xl font-black text-gray-900">+28%</p>
                                        </div>
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
