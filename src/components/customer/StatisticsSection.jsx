// components/customer/StatisticsSection.jsx
'use client'
import { useState, useEffect, useRef } from 'react'
import { FiUsers, FiShoppingBag, FiTrendingUp, FiGlobe } from 'react-icons/fi'

const stats = [
  {
    icon: FiUsers,
    value: 50000,
    suffix: '+',
    label: 'Active Sellers',
    description: 'Verified vendors across India & UAE',
    gradient: 'from-blue-500 to-indigo-600',
    bgGradient: 'from-blue-50 to-indigo-50'
  },
  {
    icon: FiShoppingBag,
    value: 1000000,
    suffix: '+',
    label: 'Products Listed',
    description: 'Across all categories',
    gradient: 'from-purple-500 to-pink-600',
    bgGradient: 'from-purple-50 to-pink-50'
  },
  {
    icon: FiTrendingUp,
    value: 5000000,
    suffix: '+',
    label: 'Happy Customers',
    description: 'Satisfied buyers worldwide',
    gradient: 'from-green-500 to-emerald-600',
    bgGradient: 'from-green-50 to-emerald-50'
  },
  {
    icon: FiGlobe,
    value: 2,
    suffix: ' Countries',
    label: 'Global Reach',
    description: 'India & UAE markets',
    gradient: 'from-orange-500 to-red-600',
    bgGradient: 'from-orange-50 to-red-50'
  }
]

function AnimatedCounter({ value, duration = 2000 }) {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef(null)

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

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!isVisible) return

    let startTime
    let animationFrame

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)

      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      setCount(Math.floor(easeOutQuart * value))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [isVisible, value, duration])

  return <span ref={ref}>{count.toLocaleString()}</span>
}

export default function StatisticsSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold mb-4">
            <FiTrendingUp className="w-4 h-4" />
            <span className="text-sm">Our Impact</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Powering Commerce Across
            <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              India & UAE
            </span>
          </h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
            Join thousands of sellers and millions of customers in the fastest-growing multi-vendor marketplace
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group relative"
            >
              {/* Card */}
              <div className={`relative bg-gradient-to-br ${stat.bgGradient} rounded-2xl p-8 shadow-2xl border border-white/10 backdrop-blur-sm hover:scale-105 transition-all duration-300`}>
                {/* Icon */}
                <div className={`w-16 h-16 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-8 h-8 text-white" />
                </div>

                {/* Number */}
                <div className={`text-4xl md:text-5xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-2`}>
                  <AnimatedCounter value={stat.value} />
                  {stat.suffix}
                </div>

                {/* Label */}
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {stat.label}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm">
                  {stat.description}
                </p>

                {/* Decorative Element */}
                <div className={`absolute -top-2 -right-2 w-20 h-20 bg-gradient-to-br ${stat.gradient} rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-300`} />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-white text-lg mb-6">
            Ready to be part of our success story?
          </p>
          <div className="inline-flex flex-col sm:flex-row gap-4">
            <a
              href="/seller/register"
              className="px-8 py-4 bg-white text-gray-900 font-bold rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              Start Selling Today
            </a>
            <a
              href="/products"
              className="px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white font-bold rounded-xl hover:bg-white/20 transition-all duration-300"
            >
              Explore Products
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
