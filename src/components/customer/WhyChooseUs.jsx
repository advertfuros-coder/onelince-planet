'use client'
import { FiCheckCircle, FiTruck, FiShield, FiAward, FiClock, FiPercent } from 'react-icons/fi'

const features = [
  {
    icon: FiTruck,
    title: 'Free Shipping',
    description: 'On orders over $50',
    color: 'from-blue-500 to-blue-600'
  },
  {
    icon: FiShield,
    title: 'Secure Payment',
    description: '100% protected transactions',
    color: 'from-green-500 to-green-600'
  },
  {
    icon: FiCheckCircle,
    title: 'Easy Returns',
    description: '30-day money-back guarantee',
    color: 'from-purple-500 to-purple-600'
  },
  {
    icon: FiAward,
    title: 'Quality Guarantee',
    description: 'Verified authentic products',
    color: 'from-orange-500 to-orange-600'
  },
  {
    icon: FiClock,
   title: '24/7 Support',
    description: 'Dedicated customer service',
    color: 'from-pink-500 to-pink-600'
  },
  {
    icon: FiPercent,
    title: 'Best Prices',
    description: 'Competitive pricing guaranteed',
    color: 'from-indigo-500 to-indigo-600'
  }
]

export default function WhyChooseUs() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">
            Why Shop With Us?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience the best online shopping with unbeatable service and quality
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="group relative p-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 hover:border-transparent hover:shadow-2xl transition-all duration-300 overflow-hidden"
              >
                {/* Animated Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                
                {/* Icon */}
                <div className={`relative w-16 h-16 mb-4 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <div className="relative">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {feature.description}
                  </p>
                </div>

                {/* Decorative Element */}
                <div className="absolute -bottom-2 -right-2 w-24 h-24 bg-gradient-to-br from-blue-100/50 to-purple-100/50 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
              </div>
            )
          })}
        </div>

        {/* Trust Badge */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full border border-blue-100">
            <FiCheckCircle className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-semibold text-gray-900">
              Trusted by 50,000+ Happy Customers
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
