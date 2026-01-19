'use client'
import React from 'react';
import Link from 'next/link';

const GadgetCategories = [
    {
        id: 1,
        title: 'Audio & wearables',
        image: '/images/gadget-audio.png',
        bgColor: 'bg-[#E3F2FD]',
    },
    {
        id: 2,
        title: 'Grooming & styling',
        image: '/images/gadget-grooming.png',
        bgColor: 'bg-[#E3F2FD]',
    },
    {
        id: 3,
        title: 'Home & kitchen',
        image: '/images/gadget-home.png',
        bgColor: 'bg-[#E3F2FD]',
    },
    {
        id: 4,
        title: 'Winter store',
        image: '/images/gadget-winter.png',
        bgColor: 'bg-[#E3F2FD]',
    },
    {
        id: 5,
        title: 'Accessories',
        image: '/images/gadget-accessories.png',
        bgColor: 'bg-[#E3F2FD]',
    },
];

export default function ElectronicGadgets() {
    return (
        <section className="py-8 bg-white overflow-hidden">
            <div className="max-w-8xl mx-auto px-4">
                <div className="bg-[#EEF7FF] rounded-[48px] p-6 md:p-10 border border-blue-50">

                    {/* Header Section */}
                    <div className="flex items-center gap-3 mb-8">
                        <div className="flex flex-col md:flex-row items-baseline gap-1 md:gap-3">
                            <h2 className="text-4xl md:text-5xl font-[1000] text-black tracking-tight uppercase leading-none">
                                ELECTRONIC
                            </h2>
                            <span
                                className="text-4xl md:text-6xl text-[#0061FF] font-bold italic"
                                style={{ fontFamily: '"Brush Script MT", cursive' }}
                            >
                                Gadgets
                            </span>
                        </div>
                    </div>

                    {/* Categories Grid */}
                    <div className="grid grid-cols-4 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                        {GadgetCategories.map((cat) => (
                            <Link
                                key={cat.id}
                                href={`/category/electronics?type=${cat.title.toLowerCase()}`}
                                className="group"
                            >
                                <div className={`aspect-square ${cat.bgColor} rounded-[32px] p-5 flex flex-col items-center justify-between transition-all duration-500 hover:scale-105 hover:shadow-xl border border-white/40 relative overflow-hidden h-full`}>

                                    {/* Category Title */}
                                    <h3 className="text-center font-black text-gray-800 text-sm md:text-xl leading-tight">
                                        {cat.title}
                                    </h3>

                                    {/* Category Image */}
                                    <div className="relative w-full h-[70%] mt-2">
                                        <img
                                            src={cat.image}
                                            alt={cat.title}
                                            className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
                                        />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
