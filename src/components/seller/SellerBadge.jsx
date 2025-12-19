// components/seller/SellerBadge.jsx
'use client'

import { FiCheckCircle, FiAward, FiTruck, FiStar, FiMessageCircle, FiShield } from 'react-icons/fi'

const badgeConfig = {
  verified: {
    icon: FiCheckCircle,
    label: 'Verified Seller',
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    iconColor: 'text-blue-600'
  },
  top_seller: {
    icon: FiAward,
    label: 'Top Seller',
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-700',
    iconColor: 'text-yellow-600'
  },
  fast_shipper: {
    icon: FiTruck,
    label: 'Fast Shipper',
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    iconColor: 'text-green-600'
  },
  quality_products: {
    icon: FiStar,
    label: 'Quality Products',
    color: 'purple',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
    iconColor: 'text-purple-600'
  },
  responsive: {
    icon: FiMessageCircle,
    label: 'Responsive',
    color: 'indigo',
    bgColor: 'bg-indigo-100',
    textColor: 'text-indigo-700',
    iconColor: 'text-indigo-600'
  },
  trusted: {
    icon: FiShield,
    label: 'Trusted Seller',
    color: 'emerald',
    bgColor: 'bg-emerald-100',
    textColor: 'text-emerald-700',
    iconColor: 'text-emerald-600'
  }
}

export default function SellerBadge({ type, size = 'md', showLabel = true, tooltip = true }) {
  const config = badgeConfig[type]
  if (!config) return null

  const Icon = config.icon

  const sizes = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  return (
    <div
      className={`
        inline-flex items-center space-x-1.5 rounded-full font-semibold
        ${config.bgColor} ${config.textColor} ${sizes[size]}
        ${tooltip ? 'cursor-help' : ''}
      `}
      title={tooltip ? config.label : ''}
    >
      <Icon className={`${iconSizes[size]} ${config.iconColor}`} />
      {showLabel && <span>{config.label}</span>}
    </div>
  )
}

// Component to display multiple badges
export function SellerBadges({ badges = [], maxDisplay = 3, size = 'sm' }) {
  if (!badges || badges.length === 0) return null

  const displayBadges = badges.slice(0, maxDisplay)
  const remaining = badges.length - maxDisplay

  return (
    <div className="flex flex-wrap gap-2">
      {displayBadges.map((badge, index) => (
        <SellerBadge
          key={index}
          type={typeof badge === 'string' ? badge : badge.type}
          size={size}
          showLabel={true}
        />
      ))}
      {remaining > 0 && (
        <span className="text-xs text-gray-500 self-center">
          +{remaining} more
        </span>
      )}
    </div>
  )
}
