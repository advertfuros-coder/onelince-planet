'use client'
import { useState } from 'react'
import Link from 'next/link'
import ProductFilters from '@/components/customer/ProductFilters'
import ProductCard from '@/components/customer/ProductCard'
import { FiChevronRight, FiChevronLeft } from 'react-icons/fi'

// Mock data to match the image precisely
const mockProducts = [
  {
    _id: '1',
    name: 'Sony WH-1000XM4 Noise Canceling...',
    pricing: { basePrice: 24000, salePrice: 19990 },
    ratings: { average: 4.8, totalReviews: 1240 },
    images: [{ url: 'https://m.media-amazon.com/images/I/71o8Q5h63aL._SL1500_.jpg' }],
    isBestSeller: true,
    isVerified: true,
    sellerId: { storeInfo: { storeName: 'Appario R...' } }
  },
  {
    _id: '2',
    name: 'Bose QuietComfort 45 Bluetooth Wireless...',
    pricing: { basePrice: 29900, salePrice: 29900 },
    ratings: { average: 4.7, totalReviews: 856 },
    images: [{ url: 'https://m.media-amazon.com/images/I/51JbsHSktkL._SL1500_.jpg' }],
    isNewArrival: true,
    isVerified: false,
    sellerId: { storeInfo: { storeName: 'Electronics...' } }
  },
  {
    _id: '3',
    name: 'JBL Tune 760NC, Wireless Over Ear...',
    pricing: { basePrice: 7999, salePrice: 5499 },
    ratings: { average: 4.5, totalReviews: 4102 },
    images: [{ url: 'https://m.media-amazon.com/images/I/61S9057B-2L._SL1500_.jpg' }],
    isVerified: false,
    sellerId: { storeInfo: { storeName: 'RetailNet' } }
  },
  {
    _id: '4',
    name: 'Sennheiser MOMENTUM 4...',
    pricing: { basePrice: 34990, salePrice: 34990 },
    ratings: { average: 4.9, totalReviews: 342 },
    images: [{ url: 'https://m.media-amazon.com/images/I/718V3X6Y-4L._SL1500_.jpg' }],
    isPremium: true,
    isVerified: true,
    sellerId: { storeInfo: { storeName: 'Sennheis...' } }
  },
  {
    _id: '5',
    name: 'boAt Rockerz 450 Bluetooth On Ear...',
    pricing: { basePrice: 3990, salePrice: 1499 },
    ratings: { average: 4.2, totalReviews: 12450 },
    images: [{ url: 'https://m.media-amazon.com/images/I/51D68n2h+8L._SL1500_.jpg' }],
    isVerified: false,
    sellerId: { storeInfo: { storeName: 'ClickTech' } }
  },
  {
    _id: '6',
    name: 'Beats Solo3 Wireless On-Ear Headphones...',
    pricing: { basePrice: 16900, salePrice: 16900 },
    ratings: { average: 4.4, totalReviews: 520 },
    images: [{ url: 'https://m.media-amazon.com/images/I/51A3I1-z9vL._SL1000_.jpg' }],
    isVerified: true,
    sellerId: { storeInfo: { storeName: 'iWorld' } }
  },
  {
    _id: '7',
    name: 'Skullcandy Crusher Evo Wireless Over-E...',
    pricing: { basePrice: 19999, salePrice: 12999 },
    ratings: { average: 4.6, totalReviews: 2800 },
    images: [{ url: 'https://m.media-amazon.com/images/I/71R2o5-Uf2L._SL1500_.jpg' }],
    isTopRated: true,
    isVerified: false,
    sellerId: { storeInfo: { storeName: 'MusicBox' } }
  },
  {
    _id: '8',
    name: 'Anker Soundcore Life Q20 Hybrid Active...',
    pricing: { basePrice: 7500, salePrice: 5999 },
    ratings: { average: 4.5, totalReviews: 990 },
    images: [{ url: 'https://m.media-amazon.com/images/I/61fI9HkX7UL._SL1500_.jpg' }],
    isVerified: false,
    sellerId: { storeInfo: { storeName: 'TechStore' } }
  }
]

