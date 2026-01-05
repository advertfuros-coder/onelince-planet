// components/customer/FlashDeals.jsx
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FiClock } from 'react-icons/fi'
import ProductCard from './ProductCard'

export default function FlashDeals({ products = [] }) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 45,
    seconds: 30
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev
        
        if (seconds > 0) {
          seconds--
        } else {
          seconds = 59
          if (minutes > 0) {
            minutes--
          } else {
            minutes = 59
            if (hours > 0) {
              hours--
            } else {
              hours = 23
            }
          }
        }
        
        return { hours, minutes, seconds }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  if (!products || products.length === 0) {
    return null
  }

  return (
    <section className="bg-gradient-to-r from-red-500 to-orange-500 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-semibold text-white mb-2">⚡ Flash Deals</h2>
            <p className="text-white/90">Limited time offers - Grab them fast!</p>
          </div>
          
          {/* Countdown Timer */}
          <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-3 mt-4 md:mt-0">
            <FiClock className="text-white w-5 h-5" />
            <div className="flex items-center space-x-2 text-white font-semibold">
              <div className="flex flex-col items-center">
                <span className="text-2xl">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="text-xs">Hours</span>
              </div>
              <span className="text-2xl">:</span>
              <div className="flex flex-col items-center">
                <span className="text-2xl">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="text-xs">Minutes</span>
              </div>
              <span className="text-2xl">:</span>
              <div className="flex flex-col items-center">
                <span className="text-2xl">{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className="text-xs">Seconds</span>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>

        {/* View All Link */}
        <div className="text-center mt-8">
          <Link 
            href="/products?deals=flash"
            className="inline-block bg-white text-red-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            View All Flash Deals
          </Link>
        </div>
      </div>
    </section>
  )
}
