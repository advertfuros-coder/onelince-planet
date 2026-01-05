'use client'
import { FiTruck, FiShield, FiRefreshCw, FiHeadphones, FiUsers, FiGlobe, FiTrendingUp, FiAward, FiArrowUpRight, FiMinus } from 'react-icons/fi'

const features = [
  {
    icon: FiGlobe,
    title: "Global Network",
    description: "Authentic selections curated from verified sellers across India & the UAE.",
    accent: "text-blue-600",
    bg: "bg-blue-50"
  },
  {
    icon: FiTruck,
    title: "Express Logistics",
    description: "Premium delivery architecture ensuring products arrive within 24-48 hours.",
    accent: "text-emerald-600",
    bg: "bg-emerald-50"
  },
  {
    icon: FiShield,
    title: "Secure Checkout",
    description: "Bank-grade encryption and a full guarantee on every transaction you make.",
    accent: "text-purple-600",
    bg: "bg-purple-50"
  },
  {
    icon: FiAward,
    title: "Quality Mastery",
    description: "Vigorously inspected products ensuring only the highest standards reach you.",
    accent: "text-amber-600",
    bg: "bg-amber-50"
  },
  {
    icon: FiUsers,
    title: "Seller Vanguard",
    description: "Empowering visionary entrepreneurs with industry-leading business tools.",
    accent: "text-pink-600",
    bg: "bg-pink-50"
  },
  {
    icon: FiTrendingUp,
    title: "Optimal Value",
    description: "Dynamic pricing model guaranteeing the most competitive rates in the market.",
    accent: "text-cyan-600",
    bg: "bg-cyan-50"
  },
  {
    icon: FiRefreshCw,
    title: "Intuitive Returns",
    description: "Hassle-free 7-day circularity policy for seamless exchanges and refunds.",
    accent: "text-rose-600",
    bg: "bg-rose-50"
  },
  {
    icon: FiHeadphones,
    title: "Concierge Care",
    description: "Multilingual assistance available 24/7 to resolve every single query.",
    accent: "text-indigo-600",
    bg: "bg-indigo-50"
  }
]

export default function FeaturesSection() {
  return (
    <section className="py-24 bg-white border-b border-gray-100 relative overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 relative z-10">
        {/* Editorial Header */}
        <div className="flex flex-col md:flex-row items-baseline justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <FiMinus className="text-blue-600 w-8" />
              <span className="text-blue-600 font-semibold text-[10px] uppercase tracking-[0.3em]">Service Standards</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-semibold text-gray-900 tracking-tighter leading-none mb-6">
              Why Choice <br /> Online Planet
            </h2>
            <p className="text-gray-500 text-sm md:text-base font-medium max-w-lg">
              Setting the benchmark for modern commerce excellence across the Middle East and beyond.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-gray-100 border border-gray-100">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white p-10 transition-all duration-500 hover:z-10 hover:shadow-2xl"
            >
              <div className={`w-12 h-12 rounded-2xl ${feature.bg} ${feature.accent} flex items-center justify-center mb-8 transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-[10deg]`}>
                <feature.icon className="w-6 h-6" />
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-3 tracking-tight">
                {feature.title}
              </h3>
              <p className="text-gray-500 text-xs font-medium leading-relaxed mb-6">
                {feature.description}
              </p>

              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400 group-hover:text-blue-600 transition-colors">
                <span>Core Pillar</span>
                <FiArrowUpRight className="w-3 h-3 transform translate-y-0.5 group-hover:-translate-y-0 group-hover:translate-x-0.5 transition-transform" />
              </div>

              {/* Subtle Overlay */}
              <div className="absolute inset-0 bg-gray-900 opacity-0 group-hover:opacity-[0.01] transition-opacity duration-500"></div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 flex flex-col sm:flex-row items-center justify-center gap-6">
          <a
            href="/products"
            className="w-full sm:w-auto px-10 py-4 bg-gray-900 text-white font-semibold text-xs uppercase tracking-widest rounded-2xl hover:bg-blue-600 transition-all duration-500 text-center"
          >
            Enter The Marketplace
          </a>
          <a
            href="/seller/register"
            className="w-full sm:w-auto px-10 py-4 bg-white border border-gray-200 text-gray-900 font-semibold text-xs uppercase tracking-widest rounded-2xl hover:border-blue-600 hover:text-blue-600 transition-all duration-500 text-center"
          >
            Become A Partner
          </a>
        </div>
      </div>
    </section>
  )
}