export default function SearchPage() {
  const [filters, setFilters] = useState({
    search: 'Wireless Headphones',
    minPrice: '',
    maxPrice: '',
    brand: '',
    rating: '',
    verified: false,
    fastDelivery: true,
    sortBy: 'relevance'
  })

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1440px] mx-auto px-6 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-[13px] text-gray-500 mb-8 font-medium">
          <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <FiChevronRight className="w-3.5 h-3.5" />
          <Link href="/electronics" className="hover:text-blue-600 transition-colors">Electronics</Link>
          <FiChevronRight className="w-3.5 h-3.5" />
          <Link href="/audio" className="hover:text-blue-600 transition-colors">Audio</Link>
          <FiChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#1a1a1b] font-bold">Wireless Headphones</span>
        </nav>

        <div className="flex gap-10">
          {/* Left Sidebar */}
          <aside className="w-[280px] flex-shrink-0">
            <ProductFilters filters={filters} onFiltersChange={setFilters} />
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Results Header */}
            <div className="flex flex-col gap-6 mb-8">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h1 className="text-[34px] font-black text-[#1a1a1b] leading-tight tracking-tight">
                    Search results for '{filters.search}'
                  </h1>
                  <p className="text-[14px] font-bold text-gray-400">
                    Showing 1-12 of 348 results
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Sort Dropdown */}
                  <div className="group relative">
                    <button className="flex items-center gap-3 px-5 py-2.5 bg-[#F8F9FA] rounded-[14px] border border-gray-100 font-bold text-[14px] text-[#1a1a1b] hover:border-gray-300 transition-all">
                      Sort by: <span className="text-gray-500">Relevance</span>
                      <FiChevronRight className="w-4 h-4 rotate-90 text-gray-400" />
                    </button>
                  </div>
                  
                  {/* Quick Filters */}
                  <button className="flex items-center gap-3 px-5 py-2.5 bg-[#F8F9FA] rounded-[14px] border border-gray-100 font-bold text-[14px] text-[#1a1a1b] hover:border-gray-300 transition-all">
                    Brand
                    <FiChevronRight className="w-4 h-4 rotate-90 text-gray-400" />
                  </button>
                  
                  <button className="flex items-center gap-3 px-5 py-2.5 bg-[#F8F9FA] rounded-[14px] border border-gray-100 font-bold text-[14px] text-[#1a1a1b] hover:border-gray-300 transition-all">
                    Price
                    <FiChevronRight className="w-4 h-4 rotate-90 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {mockProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2 py-8">
              <button className="p-2 bg-[#F8F9FA] rounded-full text-gray-400 hover:text-blue-600 transition-colors border border-gray-100">
                <FiChevronLeft className="w-5 h-5" />
              </button>
              
              <button className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white font-black text-[14px] shadow-lg shadow-blue-200">1</button>
              <button className="w-10 h-10 flex items-center justify-center rounded-full bg-transparent text-gray-500 font-bold text-[14px] hover:bg-[#F8F9FA] transition-all">2</button>
              <button className="w-10 h-10 flex items-center justify-center rounded-full bg-transparent text-gray-500 font-bold text-[14px] hover:bg-[#F8F9FA] transition-all">3</button>
              <span className="text-gray-400 font-bold px-2">...</span>
              <button className="w-10 h-10 flex items-center justify-center rounded-full bg-transparent text-gray-500 font-bold text-[14px] hover:bg-[#F8F9FA] transition-all">8</button>
              
              <button className="p-2 bg-[#F8F9FA] rounded-full text-gray-400 hover:text-blue-600 transition-colors border border-gray-100">
                <FiChevronRight className="w-5 h-5" />
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
