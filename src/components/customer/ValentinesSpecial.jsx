'use client'
import React from 'react';
import { FiChevronRight, FiHeart } from 'react-icons/fi';
import Link from 'next/link';

const ValentinceCategories = [
    {
        id: 1,
        title: 'Flowers & Bouquets',
        image: '/images/valentine-flowers.png',
        bgColor: 'bg-red-50',
    },
    {
        id: 2,
        title: 'Premium Chocolates',
        image: '/images/valentine-chocolates.png',
        bgColor: 'bg-pink-50',
    },
    {
        id: 3,
        title: 'Soft Toys & Teddies',
        image: '/images/valentine-teddy.png',
        bgColor: 'bg-rose-50',
    },
    {
        id: 4,
        title: 'Luxury Perfumes',
        image: '/images/valentine-perfume.png',
        bgColor: 'bg-red-50',
    },
    {
        id: 5,
        title: 'Jewelry & Watches',
        image: '/images/valentine-jewelry.png',
        bgColor: 'bg-pink-50',
    },
    {
        id: 6,
        title: 'Beauty & Skincare',
        image: '/images/valentine-skincare.png',
        bgColor: 'bg-rose-50',
    },
    {
        id: 7,
        title: 'Handbags & Purses',
        image: '/images/valentine-handbag.png',
        bgColor: 'bg-red-50',
    },
    {
        id: 8,
        title: 'Gift Hampers',
        image: '/images/valentine-hampers.png',
        bgColor: 'bg-pink-50',
    },
];

export default function
    ValentinesSpecial() {
    return (
        <section className="pb- bg-white">
            <div className="max-w-8xl mx-auto px-4">
                <div className="rounded-[48px] overflow-hidden shadow-2xl flex flex-col border-4 border-red-50">

                    {/* Header Section with User's Background */}
                    <div
                        className="h-[250px] md:h-[300px] relative flex flex-col items-center justify-center bg-cover bg-center"
                        style={{
                            backgroundImage: `url('/images/valentine-bg.png')`,
                            backgroundColor: '#FFB6C1'
                        }}
                    >
                        {/* Overlay to make text pop if needed */}
                        <div className="absolute inset-0 bg-red-900/10 pointer-events-none"></div>

                        {/* Title - Stylized like the Winter one */}
                        <div className="relative z-10 text-center scale-75 md:scale-100">
                            <div className="flex flex-col items-center">
                                <span className="text-2xl md:text-3xl font-extrabold text-red-600 uppercase tracking-[0.2em] drop-shadow-sm mb-[-15px] ml-[-80px] rotate-[-5deg]">
                                    HELLO
                                </span>
                                <h2
                                    className="text-7xl md:text-[120px] font-[1000] text-[#E11D48] italic tracking-tighter leading-none"
                                    style={{
                                        textShadow: '4px 4px 0px #fff, 8px 8px 20px rgba(225, 29, 72, 0.3)',
                                    }}
                                >
                                    Valentine
                                </h2>
                                <div className="absolute -top-10 -right-16 animate-bounce-slow">
                                    <FiHeart className="w-12 h-12 text-red-500 fill-red-500 rotate-12 drop-shadow-lg" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Categories Grid - Red/Pink Theme */}
                    <div className="bg-gradient-to-b from-red-600 to-pink-600 p-6 md:p-12">
                        <div className="grid grid-cols-4 md:grid-cols-8 gap-4 md:gap-8">
                            {ValentinceCategories.map((cat) => (
                                <Link
                                    key={cat.id}
                                    href={`/products?search=${encodeURIComponent(cat.title)}&category=valentine-special`}
                                    className="group"
                                >
                                    <div className={`aspect-square ${cat.bgColor} rounded-[32px] p-1 flex flex-col items-center justify-between transition-all duration-500 group-hover:scale-105 group-hover:shadow-xl border-4 border-white/20 relative overflow-hidden`}>

                                        {/* Category Title */}
                                        <h3 className="text-center font-semibold text-red-900 text-[12px] md:text-lg leading-tight z-10">
                                            {cat.title}
                                        </h3>

                                        {/* Category Image */}
                                        <div className="relative w-full ">
                                            <img
                                                src={cat.image}
                                                alt={cat.title}
                                                className="w-full h-full object-cover rounded-[32px] mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
                                            />
                                        </div>

                                        {/* Decorative elements */}
                                        <div className="absolute -bottom-2 -right-2 opacity-10 group-hover:opacity-20 transition-opacity">
                                            <FiHeart className="w-16 h-16 text-red-900 fill-current" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                    </div>

                </div>
            </div>
        </section>
    );
}
