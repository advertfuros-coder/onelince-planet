'use client'
import Link from 'next/link'
import { FiArrowRight } from 'react-icons/fi'

const priceRanges = [
    {
        title: 'Under $25',
        description: 'Budget-friendly finds',
        image: '/price-ranges/under-25.jpg',
        link: '/products?maxPrice=25',
        gradient: 'from-blue-500 to-cyan-500',
        bgColor: 'bg-blue-50'
    },
    {
        title: '$25 to $50',
        description: 'Best value picks',
        image: '/price-ranges/25-50.jpg',
        link: '/products?minPrice=25&maxPrice=50',
        gradient: 'from-purple-500 to-pink-500',
        bgColor: 'bg-purple-50'
    },
    {
        title: '$50 to $100',
        description: 'Quality selection',
        image: '/price-ranges/50-100.jpg',
        link: '/products?minPrice=50&maxPrice=100',
        gradient: 'from-orange-500 to-red-500',
        bgColor: 'bg-orange-50'
    },
    {
        title: '$100+',
        description: 'Premium collection',
        image: '/price-ranges/100-plus.jpg',
        link: '/products?minPrice=100',
        gradient: 'from-indigo-500 to-purple-500',
        bgColor: 'bg-indigo-50'
    }
]

export default function ShopByPrice() {
    return (
        <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">
                        Shop by Price
                    </h2>
                    <p className="text-lg text-gray-600">
                        Find the perfect product within your budget
                    </p>
                </div>

                {/* Price Range Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {priceRanges.map((range, index) => (
                        <Link
                            key={index}
                            href={range.link}
                            className="group relative overflow-hidden rounded-2xl aspect-[4/5] hover:shadow-2xl transition-all duration-300"
                        >
                            {/* Background */}
                            <div className={`absolute inset-0 ${range.bgColor} group-hover:scale-110 transition-transform duration-500`}></div>

                            {/* Gradient Overlay */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${range.gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-300`}></div>

                            {/* Content */}
                            <div className="relative h-full p-6 flex flex-col justify-between">
                                <div>
                                    <div className={`inline-block px-4 py-1.5 bg-gradient-to-r ${range.gradient} text-white rounded-full text-xs font-bold mb-3`}>
                                        {range.description}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">
                                        {range.title}
                                    </h3>
                                    <div className="flex items-center gap-2 text-gray-700 font-semibold group-hover:text-blue-600 transition-colors">
                                        <span className="text-sm">Shop Now</span>
                                        <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>

                                {/* Decorative Circle */}
                                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${range.gradient} opacity-10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500`}></div>
                            </div>

                            {/* Hover Border */}
                            <div className={`absolute inset-0 border-2 border-transparent group-hover:border-gradient-to-r ${range.gradient} rounded-2xl`}></div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}
