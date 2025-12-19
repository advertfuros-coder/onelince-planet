// components/admin/ResponsiveChart.jsx
'use client'

import { ResponsiveContainer } from 'recharts'

/**
 * Responsive chart wrapper that adjusts height based on screen size
 * Mobile: 240px, Tablet: 280px, Desktop: 320px
 */
export default function ResponsiveChart({ children, mobileHeight = 240, desktopHeight = 280 }) {
    return (
        <div className="w-full">
            {/* Mobile */}
            <div className="block md:hidden">
                <ResponsiveContainer width="100%" height={mobileHeight}>
                    {children}
                </ResponsiveContainer>
            </div>

            {/* Tablet and Desktop */}
            <div className="hidden md:block">
                <ResponsiveContainer width="100%" height={desktopHeight}>
                    {children}
                </ResponsiveContainer>
            </div>
        </div>
    )
}
