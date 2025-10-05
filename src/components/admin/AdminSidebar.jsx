// components/admin/AdminSidebar.jsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  FiHome,
  FiUsers,
  FiBox,
  FiShoppingCart,
  FiDollarSign,
  FiStar,
  FiSettings,
  FiBarChart2,
  FiPackage,
  FiUserPlus,
  FiTrendingUp,
} from 'react-icons/fi'

export default function AdminSidebar() {
  const pathname = usePathname()

  const navItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: FiHome },
    { label: 'Users', href: '/admin/users', icon: FiUsers },
    { label: 'Sellers', href: '/admin/sellers', icon: FiUserPlus },
    { label: 'Products', href: '/admin/products', icon: FiBox },
    { label: 'Orders', href: '/admin/orders', icon: FiShoppingCart },
    { label: 'Payout Requests', href: '/admin/payouts', icon: FiDollarSign },
    { label: 'Reviews', href: '/admin/reviews', icon: FiStar },
    { label: 'Categories', href: '/admin/categories', icon: FiPackage },
    { label: 'Analytics', href: '/admin/analytics', icon: FiBarChart2 },
    { label: 'Marketing', href: '/admin/marketing', icon: FiTrendingUp },
    { label: 'Settings', href: '/admin/settings', icon: FiSettings },
  ]

  return (
    <aside className="w-64 bg-white border-r border-gray-200 shadow-sm flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-gray-200">
        <Link href="/admin/dashboard" className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">OP</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">OnlinePlanet</h1>
            <p className="text-xs text-gray-500">Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon className={`text-xl ${isActive ? 'text-blue-700' : 'text-gray-500'}`} />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          <p className="font-semibold">OnlinePlanet v1.0</p>
          <p>© 2025 All rights reserved</p>
        </div>
      </div>
    </aside>
  )
}
