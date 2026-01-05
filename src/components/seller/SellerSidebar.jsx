// components/seller/SellerSidebar.jsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  FiHome,
  FiShoppingBag,
  FiClipboard,
  FiBarChart,
  FiSettings,
  FiUsers,
  FiDollarSign,
  FiBell,
  FiMessageCircle,
  FiTruck,
  FiStar,
  FiMenu,
  FiMapPin,
  FiZap,
  FiTrendingUp,
  FiAlertCircle,
  FiAward,
  FiLink,
  FiBook,
  FiUser,
  FiCreditCard,
  FiFileText,
} from 'react-icons/fi'
import { useAuth } from '../../lib/context/AuthContext'

const sidebarItems = [
  {
    name: 'Dashboard',
    href: '/seller/dashboard',
    icon: FiHome
  },
  {
    name: 'Products',
    href: '/seller/products',
    icon: FiShoppingBag
  },
  {
    name: 'Orders',
    href: '/seller/orders',
    icon: FiClipboard
  },
  {
    name: 'Insights',
    href: '/seller/insights',
    icon: FiTrendingUp,
    badge: 'New'
  },
  {
    name: 'Warehouses',
    href: '/seller/warehouses',
    icon: FiMapPin,
    badge: 'New'
  },
  {
    name: 'Inventory Alerts',
    href: '/seller/inventory-alerts',
    icon: FiAlertCircle,
    badge: 'New'
  },
  {
    name: 'Pricing Rules',
    href: '/seller/pricing-rules',
    icon: FiZap,
    badge: 'New'
  },
  {
    name: 'Analytics',
    href: '/seller/analytics',
    icon: FiBarChart
  },
  {
    name: 'Customers',
    href: '/seller/customers',
    icon: FiUsers
  },
  {
    name: 'Payouts',
    href: '/seller/payouts',
    icon: FiDollarSign
  },
  {
    name: 'Reviews',
    href: '/seller/reviews',
    icon: FiStar
  },
  {
    name: 'Messages',
    href: '/seller/messages',
    icon: FiMessageCircle
  },
  {
    name: 'Shipping',
    href: '/seller/shipping',
    icon: FiTruck
  },
  {
    name: 'Notifications',
    href: '/seller/notifications',
    icon: FiBell
  },
  {
    name: 'Suppliers',
    href: '/seller/suppliers',
    icon: FiUsers,
    badge: 'New'
  },
  {
    name: 'Advertising',
    href: '/seller/advertising',
    icon: FiTrendingUp,
    badge: 'New'
  },
  {
    name: 'Training',
    href: '/seller/training',
    icon: FiBook,
    badge: 'New'
  },
  {
    name: 'Integrations',
    href: '/seller/integrations',
    icon: FiLink,
    badge: 'New'
  },
  {
    name: 'Documents',
    href: '/seller/documents',
    icon: FiFileText,
    badge: 'New'
  },
  {
    name: 'Profile',
    href: '/seller/profile',
    icon: FiUser
  },
  {
    name: 'Bank Details',
    href: '/seller/bank-details',
    icon: FiCreditCard
  },
  {
    name: 'Subscription',
    href: '/seller/subscription',
    icon: FiAward,
    badge: 'New'
  },
  {
    name: 'Settings',
    href: '/seller/settings',
    icon: FiSettings
  }
]

export default function SellerSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const { user } = useAuth()

  return (
    <div className={`bg-white shadow-lg transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && (
          <Link href="/seller/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-semibold text-sm">OP</span>
            </div>
            <div>
              <span className="text-lg font-semibold text-blue-600">OnlinePlanet</span>
              <p className="text-xs text-gray-500">Seller Panel</p>
            </div>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <FiMenu className="w-5 h-5" />
        </button>
      </div>

      {!collapsed && user && (
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-900">{user.name}</p>
              <p className="text-sm text-gray-500">Seller Account</p>
            </div>
          </div>
        </div>
      )}

      <nav className="mt-6">
        <ul className="space-y-1 px-3">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                >
                  <div className="flex items-center">
                    <Icon className="w-5 h-5 mr-3" />
                    {!collapsed && <span>{item.name}</span>}
                  </div>
                  {!collapsed && item.badge && (
                    <span className="px-2 py-0.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs rounded-full font-semibold">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* {!collapsed && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 text-white text-center">
            <h3 className="font-semibold mb-1">Need Help?</h3>
            <p className="text-xs mb-3 opacity-90">Contact our seller support team</p>
            <Link
              href="/seller/support"
              className="inline-block bg-white text-blue-600 px-3 py-1 rounded text-xs font-medium"
            >
              Get Support
            </Link>
          </div>
        </div>
      )} */}
    </div>
  )
}
