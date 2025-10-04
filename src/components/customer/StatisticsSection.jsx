// components/customer/StatisticsSection.jsx
'use client'
import { useState, useEffect, useRef } from 'react'
import { FaUsers, FaShoppingBag, FaBuilding, FaTruck, FaStar, FaGlobe } from 'react-icons/fa'

const statistics = [
  {
    id: 1,
    title: 'Happy Customers',
    value: 500000,
    suffix: '+',
    icon: FaUsers,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  {
    id: 2,
    title: 'Products Sold',
    value: 2000000,
    suffix: '+',
    icon: FaShoppingBag,
    color: 'text-green-600',
    bgColor: 'bg-green-100'
  },
  {
    id: 3,
    title: 'Verified Sellers',
    value: 25000,
    suffix: '+',
    icon: FaBuilding,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100'
  },
  {
    id: 4,
    title: 'Orders Delivered',
    value: 1800000,
    suffix: '+',
    icon: FaTruck,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100'
  },
  {
    id: 5,
    title: 'Average Rating',
    value: 4.8,
    suffix: '/5',
    icon: FaStar,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100'
  },
  {
    id: 6,
    title: 'Cities Covered',
    value: 500,
    suffix: '+',
    icon: FaGlobe,
    color: 'text-red-600',
    bgColor: 'bg-red-100'
  }
]

function useCountUp(end, duration = 2000) {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef()

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) return

    let startTime
    const animateCount = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      setCount(Math.floor(progress * end))
      
      if (progress < 1) {
        requestAnimationFrame(animateCount)
      }
    }
    
    requestAnimationFrame(animateCount)
  }, [isVisible, end, duration])

  return [count, ref]
}

function StatCard({ stat }) {
  const [count, ref] = useCountUp(stat.value)
  const Icon = stat.icon

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(0) + 'K'
    }
    return num.toString()
  }

  return (
    <div ref={ref} className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
      <div className={`inline-flex items-center justify-center w-16 h-16 ${stat.bgColor} rounded-full mb-4`}>
        <Icon className={`w-8 h-8 ${stat.color}`} />
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-2">
        {stat.value === 4.8 ? count.toFixed(1) : formatNumber(count)}
        <span className={`text-lg ${stat.color}`}>{stat.suffix}</span>
      </div>
      <h3 className="text-gray-600 font-medium">{stat.title}</h3>
    </div>
  )
}

export default function StatisticsSection() {
  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">OnlinePlanet by Numbers</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join millions of satisfied customers and thousands of successful sellers in India's fastest-growing marketplace
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {statistics.map((stat) => (
            <StatCard key={stat.id} stat={stat} />
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="inline-flex items-center space-x-2 text-sm text-gray-600 bg-white px-4 py-2 rounded-full shadow-sm">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full border-2 border-white"
                />
              ))}
            </div>
            <span>Trusted by millions across India since 2020</span>
          </div>
        </div>
      </div>
    </section>
  )
}
