'use client'
import Link from 'next/link'
import { FiArrowRight, FiAward, FiChevronRight, FiDollarSign, FiPercent, FiShoppingBag, FiTrendingUp } from 'react-icons/fi'
import { useRegion } from '@/context/RegionContext'

const regionPriceRanges = {
    AE: [
        { 
            title: 'Under 50', 
            currency: 'AED',
            link: '/products?maxPrice=50', 
            label: 'Starter Deals',
            savings: 'Up to 60% off',
            items: '500+ items'
        },
        { 
            title: '50 - 200', 
            currency: 'AED',
            link: '/products?minPrice=50&maxPrice=200', 
            label: 'Smart Buys',
            savings: 'Best sellers',
            items: '1200+ items'
        },
        { 
            title: '200 - 500', 
            currency: 'AED',
            link: '/products?minPrice=200&maxPrice=500', 
            label: 'Premium Range',
            savings: 'Top quality',
            items: '800+ items'
        },
        { 
            title: '500+', 
            currency: 'AED',
            link: '/products?minPrice=500', 
            label: 'Luxury Collection',
            savings: 'Exclusive',
            items: '300+ items'
        }
    ],
    IN: [
        { 
            title: 'Under 500', 
            currency: '₹',
            link: '/products?maxPrice=500', 
            label: 'Starter Deals',
            savings: 'Up to 60% off',
            items: '500+ items'
        },
        { 
            title: '500 - 2000', 
            currency: '₹',
            link: '/products?minPrice=500&maxPrice=2000', 
            label: 'Smart Buys',
            savings: 'Best sellers',
            items: '1200+ items'
        },
        { 
            title: '2000 - 5000', 
            currency: '₹',
            link: '/products?minPrice=2000&maxPrice=5000', 
            label: 'Premium Range',
            savings: 'Top quality',
            items: '800+ items'
        },
        { 
            title: '5000+', 
            currency: '₹',
            link: '/products?minPrice=5000', 
            label: 'Luxury Collection',
            savings: 'Exclusive',
            items: '300+ items'
        }
    ]
}

const priceThemes = [
    {
        bg: 'from-cyan-500/10 via-blue-500/10 to-indigo-500/10',
        border: 'border-cyan-200',
        glow: 'shadow-cyan-500/20',
        accent: 'from-cyan-500 to-blue-600',
        text: 'text-cyan-700',
        icon: FiShoppingBag,
        pattern: 'bg-cyan-50'
    },
    {
        bg: 'from-violet-500/10 via-purple-500/10 to-fuchsia-500/10',
        border: 'border-violet-200',
        glow: 'shadow-violet-500/20',
        accent: 'from-violet-500 to-purple-600',
        text: 'text-violet-700',
        icon: FiTrendingUp,
        pattern: 'bg-violet-50'
    },
    {
        bg: 'from-amber-500/10 via-orange-500/10 to-rose-500/10',
        border: 'border-amber-200',
        glow: 'shadow-amber-500/20',
        accent: 'from-amber-500 to-orange-600',
        text: 'text-amber-700',
        icon: FiAward,
        pattern: 'bg-amber-50'
    },
    {
        bg: 'from-emerald-500/10 via-teal-500/10 to-cyan-500/10',
        border: 'border-emerald-200',
        glow: 'shadow-emerald-500/20',
        accent: 'from-emerald-500 to-teal-600',
        text: 'text-emerald-700',
        icon: FiDollarSign,
        pattern: 'bg-emerald-50'
    }
]

