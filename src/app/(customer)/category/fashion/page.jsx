'use client'
import { useSearchParams } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { FiChevronRight, FiPlay, FiCheckCircle } from 'react-icons/fi'
import { motion } from 'framer-motion'
import GenderSwitcher from '../../../../components/customer/GenderSwitcher'

// Kids Fashion Data
const KIDS_FASHION_DATA = {
    subcategories: [
        { name: 'Boys Clothing', icon: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&q=80&w=200' },
        { name: 'Girls Clothing', icon: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&q=80&w=200' },
        { name: 'Kids Footwear', icon: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&q=80&w=200' },
        { name: 'School Bags', icon: 'https://images.unsplash.com/photo-1553062407-98eeb94c6a62?auto=format&fit=crop&q=80&w=200' },
        { name: 'Toys & Games', icon: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?auto=format&fit=crop&q=80&w=200' },
        { name: 'Baby Care', icon: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&q=80&w=200' },
    ],
    hero: {
        image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&q=80&w=1200',
        title: 'Little Stars',
        subtitle: 'Kids Fashion | Up to 60% Off',
        tag: '#GrowInStyle',
        logos: ['Carter\'s', 'OshKosh']
    },
    highlights: [
        { title: 'School Ready', image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&q=80&w=500' },
        { title: 'Play Time', image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&q=80&w=500' },
        { title: 'Party Wear', image: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&q=80&w=500' }
    ],
    trustedBrands: [
        { name: 'CARTERS', offer: 'Under ₹599', logo: 'https://logo.clearbit.com/carters.com' },
        { name: 'OSHKOSH', offer: 'Min 40% Off', logo: 'https://logo.clearbit.com/oshkosh.com' },
        { name: 'GAP KIDS', offer: 'New Arrivals', logo: 'https://logo.clearbit.com/gap.com' },
        { name: 'H&M KIDS', offer: 'Season Sale', logo: 'https://logo.clearbit.com/hm.com' },
    ],
    occasions: [
        { name: 'Birthday Party', images: ['https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=300', 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=300', 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=300'] },
        { name: 'School Days', images: ['https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=300', 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=300', 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=300'] },
    ]
}

function FashionCategoryContent() {
    const searchParams = useSearchParams()
    const gender = searchParams.get('gender') || 'men'

    // Import the data from the existing category page
    const MEN_FASHION_DATA = {
        subcategories: [
            { name: 'T-Shirts', icon: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=200' },
            { name: 'Formal Shirts', icon: 'https://images.unsplash.com/photo-1598033129183-c4f50c7176c8?auto=format&fit=crop&q=80&w=200' },
            { name: 'Gen-Z Drip', icon: 'https://images.unsplash.com/photo-1550246140-5119ae4790b8?auto=format&fit=crop&q=80&w=200', premium: true, bg: 'bg-yellow-400' },
            { name: 'Trousers', icon: 'https://images.unsplash.com/photo-1624371414361-e6e0efc8c030?auto=format&fit=crop&q=80&w=200' },
            { name: 'Track Pants', icon: 'https://images.unsplash.com/photo-1515434126000-961d90ff09db?auto=format&fit=crop&q=80&w=200' },
            { name: 'Casual Shoes', icon: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&q=80&w=200' },
            { name: 'Sports Shoes', icon: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=200' },
            { name: 'Jackets', icon: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=200' },
            { name: 'Sweatshirts', icon: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=200' },
            { name: 'Shorts', icon: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&q=80&w=200' },
            { name: 'Street Wear', icon: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=200' },
            { name: 'Smart Watches', icon: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=200' },
            { name: 'Sunglasses', icon: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=200' },
            { name: 'Headphones', icon: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=200' },
            { name: 'Personal Care', icon: 'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&q=80&w=200' },
            { name: 'Perfumes', icon: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=200' },
            { name: 'Suits', icon: 'https://images.unsplash.com/photo-1594932224528-796ce6296ee2?auto=format&fit=crop&q=80&w=200' },
            { name: 'Blazers', icon: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=200' },
            { name: 'Formal Shoes', icon: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&q=80&w=200' },
            { name: 'Wedding Ready', icon: 'https://images.unsplash.com/photo-1594932224528-796ce6296ee2?auto=format&fit=crop&q=80&w=200' },
            { name: 'Jewellery', icon: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=200' },
            { name: 'Wallets', icon: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=200' },
            { name: 'Belts', icon: 'https://images.unsplash.com/photo-1624222247344-550fb839482d?auto=format&fit=crop&q=80&w=200' },
            { name: 'Backpacks', icon: 'https://images.unsplash.com/photo-1553062407-98eeb94c6a62?auto=format&fit=crop&q=80&w=200' },
            { name: 'Sweaters', icon: 'https://images.unsplash.com/photo-1556905055-8f358a7a4bb4?auto=format&fit=crop&q=80&w=200' },
            { name: 'Flip-Flops', icon: 'https://images.unsplash.com/photo-1533659022457-0bc875e70932?auto=format&fit=crop&q=80&w=200' },
            { name: 'Shaving', icon: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=200' },
        ],
        hero: {
            image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200',
            title: 'Ready To Play',
            subtitle: 'Starting ₹999 ₹199',
            tag: '#BrandStories',
            logos: ['Decathlon', 'Cult']
        },
        highlights: [
            { title: 'New Balance', image: 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&q=80&w=500' },
            { title: 'The Roadster Life', image: 'https://images.unsplash.com/photo-1556306535-0f09a537f0a3?auto=format&fit=crop&q=80&w=500' },
            { title: 'Puma Sports', image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=500' }
        ],
        trustedBrands: [
            { name: 'JOMPERS', offer: 'Under ₹799', logo: 'https://logo.clearbit.com/nike.com' },
            { name: 'ANOUK', offer: 'Under ₹699', logo: 'https://logo.clearbit.com/adidas.com' },
            { name: 'VASTRAMAY', offer: 'Under ₹999', logo: 'https://logo.clearbit.com/hm.com' },
            { name: 'NIKE', offer: 'Up To 50% Off', logo: 'https://logo.clearbit.com/nike.com' },
            { name: 'LEVIS', offer: 'Min. 50% Off', logo: 'https://logo.clearbit.com/levis.com' },
            { name: 'ALLEN SOLLY', offer: 'Up to 60% Off', logo: 'https://logo.clearbit.com/puma.com' },
            { name: 'ADIDAS', offer: 'Min. 45% Off', logo: 'https://logo.clearbit.com/adidas.com' },
            { name: 'CALVIN KLEIN', offer: 'Up to 50% Off', logo: 'https://logo.clearbit.com/calvinklein.com' },
        ],
        occasions: [
            { name: 'Wedding', images: ['https://images.unsplash.com/photo-1594932224528-796ce6296ee2?w=300', 'https://images.unsplash.com/photo-1550246140-5119ae4790b8?w=300', 'https://images.unsplash.com/photo-1520975916090-3105956dac5e?w=300'] },
            { name: 'Workwear', images: ['https://images.unsplash.com/photo-1598033129183-c4f50c7176c8?w=300', 'https://images.unsplash.com/photo-1624371414361-e6e0efc8c030?w=300', 'https://images.unsplash.com/photo-1507679799987-c7377f323b8d?w=300'] },
            { name: 'Sports', images: ['https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=300', 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=300', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300'] },
            { name: 'Party', images: ['https://images.unsplash.com/photo-1594932224528-796ce6296ee2?w=300', 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=300', 'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=300'] },
            { name: 'Travel Ready', images: ['https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=300', 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=300', 'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=300'] },
            { name: 'Laidback Fit', images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300', 'https://images.unsplash.com/photo-1515434126000-961d90ff09db?w=300', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=300'] }
        ]
    }

    const WOMEN_FASHION_DATA = {
        subcategories: [
            { name: 'Dresses', icon: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&q=80&w=200' },
            { name: 'Kurtas & Suits', icon: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&q=80&w=200' },
            { name: 'Sale Drip', icon: 'https://images.unsplash.com/photo-1618242479322-128081190965?auto=format&fit=crop&q=80&w=200', premium: true, bg: 'bg-pink-400' },
            { name: 'Top & Tees', icon: 'https://images.unsplash.com/photo-1503341455253-b2e72fbb0db2?auto=format&fit=crop&q=80&w=200' },
            { name: 'Jeans & Jeggings', icon: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=200' },
            { name: 'Handbags', icon: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=200' },
            { name: 'Heels & Flats', icon: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=200' },
            { name: 'Sarees', icon: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=200' },
            { name: 'Makeup', icon: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=200' },
            { name: 'Skincare', icon: 'https://images.unsplash.com/photo-1556228578-0d85a1a4a5ed?auto=format&fit=crop&q=80&w=200' },
            { name: 'Earrings', icon: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=200' },
            { name: 'Lingerie', icon: 'https://images.unsplash.com/photo-1582533089852-02c02120a239?auto=format&fit=crop&q=80&w=200' },
            { name: 'Watches', icon: 'https://images.unsplash.com/photo-1508685096489-7233e6d97c14?auto=format&fit=crop&q=80&w=200' },
            { name: 'Sunglasses', icon: 'https://images.unsplash.com/photo-1511499767390-91f19760a0ac?auto=format&fit=crop&q=80&w=200' },
            { name: 'Activewear', icon: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&q=80&w=200' },
            { name: 'Sleepwear', icon: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=200' },
            { name: 'Hair Care', icon: 'https://images.unsplash.com/photo-1527799822367-a05eb5dc0f04?auto=format&fit=crop&q=80&w=200' },
            { name: 'Footwear', icon: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&q=80&w=200' },
            { name: 'Belts', icon: 'https://images.unsplash.com/photo-1624222247344-550fb839482d?auto=format&fit=crop&q=80&w=200' },
            { name: 'Backpacks', icon: 'https://images.unsplash.com/photo-1553062407-98eeb94c6a62?auto=format&fit=crop&q=80&w=200' },
        ],
        hero: {
            image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1200',
            title: 'The Style Edit',
            subtitle: 'New Collections | Min 50% Off',
            tag: '#TrendAlert',
            logos: ['Zara', 'H&M']
        },
        highlights: [
            { title: 'Ethnic Elegance', image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&q=80&w=500' },
            { title: 'Modern Chic', image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&q=80&w=500' },
            { title: 'Active Life', image: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&q=80&w=500' }
        ],
        trustedBrands: [
            { name: 'BIBA', offer: 'Under ₹999', logo: 'https://logo.clearbit.com/biba.in' },
            { name: 'LIBAS', offer: 'Min 40% Off', logo: 'https://logo.clearbit.com/libas.in' },
            { name: 'W', offer: 'Up to 50% Off', logo: 'https://logo.clearbit.com/wforwoman.com' },
            { name: 'ZARA', offer: 'Season Sale', logo: 'https://logo.clearbit.com/zara.com' },
            { name: 'H&M', offer: 'Min. 50% Off', logo: 'https://logo.clearbit.com/hm.com' },
            { name: 'NYKAA', offer: 'Beauty Deals', logo: 'https://logo.clearbit.com/nykaa.com' },
            { name: 'PUMA', offer: 'Active Wear', logo: 'https://logo.clearbit.com/puma.com' },
            { name: 'Vero Moda', offer: 'New Arrivals', logo: 'https://logo.clearbit.com/veromoda.com' },
        ],
        occasions: [
            { name: 'Wedding', images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300', 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=300', 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=300'] },
            { name: 'Workwear', images: ['https://images.unsplash.com/photo-1507679799987-c7377f323b8d?w=300', 'https://images.unsplash.com/photo-1594932224528-796ce6296ee2?w=300', 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=300'] },
            { name: 'Party', images: ['https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=300', 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=300', 'https://images.unsplash.com/photo-1520006403993-4fd2d79f221e?w=300'] },
            { name: 'Casual', images: ['https://images.unsplash.com/photo-1503341455253-b2e72fbb0db2?w=300', 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=300', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300'] },
            { name: 'Active', images: ['https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=300', 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=300', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300'] },
            { name: 'Vacation', images: ['https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=300', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300', 'https://images.unsplash.com/photo-1528127269322-539801943592?w=300'] }
        ]
    }

    // Select data based on gender
    let categoryData
    switch (gender) {
        case 'women':
            categoryData = WOMEN_FASHION_DATA
            break
        case 'kids':
            categoryData = KIDS_FASHION_DATA
            break
        case 'men':
        default:
            categoryData = MEN_FASHION_DATA
            break
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space- y-8">

                {/* Gender Switcher - Sticky on scroll */}
                <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md py-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 border-b border-gray-100">
                    <GenderSwitcher />
                </div>

                {/* Main Hero Banner with smooth transition */}
                <motion.section
                    key={gender}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative rounded-[32px] overflow-hidden md:aspect-[3/1] aspect-[4/2] shadow-2xl group"
                >
                    <img src={categoryData.hero.image} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={categoryData.hero.title} />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 md:p-12">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="bg-white rounded-xl p-3 flex items-center gap-4 shadow-xl">
                                <span className="text-blue-900 font-semibold italic tracking-tighter text-lg uppercase">{categoryData.hero.logos[0]}</span>
                                <div className="w-px h-6 bg-gray-200"></div>
                                <span className="text-black font-semibold italic tracking-tighter text-lg uppercase flex items-center gap-1">
                                    {categoryData.hero.logos[1]}
                                </span>
                            </div>
                            <div className="bg-white/40 backdrop-blur-md px-2 py-1 rounded-md text-[8px] font-semibold text-white uppercase">& More</div>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-semibold text-white italic tracking-tighter leading-none mb-2 uppercase">
                            {categoryData.hero.title}
                        </h1>
                        <p className="text-xl md:text-2xl font-semibold text-white mb-2">{categoryData.hero.subtitle}</p>
                        <p className="text-sm font-semibold text-white/70 italic">{categoryData.hero.tag}</p>
                    </div>
                    <button className="absolute bottom-8 right-8 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-2xl hover:bg-blue-600 hover:text-white transition-all transform group-hover:translate-x-1">
                        <FiChevronRight className="w-6 h-6" />
                    </button>
                </motion.section>

                {/* Subcategories Grid with animation */}
                <motion.div
                    key={`${gender}-subcategories`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="bg-white py-4 overflow-x-auto no-scrollbar border-b border-gray-50"
                >
                    <div className="grid grid-rows-2 grid-flow-col gap-x-6 gap-y-6 min-w-max px-2">
                        {categoryData.subcategories.map((sub, idx) => (
                            <Link
                                href={`/products?category=fashion&subcategory=${sub.name.toLowerCase()}&gender=${gender}`}
                                key={idx}
                                className="flex flex-col items-center gap-2 flex-shrink-0 animate-in fade-in slide-in-from-right-4 duration-500"
                                style={{ animationDelay: `${idx * 30}ms` }}
                            >
                                <div className={`w-20 h-24 rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex items-center justify-center ${sub.bg || 'bg-gray-100'}`}>
                                    {sub.premium ? (
                                        <div className="flex flex-col items-center text-center px-2">
                                            <span className="text-[10px] font-semibold uppercase text-black leading-none mb-1">SALE</span>
                                            <span className="text-xl font-semibold text-black tracking-tighter">DRIP</span>
                                        </div>
                                    ) : (
                                        <img src={sub.icon} alt={sub.name} className="w-full h-full object-cover" />
                                    )}
                                </div>
                                <span className="text-[11px] font-semibold text-gray-800 tracking-tight text-center max-w-[80px] line-clamp-1">{sub.name}</span>
                            </Link>
                        ))}
                    </div>
                </motion.div>

                {/* Highlights Section */}
                <section>
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-semibold  tracking-tighter text-gray-900 leading-none">Highlights Of The Day</h2>
                    </div>
                    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-6 px-1">
                        {categoryData.highlights.map((item, idx) => (
                            <div key={idx} className="relative w-72 flex-shrink-0 rounded-[32px] overflow-hidden aspect-[3/4] shadow-xl group">
                                <img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute inset-x-0 bottom-6 px-6">
                                    <div className="bg-white rounded-2xl p-4 shadow-2xl transform group-hover:-translate-y-2 transition-transform duration-500">
                                        <div className="flex items-center justify-center gap-3">
                                            <span className="text-gray-900 font-semibold italic tracking-tighter text-lg uppercase italic">{item.title}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute bottom-10 left-6 w-10 h-10 bg-black/80 rounded-full flex items-center justify-center text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
                                    <FiPlay className="w-4 h-4 fill-current ml-0.5" />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Top-Rated Brands */}
                <section className="space-y-6">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-semibold  tracking-tighter text-gray-900">Top-Rated Brands</h2>
                        <div className="flex items-center gap-2 text-green-600 mt-1">
                            <FiCheckCircle className="w-5 h-5 fill-auto" />
                            <span className="text-xs font-semibold uppercase tracking-widest">100% Original Selection</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {categoryData.trustedBrands.map((brand, idx) => (
                            <div key={idx} className="bg-white rounded-[24px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
                                <div className="p-6 flex flex-col items-center gap-4">
                                    <img src={brand.logo} alt={brand.name} className="h-10 w-auto object-contain grayscale group-hover:grayscale-0 transition-all duration-500" />
                                    <div className="h-px w-8 bg-gray-100"></div>
                                </div>
                                <div className={`${gender === 'women' ? 'bg-pink-50/50' : gender === 'kids' ? 'bg-purple-50/50' : 'bg-blue-50/50'} py-3 text-center border-t border-gray-50`}>
                                    <span className={`text-xs font-semibold  ${gender === 'women' ? 'text-pink-900' : gender === 'kids' ? 'text-purple-900' : 'text-blue-900'}`}>{brand.offer}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Occasion-Ready Fits */}
                <section className="space-y-6">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-semibold  tracking-tighter text-gray-900 leading-none">Occasion-Ready Fits</h2>
                        <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mt-2">Picks To Make An Impression</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {categoryData.occasions.map((fit, idx) => (
                            <div key={idx} className="bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-sm group hover:shadow-xl transition-all">
                                <div className="flex aspect-[4/3]">
                                    {fit.images.map((img, i) => (
                                        <div key={i} className="flex-1 overflow-hidden border-r last:border-0 border-gray-50">
                                            <img src={img} alt={fit.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                        </div>
                                    ))}
                                </div>
                                <div className="p-4 text-center">
                                    <span className="text-sm font-semibold text-gray-700 tracking-tight">{fit.name}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Featured Brands Carousel */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-semibold  tracking-tighter text-gray-900">Featured Brands</h2>
                            <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mt-1">Spotlight your style with brands</p>
                        </div>
                        <div className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-semibold text-gray-400 uppercase tracking-widest">AD</div>
                    </div>

                    <div className="flex gap-6 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
                        {/* Brand Card 1 */}
                        <div className="w-[300px] md:w-[450px] flex-shrink-0 rounded-[40px] overflow-hidden bg-white border border-gray-100 shadow-xl group">
                            <div className={`aspect-[4/5] relative ${gender === 'women' ? 'bg-gradient-to-br from-pink-700 to-pink-900' : gender === 'kids' ? 'bg-gradient-to-br from-purple-700 to-purple-900' : 'bg-gradient-to-br from-blue-700 to-blue-900'} flex flex-col justify-end p-8 text-white`}>
                                <img
                                    src={gender === 'women' ? 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=600' : gender === 'kids' ? 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&q=80&w=600' : 'https://images.unsplash.com/photo-1626015569424-697526ae7664?auto=format&fit=crop&q=80&w=600'}
                                    className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-80"
                                    alt="Featured brand"
                                />
                                <div className="absolute top-8 left-8 space-y-1">
                                    <p className="text-2xl font-semibold  leading-none tracking-tighter">UNBEATABLE <br /> COMFORT,</p>
                                    <p className="text-2xl font-normal opacity-80  tracking-tighter">UNMATCHED <br /> DISCOUNT</p>
                                </div>
                                <div className="relative z-10 text-center space-y-1 mt-auto">
                                    <p className="text-3xl font-semibold  tracking-tighter">Up To 50% Off</p>
                                    <p className="text-sm font-semibold opacity-80 uppercase tracking-widest italic">Premium Collection</p>
                                </div>
                            </div>
                            <div className="p-6 flex justify-center items-center bg-white h-24">
                                <span className={`${gender === 'women' ? 'text-pink-900' : gender === 'kids' ? 'text-purple-900' : 'text-blue-900'} font-semibold italic text-4xl tracking-tighter uppercase italic`}>
                                    {gender === 'women' ? 'Zara' : gender === 'kids' ? 'Gap Kids' : 'Nike'}
                                </span>
                            </div>
                        </div>

                        {/* Brand Card 2 */}
                        <div className="w-[300px] md:w-[450px] flex-shrink-0 rounded-[40px] overflow-hidden bg-white border border-gray-100 shadow-xl group">
                            <div className="aspect-[4/5] relative overflow-hidden flex flex-col justify-end p-8 text-white text-center">
                                <img
                                    src={gender === 'women' ? 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&q=80&w=600' : gender === 'kids' ? 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&q=80&w=600' : 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=600'}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    alt="Featured brand"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>
                                <div className="relative z-10 space-y-1 mt-auto">
                                    <p className="text-3xl font-semibold  tracking-tighter">Min. 65% Off</p>
                                    <p className="text-sm font-semibold opacity-80 uppercase tracking-widest italic">Own Your Unique Style</p>
                                </div>
                            </div>
                            <div className="p-6 flex justify-center items-center bg-white h-24">
                                <div className={`px-10 py-3 ${gender === 'women' ? 'bg-pink-600' : gender === 'kids' ? 'bg-purple-600' : 'bg-red-600'} rounded-md text-white font-semibold italic text-xl tracking-tighter uppercase italic`}>
                                    {gender === 'women' ? 'H&M' : gender === 'kids' ? 'OshKosh' : 'Levis'}
                                </div>
                            </div>
                        </div>

                        {/* Brand Card 3 */}
                        <div className="w-[300px] md:w-[450px] flex-shrink-0 rounded-[40px] overflow-hidden bg-white border border-gray-100 shadow-xl group">
                            <div className="aspect-[4/5] relative overflow-hidden flex flex-col justify-end p-8 text-white text-center">
                                <img
                                    src={gender === 'women' ? 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&q=80&w=600' : gender === 'kids' ? 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&q=80&w=600' : 'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?auto=format&fit=crop&q=80&w=600'}
                                    className="absolute inset-0 w-full h-full object-cover"
                                    alt="Featured brand"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>
                                <div className="relative z-10 space-y-1 mt-auto">
                                    <p className="text-3xl font-semibold  tracking-tighter">Flat 40% Off</p>
                                    <p className="text-sm font-semibold opacity-80 uppercase tracking-widest italic">Go with the Flow</p>
                                </div>
                            </div>
                            <div className="p-6 flex justify-center items-center bg-white h-24">
                                <div className="px-10 py-3 bg-gray-900 rounded-md text-white font-semibold italic text-xl tracking-tighter uppercase italic">
                                    {gender === 'women' ? 'Biba' : gender === 'kids' ? 'Carters' : 'Roadster'}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Winter/Season Specials */}
                <section className="space-y-6 pt-8">
                    <div className="bg-stone-900 rounded-[40px] p-12 text-white relative overflow-hidden h-[500px] flex flex-col justify-center">
                        <img
                            src={gender === 'women' ? 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80' : gender === 'kids' ? 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&q=80' : 'https://images.unsplash.com/photo-1444491741275-3747c53c99b4?auto=format&fit=crop&q=80'}
                            className="absolute right-0 top-0 h-full w-1/2 object-cover opacity-60 hidden md:block"
                            alt="Season special"
                        />
                        <div className="relative z-10 space-y-4">
                            <h2 className="text-4xl md:text-5xl font-semibold uppercase italic leading-none tracking-tighter">
                                {gender === 'kids' ? 'Back To School' : 'Winter'} <br /> Specials
                            </h2>
                            <p className="text-gray-400 font-semibold uppercase text-sm tracking-widest">
                                {gender === 'kids' ? 'Get Ready For School!' : 'Gear Up For Early Winter!'}
                            </p>
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black shadow-2xl">
                                <FiChevronRight className="w-6 h-6" />
                            </div>
                        </div>
                    </div>

                    <div className="flex md:grid md:grid-cols-2 overflow-x-auto no-scrollbar gap-6 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
                        <div className="relative rounded-[40px] overflow-hidden aspect-square shadow-2xl group flex-shrink-0 w-[40vw] md:w-auto">
                            <img
                                src={gender === 'women' ? 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&q=80' : gender === 'kids' ? 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&q=80' : 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&q=80'}
                                className="absolute inset-0 w-full h-full object-cover"
                                alt="Special offer"
                            />
                            <div className="absolute inset-x-0 bottom-0 p-4 md:p-8 bg-gradient-to-t from-black/80 to-transparent">
                                <p className="text-xl md:text-3xl font-semibold text-white  mb-1 md:mb-2">UPTO 60% OFF</p>
                                <p className="text-[10px] md:text-sm font-semibold text-white/70 uppercase mb-3 md:mb-6 tracking-widest">
                                    {gender === 'women' ? 'Ethnic Wear' : gender === 'kids' ? 'School Uniforms' : 'Padded Jackets'}
                                </p>
                                <div className="bg-white rounded-lg md:rounded-xl p-1.5 md:p-3 flex items-center gap-2 md:gap-4 w-fit">
                                    <span className="text-black font-semibold italic tracking-tighter text-[9px] md:text-sm uppercase">
                                        {gender === 'women' ? 'Biba' : gender === 'kids' ? 'Gap Kids' : 'Allen Solly'}
                                    </span>
                                    <div className="w-px h-3 md:h-4 bg-gray-200"></div>
                                    <span className={`${gender === 'women' ? 'text-pink-900' : gender === 'kids' ? 'text-purple-900' : 'text-blue-900'} font-semibold italic tracking-tighter text-[9px] md:text-sm uppercase whitespace-nowrap`}>
                                        {gender === 'women' ? 'W for Woman' : gender === 'kids' ? 'Carters' : 'U.S. Polo Assn.'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="relative rounded-[40px] overflow-hidden aspect-square shadow-2xl group flex-shrink-0 w-[40vw] md:w-auto">
                            <img
                                src={gender === 'women' ? 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&q=80' : gender === 'kids' ? 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&q=80' : 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80'}
                                className="absolute inset-0 w-full h-full object-cover"
                                alt="Special offer"
                            />
                            <div className="absolute inset-x-0 bottom-0 p-4 md:p-8 bg-gradient-to-t from-black/80 to-transparent">
                                <p className="text-xl md:text-3xl font-semibold text-white  mb-1 md:mb-2">
                                    {gender === 'kids' ? 'Buy 2 Get 1' : 'Up To 10% OFF'}
                                </p>
                                <p className="text-[10px] md:text-sm font-semibold text-white/70 uppercase mb-3 md:mb-6 tracking-widest">
                                    {gender === 'women' ? 'Western Wear' : gender === 'kids' ? 'Party Wear' : 'Built For Outdoors'}
                                </p>
                                <div className="bg-white rounded-lg md:rounded-xl p-1.5 md:p-3 flex items-center gap-2 md:gap-4 w-fit">
                                    <span className={`${gender === 'women' ? 'text-pink-600' : gender === 'kids' ? 'text-purple-600' : 'text-blue-600'} font-semibold italic tracking-tighter text-[9px] md:text-sm uppercase flex items-center gap-1 italic`}>
                                        {gender === 'women' ? 'Zara' : gender === 'kids' ? 'OshKosh' : 'Columbia'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <style jsx>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    )
}

export default function FashionCategoryPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading fashion...</p>
                </div>
            </div>
        }>
            <FashionCategoryContent />
        </Suspense>
    )
}
