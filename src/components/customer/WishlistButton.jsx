// components/customer/WishlistButton.jsx
'use client'

import { FiHeart } from 'react-icons/fi'
import { useWishlist } from '@/lib/hooks/useWishlist'

export default function WishlistButton({ productId, className = '', showText = false, size = 'md' }) {
    const { isInWishlist, toggleWishlist, actionLoading } = useWishlist()
    const inWishlist = isInWishlist(productId)

    const sizeClasses = {
        sm: 'p-1.5 text-sm',
        md: 'p-2 text-base',
        lg: 'p-3 text-lg'
    }

    const handleClick = async (e) => {
        e.preventDefault()
        e.stopPropagation()
        await toggleWishlist(productId)
    }

    return (
        <button
            onClick={handleClick}
            disabled={actionLoading}
            className={`
        ${sizeClasses[size]}
        ${inWishlist
                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }
        border border-gray-200 rounded-lg
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center space-x-2
        ${className}
      `}
            title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
            <FiHeart
                className={`${inWishlist ? 'fill-current' : ''} transition-all`}
                strokeWidth={inWishlist ? 0 : 2}
            />
            {showText && (
                <span className="text-sm font-medium">
                    {inWishlist ? 'Saved' : 'Save'}
                </span>
            )}
        </button>
    )
}
