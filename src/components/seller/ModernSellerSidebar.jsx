'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package,
  LayoutDashboard,
  ShoppingBag,
  ClipboardList,
  LineChart,
  Users,
  Wallet,
  Star,
  MessageSquare,
  Truck,
  Bell,
  Settings,
  BookOpen,
  Link2,
  FileText,
  User,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Search,
  Menu,
  X,
  MapPin,
  TrendingUp,
  AlertCircle,
  Zap,
  Award,
  Book,
  Box,
  Target,
  RefreshCcw,
  Ticket
} from 'lucide-react'
import { useAuth } from '@/lib/context/AuthContext'

const menuSections = [
  {
    title: 'Overview',
    items: [
      { name: 'Dashboard', href: '/seller/dashboard', icon: LayoutDashboard },
      { name: 'Analytics', href: '/seller/analytics', icon: LineChart },
      // { name: 'Insights', href: '/seller/insights', icon: TrendingUp, badge: 'New' },
      // { name: 'Reports', href: '/seller/reports', icon: FileText, badge: 'New' },
    ]
  },
  {
    title: 'Catalog & Inventory',
    items: [
      { name: 'Products', href: '/seller/products', icon: ShoppingBag },
      { name: 'Inventory Master', href: '/seller/inventory', icon: Package, badge: 'Live' },
      // { name: 'Warehouses', href: '/seller/warehouses', icon: MapPin, badge: 'New' },
      // { name: 'Inventory Alerts', href: '/seller/inventory-alerts', icon: AlertCircle, badge: 'New' },
      // { name: 'Pricing Rules', href: '/seller/pricing-rules', icon: Zap, badge: 'New' },
    ]
  },
  {
    title: 'Sales & Logistics',
    items: [
      { name: 'Orders', href: '/seller/orders', icon: ClipboardList },
      { name: 'Returns', href: '/seller/returns', icon: RefreshCcw, badge: 'New' },
      { name: 'Shipping', href: '/seller/shipping', icon: Truck },
      // { name: 'Customers', href: '/seller/customers', icon: Users },
      { name: 'Payouts', href: '/seller/payouts', icon: Wallet },
    ]
  },
  {
    title: 'Marketing',
    items: [
      // { name: 'Advertising', href: '/seller/advertising', icon: Target, badge: 'New' },
      // { name: 'Coupons', href: '/seller/coupons', icon: Ticket, badge: 'New' },
      // { name: 'Suppliers', href: '/seller/suppliers', icon: Users, badge: 'New' },
      { name: 'Reviews', href: '/seller/reviews', icon: Star },
    ]
  },
  {
    title: 'Tools & Learning',
    items: [
      // { name: 'Messages', href: '/seller/messages', icon: MessageSquare, badge: '4' },
      // { name: 'Notifications', href: '/seller/notifications', icon: Bell, badge: '12' },
      // { name: 'Training', href: '/seller/training', icon: Book, badge: 'New' },
      // { name: 'Integrations', href: '/seller/integrations', icon: Link2, badge: 'New' },
      { name: 'Documents', href: '/seller/documents', icon: FileText, badge: 'New' },
    ]
  },
  {
    title: 'Account',
    items: [
      // { name: 'Profile', href: '/seller/profile', icon: User },
      { name: 'Bank Details', href: '/seller/bank-details', icon: CreditCard },
      // { name: 'Subscription', href: '/seller/subscription', icon: Award, badge: 'New' },
      { name: 'Settings', href: '/seller/settings', icon: Settings },
    ]
  },
]

export default function ModernSellerSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const pathname = usePathname()
  const { user } = useAuth()

  // Filter items based on search
  const filteredSections = menuSections.map(section => ({
    ...section,
    items: section.items.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(section => section.items.length > 0)

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-xl shadow-lg border border-gray-100"
      >
        {mobileOpen ? <X className="w-5 h-5 text-gray-900" /> : <Menu className="w-5 h-5 text-gray-900" />}
      </button>

      {/* Backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: collapsed ? '80px' : '280px',
          x: mobileOpen || (typeof window !== 'undefined' && window.innerWidth >= 1024) ? 0 : -280
        }}
        className="fixed lg:sticky top-0 left-0 h-screen bg-white border-r border-gray-100 shadow-sm z-[70] flex flex-col transition-all duration-300 overflow-hidden"
      >
        {/* Brand Section */}
        <div className="p-6 flex items-center justify-between shrink-0">
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center space-x-3"
              >
                <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <span className="text-white font-semibold text-xs">OP</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-lg text-gray-900 leading-none">Online Planet</span>
                  <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-widest mt-1">Seller Hub</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-2 rounded-xl hover:bg-gray-50 text-gray-400 hover:text-blue-600 transition-colors"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* Search Bar - Only in expanded */}
        {!collapsed && (
          <div className="px-6 mb-6">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools..."
                className="w-full bg-gray-50 border-none rounded-2xl py-2.5 pl-10 pr-4 text-xs font-medium focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-400"
              />
            </div>
          </div>
        )}

        {/* Navigation Content */}
        <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-6 space-y-8">
          {filteredSections.map((section, sIndex) => (
            <div key={section.title} className="space-y-2">
              <AnimatePresence>
                {!collapsed && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.2em] px-3 mb-4"
                  >
                    {section.title}
                  </motion.p>
                )}
              </AnimatePresence>

              <nav className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center px-3 py-3 rounded-2xl transition-all relative group ${isActive
                        ? 'text-blue-700 bg-blue-50/80 shadow-sm'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 underline-none'
                        }`}
                    >
                      <Icon size={isActive ? 22 : 20} className={isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-900'} />
                      <AnimatePresence>
                        {!collapsed && (
                          <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="ml-4 font-semibold text-[13px] tracking-tight whitespace-nowrap"
                          >
                            {item.name}
                          </motion.span>
                        )}
                      </AnimatePresence>
                      {isActive && (
                        <motion.div
                          layoutId="active-indicator"
                          className="absolute left-0 w-1.5 h-6 bg-blue-600 rounded-r-full"
                        />
                      )}
                      {!collapsed && item.badge && (
                        <span className={`ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full ${item.badge === 'New' ? 'bg-blue-600 text-white' : 'bg-gray-900 text-white'
                          }`}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* User / Logout Section */}
        <div className="p-4 border-t border-gray-50 mt-auto">
          <div className={`
            flex items-center p-2 rounded-2xl bg-gray-50/50 border border-gray-100/50
            ${collapsed ? 'justify-center' : 'justify-between'}
          `}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-semibold text-xs shadow-lg shadow-blue-500/20">
                {user?.name?.charAt(0).toUpperCase() || 'S'}
              </div>
              {!collapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-gray-900 truncate">{user?.name || 'Seller User'}</span>
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-tighter">Verified Merchant</span>
                </div>
              )}
            </div>
            {!collapsed && (
              <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                <ChevronRight size={18} />
              </button>
            )}
          </div>
        </div>
      </motion.aside>
    </>
  )
}
