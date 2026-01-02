'use client'
import { useState, useEffect } from 'react'
import { FiMapPin, FiX } from 'react-icons/fi'
import { requestLocationPermission } from '@/lib/utils/geolocation'
import { useCurrency } from '@/lib/context/CurrencyContext'

export default function LocationPermissionModal() {
    const [isOpen, setIsOpen] = useState(false)
    const { country, changeCountry } = useCurrency()

    useEffect(() => {
        // Check if we should show the modal
        const hasAskedPermission = localStorage.getItem('locationPermissionAsked')
        const savedCountry = localStorage.getItem('userCountry')

        // Show modal if:
        // 1. Haven't asked for permission before
        // 2. No country is saved
        if (!hasAskedPermission && !savedCountry) {
            // Show modal after a short delay for better UX
            setTimeout(() => {
                setIsOpen(true)
            }, 2000)
        }
    }, [])

    const handleAllow = () => {
    requestLocationPermission(
      async (position) => {
        // Success - location detected
        const { latitude, longitude } = position.coords
        
        // Reverse geocode to get full address
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          )
          const data = await response.json()
          const address = data.address || {}
          
          const countryCode = address.country_code?.toUpperCase()
          const city = address.city || address.town || address.village || address.suburb || ''
          const state = address.state || ''
          const postcode = address.postcode || ''
          
          // Create formatted address
          const addressParts = [
            address.road || address.neighbourhood,
            address.suburb || address.city_district,
            city,
            state,
            postcode
          ].filter(Boolean)
          
          const formattedAddress = addressParts.slice(0, 3).join(', ') // First 3 parts for header
          
          // Save all location data
          if (countryCode === 'IN' || countryCode === 'AE') {
            changeCountry(countryCode)
            localStorage.setItem('userCountry', countryCode)
          }
          
          if (city) {
            localStorage.setItem('userLocation', formattedAddress || city)
          }
          
          if (postcode) {
            localStorage.setItem('userPincode', postcode)
          }
          
          // Dispatch event for header to update
          window.dispatchEvent(new CustomEvent('locationUpdated'))
          
        } catch (error) {
          console.error('Failed to detect location:', error)
        }

        localStorage.setItem('locationPermissionAsked', 'true')
        setIsOpen(false)
      },
      () => {
        // Denied - use IP-based detection or keep default
        localStorage.setItem('locationPermissionAsked', 'true')
        setIsOpen(false)
      }
    )
  }

    const handleDeny = () => {
        localStorage.setItem('locationPermissionAsked', 'true')
        setIsOpen(false)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-300">
                {/* Close button */}
                <button
                    onClick={handleDeny}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <FiX className="w-5 h-5" />
                </button>

                {/* Icon */}
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiMapPin className="w-8 h-8 text-blue-600" />
                </div>

                {/* Content */}
                <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
                    Enable Location
                </h2>
                <p className="text-gray-600 text-center mb-6">
                    We'll use your location to show you products and prices relevant to your region.
                </p>

                {/* Benefits */}
                <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-3">
                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <p className="text-sm text-gray-700">See products available in your country</p>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <p className="text-sm text-gray-700">View prices in your local currency</p>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <p className="text-sm text-gray-700">Get accurate delivery estimates</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={handleDeny}
                        className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        Not Now
                    </button>
                    <button
                        onClick={handleAllow}
                        className="flex-1 px-4 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                    >
                        Allow Location
                    </button>
                </div>

                {/* Privacy note */}
                <p className="text-xs text-gray-500 text-center mt-4">
                    We respect your privacy. Your location is only used to enhance your shopping experience.
                </p>
            </div>
        </div>
    )
}
