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
        id: 5,
        title: 'Accessories',
        image: '/images/gadget-accessories.png',
        bgColor: 'bg-[#E3F2FD]',
    },
];

export default function ElectronicGadgets() {
    return (
        <section className="py-8 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div>
                    {/* Header Section */}
                    <div className="mb-6">
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
                            Electronic gadgets
                        </h2>
                        <p className="text-sm text-gray-500 mt-0.5">
                            Shop audio, grooming, home and more
                        </p>
                    </div>

                    {/* Categories Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
                        {GadgetCategories.map((cat) => (
                            <Link
                                key={cat.id}
                                href={`/products?search=${encodeURIComponent(cat.title)}&category=electronics`}
                                className="group"
                            >
                                <div className={`aspect-square ${cat.bgColor} rounded-2xl flex flex-col items-center justify-between transition-all duration-300 hover:shadow-lg border border-gray-100 relative overflow-hidden h-full`}>

                                    {/* Category Title */}
                                    <h3 className="text-center capitalize px-2 pt-3 font-semibold text-gray-800 text-xs md:text-sm leading-tight">
                                        {cat.title}
                                    </h3>

                                    {/* Category Image */}
                                    <div className="relative w-full">
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
