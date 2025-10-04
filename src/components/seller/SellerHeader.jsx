// components/seller/SellerHeader.jsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { 
  FiBell, 
  FiMessageCircle, 
  FiSearch,
  FiMenu 
} from 'react-icons/fi'
import { useAuth } from '../../lib/context/AuthContext'

export default function SellerHeader() {
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'New order received', time: '2 min ago', unread: true },
    { id: 2, message: 'Product approved', time: '1 hour ago', unread: true },
    { id: 3, message: 'Payment processed', time: '3 hours ago', unread: false }
  ])
  const [showNotifications, setShowNotifications] = useState(false)
  const { user } = useAuth()

  const unreadCount = notifications.filter(n => n.unread).length

  return (
    <header className="bg-white shadow-sm border-b px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
            <FiMenu className="w-6 h-6" />
          </button>
          
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products, orders..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Link 
            href="/seller/messages" 
            className="p-2 text-gray-600 hover:text-blue-600 transition-colors relative"
          >
            <FiMessageCircle className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
              3
            </span>
          </Link>

          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-gray-600 hover:text-blue-600 transition-colors relative"
            >
              <FiBell className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border py-2 z-50">
                <div className="px-4 py-2 border-b">
                  <h3 className="font-semibold">Notifications</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${
                        notification.unread ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                      }`}
                    >
                      <p className="text-sm text-gray-900">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 border-t">
                  <Link href="/seller/notifications" className="text-sm text-blue-600 hover:text-blue-800">
                    View all notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3 border-l pl-4">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">Seller</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
