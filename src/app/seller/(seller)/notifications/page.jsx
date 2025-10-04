// seller/(seller)/notifications/page.jsx
'use client'
import { useState, useEffect } from 'react'
import { 
  FiBell,
  FiCheck,
  FiX,
  FiSettings,
  FiFilter
} from 'react-icons/fi'
import Button from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils'
 
export default function SellerNotifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    try {
      // Mock notifications data
      const mockNotifications = [
        {
          id: '1',
          type: 'order',
          title: 'New Order Received',
          message: 'You have received a new order #OP001234 worth ₹2,499',
          timestamp: '2025-09-30T10:30:00Z',
          isRead: false,
          actionUrl: '/seller/orders/OP001234'
        },
        {
          id: '2',
          type: 'payment',
          title: 'Payment Received',
          message: 'Payment of ₹15,000 has been credited to your account',
          timestamp: '2025-09-30T09:15:00Z',
          isRead: false,
          actionUrl: '/seller/revenue'
        },
        {
          id: '3',
          type: 'product',
          title: 'Product Approved',
          message: 'Your product "Wireless Headphones" has been approved and is now live',
          timestamp: '2025-09-29T18:45:00Z',
          isRead: true,
          actionUrl: '/seller/products'
        },
        {
          id: '4',
          type: 'review',
          title: 'New Review',
          message: 'John Doe left a 5-star review for "Smart Watch Pro"',
          timestamp: '2025-09-29T16:20:00Z',
          isRead: true,
          actionUrl: '/seller/reviews'
        },
        {
          id: '5',
          type: 'system',
          title: 'System Maintenance',
          message: 'Scheduled maintenance on Oct 1, 2025 from 2:00 AM to 4:00 AM IST',
          timestamp: '2025-09-29T12:00:00Z',
          isRead: true
        }
      ]
      setNotifications(mockNotifications)
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const getNotificationIcon = (type) => {
    const iconClass = "w-5 h-5"
    switch (type) {
      case 'order':
        return <FiBell className={`${iconClass} text-blue-600`} />
      case 'payment':
        return <FiBell className={`${iconClass} text-green-600`} />
      case 'product':
        return <FiBell className={`${iconClass} text-purple-600`} />
      case 'review':
        return <FiBell className={`${iconClass} text-yellow-600`} />
      case 'system':
        return <FiBell className={`${iconClass} text-gray-600`} />
      default:
        return <FiBell className={`${iconClass} text-gray-600`} />
    }
  }

  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    )
  }

  const deleteNotification = (notificationId) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== notificationId)
    )
  }

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.isRead
    if (filter === 'read') return notification.isRead
    return true
  })

  const unreadCount = notifications.filter(n => !n.isRead).length

  if (loading) {
    return <div className="p-6">Loading notifications...</div>
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600">
            {unreadCount > 0 ? `You have ${unreadCount} unread notifications` : 'All caught up!'}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead}>
              <FiCheck className="w-4 h-4 mr-1" />
              Mark all as read
            </Button>
          )}
          <Button variant="outline">
            <FiSettings className="w-4 h-4 mr-1" />
            Settings
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center space-x-4">
          <FiFilter className="w-5 h-5 text-gray-400" />
          <div className="flex space-x-2">
            {['all', 'unread', 'read'].map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  filter === filterOption
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-2">
        {filteredNotifications.map((notification) => (
          <div
            key={notification.id}
            className={`bg-white p-4 rounded-lg shadow-sm border transition-colors ${
              notification.isRead ? 'border-gray-200' : 'border-blue-200 bg-blue-50'
            }`}
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 pt-1">
                {getNotificationIcon(notification.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className={`text-sm font-medium ${
                      notification.isRead ? 'text-gray-900' : 'text-gray-900'
                    }`}>
                      {notification.title}
                    </h3>
                    <p className={`text-sm mt-1 ${
                      notification.isRead ? 'text-gray-600' : 'text-gray-700'
                    }`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(notification.timestamp).toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Mark as read
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="text-gray-400 hover:text-red-600 p-1"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {notification.actionUrl && (
                  <div className="mt-3">
                    <a
                      href={notification.actionUrl}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      View Details →
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {filteredNotifications.length === 0 && (
          <div className="text-center py-12">
            <FiBell className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter === 'unread' ? 'All notifications have been read' : 'You\'re all caught up!'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
