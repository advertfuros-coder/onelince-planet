'use client'
import React, { useState, useEffect } from 'react';
import { FiChevronRight, FiGift, FiTruck, FiClock, FiHeart, FiShoppingBag, FiStar, FiPercent } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import Link from 'next/link';

const RakhiPremiumItems = [
    {
        id: 1,
        title: 'Royal Kundan Rakhi',
        subtitle: 'Artisan handcrafted golden silk threads with semi-precious Kundan stone',
        price: '₹149',
        originalPrice: '₹399',
        discount: '62% OFF',
        badge: 'Bestseller',
        image: '/images/rakhi/rakhi-designer.png',
        tag: 'Silk Thread',
        bgColor: 'from-amber-500/10 to-orange-500/5',
        accentColor: 'text-amber-600',
        borderColor: 'border-amber-200/60',
        ringColor: 'group-hover:ring-amber-400'
    },
    {
        id: 2,
        title: 'Bhaiya-Bhabhi Pair',
        subtitle: 'Beautiful matching set with hanging Lumba, designer tassels & pearls',
        price: '₹299',
        originalPrice: '₹599',
        discount: '50% OFF',
        badge: 'Lumba Set',
        image: '/images/rakhi/rakhi-lumba.png',
        tag: 'Couple Set',
        bgColor: 'from-rose-500/10 to-orange-500/5',
        accentColor: 'text-rose-600',
        borderColor: 'border-rose-200/60',
        ringColor: 'group-hover:ring-rose-400'
    },
    {
        id: 3,
        title: 'Kids Superhero Band',
        subtitle: 'Soft skin-friendly silicone wristband featuring cute glowing superhero',
        price: '₹99',
        originalPrice: '₹199',
        discount: '50% OFF',
        badge: 'Kids Special',
        image: '/images/rakhi/rakhi-kids.png',
        tag: 'Toys',
        bgColor: 'from-sky-500/10 to-indigo-500/5',
        accentColor: 'text-sky-600',
        borderColor: 'border-sky-200/60',
        ringColor: 'group-hover:ring-sky-400'
    },
    {
        id: 4,
        title: 'Kaju Katli Sweets Box',
        subtitle: 'Freshly prepared pure cashew sweets with silver foil garnish',
        price: '₹349',
        originalPrice: '₹499',
        discount: '30% OFF',
        badge: '100% Pure',
        image: '/images/rakhi/rakhi-sweets.png',
        tag: 'Mithai',
        bgColor: 'from-orange-500/10 to-amber-500/5',
        accentColor: 'text-orange-600',
        borderColor: 'border-orange-200/60',
        ringColor: 'group-hover:ring-orange-400'
    },
    {
        id: 5,
        title: 'Chocolate Celebration Box',
        subtitle: 'Rich premium chocolate gift hamper tied with elegant satin ribbon bow',
        price: '₹199',
        originalPrice: '₹299',
        discount: '33% OFF',
        badge: 'Festive Pack',
        image: '/images/rakhi/rakhi-chocolates.png',
        tag: 'Chocolates',
        bgColor: 'from-red-500/10 to-rose-500/5',
        accentColor: 'text-red-600',
        borderColor: 'border-red-200/60',
        ringColor: 'group-hover:ring-red-400'
    },
    {
        id: 6,
        title: 'Puja Thali Gift Combo',
        subtitle: 'Decorated brass Puja thali with diya, roli-chawal & card',
        price: '₹249',
        originalPrice: '₹499',
        discount: '50% OFF',
        badge: 'All-in-One',
        image: '/images/rakhi/rakhi-puja-thali.png',
        tag: 'Puja Kit',
        bgColor: 'from-yellow-500/10 to-orange-500/5',
        accentColor: 'text-yellow-600',
        borderColor: 'border-yellow-200/60',
        ringColor: 'group-hover:ring-yellow-400'
    }
];

