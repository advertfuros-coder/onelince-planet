'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
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
import SearchAutocomplete from './SearchAutocomplete'

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
  const pathname = usePathname()
  const userMenuRef = useRef(null)
  const categoriesRef = useRef(null)
  const countryMenuRef = useRef(null)

  // Check if current page is a product detail page or products listing page
  const isProductDetailPage = pathname?.startsWith('/products/') && pathname.split('/').length === 3
  const isProductsPage = pathname === '/products'
  const isProfilePage = pathname?.startsWith('/profile')
  const isOrderDetailsPage = pathname?.startsWith('/orders/')
  const hideHeaderExtras = isProductDetailPage || isProductsPage || isProfilePage || isOrderDetailsPage

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

  // Scroll handler with lockout to prevent flickering during transitions
  useEffect(() => {
    let ticking = false;
    let lastScroll = window.scrollY;
    let isLocked = false;
    let lockTimeout = null;

    const updateHeader = () => {
      const currentScroll = Math.max(0, window.scrollY);
      const delta = currentScroll - lastScroll;

      // Update lastScroll immediately to track progress
      const prevScroll = lastScroll;
      lastScroll = currentScroll;

      // If locked, skip state changes but keep tracking scroll
      if (isLocked) {
        ticking = false;
        return;
      }

      // Handle showing/hiding logic
      if (currentScroll > 200 && delta > 15) {
        // Scrolling Down - Hide
        setShowSecondaryHeader((prev) => {
          if (prev) {
            isLocked = true;
            if (lockTimeout) clearTimeout(lockTimeout);
            lockTimeout = setTimeout(() => { isLocked = false; }, 400);
            return false;
          }
          return prev;
        });
      } else if (currentScroll < 50 || delta < -30) {
        // Scrolling Up or near top - Show
        setShowSecondaryHeader((prev) => {
          if (!prev) {
            isLocked = true;
            if (lockTimeout) clearTimeout(lockTimeout);
            lockTimeout = setTimeout(() => { isLocked = false; }, 400);
            return true;
          }
          return prev;
        });
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
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (lockTimeout) clearTimeout(lockTimeout);
    };
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



  const cartCount = items.reduce((count, item) => count + item.quantity, 0)
  const wishlistCount = wishlist?.length || 0

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Desktop Main Header */}
      <div className="hidden lg:block border-b border-gray-100">
        <div className="max-w-8xl mx-auto px-4  ">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <img
                src="/logo.png"
                alt="OnlinePlanet Logo"
                className="h-8 w-auto object-contain"
              />

              <p className="text-xl font-semibold transition-colors hover:text-blue-600 cursor-pointer tracking-tight">
                Online Planet
              </p>
            </Link>

            {/* Search Bar - Center */}
            {!hideHeaderExtras && (
              <div className="flex flex-1 max-w-2xl mx-8">
                <SearchAutocomplete />
              </div>
            )}

            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={() => setIsLocationModalOpen(!isLocationModalOpen)}
                  className="flex items-center gap-2 text-xs hover:text-blue-600 transition-colors"
                >
                  <FiMapPin className="w-4 h-4" />
                  <div className="text-left">
                    <div className="text-gray-500 line-clamp-1 max-w-[150px]">
                      Delivering to {location} {pincode && <span className="font-semibold">{pincode}</span>}
                    </div>
                    <div className="font-semibold text-gray-900">Update Location</div>
                  </div>
                </button>
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
                      <h3 className="text-sm font-semibold text-gray-900">Choose country</h3>
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

              {user?.role === 'admin' && (
                <Link href="/admin/dashboard" className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all font-semibold text-sm">
                  <FiZap className="w-4 h-4 text-yellow-400" />
                  <span>Admin Panel</span>
                </Link>
              )}
              {user?.role === 'seller' && (
                <Link href="/seller" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold text-sm">
                  <FiShoppingBag className="w-4 h-4" />
                  <span>Seller Panel</span>
                </Link>
              )}

              {(!user || user.role === 'customer') && (
                <Link href="/become-a-seller" className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 transition-all font-semibold text-sm">
                  <FiShoppingBag className="w-4 h-4" />
                  <span>Want to Sell?</span>
                </Link>
              )}

              <Link href="/cart" className="relative p-2 hover:bg-gray-50 rounded-lg">
                <FiShoppingCart className="w-5 h-5" />
                {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-semibold rounded-full w-4 h-4 flex items-center justify-center">{cartCount}</span>}
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
                      {user.role === 'admin' && (
                        <Link href="/admin" className="flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 text-sm font-semibold text-blue-600 border-t border-gray-50">Admin Dashboard</Link>
                      )}
                      {user.role === 'seller' && (
                        <Link href="/seller" className="flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 text-sm font-semibold text-blue-600 border-t border-gray-50">Seller Dashboard</Link>
                      )}
                      <button onClick={logout} className="w-full text-left px-4 py-2.5 text-red-600 hover:bg-red-50 text-sm border-t border-gray-50">Sign Out</button>
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
        <div className="">
          {/* Row 0: Mobile Location Bar - Scalloped & Framed Design - Hide on product detail pages */}
          {!hideHeaderExtras && (
            <div className={`relative transition-all duration-300 ease-in-out z-20 ${showSecondaryHeader ? 'max-h-24 opacity-100 mb-4' : 'max-h-0 opacity-0 mb-0'}`}>
              {/* Top Dark Strip as seen in screenshot */}
              <div className="h-1 bg-[#2D313F] w-full"></div>

              {/* Main Location Content */}
              <div className="bg-[#FFD23F] px-4 py-2 relative z-10 sh adow-sm border-b border-[#FFD23F]/20">
                <button
                  onClick={() => setIsLocationModalOpen(true)}
                  className="flex items-center gap-2 w-full text-left"
                >
                  <FiMapPin className="w-4 h-4 text-black shrink-0" />
                  <div className="flex-1 min-w-0 flex items-center gap-1.5">
                    <span className="text-[12px] text-gray-800 font-medium">Deliver to</span>
                    <span className="text-[12px] text-black font-semibold truncate">{location}, {pincode}</span>
                    <FiChevronDown className="w-4 h-4 text-gray-800 shrink-0 ml-auto" />
                  </div>
                </button>
              </div>

              {/* Premium Scalloped Bottom Edge */}
              <div className="absolute -bottom-2.5 left-0 w-full overflow-hidden leading-none z-0">
                <svg
                  viewBox="0 0 1200 24"
                  preserveAspectRatio="none"
                  className="relative block w-full h-3 fill-[#FFD23F]"
                >
                  <path d="M0,0 h1200 v10 c-10,12-20,12-30,0 c-10,12-20,12-30,0 c-10,12-20,12-30,0 c-10,12-20,12-30,0 c-10,12-20,12-30,0 c-10,12-20,12-30,0 c-10,12-20,12-30,0 c-10,12-20,12-30,0 c-10,12-20,12-30,0 c-10,12-20,12-30,0 c-10,12-20,12-30,0 c-10,12-20,12-30,0 c-10,12-20,12-30,0 c-10,12-20,12-30,0 c-10,12-20,12-30,0 c-10,12-20,12-30,0 c-10,12-20,12-30,0 c-10,12-20,12-30,0 c-10,12-20,12-30,0 c-10,12-20,12-30,0 c-10,12-20,12-30,0 c-10,12-20,12-30,0 c-10,12-20,12-30,0 c-10,12-20,12-30,0 c-10,12-20,12-30,0 c-10,12-20,12-30,0 c-10,12-20,12-30,0 c-10,12-20,12-30,0 c-10,12-20,12-30,0 c-10,12-20,12-30,0 c-10,12-20,12-30,0 c-10,12-20,12-30,0 c-10,12-20,12-30,0 c-10,12-20,12-30,0 c-10,12-20,12-30,0 c-10,12-20,12-30,0 c-10,12-20,12-30,0 c-10,12-20,12-30,0 c-10,12-20,12-30,0 c-10,12-20,12-30,0 v-10 h-1200 Z"></path>
                </svg>
              </div>
            </div>
          )}

          {/* Row 1: Logo and Icons */}
          <div className="flex items-center justify-between mb-4 px-4 py-2">
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
                  <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] font-semibold rounded-full w-4 h-4 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
              <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
                <FiMenu className="w-7 h-7 text-gray-700" />
              </button>
            </div>
          </div>

          {/* Row 2: Search Bar - Hide on product detail pages */}
          {!hideHeaderExtras && (
            <div className="px-4 mb-4">
              <SearchAutocomplete />
            </div>
          )}

          {/* Row 3: Categories Horizontal Scroll - Hide on product detail pages */}
          {!hideHeaderExtras && (
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showSecondaryHeader ? 'max-h-12 opacity-100 py-1 mb-2' : 'max-h-0 opacity-0 py-0 mb-0'}`}>
              <div className="flex items-center gap-3 overflow-x-auto no-scrollbar whitespace-nowrap">
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-semibold text-gray-900">Categories</span>
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
          )}
        </div>
      </div>


      {/* Navigation Bar - Hide on product detail pages */}
      {!hideHeaderExtras && (
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
      )}

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100">
          <div className="px-4 py-4 space-y-4">
            {/* Mobile Search */}
            <SearchAutocomplete onClose={() => setIsMenuOpen(false)} />

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
              {user?.role === 'admin' && (
                <Link href="/admin" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 py-2 text-sm font-bold text-blue-600">
                  <FiZap className="w-4 h-4 text-yellow-500" />
                  Admin Dashboard
                </Link>
              )}
              {user?.role === 'seller' && (
                <Link href="/seller" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 py-2 text-sm font-bold text-blue-600">
                  <FiShoppingBag className="w-4 h-4" />
                  Seller Dashboard
                </Link>
              )}
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

      {/* Global Responsive Location Modal */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsLocationModalOpen(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 border border-gray-100 animate-in fade-in zoom-in duration-300">
            <button onClick={() => setIsLocationModalOpen(false)} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors">
              <FiX className="w-5 h-5" />
            </button>
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0 animate-bounce-subtle">
                  <FiMapPin className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Select Location</h3>
                  <p className="text-xs font-medium text-gray-400">Enter pincode for delivery estimates</p>
                </div>
              </div>
            </div>
            <form onSubmit={handleLocationSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest ml-1">Pincode</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.toUpperCase())}
                  placeholder="e.g., 110001 or DXB123"
                  className="w-full px-5 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-500 focus:bg-white focus:outline-none transition-all text-sm font-semibold"
                  maxLength={6}
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={loadingLocation}
                className="w-full py-4 bg-blue-600 text-white font-semibold rounded-2xl hover:bg-blue-700 disabled:bg-gray-200 transition-all shadow-lg"
              >
                {loadingLocation ? 'Detecting Location...' : 'Update Location'}
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  )
}
