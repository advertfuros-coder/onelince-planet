// components/customer/TrendingProducts.jsx
'use client'
import { FiTrendingUp } from 'react-icons/fi'
import ProductCard from './ProductCard'
import Button from '../ui/Button'

export default function TrendingProducts({ products = [] }) {
  if (!products || products.length === 0) {
    return null
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <FiTrendingUp className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Trending Products</h2>
            <p className="text-gray-600">Most popular items right now</p>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map(product => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>

      {/* View More Button */}
      <div className="text-center mt-10">
        <Button variant="outline" size="lg" onClick={() => window.location.href = '/products'}>
          View More Trending Products
        </Button>
      </div>
    </section>
  )
}
