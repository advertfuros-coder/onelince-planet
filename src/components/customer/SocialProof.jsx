'use client'
import React from 'react'
import { FiEye, FiShoppingBag, FiClock, FiTrendingUp, FiAlertCircle } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Real-time viewing indicator
 */
export function ViewingNowBadge({ count }) {
    if (!count || count === 0) return null

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-full"
        >
            <div className="relative">
                <FiEye className="w-4 h-4 text-blue-600" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            </div>
            <span className="text-xs font-medium text-blue-700">
                <span className="font-bold">{count}</span> {count === 1 ? 'person' : 'people'} viewing now
            </span>
        </motion.div>
    )
}

/**
 * Stock urgency indicator
 */
export function StockUrgencyBadge({ message, isLowStock }) {
    if (!message) return null

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${isLowStock
                ? 'bg-red-50 border border-red-200'
                : 'bg-green-50 border border-green-200'
                }`}
        >
            <FiAlertCircle className={`w-4 h-4 ${isLowStock ? 'text-red-600' : 'text-green-600'}`} />
            <span className={`text-xs font-semibold ${isLowStock ? 'text-red-700' : 'text-green-700'}`}>
                {message}
            </span>
        </motion.div>
    )
}

/**
 * Recent sales indicator
 */
export function RecentSalesBadge({ count }) {
    if (!count || count === 0) return null

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full"
        >
            <FiTrendingUp className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-medium text-emerald-700">
                <span className="font-bold">{count}</span> sold in last 24 hours
            </span>
        </motion.div>
    )
}

/**
 * Recent purchases notification popup
 */
export function RecentPurchaseNotification({ purchases }) {
    const [currentIndex, setCurrentIndex] = React.useState(0)
    const [isVisible, setIsVisible] = React.useState(false)

    React.useEffect(() => {
        if (!purchases || purchases.length === 0) return

        // Show first notification after 3 seconds
        const initialTimeout = setTimeout(() => {
            setIsVisible(true)
        }, 3000)

        // Cycle through purchases every 8 seconds
        const interval = setInterval(() => {
            setIsVisible(false)

            setTimeout(() => {
                setCurrentIndex((prev) => (prev + 1) % purchases.length)
                setIsVisible(true)
            }, 500)
        }, 8000)

        return () => {
            clearTimeout(initialTimeout)
            clearInterval(interval)
        }
    }, [purchases])

    if (!purchases || purchases.length === 0) return null

    const currentPurchase = purchases[currentIndex]

    return (
        <AnimatePresence>
            {isVisible && currentPurchase && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 50, scale: 0.9 }}
                    className="fixed bottom-24 left-4 md:left-8 z-50 max-w-sm"
                >
                    <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                            <FiShoppingBag className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900">
                                Someone from {currentPurchase.location}
                            </p>
                            <p className="text-xs text-gray-600 mt-0.5">
                                purchased this product
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                                <FiClock className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-500">{currentPurchase.timeAgo}</span>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsVisible(false)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

/**
 * Verified purchase badge for reviews
 */
export function VerifiedPurchaseBadge() {
    return (
        <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 border border-green-200 rounded-md">
            <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-xs font-medium text-green-700">Verified Purchase</span>
        </div>
    )
}

/**
 * Combined social proof section
 */
export function SocialProofSection({ viewingNow, soldLast24Hours, stockUrgency, isLowStock }) {
    return (
        <div className="flex flex-wrap items-center gap-2 mb-4">
            <ViewingNowBadge count={viewingNow} />
            <RecentSalesBadge count={soldLast24Hours} />
            <StockUrgencyBadge message={stockUrgency} isLowStock={isLowStock} />
        </div>
    )
}
