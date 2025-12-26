'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  FiShoppingCart,
  FiUser,
  FiSearch,
  FiMenu,
  FiX,
  FiHeart,
  FiChevronDown,
  FiMapPin,
  FiGift,
  FiZap
} from 'react-icons/fi'
import { useAuth } from '../../lib/context/AuthContext'
import { useCart } from '../../lib/context/CartContext'
import { useWishlist } from '../../lib/hooks/useWishlist'

const categories = [
  { name: 'Electronics', href: '/products?category=electronics' },
  { name: 'Fashion', href: '/products?category=fashion' },
  { name: 'Women\'s', href: '/products?category=womens' },
  { name: 'Kids\' Fashion', href: '/products?category=kids' },
  { name: 'Health & Beauty', href: '/products?category=beauty' },
  { name: 'Pharmacy', href: '/products?category=pharmacy' },
  { name: 'Groceries', href: '/products?category=groceries' },
  { name: 'Luxury Item', href: '/products?category=luxury' }
]

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false)
  const [isCountryMenuOpen, setIsCountryMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [location, setLocation] = useState('Dubai')
  const [country, setCountry] = useState('AE') // IN or AE
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)
  const [pincode, setPincode] = useState('')
  const [loadingLocation, setLoadingLocation] = useState(false)
  const [locationError, setLocationError] = useState('')

  const { user, logout } = useAuth()
  const { items } = useCart()
  const { wishlist } = useWishlist()
  const router = useRouter()
  const userMenuRef = useRef(null)
  const categoriesRef = useRef(null)
  const countryMenuRef = useRef(null)

  // Country configuration
  const countries = {
    IN: {
      name: 'India',
      flag: '🇮🇳',
      code: 'IN',
      currency: '₹',
      defaultCity: 'Mumbai'
    },
    AE: {
      name: 'UAE',
      flag: '🇦🇪',
      code: 'AE',
      currency: 'AED',
      defaultCity: 'Dubai'
    }
  }

  // Load saved location from localStorage
  useEffect(() => {
    const savedLocation = localStorage.getItem('userLocation')
    const savedPincode = localStorage.getItem('userPincode')
    const savedCountry = localStorage.getItem('userCountry')

    if (savedLocation) setLocation(savedLocation)
    if (savedPincode) setPincode(savedPincode)
    if (savedCountry) setCountry(savedCountry)
    else {
      // Default based on location or IP detection could be added here
      setCountry('AE') // Default to UAE
    }
  }, [])

  // Fetch location based on pincode
  const fetchLocationFromPincode = async (code) => {
    setLoadingLocation(true)
    setLocationError('')

    try {
      // Determine if it's India (6 digits) or UAE (5-6 digits with letters)
      const isIndiaPincode = /^\d{6}$/.test(code)
      const isUAEPincode = /^[A-Z0-9]{5,6}$/i.test(code)

      if (!isIndiaPincode && !isUAEPincode) {
        throw new Error('Invalid pincode format')
      }

      let locationName = ''
      let detectedCountry = 'AE'

      if (isIndiaPincode) {
        // India Postal API
        const response = await fetch(`https://api.postalpincode.in/pincode/${code}`)
        const data = await response.json()

        if (data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
          const postOffice = data[0].PostOffice[0]
          locationName = `${postOffice.District}, ${postOffice.State}`
          detectedCountry = 'IN'
        } else {
          throw new Error('Invalid Indian pincode')
        }
      } else if (isUAEPincode) {
        // UAE - Use simple mapping or API
        // Note: UAE doesn't have a comprehensive free postal API
        // Using a basic city detection based on common patterns
        const uaeLocations = {
          'DXB': 'Dubai',
          'AUH': 'Abu Dhabi',
          'SHJ': 'Sharjah',
          'AJM': 'Ajman',
          'UAQ': 'Umm Al Quwain',
          'RAK': 'Ras Al Khaimah',
          'FUJ': 'Fujairah'
        }

        const emirateCode = code.substring(0, 3).toUpperCase()
        locationName = uaeLocations[emirateCode] || 'Dubai'
        detectedCountry = 'AE'
      }

      // Save to state and localStorage
      setLocation(locationName)
      setCountry(detectedCountry)
      localStorage.setItem('userLocation', locationName)
      localStorage.setItem('userPincode', code)
      localStorage.setItem('userCountry', detectedCountry)
      setIsLocationModalOpen(false)
      setPincode(code)
    } catch (error) {
      setLocationError(error.message || 'Unable to fetch location. Please try again.')
    } finally {
      setLoadingLocation(false)
    }
  }

  const handleLocationSubmit = (e) => {
    e.preventDefault()
    if (pincode.trim()) {
      fetchLocationFromPincode(pincode.trim())
    }
  }

  const handleCountryChange = (countryCode) => {
    setCountry(countryCode)
    setLocation(countries[countryCode].defaultCity)
    setPincode('')
    localStorage.setItem('userCountry', countryCode)
    localStorage.setItem('userLocation', countries[countryCode].defaultCity)
    localStorage.removeItem('userPincode')
    setIsCountryMenuOpen(false)
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false)
      }
      if (categoriesRef.current && !categoriesRef.current.contains(event.target)) {
        setIsCategoriesOpen(false)
      }
      if (countryMenuRef.current && !countryMenuRef.current.contains(event.target)) {
        setIsCountryMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`)
      setSearchQuery('')
    }
  }

  const cartCount = items.reduce((count, item) => count + item.quantity, 0)
  const wishlistCount = wishlist?.length || 0

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Main Header */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <img
                src="/logo.png"
                alt="OnlinePlanet Logo"
                className="h-8 w-auto object-contain"
              />
            </Link>

            {/* Search Bar - Center */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl mx-8">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <FiSearch className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for any product or brand"
                  className="w-full pl-11 pr-12 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <button
                  type="submit"
                  className="absolute inset-y-0 right-2 flex items-center justify-center w-8 h-8 my-auto bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                >
                  <FiSearch className="w-4 h-4 text-white" />
                </button>
              </div>
            </form>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4">
              {/* Location */}
              <div className="relative">
                <button
                  onClick={() => setIsLocationModalOpen(!isLocationModalOpen)}
                  className="hidden lg:flex items-center gap-2 text-xs hover:text-blue-600 transition-colors"
                >
                  <FiMapPin className="w-4 h-4" />
                  <div className="text-left">
                    <div className="text-gray-500">Delivering to {location}</div>
                    <div className="font-semibold text-gray-900">Update Location</div>
                  </div>
                </button>

                {/* Location Dropdown */}
                {isLocationModalOpen && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => {
                        setIsLocationModalOpen(false)
                        setLocationError('')
                      }}
                    />

                    {/* Dropdown Panel */}
                    <div className="absolute top-full right-0 mt-2 z-50 bg-white rounded-2xl shadow-2xl w-96 p-6 border border-gray-100">
                      {/* Close Button */}
                      <button
                        onClick={() => {
                          setIsLocationModalOpen(false)
                          setLocationError('')
                        }}
                        className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <FiX className="w-4 h-4" />
                      </button>

                      {/* Modal Header */}
                      <div className="mb-5">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <FiMapPin className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">Select Delivery Location</h3>
                            <p className="text-xs text-gray-500">Enter your pincode for delivery estimates</p>
                          </div>
                        </div>
                      </div>



                      {/* Pincode Form */}
                      <form onSubmit={handleLocationSubmit} className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Pincode / Postal Code
                          </label>
                          <input
                            type="text"
                            value={pincode}
                            onChange={(e) => {
                              setPincode(e.target.value.toUpperCase())
                              setLocationError('')
                            }}
                            placeholder="e.g., 110001 or DXB123"
                            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-sm font-mono"
                            maxLength={6}
                          />

                        </div>

                        {/* Error Message */}
                        {locationError && (
                          <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                            <p className="text-xs text-red-600">{locationError}</p>
                          </div>
                        )}

                        {/* Submit Button */}
                        <button
                          type="submit"
                          disabled={loadingLocation || !pincode.trim()}
                          className="w-full py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm"
                        >
                          {loadingLocation ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Detecting...</span>
                            </>
                          ) : (
                            <>
                              <FiMapPin className="w-4 h-4" />
                              <span>Update Location</span>
                            </>
                          )}
                        </button>
                      </form>


                    </div>
                  </>
                )}
              </div>

              {/* Country Selector */}
              <div className="relative" ref={countryMenuRef}>
                <button
                  onClick={() => setIsCountryMenuOpen(!isCountryMenuOpen)}
                  className="hidden lg:flex items-center gap-1.5 px-2 py-1 hover:bg-gray-50 rounded transition-colors"
                >
                  <span className="text-xl">{countries[country].flag}</span>
                  <span className="text-sm font-semibold">{country}</span>
                  <FiChevronDown className="w-3 h-3" />
                </button>

                {/* Country Dropdown */}
                {isCountryMenuOpen && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsCountryMenuOpen(false)}
                    />

                    {/* Dropdown Panel */}
                    <div className="absolute top-full right-0 mt-2 z-50 bg-white rounded-xl shadow-2xl w-80 border border-gray-100 overflow-hidden">
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                        <h3 className="text-sm font-bold text-gray-900 mb-1">Choose your country</h3>
                        <p className="text-xs text-gray-600">Product availability and pricing may vary</p>
                      </div>

                      <div className="p-2">
                        {Object.values(countries).map((c) => (
                          <button
                            key={c.code}
                            onClick={() => handleCountryChange(c.code)}
                            className={`w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors ${country === c.code ? 'bg-blue-50 border border-blue-200' : ''
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{c.flag}</span>
                              <div className="text-left">
                                <div className="font-semibold text-sm text-gray-900">{c.name}</div>
                                <div className="text-xs text-gray-500">Currency: {c.currency}</div>
                              </div>
                            </div>
                            {country === c.code && (
                              <div className="flex items-center gap-1 text-blue-600">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>

                      <div className="p-3 bg-gray-50 border-t border-gray-100">
                        <p className="text-xs text-gray-600 text-center">
                          🌍 Shipping to {countries[country].name}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Cart */}
              <Link
                href="/cart"
                className="relative p-2 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <FiShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Sign In / User Menu */}
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <FiUser className="w-5 h-5" />
                    <span className="hidden lg:inline text-sm font-semibold">{user.name}</span>
                    <FiChevronDown className="w-3 h-3" />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2">
                      <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors">
                        <FiUser className="w-4 h-4" />
                        <span className="text-sm font-medium">My Profile</span>
                      </Link>
                      <Link href="/orders" className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors">
                        <FiGift className="w-4 h-4" />
                        <span className="text-sm font-medium">My Orders</span>
                      </Link>
                      <Link href="/wishlist" className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors">
                        <FiHeart className="w-4 h-4" />
                        <span className="text-sm font-medium">Wishlist ({wishlistCount})</span>
                      </Link>
                      <hr className="my-2" />
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <span className="text-sm font-medium">Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <FiUser className="w-5 h-5" />
                  <span className="hidden lg:inline text-sm font-semibold">Sign In</span>
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 hover:bg-gray-50 rounded-lg transition-colors"
              >
                {isMenuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>


      {/* Navigation Bar */}
      <div className="hidden lg:block bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            {/* Categories */}
            <div className="flex items-center gap-6">
              {/* All Categories Dropdown */}
              <div className="relative" ref={categoriesRef}>
                <button
                  onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                  className="flex items-center gap-2 px-4 py-1.5 bg-white border border-gray-200 rounded-md hover:border-gray-300 transition-colors"
                >
                  <FiMenu className="w-4 h-4" />
                  <span className="text-sm font-semibold">All Categories</span>
                  <FiChevronDown className="w-3 h-3" />
                </button>

                {isCategoriesOpen && (
                  <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 max-h-96 overflow-y-auto">
                    {categories.map((category) => (
                      <Link
                        key={category.name}
                        href={category.href}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsCategoriesOpen(false)}
                      >
                        <span className="text-sm font-medium">{category.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Categories */}
              {categories.slice(0, 7).map((category) => (
                <Link
                  key={category.name}
                  href={category.href}
                  className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  {category.name}
                </Link>
              ))}
            </div>

            {/* Right Side Links */}
            <div className="flex items-center gap-6">
              <Link href="/deals" className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                <FiGift className="w-4 h-4" />
                Best Deals
              </Link>
              <Link href="/live" className="flex items-center gap-2 text-sm font-semibold hover:text-blue-600 transition-colors">
                <span>OnlinePlanet Live</span>
                <FiZap className="w-4 h-4 text-red-500" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100">
          <div className="px-4 py-4 space-y-4">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for any product or brand"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </form>

            {/* Categories */}
            <div className="space-y-2">
              <div className="font-semibold text-sm text-gray-900 mb-2">Categories</div>
              {categories.map((category) => (
                <Link
                  key={category.name}
                  href={category.href}
                  className="block py-2 text-sm text-gray-700 hover:text-blue-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {category.name}
                </Link>
              ))}
            </div>

            {/* Mobile Links */}
            <div className="pt-4 border-t border-gray-100 space-y-2">
              <Link href="/deals" className="flex items-center gap-2 py-2 text-sm font-semibold text-blue-600">
                <FiGift className="w-4 h-4" />
                Best Deals
              </Link>
              <Link href="/wishlist" className="flex items-center gap-2 py-2 text-sm text-gray-700">
                <FiHeart className="w-4 h-4" />
                Wishlist ({wishlistCount})
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
