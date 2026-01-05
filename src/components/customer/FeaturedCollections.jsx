'use client'
import Link from 'next/link'
import { FiShoppingBag, FiArrowRight } from 'react-icons/fi'

const collections = [
    {
        id: 1,
        title: 'Summer Essentials',
        description: '120+ products',
        category: 'seasonal',
        image: '/collections/summer.jpg',
        gradient: 'from-yellow-400 to-orange-500'
    },
    {
        id: 2,
        title: 'Tech Gadgets',
        description: '85+ products',
        category: 'electronics',
        image: '/collections/tech.jpg',
        gradient: 'from-blue-500 to-purple-600'
    },
    {
        id: 3,
        title: 'Home & Living',
        description: '200+ products',
        category: 'home',
        image: '/collections/home.jpg',
        gradient: 'from-green-400 to-teal-500'
    },
    {
        id: 4,
        title: 'Fashion Trends',
        description: '150+ products',
        category: 'fashion',
        image: '/collections/fashion.jpg',
        gradient: 'from-pink-500 to-red-500'
    }
]

export default function FeaturedCollections({ products = [] }) {
    return (
        <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-2">
                            Featured Collections
                        </h2>
                        <p className="text-lg text-gray-600">
                            Curated selections for every style
                        </p>
                    </div>
                    <Link
                        href="/collections"
                        className="hidden md:flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                    >
                        <span>View All</span>
                        <FiArrowRight className="w-5 h-5" />
                    </Link>
                </div>

                {/* Collections Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                    {collections.map((collection, index) => (
                        <Link
                            key={collection.id}
                            href={`/products?category=${collection.category}`}
                            className={`group relative overflow-hidden rounded-3xl ${index === 0 ? 'md:col-span-2 aspect-[21/9]' : 'aspect-square'
                                } hover:shadow-2xl transition-all duration-500`}
                        >
                            {/* Background Image */}
                            <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300"></div>

                            {/* Gradient Overlay */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${collection.gradient} opacity-80 group-hover:opacity-70 transition-opacity duration-300`}></div>

                            {/* Pattern Overlay */}
                            <div className="absolute inset-0 opacity-10">
                                <div className="absolute inset-0" style={{
                                    backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                                    backgroundSize: '20px 20px'
                                }}></div>
                            </div>

                            {/* Content */}
                            <div className="relative h-full p-8 md:p-12 flex flex-col justify-between">
                                <div>
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full mb-4">
                                        <FiShoppingBag className="w-4 h-4 text-gray-900" />
                                        <span className="text-sm font-semibold text-gray-900">{collection.description}</span>
                                    </div>
                                </div>

                                <div>
                                    <h3 className={`font-semibold text-white mb-4 ${index === 0 ? 'text-4xl md:text-6xl' : 'text-3xl md:text-4xl'
                                        }`}>
                                        {collection.title}
                                    </h3>
                                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                                        <span className="text-sm font-semibold text-gray-900">Explore Collection</span>
                                        <FiArrowRight className="w-4 h-4 text-gray-900 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>

                                {/* Decorative Elements */}
                                <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-white/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                            </div>

                            {/* Shine Effect on Hover */}
                            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"></div>
                        </Link>
                    ))}
                </div>

                {/* Mobile View All Link */}
                <div className="mt-8 text-center md:hidden">
                    <Link
                        href="/collections"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                    >
                        <span>View All Collections</span>
                        <FiArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        </section>
    )
}
