// components/customer/FeaturesSection.jsx
'use client'
import { FiTruck, FiShield, FiRefreshCw, FiHeadphones, FiUsers, FiGlobe, FiTrendingUp, FiAward } from 'react-icons/fi'

const features = [
  {
    icon: FiGlobe,
    title: "Multi-Vendor Marketplace",
    description: "Shop from thousands of verified sellers across India & UAE",
    gradient: "from-blue-500 via-blue-600 to-indigo-600",
    iconBg: "bg-blue-50"
  },
  {
    icon: FiTruck,
    title: "Express Delivery",
    description: "Lightning-fast delivery to your doorstep in 24-48 hours",
    gradient: "from-green-500 via-green-600 to-emerald-600",
    iconBg: "bg-green-50"
  },
  {
    icon: FiShield,
    title: "Buyer Protection",
    description: "100% secure payments with money-back guarantee",
    gradient: "from-purple-500 via-purple-600 to-violet-600",
    iconBg: "bg-purple-50"
  },
  {
    icon: FiAward,
    title: "Quality Assured",
    description: "Only verified products from trusted sellers",
    gradient: "from-orange-500 via-orange-600 to-amber-600",
    iconBg: "bg-orange-50"
  },
  {
    icon: FiUsers,
    title: "Seller Support",
    description: "Grow your business with our powerful seller tools",
    gradient: "from-pink-500 via-pink-600 to-rose-600",
    iconBg: "bg-pink-50"
  },
  {
    icon: FiTrendingUp,
    title: "Best Prices",
    description: "Competitive pricing from multiple sellers",
    gradient: "from-teal-500 via-teal-600 to-cyan-600",
    iconBg: "bg-teal-50"
  },
  {
    icon: FiRefreshCw,
    title: "Easy Returns",
    description: "Hassle-free 7-day return & exchange policy",
    gradient: "from-red-500 via-red-600 to-rose-600",
    iconBg: "bg-red-50"
  },
  {
    icon: FiHeadphones,
    title: "24/7 Support",
    description: "Round-the-clock assistance in multiple languages",
    gradient: "from-indigo-500 via-indigo-600 to-blue-600",
    iconBg: "bg-indigo-50"
  }
]

export default function FeaturesSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-semibold mb-4">
            <FiAward className="w-4 h-4" />
            <span className="text-sm">Why Choose Us</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            India & UAE's Premier
            <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Multi-Vendor Marketplace
            </span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Connect with thousands of sellers and millions of products. Whether you're buying or selling,
            we've got everything you need.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-2xl p-6 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
            >
              {/* Gradient Border Effect on Hover */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

              {/* Icon Container */}
              <div className="relative mb-4">
                <div className={`w-14 h-14 ${feature.iconBg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <div className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-lg flex items-center justify-center shadow-lg`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              {/* Content */}
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {feature.description}
              </p>

              {/* Hover Arrow */}
              <div className={`mt-4 flex items-center text-sm font-semibold bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
                Learn more
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-col sm:flex-row gap-4">
            <a
              href="/products"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              Start Shopping
            </a>
            <a
              href="/seller/register"
              className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-900 font-bold rounded-xl hover:border-blue-600 hover:shadow-xl transition-all duration-300"
            >
              Become a Seller
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
