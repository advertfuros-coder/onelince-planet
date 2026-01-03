'use client'
import React from 'react'
import Link from 'next/link'

export default function PocketFriendlyBargain() {
    const bargains = [
        {
            id: 1,
            category: 'Kurtas',
            price: '549',
            image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=600&fit=crop',
            link: '/products?category=kurtas'
        },
        {
            id: 2,
            category: 'Jeans',
            price: '799',
            image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=600&fit=crop',
            link: '/products?category=jeans'
        },
        {
            id: 3,
            category: 'Backpacks',
            price: '799',
            image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=600&fit=crop',
            link: '/products?category=backpacks'
        },
        {
            id: 4,
            category: 'Casual Shoes',
            price: '1149',
            image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=600&fit=crop',
            link: '/products?category=shoes'
        },
        {
            id: 5,
            category: 'Jackets',
            price: '1299',
            image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=600&fit=crop',
            link: '/products?category=jackets'
        },
        {
            id: 6,
            category: 'Day Cream',
            price: '249',
            image: 'https://images.unsplash.com/photo-1556228578-8c7c2f1e1493?w=400&h=600&fit=crop',
            link: '/products?category=skincare'
        }
    ]

    return (
        <section className=" bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto md:px-0 px-4">
                {/* Header Section */}
                <div className="flex items-center justify-between mb-5 relative">
                    <div className="space-y-1">
                        <h2 className="text-md md:text-2xl font-semibold text-gray-900 tracking-tight">
                            Pocket Friendly Bargain!
                        </h2>
                        <p className="text-xs md:text-lg text-gray-400 font-medium">
                            Where style matches savings
                        </p>
                    </div>

                    {/* Coin Graphic - High Quality SVG */}
                    <div className=" md:flex relative w-16 h-16 items-center justify-center">
                        <svg width="60" height="60" viewBox="0 0 100 100" className="filter drop-shadow-lg transform scale-100">
                            {/* Decorative Stars - Bigger and More */}
                            {/* Top Left Star - Bigger */}
                            <g transform="translate(10, 10)">
                                <path d="M8,0 L10,5 L15,5 L11,8 L13,13 L8,10 L3,13 L5,8 L1,5 L6,5 Z" fill="#FFD700" opacity="0.95">
                                    <animateTransform attributeName="transform" type="rotate" from="0 8 8" to="360 8 8" dur="3s" repeatCount="indefinite"/>
                                </path>
                            </g>
                            
                            {/* Top Center Star */}
                            <g transform="translate(45, 5)">
                                <path d="M6,0 L7.5,4 L11.5,4 L8.5,6.5 L10,10.5 L6,8 L2,10.5 L3.5,6.5 L0.5,4 L4.5,4 Z" fill="#FFD700" opacity="0.9">
                                    <animateTransform attributeName="transform" type="rotate" from="0 6 6" to="360 6 6" dur="2.5s" repeatCount="indefinite"/>
                                </path>
                            </g>
                            
                            {/* Top Right Star - Bigger */}
                            <g transform="translate(82, 8)">
                                <path d="M8,0 L10,5 L15,5 L11,8 L13,13 L8,10 L3,13 L5,8 L1,5 L6,5 Z" fill="#FFC107" opacity="0.9">
                                    <animateTransform attributeName="transform" type="rotate" from="0 8 8" to="360 8 8" dur="4s" repeatCount="indefinite"/>
                                </path>
                            </g>
                            
                            {/* Middle Right Star */}
                            <g transform="translate(88, 45)">
                                <path d="M5,0 L6.5,3.5 L10,3.5 L7,5.5 L8.5,9 L5,7 L1.5,9 L3,5.5 L0,3.5 L3.5,3.5 Z" fill="#FFB300" opacity="0.85">
                                    <animateTransform attributeName="transform" type="rotate" from="0 5 5" to="360 5 5" dur="3.2s" repeatCount="indefinite"/>
                                </path>
                            </g>
                            
                            {/* Bottom Left Star - Bigger */}
                            <g transform="translate(5, 72)">
                                <path d="M7,0 L8.5,4.5 L13,4.5 L9.5,7 L11,11.5 L7,9 L3,11.5 L4.5,7 L1,4.5 L5.5,4.5 Z" fill="#FFB300" opacity="0.9">
                                    <animateTransform attributeName="transform" type="rotate" from="0 7 7" to="360 7 7" dur="3.5s" repeatCount="indefinite"/>
                                </path>
                            </g>
                            
                            {/* Bottom Right Star */}
                            <g transform="translate(75, 78)">
                                <path d="M6,0 L7.5,4 L11.5,4 L8.5,6.5 L10,10.5 L6,8 L2,10.5 L3.5,6.5 L0.5,4 L4.5,4 Z" fill="#FFC107" opacity="0.88">
                                    <animateTransform attributeName="transform" type="rotate" from="0 6 6" to="360 6 6" dur="2.8s" repeatCount="indefinite"/>
                                </path>
                            </g>

                            {/* Smaller Back Coin */}
                            <circle cx="65" cy="45" r="30" fill="#FFC107" stroke="#FFD66B" strokeWidth="2" />
                            <circle cx="65" cy="45" r="24" fill="#FFB300" />
                            <text x="65" y="55" fontSize="24" fontWeight="400" textAnchor="middle" fill="#FFD66B" style={{ fontFamily: 'Poppins' }}>₹</text>

                            {/* Larger Front Coin */}
                            <circle cx="40" cy="55" r="35" fill="#FFD54F" stroke="white" strokeWidth="3" />
                            <circle cx="40" cy="55" r="28" fill="#FFC107" />
                            <text x="40" y="66" fontSize="30" fontWeight="400" textAnchor="middle" fill="#E65100" style={{ fontFamily: 'Poppins' }}>₹</text>

                            {/* Shine effect atop front coin */}
                            <path d="M25 35 Q30 30 40 30" stroke="white" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
                        </svg>
                    </div>
                </div>

                {/* Grid / Carousel Container */}
                <div className="relative">
                    <div className="flex md:grid md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4">
                        {bargains.map((item) => (
                            <Link
                                key={item.id}
                                href={item.link}
                                className="min-w-[45vw] md:min-w-0 snap-start group"
                            >
                                <div className="relative aspect-[3/4] rounded-[24px] md:rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 bg-gray-100">
                                    {/* Image */}
                                    <img
                                        src={item.image}
                                        alt={item.category}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                                    />

                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent"></div>

                                    {/* Content Overlay */}
                                    <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 text-white space-y-0.5">
                                        <p className="text-[10px] md:text-xs font-semibold opacity-80 uppercase tracking-wider">
                                            Under
                                        </p>
                                        <div className="inline-block bg-yellow-400 px-1.5 md:px-2 py-1 -rotate-2 transform-gpu shadow-lg">
                                            <p className="text-xl md:text-xl font-semibold text-black tracking-tighter italic leading-none">
                                                ₹ {item.price}
                                            </p>
                                        </div>
                                        <p className="text-xs md:text-lg font-semibold opacity-90 leading-tight">
                                            {item.category}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Pagination Dots (Mobile) */}

                </div>
            </div>
        </section>
    )
}
