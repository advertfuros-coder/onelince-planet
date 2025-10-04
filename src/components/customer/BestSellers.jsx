// components/customer/BestSellers.jsx
'use client'
import { FiAward } from 'react-icons/fi'
import ProductCard from './ProductCard'
import Link from 'next/link'

export default function BestSellers({ products = [] }) {
  if (!products || products.length === 0) {
    return null
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <FiAward className="w-8 h-8 text-yellow-600" />
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Best Sellers</h2>
            <p className="text-gray-600">Top rated and most loved products</p>
          </div>
        </div>
        <Link 
          href="/products?sortBy=totalSales&order=desc"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          View All →
        </Link>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map(product => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  )
}
