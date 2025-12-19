'use client'

import { useState, useEffect } from 'react'
import {
    FiBell,
    FiX,
    FiCheck,
    FiCheckCircle,
    FiAlertCircle,
    FiInfo,
    FiPackage,
    FiShoppingCart,
    FiUsers,
    FiDollarSign,
} from 'react-icons/fi'
import clsx from 'clsx'
import { useAuth } from '@/lib/context/AuthContext'

/**
 * Notification Center Component
 * Displays notifications with mark as read, delete, and real-time updates
 */
export default function NotificationCenter() {
    const { user } = useAuth()
    const [isOpen, setIsOpen] = useState(false)
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(false)

    // Fetch notifications
    const fetchNotifications = async () => {
        if (!user) return

        setLoading(true)
        try {
            const response = await fetch('/api/admin/notifications?limit=20')
            const data = await response.json()

            if (data.success) {
                setNotifications(data.notifications || [])
                setUnreadCount(data.unreadCount || 0)
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error)
        } finally {
            setLoading(false)
        }
    }

    // Load notifications on mount and when opened
    useEffect(() => {
        if (user) {
            fetchNotifications()
        }
    }, [user])

    useEffect(() => {
        if (isOpen && user) {
            fetchNotifications()
        }
    }, [isOpen])

    // Mark as read
    const markAsRead = async (notificationId) => {
        try {
            const response = await fetch(`/api/admin/notifications/${notificationId}`, {
                method: 'PATCH',
            })

            if (response.ok) {
                setNotifications((prev) =>
                    prev.map((n) =>
                        n._id === notificationId ? { ...n, read: true, readAt: new Date() } : n
                    )
                )
                setUnreadCount((prev) => Math.max(0, prev - 1))
            }
        } catch (error) {
            console.error('Failed to mark as read:', error)
        }
    }

    // Mark all as read
    const markAllAsRead = async () => {
        try {
            const response = await fetch('/api/admin/notifications/mark-all-read', {
                method: 'POST',
            })

            if (response.ok) {
                setNotifications((prev) =>
                    prev.map((n) => ({ ...n, read: true, readAt: new Date() }))
                )
                setUnreadCount(0)
            }
        } catch (error) {
            console.error('Failed to mark all as read:', error)
        }
    }

    // Delete notification
    const deleteNotification = async (notificationId) => {
        try {
            const response = await fetch(`/api/admin/notifications/${notificationId}`, {
                method: 'DELETE',
            })

            if (response.ok) {
                setNotifications((prev) => prev.filter((n) => n._id !== notificationId))
                const wasUnread = notifications.find((n) => n._id === notificationId)?.read === false
                if (wasUnread) {
                    setUnreadCount((prev) => Math.max(0, prev - 1))
                }
            }
        } catch (error) {
            console.error('Failed to delete notification:', error)
        }
    }

    return (
        <>
            {/* Notification Bell Button */}
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
                >
                    <FiBell size={22} />
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>

                {/* Notifications Dropdown */}
                {isOpen && (
                    <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[80vh] flex flex-col">
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900">Notifications</h3>
                            <div className="flex items-center space-x-2">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        Mark all read
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1 hover:bg-gray-100 rounded"
                                >
                                    <FiX size={18} className="text-gray-400" />
                                </button>
                            </div>
                        </div>

                        {/* Notifications List */}
                        <div className="overflow-y-auto flex-1">
                            {loading ? (
                                <div className="p-8 text-center">
                                    <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                    <p className="mt-2 text-sm text-gray-500">Loading...</p>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="p-8 text-center">
                                    <FiBell className="mx-auto text-gray-300 mb-3" size={48} />
                                    <p className="text-gray-500">No notifications</p>
                                </div>
                            ) : (
                                <div>
                                    {notifications.map((notification) => (
                                        <NotificationItem
                                            key={notification._id}
                                            notification={notification}
                                            onMarkAsRead={() => markAsRead(notification._id)}
                                            onDelete={() => deleteNotification(notification._id)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-center">
                                <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                                    View All Notifications
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Click outside to close */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    )
}

// Individual Notification Item
function NotificationItem({ notification, onMarkAsRead, onDelete }) {
    const getIcon = () => {
        switch (notification.type) {
            case 'NEW_ORDER':
                return <FiShoppingCart className="text-blue-600" size={20} />
            case 'SELLER_REGISTRATION':
                return <FiUsers className="text-purple-600" size={20} />
            case 'PRODUCT_APPROVAL':
                return <FiPackage className="text-green-600" size={20} />
            case 'PAYOUT_REQUEST':
                return <FiDollarSign className="text-yellow-600" size={20} />
            case 'REVIEW_FLAGGED':
                return <FiAlertCircle className="text-red-600" size={20} />
            default:
                return <FiInfo className="text-gray-600" size={20} />
        }
    }

    const getPriorityColor = () => {
        switch (notification.priority) {
            case 'urgent':
                return 'border-l-red-500'
            case 'high':
                return 'border-l-orange-500'
            case 'medium':
                return 'border-l-blue-500'
            default:
                return 'border-l-gray-300'
        }
    }

    const timeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000)
        if (seconds < 60) return 'Just now'
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
        return `${Math.floor(seconds / 86400)}d ago`
    }

    return (
        <div
            className={clsx(
                'px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer border-l-4',
                getPriorityColor(),
                !notification.read && 'bg-blue-50'
            )}
            onClick={notification.actionUrl ? () => window.location.href = notification.actionUrl : undefined}
        >
            <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">{getIcon()}</div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <p className={clsx('text-sm', notification.read ? 'text-gray-700' : 'font-semibold text-gray-900')}>
                                {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                            <p className="text-xs text-gray-400 mt-1">{timeAgo(notification.createdAt)}</p>
                        </div>
                        <div className="flex items-center space-x-1 ml-2">
                            {!notification.read && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onMarkAsRead()
                                    }}
                                    className="p-1 hover:bg-gray-200 rounded"
                                    title="Mark as read"
                                >
                                    <FiCheck size={16} className="text-gray-400 hover:text-green-600" />
                                </button>
                            )}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onDelete()
                                }}
                                className="p-1 hover:bg-gray-200 rounded"
                                title="Delete"
                            >
                                <FiX size={16} className="text-gray-400 hover:text-red-600" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
