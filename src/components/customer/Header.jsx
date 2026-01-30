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
  FiShoppingBag,
  FiHome,
  FiGrid
} from 'react-icons/fi'
import {
  Smartphone,
  ShoppingBag,
  Home,
  Sparkles,
  BookOpen,
  Heart,
  ShoppingCart,
  Gift,
  ChevronRight,
  Baby,
  Car,
  PawPrint,
  Briefcase
} from 'lucide-react'
import { useAuth } from '../../lib/context/AuthContext'
import { useCart } from '../../lib/context/CartContext'
import { useCurrency } from '../../lib/context/CurrencyContext'
import { useWishlist } from '../../lib/hooks/useWishlist'
import SearchAutocomplete from './SearchAutocomplete'
import GenderSwitcher from './GenderSwitcher'

// Mega Menu Category Data Structure
const megaMenuCategories = [
  {
    name: 'Electronics',
    href: '/category/electronics',
    icon: 'Smartphone',
    subcategories: [
      { name: 'Mobile Phones', href: '/category/electronics/mobiles' },
      { name: 'Laptops & Computers', href: '/category/electronics/laptops' },
      { name: 'Tablets & iPads', href: '/category/electronics/tablets' },
      { name: 'Cameras & Photography', href: '/category/electronics/cameras' },
      { name: 'Audio & Headphones', href: '/category/electronics/audio' },
      { name: 'Wearables & Smartwatches', href: '/category/electronics/wearables' },
      { name: 'Gaming Consoles', href: '/category/electronics/gaming' },
      { name: 'TV & Home Entertainment', href: '/category/electronics/tv' },
      { name: 'Accessories', href: '/category/electronics/accessories' }
    ],
    featured: {
      title: 'New Arrivals',
      description: 'Latest tech at unbeatable prices',
      image: '/featured/electronics.jpg',
      link: '/category/electronics/new'
    }
  },
  {
    name: 'Fashion',
    href: '/category/fashion',
    icon: 'ShoppingBag',
    subcategories: [
      { name: "Men's Clothing", href: '/category/fashion/mens' },
      { name: "Women's Clothing", href: '/category/fashion/womens' },
      { name: 'Kids Fashion', href: '/category/fashion/kids' },
      { name: 'Footwear', href: '/category/fashion/footwear' },
      { name: 'Bags & Luggage', href: '/category/fashion/bags' },
      { name: 'Watches', href: '/category/fashion/watches' },
      { name: 'Jewelry & Accessories', href: '/category/fashion/jewelry' },
      { name: 'Sunglasses & Eyewear', href: '/category/fashion/eyewear' },
      { name: 'Sportswear', href: '/category/fashion/sportswear' }
    ],
    featured: {
      title: 'Trending Styles',
      description: 'Up to 60% off on fashion',
      image: '/featured/fashion.jpg',
      link: '/category/fashion/trending'
    }
  },
  {
    name: 'Home & Decor',
    href: '/category/home',
    icon: 'Home',
    subcategories: [
      { name: 'Furniture', href: '/category/home/furniture' },
      { name: 'Home Decor', href: '/category/home/decor' },
      { name: 'Kitchen & Dining', href: '/category/home/kitchen' },
      { name: 'Bedding & Linen', href: '/category/home/bedding' },
      { name: 'Lighting', href: '/category/home/lighting' },
      { name: 'Storage & Organization', href: '/category/home/storage' },
      { name: 'Garden & Outdoor', href: '/category/home/garden' },
      { name: 'Home Appliances', href: '/category/home/appliances' }
    ],
    featured: {
      title: 'Home Makeover',
      description: 'Transform your space',
      image: '/featured/home.jpg',
      link: '/category/home/featured'
    }
  },
  {
    name: 'Beauty & Skin',
    href: '/category/beauty',
    icon: 'Sparkles',
    subcategories: [
      { name: 'Skincare Essentials', href: '/category/beauty/skincare' },
      { name: 'Haircare & Treatments', href: '/category/beauty/haircare' },
      { name: 'Makeup & Cosmetics', href: '/category/beauty/makeup' },
      { name: 'Fragrances & Perfumes', href: '/category/beauty/fragrances' },
      { name: 'Bath & Body Care', href: '/category/beauty/bath-body' },
      { name: 'Men\'s Grooming', href: '/category/beauty/mens-grooming' },
      { name: 'Oral Care', href: '/category/beauty/oral-care-dept' },
      { name: 'Professional Tools', href: '/category/beauty/makeup-tools' }
    ],
    featured: {
      title: 'Glow Up',
      description: 'Premium beauty essentials',
      image: '/featured/beauty.jpg',
      link: '/category/beauty/premium'
    }
  },
  {
    name: 'Books',
    href: '/category/books',
    icon: 'BookOpen',
    subcategories: [
      { name: 'Fiction', href: '/category/books/fiction' },
      { name: 'Non-Fiction', href: '/category/books/non-fiction' },
      { name: 'Children\'s Books', href: '/category/books/children' },
      { name: 'Educational', href: '/category/books/educational' },
      { name: 'Comics & Manga', href: '/category/books/comics' },
      { name: 'Magazines', href: '/category/books/magazines' },
      { name: 'eBooks', href: '/category/books/ebooks' }
    ],
    featured: {
      title: 'Bestsellers',
      description: 'Top reads this month',
      image: '/featured/books.jpg',
      link: '/category/books/bestsellers'
    }
  },
  {
    name: 'Health & Fitness',
    href: '/category/health',
    icon: 'Heart',
    subcategories: [
      { name: 'Fitness Equipment', href: '/category/health/equipment' },
      { name: 'Supplements & Vitamins', href: '/category/health/supplements' },
      { name: 'Yoga & Meditation', href: '/category/health/yoga' },
      { name: 'Sports Nutrition', href: '/category/health/nutrition' },
      { name: 'Health Monitors', href: '/category/health/monitors' },
      { name: 'Personal Care', href: '/category/health/personal-care' }
    ],
    featured: {
      title: 'Fitness Goals',
      description: 'Start your journey today',
      image: '/featured/health.jpg',
      link: '/category/health/featured'
    }
  },
  {
    name: 'Groceries',
    href: '/category/groceries',
    icon: 'ShoppingCart',
    subcategories: [
      { name: 'Fresh Produce', href: '/category/groceries/fresh' },
      { name: 'Dairy & Eggs', href: '/category/groceries/dairy' },
      { name: 'Snacks & Beverages', href: '/category/groceries/snacks' },
      { name: 'Packaged Foods', href: '/category/groceries/packaged' },
      { name: 'Bakery', href: '/category/groceries/bakery' },
      { name: 'Organic', href: '/category/groceries/organic' },
      { name: 'International Foods', href: '/category/groceries/international' }
    ],
    featured: {
      title: 'Fresh Daily',
      description: 'Farm to your doorstep',
      image: '/featured/groceries.jpg',
      link: '/category/groceries/fresh'
    }
  },
  {
    name: 'Automotive',
    href: '/category/automotive',
    icon: 'Car',
    subcategories: [
      { name: 'Car Accessories', href: '/category/automotive/car-accessories' },
      { name: 'Car Care', href: '/category/automotive/car-care' },
      { name: 'Auto Electronics', href: '/category/automotive/electronics' },
      { name: 'Tools & Equipment', href: '/category/automotive/tools' }
    ],
    featured: {
      title: 'Car Essentials',
      description: 'Keep your ride in top shape',
      image: '/featured/automotive.jpg',
      link: '/category/automotive/featured'
    }
  },
  {
    name: 'Baby & Toys',
    href: '/category/baby-toys',
    icon: 'Baby',
    subcategories: [
      { name: 'Baby Care', href: '/category/baby-toys/care' },
      { name: 'Toys', href: '/category/baby-toys/toys' },
      { name: 'Baby Gear', href: '/category/baby-toys/gear' },
      { name: 'School Supplies', href: '/category/baby-toys/school' }
    ],
    featured: {
      title: 'Kids Universe',
      description: 'The best for your little ones',
      image: '/featured/kids.jpg',
      link: '/category/baby-toys/featured'
    }
  },
  {
    name: 'Pet Supplies',
    href: '/category/pets',
    icon: 'PawPrint',
    subcategories: [
      { name: 'Dog Supplies', href: '/category/pets/dogs' },
      { name: 'Cat Supplies', href: '/category/pets/cats' },
      { name: 'Pet Food', href: '/category/pets/food' },
      { name: 'Pet Grooming', href: '/category/pets/grooming' }
    ],
    featured: {
      title: 'Pet Paradise',
      description: 'Everything for your furry friends',
      image: '/featured/pets.jpg',
      link: '/category/pets/featured'
    }
  },
  {
    name: 'Office Supplies',
    href: '/category/office',
    icon: 'Briefcase',
    subcategories: [
      { name: 'Stationery', href: '/category/office/stationery' },
      { name: 'Office Electronics', href: '/category/office/electronics' },
      { name: 'Printers', href: '/category/office/printers' }
    ],
    featured: {
      title: 'Work Smart',
      description: 'Productivity at your fingertips',
      image: '/featured/office.jpg',
      link: '/category/office/featured'
    }
  }
]

