// components/admin/AdminSidebar.jsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Box,
  ShoppingCart,
  DollarSign,
  Star,
  Settings,
  BarChart3,
  Package,
  UserPlus,
  TrendingUp,
  Gift,
  Activity,
  Truck,
  ChevronRight,
  Monitor,
  Crown
} from 'lucide-react'
import clsx from 'clsx'
import { motion } from 'framer-motion'

export default function AdminSidebar({ onNavigate, isMobile = false }) {
  const pathname = usePathname()

  const navItems = [
    { label: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Users', href: '/admin/users', icon: Users },
    { label: 'Sellers', href: '/admin/sellers', icon: UserPlus },
    { label: 'Categories', href: '/admin/categories', icon: Package },
    { label: 'Products', href: '/admin/products', icon: Box },
    { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { label: 'Payout Requests', href: '/admin/payouts', icon: DollarSign },
    { label: 'Reviews', href: '/admin/reviews', icon: Star },
    { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { label: 'Competitor Intel', href: '/admin/competitor-analysis', icon: TrendingUp },
    { label: 'Campaigns', href: '/admin/campaigns', icon: Gift },
    { label: 'Coupons', href: '/admin/coupons', icon: Gift },
    { label: 'Marketing', href: '/admin/marketing', icon: Activity },
    { label: 'Pending Pickups', href: '/admin/pending-pickups', icon: Truck },
    { label: 'Subscription Plans', href: '/admin/subscription-plans', icon: Crown },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
  ]

  const handleClick = () => {
    if (isMobile && onNavigate) {
      onNavigate()
    }
  }

  return (
    <aside
      className={clsx(
        'w-72 bg-[#0F172A] flex flex-col h-screen overflow-hidden transition-all duration-300 relative',
        isMobile ? 'shadow-2xl' : 'hidden lg:flex'
      )}
    >
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-20%] w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-20%] w-[300px] h-[300px] bg-indigo-600/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Brand Section */}
      <div className="px-8 py-10">
        <Link
          href="/admin/dashboard"
          className="flex items-center space-x-3 group"
          onClick={handleClick}
        >
          <div className="w-11 h-11 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:rotate-6 transition-transform duration-300">
            <span className="text-white font-semibold text-xl tracking-tighter">OP</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white leading-none tracking-tight">ONLINE PLANET</h1>
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-[0.2em] mt-1.5 opacity-60">Admin Terminal</p>
          </div>
        </Link>
      </div>

      {/* Navigation Matrix */}
      <nav className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar space-y-1.5 z-10">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              onClick={handleClick}
              className={clsx(
                'group flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-200 relative overflow-hidden',
                isActive
                  ? 'bg-blue-600/10 text-white shadow-sm border border-blue-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              )}
            >
              <div className="flex items-center space-x-3">
                <div className={clsx(
                  'w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300',
                  isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40' : 'bg-white/5 text-gray-500 group-hover:bg-white/10 group-hover:text-gray-300'
                )}>
                  <Icon size={18} />
                </div>
                <span className="text-[13px] font-semibold tracking-tight">{label}</span>
              </div>

              {isActive && (
                <motion.div layoutId="active-nav-indicator">
                  <ChevronRight size={14} className="text-blue-500" />
                </motion.div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* System Footer */}
      <div className="px-6 py-8 mt-auto border-t border-white/5 bg-white/[0.02]">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-semibold text-white tracking-widest uppercase">System Core v4.2</p>
            <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-widest">© 2025 OnlinePlanet</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-500">
            <Monitor size={14} />
          </div>
        </div>
      </div>
    </aside>
  )
}
