'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { detectUserCountry } from '../utils/geolocation'

const CurrencyContext = createContext()

// Exchange rates (can be updated from API in future)
const EXCHANGE_RATES = {
    INR_TO_AED: 0.044,  // 1 INR = 0.044 AED
    AED_TO_INR: 22.73   // 1 AED = 22.73 INR
}

const CURRENCY_CONFIG = {
    IN: {
        code: 'INR',
        symbol: '₹',
        name: 'Indian Rupee',
        country: 'IN',
        countryName: 'India'
    },
    AE: {
        code: 'AED',
        symbol: 'AED',
        name: 'UAE Dirham',
        country: 'AE',
        countryName: 'UAE'
    }
}

export function CurrencyProvider({ children }) {
    const [country, setCountry] = useState('IN') // Default to India
    const [isLoaded, setIsLoaded] = useState(false)
    const [isDetecting, setIsDetecting] = useState(false)

    // Auto-detect country on first load
    useEffect(() => {
        async function initializeCountry() {
            setIsDetecting(true)
            try {
                const detectedCountry = await detectUserCountry()
                setCountry(detectedCountry)
            } catch (error) {
                console.error('Country detection failed:', error)
                // Keep default 'IN'
            } finally {
                setIsDetecting(false)
                setIsLoaded(true)
            }
        }

        initializeCountry()
    }, [])

    // Save country to localStorage when it changes
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('userCountry', country)
            // Trigger event for other components to update
            window.dispatchEvent(new CustomEvent('countryChanged', { detail: { country } }))
        }
    }, [country, isLoaded])

    // Get currency config for current country
    const currencyConfig = CURRENCY_CONFIG[country]

    // Convert price from INR to current currency
    const convertPrice = (priceInINR) => {
        if (!priceInINR) return 0
        if (country === 'IN') return priceInINR
        // Convert INR to AED
        return Math.round(priceInINR * EXCHANGE_RATES.INR_TO_AED)
    }

    // Format price with currency symbol
    const formatPrice = (priceInINR, options = {}) => {
        const {
            showSymbol = true,
            decimals = country === 'AE' ? 0 : 0
        } = options

        const convertedPrice = convertPrice(priceInINR)
        const formattedNumber = convertedPrice.toLocaleString('en-IN', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        })

        if (showSymbol) {
            return `${currencyConfig.symbol} ${formattedNumber}`
        }
        return formattedNumber
    }

    // Change country
    const changeCountry = (newCountry) => {
        if (newCountry === 'IN' || newCountry === 'AE') {
            setCountry(newCountry)
        }
    }

    const value = {
        country,
        currencyConfig,
        convertPrice,
        formatPrice,
        changeCountry,
        isLoaded,
        isDetecting,
        exchangeRates: EXCHANGE_RATES
    }

    return (
        <CurrencyContext.Provider value={value}>
            {children}
        </CurrencyContext.Provider>
    )
}

export function useCurrency() {
    const context = useContext(CurrencyContext)
    if (!context) {
        throw new Error('useCurrency must be used within CurrencyProvider')
    }
    return context
}
