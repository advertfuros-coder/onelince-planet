'use client'
import { useCurrency } from '@/lib/context/CurrencyContext'

export default function Price({ amount, className = '', showSymbol = true }) {
    const { formatPrice } = useCurrency()

    if (!amount && amount !== 0) return null

    return (
        <span className={className}>
            {formatPrice(amount, { showSymbol })}
        </span>
    )
}

// Strikethrough price component for original prices
export function StrikePrice({ amount, className = '' }) {
    const { formatPrice } = useCurrency()

    if (!amount && amount !== 0) return null

    return (
        <span className={`line-through ${className}`}>
            {formatPrice(amount)}
        </span>
    )
}
