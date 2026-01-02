'use client'
import React, { createContext, useContext, useState, useEffect } from 'react'

const RegionContext = createContext()

export const REGIONS = {
    AE: {
        code: 'AE',
        currency: 'AED',
        label: 'UAE',
        flag: '🇦🇪',
        locale: 'en-AE',
        symbol: 'AED'
    },
    IN: {
        code: 'IN',
        currency: 'INR',
        label: 'India',
        flag: '🇮🇳',
        locale: 'en-IN',
        symbol: '₹'
    }
}

export function RegionProvider({ children }) {
    const [region, setRegion] = useState(REGIONS.AE) // Default to UAE (Online Planet Dubai)

    useEffect(() => {
        // Try to get region from local storage or cookie
        const savedRegion = localStorage.getItem('op-region')
        if (savedRegion && REGIONS[savedRegion]) {
            setRegion(REGIONS[savedRegion])
        } else {
            // In a real app, you'd use IP-based detection here
            // For now, we remain on UAE as default
        }
    }, [])

    const changeRegion = (regionCode) => {
        if (REGIONS[regionCode]) {
            setRegion(REGIONS[regionCode])
            localStorage.setItem('op-region', regionCode)
            // Set cookie for server-side detection
            document.cookie = `op-region=${regionCode}; path=/; max-age=31536000; SameSite=Lax`
            // Reload to ensure all components and server-side data sync up
            window.location.reload()
        }
    }

    return (
        <RegionContext.Provider value={{ region, changeRegion, REGIONS }}>
            {children}
        </RegionContext.Provider>
    )
}

export const useRegion = () => {
    const context = useContext(RegionContext)
    if (!context) {
        throw new Error('useRegion must be used within a RegionProvider')
    }
    return context
}
