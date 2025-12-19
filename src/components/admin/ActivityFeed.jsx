'use client'

import { useState, useEffect } from 'react'
import {
    FiActivity,
    FiShoppingCart,
    FiPackage,
    FiUsers,
    FiUserPlus,
    FiDollarSign,
    FiEdit,
    FiTrash2,
    FiCheckCircle,
    FiXCircle,
    FiClock,
} from 'react-icons/fi'
import clsx from 'clsx'

/**
 * Activity Feed Component
 * Real-time activity log for admin panel
 * Shows recent actions, changes, and events
 */
export default function ActivityFeed({ limit = 10, showFilters = true, compact = false }) {
    const [activities, setActivities] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all') // 'all' | 'orders' | 'products' | 'sellers' | 'users'

    useEffect(() => {
        fetchActivities()
    }, [filter, limit])

    const fetchActivities = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({ limit: limit.toString() })
            if (filter !== 'all') params.append('type', filter)

            const response = await fetch(`/api/admin/activity?${params}`)
            const data = await response.json()

            if (data.success) {
                setActivities(data.activities || [])
            }
        } catch (error) {
            console.error('Failed to fetch activities:', error)
        } finally {
            setLoading(false)
        }
    }

    const getActivityIcon = (type, action) => {
        const iconProps = { size: compact ? 16 : 20 }

        switch (type) {
            case 'order':
                if (action === 'created') return <FiShoppingCart {...iconProps} className="text-blue-600" />
                if (action === 'updated') return <FiEdit {...iconProps} className="text-yellow-600" />
                if (action === 'cancelled') return <FiXCircle {...iconProps} className="text-red-600" />
                if (action === 'completed') return <FiCheckCircle {...iconProps} className="text-green-600" />
                return <FiShoppingCart {...iconProps} className="text-gray-600" />

            case 'product':
                if (action === 'created') return <FiPackage {...iconProps} className="text-green-600" />
                if (action === 'updated') return <FiEdit {...iconProps} className="text-yellow-600" />
                if (action === 'deleted') return <FiTrash2 {...iconProps} className="text-red-600" />
                if (action === 'approved') return <FiCheckCircle {...iconProps} className="text-green-600" />
                return <FiPackage {...iconProps} className="text-gray-600" />

            case 'seller':
                if (action === 'registered') return <FiUserPlus {...iconProps} className="text-blue-600" />
                if (action === 'approved') return <FiCheckCircle {...iconProps} className="text-green-600" />
                if (action === 'rejected') return <FiXCircle {...iconProps} className="text-red-600" />
                return <FiUserPlus {...iconProps} className="text-gray-600" />

            case 'user':
                return <FiUsers {...iconProps} className="text-purple-600" />

            case 'payout':
                return <FiDollarSign {...iconProps} className="text-green-600" />

            default:
                return <FiActivity {...iconProps} className="text-gray-600" />
        }
    }

    const getActivityColor = (type, action) => {
        if (action === 'created' || action === 'approved' || action === 'completed') return 'border-l-green-500'
        if (action === 'updated') return 'border-l-yellow-500'
        if (action === 'deleted' || action === 'cancelled' || action === 'rejected') return 'border-l-red-500'
        return 'border-l-blue-500'
    }

    const timeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000)
        if (seconds < 60) return 'Just now'
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
        return new Date(date).toLocaleDateString()
    }

    if (loading) {
        return (
            <div className={clsx('bg-white rounded-lg border border-gray-200', compact ? 'p-4' : 'p-6')}>
                <div className="animate-pulse space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-gray-200 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-3/4" />
                                <div className="h-3 bg-gray-200 rounded w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className={clsx('bg-white rounded-lg border border-gray-200', compact ? 'p-4' : 'p-6')}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <FiActivity size={20} className="text-gray-700" />
                    <h3 className={clsx('font-semibold text-gray-900', compact ? 'text-sm' : 'text-lg')}>
                        Activity Feed
                    </h3>
                </div>

                {showFilters && (
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All</option>
                        <option value="order">Orders</option>
                        <option value="product">Products</option>
                        <option value="seller">Sellers</option>
                        <option value="user">Users</option>
                        <option value="payout">Payouts</option>
                    </select>
                )}
            </div>

            {/* Activity List */}
            <div className="space-y-1">
                {activities.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <FiActivity size={48} className="mx-auto mb-3 text-gray-300" />
                        <p>No recent activity</p>
                    </div>
                ) : (
                    activities.map((activity) => (
                        <div
                            key={activity._id}
                            className={clsx(
                                'flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border-l-4',
                                getActivityColor(activity.entityType, activity.action)
                            )}
                        >
                            {/* Icon */}
                            <div className={clsx('flex-shrink-0', compact ? 'mt-0.5' : 'mt-1')}>
                                {getActivityIcon(activity.entityType, activity.action)}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <p className={clsx('text-gray-900', compact ? 'text-xs' : 'text-sm')}>
                                    <span className="font-medium">{activity.userName || 'System'}</span>{' '}
                                    <span className="text-gray-600">{activity.description}</span>
                                </p>

                                {activity.metadata && !compact && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        {JSON.stringify(activity.metadata).slice(0, 100)}
                                    </p>
                                )}

                                <div className="flex items-center space-x-3 mt-1">
                                    <span className={clsx('text-gray-400', compact ? 'text-xs' : 'text-xs')}>
                                        <FiClock size={12} className="inline mr-1" />
                                        {timeAgo(activity.createdAt)}
                                    </span>

                                    {activity.entityId && (
                                        <button className="text-xs text-blue-600 hover:text-blue-800">
                                            View Details →
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* View All */}
            {activities.length > 0 && !compact && (
                <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                    <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                        View All Activity →
                    </button>
                </div>
            )}
        </div>
    )
}