export default function ShopByPrice() {
    const { region } = useRegion()
    const ranges = (regionPriceRanges[region.code] || regionPriceRanges.AE).map((r, i) => ({
        ...r,
        ...priceThemes[i]
    }))

    return (
        <section className="relative py-24 bg-gradient-to-b from-white via-gray-50 to-white overflow-hidden">
            {/* Decorative Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            
            {/* Radial Gradient Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%),radial-gradient(circle_at_70%_60%,rgba(236,72,153,0.1),transparent_50%)]"></div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="text-center mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border border-purple-100 rounded-full shadow-sm">
                        <FiPercent className="w-4 h-4 text-purple-600 animate-pulse" />
                        <span className="text-sm font-semibold text-purple-900 tracking-wide">PRICE MATCH GUARANTEE</span>
                    </div>
                    
                    <h2 className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight">
                        <span className="block text-gray-900">Find Your</span>
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
                            Perfect Price
                        </span>
                    </h2>
                    
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Browse thousands of products organized by your budget. Quality guaranteed at every price point.
                    </p>
                </div>

                {/* Price Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                    {ranges.map((range, index) => {
                        const IconComponent = range.icon
                        return (
                            <Link
                                key={index}
                                href={range.link}
                                className="group relative"
                            >
                                {/* Main Card */}
                                <div className={`relative bg-white border-2 ${range.border} rounded-3xl p-8 transition-all duration-500 hover:shadow-2xl hover:${range.glow} hover:-translate-y-3 hover:scale-[1.02]`}>
                                    {/* Background Pattern */}
                                    <div className={`absolute inset-0 ${range.pattern} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl`}></div>
                                    
                                    {/* Gradient Overlay */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${range.bg} rounded-3xl`}></div>
                                    
                                    {/* Content */}
                                    <div className="relative space-y-6">
                                        {/* Icon & Badge */}
                                        <div className="flex items-start justify-between">
                                            <div className={`p-4 rounded-2xl bg-gradient-to-br ${range.accent} shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                                                <IconComponent className="w-7 h-7 text-white" />
                                            </div>
                                            <div className={`px-3 py-1.5 rounded-full bg-gradient-to-r ${range.accent} text-white text-xs font-semibold shadow-md`}>
                                                {range.savings}
                                            </div>
                                        </div>

                                        {/* Price Display */}
                                        <div className="space-y-2">
                                            <div className="flex items-baseline gap-2">
                                                <span className={`text-2xl font-semibold ${range.text}`}>{range.currency}</span>
                                                <span className="text-4xl font-semibold text-gray-900 tracking-tight">{range.title}</span>
                                            </div>
                                            <p className="text-lg font-semibold text-gray-700">{range.label}</p>
                                        </div>

                                        {/* Stats */}
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${range.accent} animate-pulse`}></div>
                                                <span className="font-semibold">{range.items}</span>
                                            </div>
                                        </div>

                                        {/* CTA Button */}
                                        <div className={`flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r ${range.accent} text-white shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                                            <span className="font-semibold text-sm tracking-wide">SHOP NOW</span>
                                            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 group-hover:translate-x-1 transition-all">
                                                <FiChevronRight className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Decorative Corner Elements */}
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/50 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-white/50 to-transparent rounded-tr-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                </div>

                                {/* Floating Badge */}
                                <div className="absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110">
                                    <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${range.accent} text-white text-xs font-semibold shadow-xl border-4 border-white`}>
                                        HOT 🔥
                                    </div>
                                </div>

                                {/* Glow Effect */}
                                <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${range.accent} opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-500 -z-10`}></div>
                            </Link>
                        )
                    })}
                </div>

                {/* Bottom Section */}
                <div className="mt-20 text-center space-y-6">
                    <div className="inline-flex items-center gap-8 px-8 py-6 bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 rounded-2xl shadow-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-semibold text-gray-900">Free Shipping</p>
                                <p className="text-xs text-gray-600">On orders over {region.code === 'AE' ? 'AED 100' : '₹1000'}</p>
                            </div>
                        </div>
                        
                        <div className="h-12 w-px bg-gray-300"></div>
                        
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-semibold text-gray-900">Secure Payment</p>
                                <p className="text-xs text-gray-600">100% protected</p>
                            </div>
                        </div>
                        
                        <div className="h-12 w-px bg-gray-300"></div>
                        
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-semibold text-gray-900">Easy Returns</p>
                                <p className="text-xs text-gray-600">30-day guarantee</p>
                            </div>
                        </div>
                    </div>

                    <Link 
                        href="/products" 
                        className="inline-flex items-center gap-2 text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all group"
                    >
                        View All Products
                        <FiChevronRight className="w-5 h-5 text-purple-600 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </section>
    )
}
