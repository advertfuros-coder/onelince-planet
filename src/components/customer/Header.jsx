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
  FiZap,
  FiShoppingBag
} from 'react-icons/fi'
import { useAuth } from '../../lib/context/AuthContext'
import { useCart } from '../../lib/context/CartContext'
import { useCurrency } from '../../lib/context/CurrencyContext'
import { useWishlist } from '../../lib/hooks/useWishlist'

const categories = [
  { name: 'Electronics', href: '/category/electronics' },
  { name: 'Fashion', href: '/category/fashion' },
  { name: 'Home & Decor', href: '/category/home' },
  { name: 'Beauty & Skin', href: '/category/beauty' },
  { name: 'Books', href: '/category/books' },
  { name: 'Health & Fitness', href: '/category/health' },
  { name: 'Groceries', href: '/category/groceries' },
  { name: 'Gifts', href: '/category/gifts' }
]

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false)
  const [isCountryMenuOpen, setIsCountryMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [location, setLocation] = useState('Dubai')
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)
  const [pincode, setPincode] = useState('')
  const [loadingLocation, setLoadingLocation] = useState(false)
  const [locationError, setLocationError] = useState('')
  const [showSecondaryHeader, setShowSecondaryHeader] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  const { user, logout } = useAuth()
  const { items } = useCart()
  const { wishlist } = useWishlist()
  const { country, changeCountry, currencyConfig } = useCurrency()
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

    if (savedLocation) setLocation(savedLocation)
    if (savedPincode) setPincode(savedPincode)

    // Listen for location updates from product page
    const handleLocationUpdate = () => {
      const updatedLocation = localStorage.getItem('userLocation')
      const updatedPincode = localStorage.getItem('userPincode')
      if (updatedLocation) setLocation(updatedLocation)
      if (updatedPincode) setPincode(updatedPincode)
    }

    window.addEventListener('locationUpdated', handleLocationUpdate)
    return () => window.removeEventListener('locationUpdated', handleLocationUpdate)
  }, [])

  // Scroll handler to hide/show secondary header with threshold to prevent flickering
  useEffect(() => {
    let ticking = false;
    let lastScroll = window.scrollY;

    const updateHeader = () => {
      const currentScroll = window.scrollY;
      const delta = currentScroll - lastScroll;

      // Only trigger if we've scrolled more than 10px to avoid jitter
      if (Math.abs(delta) > 10) {
        if (currentScroll > lastScroll && currentScroll > 100) {
          setShowSecondaryHeader(false);
        } else if (currentScroll < lastScroll) {
          setShowSecondaryHeader(true);
        }
        lastScroll = currentScroll;
      }
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateHeader);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      changeCountry(detectedCountry)
      localStorage.setItem('userLocation', locationName)
      localStorage.setItem('userPincode', code)
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
    changeCountry(countryCode)
    setLocation(countries[countryCode].defaultCity)
    setPincode('')
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
      {/* Desktop Main Header */}
      <div className="hidden lg:block border-b border-gray-100">
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
            <form onSubmit={handleSearch} className="flex flex-1 max-w-2xl mx-8">
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

            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={() => setIsLocationModalOpen(!isLocationModalOpen)}
                  className="flex items-center gap-2 text-xs hover:text-blue-600 transition-colors"
                >
                  <FiMapPin className="w-4 h-4" />
                  <div className="text-left">
                    <div className="text-gray-500">Delivering to {location}</div>
                    <div className="font-semibold text-gray-900">Update Location</div>
                  </div>
                </button>
                {isLocationModalOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsLocationModalOpen(false)} />
                    <div className="absolute top-full right-0 mt-2 z-50 bg-white rounded-2xl shadow-2xl w-96 p-6 border border-gray-100">
                      <button onClick={() => setIsLocationModalOpen(false)} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <FiX className="w-4 h-4" />
                      </button>
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
                      <form onSubmit={handleLocationSubmit} className="space-y-4">
                        <input
                          type="text"
                          value={pincode}
                          onChange={(e) => setPincode(e.target.value.toUpperCase())}
                          placeholder="e.g., 110001 or DXB123"
                          className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-sm font-mono"
                          maxLength={6}
                        />
                        <button type="submit" disabled={loadingLocation} className="w-full py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:bg-gray-300 transition-colors text-sm">
                          {loadingLocation ? 'Detecting...' : 'Update Location'}
                        </button>
                      </form>
                    </div>
                  </>
                )}
              </div>

              <div className="relative" ref={countryMenuRef}>
                <button onClick={() => setIsCountryMenuOpen(!isCountryMenuOpen)} className="flex items-center gap-1.5 px-2 py-1 hover:bg-gray-50 rounded transition-colors">
                  <span className="text-xl">{countries[country].flag}</span>
                  <span className="text-sm font-semibold">{country}</span>
                  <FiChevronDown className="w-3 h-3" />
                </button>
                {isCountryMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 z-50 bg-white rounded-xl shadow-2xl w-80 border border-gray-100 overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b border-gray-100">
                      <h3 className="text-sm font-bold text-gray-900">Choose country</h3>
                    </div>
                    <div className="p-2">
                      {Object.values(countries).map((c) => (
                        <button key={c.code} onClick={() => handleCountryChange(c.code)} className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 ${country === c.code ? 'bg-blue-50' : ''}`}>
                          <span className="text-2xl">{c.flag}</span>
                          <span className="font-semibold text-sm">{c.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Link href="/become-a-seller" className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 transition-all font-semibold text-sm">
                <FiShoppingBag className="w-4 h-4" />
                <span>Want to Sell?</span>
              </Link>

              <Link href="/cart" className="relative p-2 hover:bg-gray-50 rounded-lg">
                <FiShoppingCart className="w-5 h-5" />
                {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{cartCount}</span>}
              </Link>

              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg">
                    <FiUser className="w-5 h-5" />
                    <span className="text-sm font-semibold">{user.name}</span>
                    <FiChevronDown className="w-3 h-3" />
                  </button>
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2">
                      <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm">My Profile</Link>
                      <Link href="/orders" className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm">My Orders</Link>
                      <button onClick={logout} className="w-full text-left px-4 py-2.5 text-red-600 hover:bg-red-50 text-sm">Sign Out</button>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/login" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 rounded-lg text-sm font-semibold">Sign In</Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* NEW Mobile Main Header */}
      <div className="lg:hidden bg-white border-b border-gray-100">
        <div className="px-4 py-3">
          {/* Row 1: Logo and Icons */}
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="flex items-center">
              <img src="/logo.png" alt="Logo" className="h-8 w-auto object-contain" />
            </Link>
            <div className="flex items-center gap-5">
              <Link href="/profile" className="flex items-center justify-center w-9 h-9 rounded-full border border-gray-200">
                <FiUser className="w-5 h-5 text-gray-700" />
              </Link>
              <Link href="/cart" className="relative">
                <FiShoppingCart className="w-6 h-6 text-gray-700" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
              <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
                <FiMenu className="w-7 h-7 text-gray-700" />
              </button>
            </div>
          </div>

          {/* Row 2: Search Bar */}
          <form onSubmit={handleSearch} className="relative mb-4">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 opacity-60">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products"
              className="w-full pl-14 pr-12 py-2.5 bg-[#F0F2F5] rounded-full text-sm border-none focus:ring-1 focus:ring-blue-500 placeholder:text-gray-500 font-medium"
            />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 bg-[#003399] rounded-full flex items-center justify-center shadow-sm"
            >
              <FiSearch className="w-5 h-5 text-white" />
            </button>
          </form>

          {/* Row 3: Categories Horizontal Scroll */}
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showSecondaryHeader ? 'max-h-12 opacity-100 py-1 mb-2' : 'max-h-0 opacity-0 py-0 mb-0'}`}>
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar whitespace-nowrap">
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-sm font-bold text-gray-900">Categories</span>
                <div className="w-px h-4 bg-gray-300"></div>
              </div>
              {categories.map((category) => (
                <Link
                  key={category.name}
                  href={category.href}
                  className="text-sm font-semibold text-gray-500 hover:text-blue-600 transition-colors px-1"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>


      {/* Navigation Bar */}
      <div className={`hidden lg:block bg-gray-50 border-b border-gray-200 overflow-hidden transition-all duration-300 ${showSecondaryHeader ? 'max-h-12 opacity-100' : 'max-h-0 opacity-0'}`}>
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
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </header>
  )
}
