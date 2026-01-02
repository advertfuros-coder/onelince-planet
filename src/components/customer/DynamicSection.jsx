'use client'
import Link from 'next/link'
import { FiArrowUpRight, FiMinus } from 'react-icons/fi'

// --- Pattern A: Explorer Grid (7-column minimalist) ---
const ExplorerGrid = ({ title, items, viewAllHref }) => (
    <div className="py-12 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl md:text-2xl font-black text-[#1e293b] tracking-tight">{title}</h2>
                <Link href={viewAllHref} className="px-4 py-1.5 border border-gray-300 text-[9px] font-black uppercase tracking-widest text-[#1e293b] hover:bg-gray-50 transition-all rounded-sm">
                    View All
                </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-5 md:gap-6">
                {items.map((item, idx) => (
                    <Link key={idx} href={item.href} className="group flex flex-col items-center">
                        <div className="relative w-full aspect-square overflow-hidden rounded-[35px] mb-3 bg-gray-50 border border-gray-100">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                        </div>
                        <span className="text-[13px] md:text-sm font-black text-[#1e293b] tracking-tight text-center leading-tight transition-colors group-hover:text-blue-600">
                            {item.name}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    </div>
)

// --- Pattern B: Brand Spotlight (Noon style) ---
const BrandSpotlight = ({ title, items, viewAllHref }) => (
    <div className="py-16 bg-gray-50">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row items-baseline justify-between mb-12 gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <FiMinus className="text-blue-600 w-6" />
                        <span className="text-blue-600 font-bold text-[9px] uppercase tracking-[0.3em]">Premium Partners</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tighter">{title}</h2>
                </div>
                <Link href={viewAllHref} className="group flex items-center gap-3 text-gray-900 font-black text-xs uppercase tracking-widest border-b-2 border-gray-900 pb-1 hover:text-blue-600 hover:border-blue-600 transition-all">
                    Explore All <FiArrowUpRight className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-px bg-gray-200 border border-gray-200">
                {items.map((item, idx) => (
                    <Link key={idx} href={item.href} className="group relative bg-white aspect-square p-8 flex flex-col items-center justify-center transition-all duration-500 hover:z-10 hover:shadow-2xl">
                        <div className="relative w-20 h-20 mb-4 grayscale group-hover:grayscale-0 transition-all duration-700">
                            <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-500"
                                onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${item.name}&background=f3f4f6&color=1f2937&bold=true` }}
                            />
                        </div>
                        <div className="absolute inset-0 bg-gray-900 opacity-0 group-hover:opacity-[0.02] transition-opacity duration-500"></div>
                        <div className="text-center opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                            <h3 className="font-black text-[10px] uppercase tracking-widest text-gray-900 mb-1">{item.name}</h3>
                            <p className="text-[9px] text-blue-600 font-bold">Exclusive Deals</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    </div>
)

// --- Main Engine Component ---
export default function DynamicSection({ section }) {
    const { pattern, title, items, viewAllHref } = section

    switch (pattern) {
        case 'EXPLORER_GRID':
            return <ExplorerGrid title={title} items={items} viewAllHref={viewAllHref} />
        case 'BRAND_SPOTLIGHT':
            return <BrandSpotlight title={title} items={items} viewAllHref={viewAllHref} />
        default:
            return null
    }
}
