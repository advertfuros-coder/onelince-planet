// components/customer/LimitedStock.jsx
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FiClock, FiAlertCircle } from 'react-icons/fi'
import { formatPrice } from '../../lib/utils'
import Button from '../ui/Button'

const limitedStockProducts = [
  {
    id: 16,
    name: 'Limited Edition Sneakers',
    price: 4999,
    originalPrice: 7999,
    image: '/images/sneakers.jpg',
    stock: 2,
    totalStock: 50,
    soldCount: 48
  },
  {
    id: 17,
    name: 'Vintage Watch Collection',
    price: 8999,
    originalPrice: 12999,
    image: '/images/vintage-watch.jpg',
    stock: 1,
    totalStock: 20,
    soldCount: 19
  },
  {
    id: 18,
    name: 'Artisan Coffee Blend',
    price: 899,
    originalPrice: 1299,
    image: '/images/coffee.jpg',
    stock: 5,
    totalStock: 100,
    soldCount: 95
  }
]

export default function LimitedStock() {
  return (
    <section className="py-12 bg-red-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <FiAlertCircle className="w-8 h-8 text-red-500" />
            <h2 className="text-3xl font-bold text-gray-900">Limited Stock Alert</h2>
          </div>
          <p className="text-gray-600">Hurry up! These products are almost sold out</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {limitedStockProducts.map((product) => {
            const progressPercentage = (product.soldCount / product.totalStock) * 100

            return (
              <div
                key={product.id}
                className="bg-white rounded-xl p-6 shadow-lg border-2 border-red-200 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 bg-red-500 text-white px-3 py-1 rounded-bl-lg">
                  <div className="flex items-center space-x-1">
                    <FiClock className="w-4 h-4" />
                    <span className="text-sm font-semibold">Only {product.stock} left!</span>
                  </div>
                </div>

                <div className="mb-4">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {product.name}
                </h3>

                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-xl font-bold text-red-600">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Sold: {product.soldCount}</span>
                    <span>Total: {product.totalStock}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>

                <Link href={`/products/${product.id}`}>
                  <Button className="w-full bg-red-500 hover:bg-red-600">
                    Buy Now - Quick!
                  </Button>
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
