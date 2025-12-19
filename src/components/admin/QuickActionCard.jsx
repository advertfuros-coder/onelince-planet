'use client'

import { FiArrowRight } from 'react-icons/fi'
import clsx from 'clsx'

/**
 * Quick Action Card
 * One-click shortcuts for common admin tasks
 * Inspired by Shopify and Stripe dashboard quick actions
 */
export default function QuickActionCard({
    title,
    description,
    icon,
    iconColor = 'text-blue-600',
    iconBgColor = 'bg-blue-100',
    onClick,
    badge,
    href,
    disabled = false,
}) {
    const handleClick = () => {
        if (disabled) return
        if (onClick) onClick()
        if (href) window.location.href = href
    }

    return (
        <button
            onClick={handleClick}
            disabled={disabled}
            className={clsx(
                'group relative w-full text-left',
                'bg-white rounded-xl border-2 border-gray-200',
                'p-5 transition-all duration-200',
                disabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:border-blue-500 hover:shadow-lg cursor-pointer'
            )}
        >
            {/* Badge (if any) */}
            {badge && (
                <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {badge}
                    </span>
                </div>
            )}

            {/* Icon */}
            <div className={clsx('inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4', iconBgColor)}>
                <span className={clsx('text-2xl', iconColor)}>{icon}</span>
            </div>

            {/* Content */}
            <h3 className="text-lg font-semibold text-gray-900 mb-1 pr-8">{title}</h3>
            <p className="text-sm text-gray-600 mb-4">{description}</p>

            {/* Arrow */}
            <div className="flex items-center text-blue-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Go</span>
                <FiArrowRight className="ml-1" size={16} />
            </div>
        </button>
    )
}

/**
 * Quick Action Grid
 * Container for quick action cards
 */
export function QuickActionGrid({ children, className = '' }) {
    return (
        <div className={clsx('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4', className)}>
            {children}
        </div>
    )
}