// Simple categories array for mobile/fallback
const categories = megaMenuCategories.map(cat => ({
  name: cat.name,
  href: cat.href
}))

// Icon mapping helper
const iconComponents = {
  Smartphone,
  ShoppingBag,
  Home,
  Sparkles,
  BookOpen,
  Heart,
  ShoppingCart,
  Gift,
  Baby,
  Car,
  PawPrint,
  Briefcase
}

const getIconComponent = (iconName) => {
  return iconComponents[iconName] || Smartphone
}

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

  // Mega Menu State
  const [activeMegaMenu, setActiveMegaMenu] = useState(null)
  const [hoveredCategory, setHoveredCategory] = useState(null)
  const megaMenuTimerRef = useRef(null)
  const hoverTimerRef = useRef(null)

  // Time-based background state
  const [timeOfDay, setTimeOfDay] = useState('day')

  // Determine time of day based on IST
  useEffect(() => {
    const updateTimeOfDay = () => {
      const now = new Date()
      // Convert to IST (UTC+5:30)
      const istOffset = 5.5 * 60 * 60 * 1000
      const istTime = new Date(now.getTime() + istOffset)
      const hours = istTime.getUTCHours()

      if (hours >= 6 && hours < 17) {
        setTimeOfDay('day')
      } else if (hours >= 17 && hours < 19) {
        setTimeOfDay('sunset')
      } else {
        setTimeOfDay('night')
      }
    }

    updateTimeOfDay()
    // Update every minute to ensure accuracy
    const interval = setInterval(updateTimeOfDay, 60000)

    return () => clearInterval(interval)
  }, [])

  // Get background image based on time of day
  const getBackgroundImage = () => {
    switch (timeOfDay) {
      case 'day':
        return '/weather/day.jpg'
      case 'sunset':
        return '/weather/sunset.png'
      case 'night':
        return '/weather/night.png'
      default:
        return '/weather/sunset.png'
    }
  }

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
  const hideHeaderExtras = isProfilePage || isOrderDetailsPage

  // Mega Menu Hover Handlers with delay
  const handleCategoryHover = (categoryName) => {
    // Clear any pending hide timer
    if (megaMenuTimerRef.current) {
      clearTimeout(megaMenuTimerRef.current)
      megaMenuTimerRef.current = null
    }

    // Set active category with slight delay for smooth transition
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current)
    }

    hoverTimerRef.current = setTimeout(() => {
      setActiveMegaMenu(categoryName)
      setHoveredCategory(categoryName)
    }, 100)
  }

  const handleMegaMenuLeave = () => {
    // Clear hover timer
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current)
      hoverTimerRef.current = null
    }

    // Delay hiding to allow user to move mouse to submenu
    megaMenuTimerRef.current = setTimeout(() => {
      setActiveMegaMenu(null)
      setHoveredCategory(null)
    }, 150)
  }

  const handleMegaMenuEnter = () => {
    // Clear hide timer when mouse enters mega menu
    if (megaMenuTimerRef.current) {
      clearTimeout(megaMenuTimerRef.current)
      megaMenuTimerRef.current = null
    }
  }

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (megaMenuTimerRef.current) clearTimeout(megaMenuTimerRef.current)
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)
    }
  }, [])

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
      <div
        className="hidden lg:block border-b border-gray-100 relative z-30"

      >
        {/* Overlay for better text readability */}
        {/* <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/"></div> */}

        <div className="max-w-8xl mx-auto px-4 relative z-10">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <img
                src="/logo.png"
                alt="OnlinePlanet Logo"
                className="h-8 w-auto object-contain drop-shadow-lg"
              />

              <p className={`text-xl font-semibold transition-colors hover:text-blue-400 cursor-pointer tracking-tight drop-shadow-lg  
                `}>
                Online Planet
              </p>
            </Link>

            {/* Search Bar - Center */}
            {!hideHeaderExtras && (
              <div className="flex  flex-1 max-w-2xl mx-8">
                <SearchAutocomplete />
              </div>
            )}

            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={() => setIsLocationModalOpen(!isLocationModalOpen)}
                  className={`flex items-center gap-2 text-xs hover:text-blue-300 transition-colors 
                    }`}
                >
                  <FiMapPin className="w-4 h-4 drop-shadow-md" />
                  <div className="text-left">
                    <div className=" text-black line-clamp-1 max-w-[150px] drop-shadow-md">
                      {location} {pincode && <span className="font-semibold">{pincode}</span>}
                    </div>
                    <div className="font-semibold text-black drop-shadow-md">Update Location</div>
                  </div>
                </button>
              </div>

              <div className="relative" ref={countryMenuRef}>
                <button onClick={() => setIsCountryMenuOpen(!isCountryMenuOpen)} className="flex items-center gap-1.5 px-2 py-1 hover:bg-white/20 rounded transition-colors backdrop-blur-sm">
                  <span className="text-xl drop-shadow-md">{countries[country].flag}</span>
                  <span className={`text-sm font-semibold drop-shadow-md 
                    }`}>{country}</span>
                  <FiChevronDown className={`w-3 h-3 drop-shadow-md 
                    }`} />
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
                <Link href="/admin/dashboard" className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm text-gray-900 rounded-lg hover:bg-white transition-all font-semibold text-sm shadow-lg">
                  <FiZap className="w-4 h-4 text-yellow-400" />
                  <span>Admin Panel</span>
                </Link>
              )}
              {user?.role === 'seller' && (
                <Link href="/seller" className="flex items-center gap-2 px-4 py-2 bg-blue-600/90 backdrop-blur-sm text-white rounded-lg hover:bg-blue-700 transition-all font-semibold text-sm shadow-lg">
                  <FiShoppingBag className="w-4 h-4" />
                  <span>Seller Panel</span>
                </Link>
              )}

              {(!user || user.role === 'customer') && (
                <Link href="/become-a-seller" className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 transition-all font-semibold text-sm shadow-lg backdrop-blur-sm">
                  <FiShoppingBag className="w-4 h-4" />
                  <span>Want to Sell?</span>
                </Link>
              )}

              <Link href="/cart" className="relative p-2 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-colors">
                <FiShoppingCart className={`w-5 h-5 drop-shadow-md 
                  }`} />
                {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-semibold rounded-full w-4 h-4 flex items-center justify-center shadow-lg">{cartCount}</span>}
              </Link>

              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center gap-2 px-3 py-2 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-colors">
                    <FiUser className={`w-5 h-5 drop-shadow-md 
                      }`} />
                    <span className={`text-sm font-semibold drop-shadow-md 
                      }`}>{user.name}</span>
                    <FiChevronDown className={`w-3 h-3 drop-shadow-md 
                      }`} />
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
                <Link href="/login" className="flex items-center gap-2 px-4 py-2 hover:bg-white/20 rounded-lg text-sm font-semibold backdrop-blur-sm transition-colors">
                  <span className={`drop-shadow-md 
                    }`}>Sign In</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* NEW Mobile Main Header */}
      <div
        className="lg:hidden border-b border-gray-100 relative z-30"

      >
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-white/70 to-white"></div>
        <div className="relative z-10">
          {/* Row 0: Mobile Location Bar - Scalloped & Framed Design - Hide on product detail pages */}
          {!hideHeaderExtras && (
            <div className={`relative transition-all duration-300 ease-in-out z-20 ${showSecondaryHeader ? 'max-h-24 opacity-100 mb-4' : 'max-h-0 opacity-0 mb-0'}`}>
              {/* Top Dark Strip as seen in screenshot */}
              <div className="h-1 bg-[#2D313F] w-full"></div>



            </div>
          )}

          {/* Row 1: Logo & Search Bar */}
          <div className="flex items-center gap-3 px-4 py-3">
            <Link href="/" className="flex-shrink-0">
              <img src="/logo.png" alt="Logo" className="h-8 w-auto object-contain drop-shadow-lg" />
            </Link>
            {!hideHeaderExtras && (
              <div className="flex-1 min-w-0">
                <SearchAutocomplete />
              </div>
            )}
          </div>

          {/* Row 3: Category Icons Horizontal Scroll - Only show on homepage */}
          {pathname === '/' && (
            <div className={`overflow-hidden transition-all duration-300 ease-in-out  ${showSecondaryHeader ? 'max-h-24 opacity-100  m' : 'max-h-0 opacity-0 py-0 mb-0'}`}>
              <div className="flex items-center gap-4 overflow-x-auto no-scrollbar whitespace-nowrap px-4">
                {megaMenuCategories.map((category) => {
                  const IconComponent = getIconComponent(category.icon)
                  return (
                    <Link
                      key={category.name}
                      href={category.href}
                      className="flex flex-col items-center justify-center min-w-[70px] group"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-white/90 backdrop-blur-sm border border-gray-200 flex items-center justify-center mb-1.5 group-active:scale-95 transition-transform shaow-lg">
                        <IconComponent className="w-7 h-7 text-gray-800" />
                      </div>
                      <span className="text-[10px] font-semibold text-gray-800 text-center leading-tight">
                        {category.name}
                      </span>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>


      {!hideHeaderExtras && (
        <div
          className={`hidden lg:block border-b border-gray-200 overflow-x-auto overflow-y-hidden transition-all duration-300 relative z-20 ${showSecondaryHeader ? 'max-h-16 opacity-100' : 'max-h-0 opacity-0'}`}

        >
          {/* Gradient overlay from background to white */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-white/60 to-white"></div>
          <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex items-center h-16 relative min-w-max">
              {/* Categories with Mega Menu - Horizontal Scroll */}
              <div className="flex items-center gap-1 relative whitespace-nowrap">
                {megaMenuCategories.map((category) => {
                  const IconComponent = getIconComponent(category.icon)
                  const isActive = activeMegaMenu === category.name

                  return (
                    <div
                      key={category.name}
                      className="relative flex-shrink-0"
                      onMouseEnter={() => handleCategoryHover(category.name)}
                      onMouseLeave={handleMegaMenuLeave}
                    >
                      <Link
                        href={category.href}
                        className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-all duration-200 rounded-lg group whitespace-nowrap ${isActive
                          ? 'text-blue-600 bg-white shadow-sm'
                          : 'text-gray-700 hover:text-blue-600 hover:bg-white/70'
                          }`}
                      >
                        <IconComponent className={`w-4 h-4 transition-transform duration-200 flex-shrink-0 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                        <span className="font-semibold">{category.name}</span>
                        <ChevronRight className={`w-3 h-3 transition-all duration-200 flex-shrink-0 ${isActive ? 'rotate-90 opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                      </Link>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Mega Menu Dropdown */}
          {activeMegaMenu && (
            <div
              className="absolute left-0 right-0 top-full bg-white border-t border-gray-200 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200"
              onMouseEnter={handleMegaMenuEnter}
              onMouseLeave={handleMegaMenuLeave}
              style={{
                animation: 'megaMenuSlide 0.2s ease-out'
              }}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {megaMenuCategories.map((category) => {
                  if (category.name !== activeMegaMenu) return null

                  const IconComponent = getIconComponent(category.icon)

                  return (
                    <div key={category.name} className="grid grid-cols-12 gap-8">
                      {/* Left Column - Category Info */}
                      <div className="col-span-3 border-r border-gray-100 pr-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                            <IconComponent className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">{category.name}</h3>
                            <p className="text-xs text-gray-500">Explore all products</p>
                          </div>
                        </div>
                        <Link
                          href={category.href}
                          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors group"
                        >
                          View All {category.name}
                          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                      </div>

                      {/* Middle Column - Subcategories Grid */}
                      <div className="col-span-6">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Popular Categories</h4>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                          {category.subcategories.map((subcat) => (
                            <Link
                              key={subcat.name}
                              href={subcat.href}
                              className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 transition-colors group py-1.5 px-2 rounded-md hover:bg-blue-50"
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-blue-600 transition-colors"></div>
                              <span className="font-medium">{subcat.name}</span>
                            </Link>
                          ))}
                        </div>
                      </div>

                      {/* Right Column - Featured Promo */}
                      <div className="col-span-3">
                        <div className="relative h-full rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 p-6 overflow-hidden group cursor-pointer">
                          {/* Glassmorphic overlay */}
                          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>

                          {/* Content */}
                          <div className="relative z-10 h-full flex flex-col justify-between">
                            <div>
                              <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full mb-3">
                                <span className="text-xs font-bold text-white">FEATURED</span>
                              </div>
                              <h4 className="text-xl font-bold text-white mb-2">{category.featured.title}</h4>
                              <p className="text-sm text-white/90 mb-4">{category.featured.description}</p>
                            </div>

                            <Link
                              href={category.featured.link}
                              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-blue-600 rounded-lg font-semibold text-sm hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 duration-200"
                            >
                              Shop Now
                              <ChevronRight className="w-4 h-4" />
                            </Link>
                          </div>

                          {/* Decorative elements */}
                          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100">
          <div className="px-4 py-4 shadow-lg space-y-4">
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
        
        @keyframes megaMenuSlide {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
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

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {/* Home */}
          <Link
            href="/"
            className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors ${pathname === '/' ? 'text-blue-600' : 'text-gray-600'
              }`}
          >
            <FiHome className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-medium">Home</span>
          </Link>

          {/* Categories */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors ${isMenuOpen ? 'text-blue-600' : 'text-gray-600'
              }`}
          >
            <FiGrid className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-medium">Categories</span>
          </button>

          {/* Deals */}
          <Link
            href="/deals"
            className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors ${pathname === '/deals' ? 'text-blue-600' : 'text-gray-600'
              }`}
          >
            <FiGift className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-medium">Deals</span>
          </Link>

          {/* Account */}
          <Link
            href="/profile"
            className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors ${pathname?.startsWith('/profile') ? 'text-blue-600' : 'text-gray-600'
              }`}
          >
            <FiUser className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-medium">Account</span>
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            className={`flex flex-col items-center justify-center flex-1 py-2 relative transition-colors ${pathname === '/cart' ? 'text-blue-600' : 'text-gray-600'
              }`}
          >
            <div className="relative">
              <FiShoppingCart className="w-6 h-6 mb-1" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-blue-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium">Cart</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
