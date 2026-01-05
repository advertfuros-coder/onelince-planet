// components/seller/AIQuickActions.jsx
'use client'
import { useState } from 'react'
import { 
  FiZap, 
  FiFileText, 
  FiDollarSign, 
  FiTrendingUp, 
  FiStar,
  FiImage,
  FiGlobe
} from 'react-icons/fi'
import Link from 'next/link'

export default function AIQuickActions() {
  const [hoveredAction, setHoveredAction] = useState(null)

  const actions = [
    {
      id: 'generate-description',
      title: 'Generate Description',
      description: 'AI-powered product descriptions',
      icon: FiFileText,
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600',
      href: '/seller/products/new?ai=description'
    },
    {
      id: 'pricing-insights',
      title: 'Smart Pricing',
      description: 'Optimize your prices with AI',
      icon: FiDollarSign,
      color: 'green',
      gradient: 'from-green-500 to-emerald-600',
      href: '/seller/products?tab=pricing-ai'
    },
    {
      id: 'product-suggestions',
      title: 'Product Ideas',
      description: 'AI suggests what to sell',
      icon: FiStar,
      color: 'yellow',
      gradient: 'from-yellow-500 to-orange-500',
      action: 'suggest-products'
    },
    {
      id: 'marketing-strategy',
      title: 'Marketing Plan',
      description: 'AI creates your strategy',
      icon: FiTrendingUp,
      color: 'blue',
      gradient: 'from-blue-500 to-indigo-600',
      action: 'marketing'
    },
    {
      id: 'enhance-images',
      title: 'Enhance Images',
      description: 'AI improves photo quality',
      icon: FiImage,
      color: 'pink',
      gradient: 'from-pink-500 to-rose-600',
      href: '/seller/products?tab=images-ai'
    },
    {
      id: 'translate',
      title: 'Translate Listings',
      description: 'Multi-language support',
      icon: FiGlobe,
      color: 'cyan',
      gradient: 'from-cyan-500 to-blue-500',
      action: 'translate'
    }
  ]

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiZap className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-gray-900">AI Quick Actions</h3>
          </div>
          <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
            NEW
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Boost your productivity with AI-powered tools
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4">
        {actions.map((action) => {
          const Icon = action.icon
          const isHovered = hoveredAction === action.id

          if (action.href) {
            return (
              <Link
                key={action.id}
                href={action.href}
                onMouseEnter={() => setHoveredAction(action.id)}
                onMouseLeave={() => setHoveredAction(null)}
                className={`group relative p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                  isHovered 
                    ? 'border-' + action.color + '-300 shadow-lg scale-105' 
                    : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${action.gradient} rounded-xl flex items-center justify-center mb-3 transition-transform ${
                  isHovered ? 'scale-110' : ''
                }`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 text-sm mb-1">
                  {action.title}
                </h4>
                <p className="text-xs text-gray-600">
                  {action.description}
                </p>
                
                {isHovered && (
                  <div className="absolute top-2 right-2">
                    <FiZap className="w-4 h-4 text-purple-600 animate-pulse" />
                  </div>
                )}
              </Link>
            )
          }

          return (
            <button
              key={action.id}
              onClick={() => {/* Handle action */}}
              onMouseEnter={() => setHoveredAction(action.id)}
              onMouseLeave={() => setHoveredAction(null)}
              className={`group relative p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                isHovered 
                  ? 'border-' + action.color + '-300 shadow-lg scale-105' 
                  : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${action.gradient} rounded-xl flex items-center justify-center mb-3 transition-transform ${
                isHovered ? 'scale-110' : ''
              }`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 text-sm mb-1">
                {action.title}
              </h4>
              <p className="text-xs text-gray-600">
                {action.description}
              </p>
              
              {isHovered && (
                <div className="absolute top-2 right-2">
                  <FiZap className="w-4 h-4 text-purple-600 animate-pulse" />
                </div>
              )}
            </button>
          )
        })}
      </div>

      <div className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600">
            <strong className="text-purple-600">100 free AI credits</strong> this month
          </span>
          <Link href="/seller/ai-features" className="text-purple-600 font-semibold hover:text-purple-700">
            View All Features →
          </Link>
        </div>
      </div>
    </div>
  )
}
