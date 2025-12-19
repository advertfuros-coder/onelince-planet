// components/admin/AdminHeader.jsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/AuthContext'
import { FiUser, FiLogOut, FiSettings, FiChevronDown, FiSearch } from 'react-icons/fi'
import MobileMenu from './MobileMenu'
import NotificationCenter from './NotificationCenter'

export default function AdminHeader() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [showDropdown, setShowDropdown] = useState(false)
  const [showMobileSearch, setShowMobileSearch] = useState(false)

  const handleLogout = () => {
    logout()
    router.push('/admin/login')
  }

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4">
        {/* Left: Mobile Menu + Logo/Title */}
        <div className="flex items-center space-x-3">
          <MobileMenu />
          <h1 className="text-lg md:text-xl font-bold text-gray-900 lg:hidden">
            Admin
          </h1>
        </div>

        {/* Center: Search Bar (Desktop) - Hint for Cmd+K */}
        <div className="hidden md:flex flex-1 max-w-xl mx-4">
          <button
            onClick={() => {
              // Trigger global search
              const event = new KeyboardEvent('keydown', {
                key: 'k',
                metaKey: true,
                bubbles: true,
              })
              document.dispatchEvent(event)
            }}
            className="w-full text-left"
          >
            <div className="relative w-full">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <div className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-pointer hover:border-blue-400 hover:bg-white transition-colors flex items-center justify-between">
                <span>Search... (Cmd+K)</span>
                <kbd className="hidden lg:inline-block px-2 py-1 text-xs bg-white border border-gray-300 rounded">⌘K</kbd>
              </div>
            </div>
          </button>
        </div>

        {/* Right Side - Notifications & Profile */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Mobile Search Button */}
          <button
            onClick={() => {
              const event = new KeyboardEvent('keydown', {
                key: 'k',
                metaKey: true,
                bubbles: true,
              })
              document.dispatchEvent(event)
            }}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Search"
          >
            <FiSearch size={22} />
          </button>

          {/* Notifications - Now using NotificationCenter */}
          <NotificationCenter />

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-2 md:space-x-3 px-2 md:px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-expanded={showDropdown}
              aria-label="User menu"
            >
              <div className="w-9 h-9 md:w-10 md:h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">{user?.name?.[0] || 'A'}</span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-gray-900">{user?.name || 'Admin'}</p>
                <p className="text-xs text-gray-500">{user?.email || 'admin@onlineplanet.com'}</p>
              </div>
              <FiChevronDown className="hidden md:block text-gray-600" />
            </button>

            {/* Profile Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-sm font-semibold text-gray-900">{user?.name || 'Admin'}</p>
                  <p className="text-xs text-gray-500">{user?.email || 'admin@onlineplanet.com'}</p>
                </div>
                <div className="py-2">
                  <button
                    onClick={() => router.push('/admin/profile')}
                    className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <FiUser />
                    <span>My Profile</span>
                  </button>
                  <button
                    onClick={() => router.push('/admin/settings')}
                    className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <FiSettings />
                    <span>Settings</span>
                  </button>
                </div>
                <div className="border-t border-gray-200 py-2">
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <FiLogOut />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Bar (Expandable) */}
      {showMobileSearch && (
        <div className="px-4 pb-3 md:hidden">
          <div className="relative w-full">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  )
}