export default function RakshaBandhanSpecial() {
    const [timeLeft, setTimeLeft] = useState({ days: 2, hours: 14, minutes: 45, seconds: 12 });
    const [wishlist, setWishlist] = useState({});
    const [budgetFilter, setBudgetFilter] = useState('all'); // 'all', 'under199', 'under499'

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
                if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
                if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
                if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
                clearInterval(timer);
                return prev;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const toggleWishlist = (id, e) => {
        e.preventDefault();
        e.stopPropagation();
        setWishlist(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const filteredItems = RakhiPremiumItems.filter(item => {
        const priceNum = parseInt(item.price.replace('₹', ''));
        if (budgetFilter === 'under199') return priceNum <= 199;
        if (budgetFilter === 'under499') return priceNum <= 499;
        return true;
    });

    return (
        <section className="py-16 bg-gradient-to-b from-[#FFFDF9] via-white to-[#FFFDF9] overflow-hidden relative">
            
            {/* Traditional Hanging Marigold Flowers Decoration (Left & Right top corners) */}
            <div className="absolute top-0 left-0 right-0 h-6 flex justify-between pointer-events-none z-20">
                <svg width="240" height="60" viewBox="0 0 240 60" className="fill-orange-500 opacity-90 drop-shadow-md">
                    {/* Hanging flower string left */}
                    <path d="M10,0 C10,15 15,25 20,35 C25,45 30,50 35,60 C38,50 43,45 48,35 C53,25 58,15 58,0" />
                    <circle cx="20" cy="35" r="8" fill="#FBBF24" />
                    <circle cx="35" cy="55" r="10" fill="#EA580C" />
                    <circle cx="48" cy="35" r="8" fill="#FBBF24" />
                    <path d="M70,0 C75,10 80,20 90,30 C100,40 105,45 110,50 C115,45 120,40 130,30 C140,20 145,10 150,0" />
                    <circle cx="90" cy="30" r="7" fill="#FBBF24" />
                    <circle cx="110" cy="48" r="9" fill="#EA580C" />
                    <circle cx="130" cy="30" r="7" fill="#FBBF24" />
                </svg>
                <svg width="240" height="60" viewBox="0 0 240 60" className="fill-orange-500 opacity-90 drop-shadow-md transform scale-x-[-1]">
                    <path d="M10,0 C10,15 15,25 20,35 C25,45 30,50 35,60 C38,50 43,45 48,35 C53,25 58,15 58,0" />
                    <circle cx="20" cy="35" r="8" fill="#FBBF24" />
                    <circle cx="35" cy="55" r="10" fill="#EA580C" />
                    <circle cx="48" cy="35" r="8" fill="#FBBF24" />
                    <path d="M70,0 C75,10 80,20 90,30 C100,40 105,45 110,50 C115,45 120,40 130,30 C140,20 145,10 150,0" />
                    <circle cx="90" cy="30" r="7" fill="#FBBF24" />
                    <circle cx="110" cy="48" r="9" fill="#EA580C" />
                    <circle cx="130" cy="30" r="7" fill="#FBBF24" />
                </svg>
            </div>

            <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                
                {/* Main Festive Hero Header */}
                <div className="rounded-[40px] overflow-hidden shadow-2xl relative border-4 border-amber-100 bg-gradient-to-r from-orange-600 via-amber-600 to-rose-700 p-8 md:p-12 mb-12">
                    
                    {/* Glowing Indian motif watermark backdrop */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-300/10 rounded-full blur-[120px] pointer-events-none"></div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                        
                        {/* Title details */}
                        <div className="lg:col-span-8 space-y-5 text-center lg:text-left text-white">
                            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/30 px-4.5 py-1.5 rounded-full text-xs font-black">
                                <HiSparkles className="text-yellow-300 w-4.5 h-4.5 animate-bounce" />
                                <span>FREE Roli-Chawal Kit with Greeting Card on All Orders</span>
                            </div>
                            
                            <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
                                रक्षा बंधन <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-200">SPECIAL</span>
                            </h2>
                            <p className="text-orange-50 text-sm md:text-lg font-semibold max-w-2xl leading-relaxed">
                                Send love across India. Premium handcrafted Designer Rakhis, fresh pure sweets, and customized sibling gift sets with guaranteed safe dispatch.
                            </p>

                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-5 pt-3">
                                <span className="flex items-center gap-2 text-xs font-bold bg-black/25 px-4 py-2 rounded-full">
                                    <FiTruck className="text-yellow-400 w-4 h-4" />
                                    <span>Same-Day Dispatch</span>
                                </span>
                                <span className="flex items-center gap-2 text-xs font-bold bg-black/25 px-4 py-2 rounded-full">
                                    <FiGift className="text-yellow-400 w-4 h-4" />
                                    <span>Free Sibling Message Card</span>
                                </span>
                            </div>
                        </div>

                        {/* Live Ticking Countdown Box */}
                        <div className="lg:col-span-4 flex justify-center">
                            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[32px] p-6 text-center w-full max-w-sm shadow-2xl relative">
                                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-yellow-400 text-orange-950 font-black text-[10px] tracking-widest uppercase px-5 py-1 rounded-full shadow-md">
                                    ⏱️ FESTIVE DELIVERY WINDOW
                                </div>
                                <h3 className="text-white text-xs font-black mt-3 mb-4 tracking-wider uppercase opacity-95">ORDER NOW TO AVOID DELAYS</h3>
                                
                                <div className="grid grid-cols-4 gap-2 text-white">
                                    <div className="bg-black/35 rounded-xl p-2.5 border border-white/5 shadow-inner">
                                        <span className="text-xl md:text-2xl font-black text-yellow-300">{timeLeft.days}</span>
                                        <p className="text-[9px] uppercase font-bold text-orange-200 mt-0.5">Days</p>
                                    </div>
                                    <div className="bg-black/35 rounded-xl p-2.5 border border-white/5 shadow-inner">
                                        <span className="text-xl md:text-2xl font-black text-yellow-300">{timeLeft.hours}</span>
                                        <p className="text-[9px] uppercase font-bold text-orange-200 mt-0.5">Hrs</p>
                                    </div>
                                    <div className="bg-black/35 rounded-xl p-2.5 border border-white/5 shadow-inner">
                                        <span className="text-xl md:text-2xl font-black text-yellow-300">{timeLeft.minutes}</span>
                                        <p className="text-[9px] uppercase font-bold text-orange-200 mt-0.5">Mins</p>
                                    </div>
                                    <div className="bg-black/35 rounded-xl p-2.5 border border-white/5 shadow-inner">
                                        <span className="text-xl md:text-2xl font-black text-yellow-300">{timeLeft.seconds}</span>
                                        <p className="text-[9px] uppercase font-bold text-orange-200 mt-0.5">Secs</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Filter and Quick Curation Tabs */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-12 border-b border-gray-100 pb-6">
                    <div className="text-center sm:text-left">
                        <h3 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">Handpicked Curation</h3>
                        <p className="text-xs md:text-sm text-gray-500 mt-1">Filter by price points to match your sibling preference</p>
                    </div>

                    {/* Filter buttons */}
                    <div className="bg-gray-100/80 backdrop-blur-sm p-1 rounded-2xl flex border border-gray-200/50 shadow-inner">
                        <button
                            onClick={() => setBudgetFilter('all')}
                            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${budgetFilter === 'all' ? 'bg-white text-gray-950 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            All Curation
                        </button>
                        <button
                            onClick={() => setBudgetFilter('under199')}
                            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${budgetFilter === 'under199' ? 'bg-white text-gray-950 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            Under ₹199
                        </button>
                        <button
                            onClick={() => setBudgetFilter('under499')}
                            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${budgetFilter === 'under499' ? 'bg-white text-gray-950 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            Under ₹499
                        </button>
                    </div>
                </div>

                {/* Main Product Showcase - Spaced, Elevated Grid with Large Visuals */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                    {filteredItems.map((item) => (
                        <Link
                            key={item.id}
                            href={`/products?search=${encodeURIComponent(item.title)}&category=raksha-bandhan`}
                            className="group"
                        >
                            <div className="bg-white border border-gray-100 rounded-[36px] p-6.5 flex flex-col justify-between min-h-[420px] transition-all duration-500 group-hover:-translate-y-2.5 shadow-[0_15px_40px_rgba(0,0,0,0.02)] group-hover:shadow-[0_30px_60px_rgba(234,88,12,0.09)] relative overflow-hidden">
                                
                                {/* Top Badges & Like Toggle */}
                                <div className="flex justify-between items-center relative z-20">
                                    <span className="bg-orange-50 border border-orange-100 text-orange-700 text-[10px] font-black tracking-widest uppercase px-3.5 py-1 rounded-full">
                                        {item.badge}
                                    </span>
                                    <button
                                        onClick={(e) => toggleWishlist(item.id, e)}
                                        className="w-9.5 h-9.5 rounded-full bg-white shadow-sm flex items-center justify-center border border-gray-100 hover:bg-red-50 hover:text-red-500 transition-all active:scale-90"
                                    >
                                        <FiHeart className={`w-4.5 h-4.5 transition-colors ${wishlist[item.id] ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                                    </button>
                                </div>

                                {/* LARGE 3D Image Showcase with Rotating Mandala Radial Aura */}
                                <div className="relative w-44 h-44 md:w-52 md:h-52 mx-auto my-6 flex items-center justify-center">
                                    {/* Rotating decorative sunburst/mandala backdrop shadow */}
                                    <div className={`absolute w-36 h-36 bg-gradient-to-br ${item.bgColor} rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500`}></div>
                                    <div className="absolute w-24 h-24 border border-dashed border-orange-200/20 rounded-full animate-spin-slow opacity-60"></div>
                                    
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="w-full h-full object-contain relative z-10 drop-shadow-[0_12px_24px_rgba(0,0,0,0.08)] group-hover:scale-108 transition-transform duration-500"
                                    />
                                </div>

                                {/* Text & Details Curation */}
                                <div className="space-y-2 mt-4 relative z-20">
                                    <div className="flex items-center gap-1">
                                        <FiStar className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                                        <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest">Premium Collection</span>
                                    </div>
                                    <h4 className="font-extrabold text-gray-900 text-lg md:text-xl group-hover:text-orange-600 transition-colors leading-tight">
                                        {item.title}
                                    </h4>
                                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                                        {item.subtitle}
                                    </p>
                                </div>

                                {/* Pricing and checkout Actions */}
                                <div className="mt-6 pt-5 border-t border-gray-50 flex items-center justify-between relative z-20 gap-4">
                                    <div className="space-y-0.5">
                                        <div className="flex items-baseline gap-1.5">
                                            <span className="text-2xl font-black text-gray-900">{item.price}</span>
                                            <span className="text-xs text-gray-400 line-through">{item.originalPrice}</span>
                                        </div>
                                        <span className="inline-flex items-center gap-0.5 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                                            <FiPercent className="w-3 h-3" /> {item.discount}
                                        </span>
                                    </div>

                                    {/* Action button */}
                                    <span className="bg-gray-950 text-white font-extrabold px-5 py-3 rounded-2xl text-xs hover:bg-orange-600 hover:shadow-lg transition-all duration-300 flex items-center gap-1.5 shrink-0 group-hover:bg-orange-600">
                                        <span>Send Love</span>
                                        <FiChevronRight className="w-4 h-4" />
                                    </span>
                                </div>

                            </div>
                        </Link>
                    ))}
                </div>

                {/* Bottom Promo / Coupon banner code */}
                <div className="mt-16 bg-gradient-to-r from-orange-600 to-rose-600 rounded-[32px] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl text-white">
                    <div className="flex items-center gap-4 text-center md:text-left">
                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0 shadow-inner">
                            <FiGift className="w-6 h-6 animate-bounce" />
                        </div>
                        <div>
                            <h4 className="font-extrabold text-base md:text-lg">Super Saver Festive Combo Extra Offer</h4>
                            <p className="text-xs text-orange-100 mt-0.5">Flat ₹150 discount on premium chocolate baskets and sweets combos</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                        <div className="bg-white/10 border border-white/20 rounded-2xl px-5 py-3 text-sm font-bold text-center w-full sm:w-auto">
                            CODE: <span className="text-yellow-300 tracking-wider">RAKHI2026</span>
                        </div>
                        <Link
                            href="/products?category=raksha-bandhan"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-white text-orange-600 hover:bg-orange-50 font-bold px-7 py-3 rounded-2xl text-sm shadow-md transition-all group shrink-0"
                        >
                            <span>Shop Hampers</span>
                            <FiChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>
                </div>

            </div>
        </section>
    );
}
