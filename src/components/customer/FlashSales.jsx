'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiClock, FiChevronLeft, FiChevronRight, FiZap,
  FiStar, FiHeart, FiShoppingCart, FiTag, FiPercent, FiGift
} from 'react-icons/fi'
import { useCart } from '../../lib/context/CartContext'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function FlashSales() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  })
  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [wishlist, setWishlist] = useState(new Set())
  const [activeCard, setActiveCard] = useState(null)
  const scrollContainerRef = useRef(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isMounted, setIsMounted] = useState(false)

  const { addToCart } = useCart()
  const router = useRouter()

  // Vibrant Zomato/Swiggy-style colors
  const colors = {
    zomato: '#E23744',
    swiggy: '#FC8019',
    blinkit: '#54B226',
    purple: '#9B1FE9',
    pink: '#FF006E',
    yellow: '#FFB800'
  }

  // Fun emoji decorations
  const floatingEmojis = ['🔥', '⚡', '💥', '🎉', '🎁', '⭐', '💫', '✨']

  // Default flash deals
  const defaultDeals = [
    {
      id: 1,
      _id: '1',
      name: 'Premium Wireless Headphones',
      emoji: '🎧',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
      originalPrice: 15999,
      flashPrice: 7999,
      discount: 50,
      rating: 4.8,
      reviews: 2847,
      soldPercentage: 78,
      stock: 22,
      tag: 'BESTSELLER',
      color: colors.zomato
    },
    {
      id: 2,
      _id: '2',
      name: 'Smart Watch Pro',
      emoji: '⌚',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
      originalPrice: 24999,
      flashPrice: 12499,
      discount: 50,
      rating: 4.6,
      reviews: 1523,
      soldPercentage: 45,
      stock: 55,
      tag: 'HOT DEAL',
      color: colors.swiggy
    },
    {
      id: 3,
      _id: '3',
      name: 'Bluetooth Speaker',
      emoji: '🔊',
      image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500',
      originalPrice: 4999,
      flashPrice: 1999,
      discount: 60,
      rating: 4.5,
      reviews: 956,
      soldPercentage: 92,
      stock: 8,
      tag: 'ALMOST GONE',
      color: colors.blinkit
    },
    {
      id: 4,
      _id: '4',
      name: 'Laptop Stand',
      emoji: '💻',
      image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500',
      originalPrice: 2999,
      flashPrice: 1199,
      discount: 60,
      rating: 4.7,
      reviews: 634,
      soldPercentage: 62,
      stock: 38,
      tag: 'TRENDING',
      color: colors.purple
    },
    {
      id: 5,
      _id: '5',
      name: 'Gaming Keyboard RGB',
      emoji: '⌨️',
      image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=500',
      originalPrice: 8999,
      flashPrice: 4499,
      discount: 50,
      rating: 4.9,
      reviews: 1842,
      soldPercentage: 88,
      stock: 12,
      tag: 'SUPER SAVER',
      color: colors.pink
    },
    {
      id: 6,
      _id: '6',
      name: 'Gaming Mouse Pro',
      emoji: '🖱️',
      image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=500',
      originalPrice: 3999,
      flashPrice: 1599,
      discount: 60,
      rating: 4.4,
      reviews: 723,
      soldPercentage: 55,
      stock: 45,
      tag: 'LIMITED',
      color: colors.yellow
    }
  ]

  // Fetch flash deals
  useEffect(() => {
    const fetchFlashDeals = async () => {
      try {
        const response = await fetch('/api/flash-deals')
        const data = await response.json()

        if (data.success && data.deals && data.deals.length > 0) {
          setDeals(data.deals)
        } else {
          setDeals(defaultDeals)
        }
      } catch (error) {
        setDeals(defaultDeals)
      } finally {
        setLoading(false)
      }
    }

    fetchFlashDeals()
  }, [])

  // Set mounted state on client
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Countdown timer
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date()
      const endOfDay = new Date(now)
      endOfDay.setHours(23, 59, 59, 999)

      const difference = endOfDay - now

      if (difference > 0) {
        setTimeLeft({
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        })
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)
    return () => clearInterval(timer)
  }, [])

  // Mouse parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const toggleWishlist = (dealId, e) => {
    e.preventDefault()
    e.stopPropagation()
    setWishlist(prev => {
      const newSet = new Set(prev)
      if (newSet.has(dealId)) {
        newSet.delete(dealId)
        toast.success('💔 Removed from wishlist')
      } else {
        newSet.add(dealId)
        toast.success('❤️ Added to wishlist!')
      }
      return newSet
    })
  }

  const handleAddToCart = (deal, e) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(deal, 1)
    toast.success(`${deal.emoji} Added to cart!`)
  }

  const scroll = (direction) => {
    const container = scrollContainerRef.current
    if (container) {
      const scrollAmount = direction === 'left' ? -400 : 400
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const cardVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    }
  }

  return (
    <section className="py-16 relative overflow-hidden" style={{
      background: 'linear-gradient(135deg, #FFF5F5 0%, #FFF9F0 25%, #F0FFF4 50%, #FAF5FF 75%, #FFF0F7 100%)'
    }}>
      {/* Animated Background Blobs */}
      <motion.div
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-30"
        style={{ background: colors.zomato }}
      />

      <motion.div
        animate={{
          x: [0, -100, 0],
          y: [0, -50, 0],
          scale: [1, 1.3, 1],
          rotate: [360, 180, 0]
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl opacity-30"
        style={{ background: colors.swiggy }}
      />

      {/* Floating Emojis */}
      {isMounted && floatingEmojis.map((emoji, index) => (
        <motion.div
          key={index}
          className="absolute text-4xl"
          initial={{
            x: typeof window !== 'undefined' ? Math.random() * window.innerWidth : 0,
            y: Math.random() * 200,
            opacity: 0.3
          }}
          animate={{
            y: [0, -30, 0],
            rotate: [0, 10, -10, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: index * 0.3
          }}
          style={{
            left: `${index * 12}%`,
            top: `${20 + (index * 10)}%`
          }}
        >
          {emoji}
        </motion.div>
      ))}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Playful Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-12"
        >
          {/* Animated Title */}
          <motion.div
            className="flex items-center justify-center gap-4 mb-4"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="text-6xl"
            >
              ⚡
            </motion.div>
            <h2 className="text-5xl md:text-7xl font-black">
              <span style={{ color: colors.zomato }}>Flash</span>{' '}
              <span style={{ color: colors.swiggy }}>Sales</span>{' '}
              <span className="text-6xl">🔥</span>
            </h2>
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="text-6xl"
            >
              💥
            </motion.div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-gray-700 mb-6"
          >
            Crazy deals that won't last long! 🎉
          </motion.p>

          {/* Fun Countdown Timer */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="inline-block"
          >
            <div className="relative p-1 rounded-3xl" style={{
              background: `linear-gradient(135deg, ${colors.zomato}, ${colors.swiggy}, ${colors.blinkit}, ${colors.purple})`
            }}>
              <div className="bg-white rounded-3xl px-8 py-6 flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <FiClock className="w-8 h-8" style={{ color: colors.zomato }} />
                  </motion.div>
                  <span className="text-2xl font-black text-gray-900">Ends in:</span>
                </div>

                {[
                  { value: timeLeft.hours, label: 'HRS', emoji: '⏰' },
                  { value: timeLeft.minutes, label: 'MIN', emoji: '⏱️' },
                  { value: timeLeft.seconds, label: 'SEC', emoji: '⚡' }
                ].map((item, index) => (
                  <div key={item.label} className="flex items-center gap-3">
                    {index > 0 && <span className="text-4xl font-black text-gray-300">:</span>}
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="text-center"
                    >
                      <div
                        className="rounded-2xl px-4 py-3 min-w-[80px] shadow-lg"
                        style={{
                          background: `linear-gradient(135deg, ${[colors.zomato, colors.swiggy, colors.blinkit][index]}, ${[colors.swiggy, colors.blinkit, colors.purple][index]})`
                        }}
                      >
                        <div className="text-4xl font-black text-white leading-none mb-1">
                          {String(item.value).padStart(2, '0')}
                        </div>
                      </div>
                      <div className="text-xs font-bold text-gray-600 mt-2">
                        {item.emoji} {item.label}
                      </div>
                    </motion.div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Products Carousel */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative"
        >
          {/* Fun Navigation Buttons */}
          <motion.button
            whileHover={{ scale: 1.1, rotate: -5 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => scroll('left')}
            className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 z-20 w-16 h-16 items-center justify-center rounded-full shadow-2xl text-white text-2xl"
            style={{ background: colors.swiggy }}
          >
            ←
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => scroll('right')}
            className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 z-20 w-16 h-16 items-center justify-center rounded-full shadow-2xl text-white text-2xl"
            style={{ background: colors.zomato }}
          >
            →
          </motion.button>

          {/* Scrollable Container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
          >
            <AnimatePresence>
              {deals.map((deal, index) => (
                <motion.div
                  key={deal.id}
                  variants={cardVariants}
                  whileHover={{ y: -10 }}
                  onHoverStart={() => setActiveCard(deal.id)}
                  onHoverEnd={() => setActiveCard(null)}
                  className="flex-shrink-0 w-80"
                >
                  <Link href={`/products/${deal._id}`}>
                    <div className="relative h-full">
                      {/* Main Card */}
                      <motion.div
                        className="bg-white rounded-3xl shadow-xl overflow-hidden border-4 border-transparent hover:border-current transition-all h-full"
                        style={{
                          borderColor: activeCard === deal.id ? deal.color : 'transparent'
                        }}
                      >
                        {/* Image with floating effect */}
                        <div className="relative aspect-square overflow-hidden" style={{ backgroundColor: `${deal.color}15` }}>
                          <motion.img
                            src={deal.image}
                            alt={deal.name}
                            className="w-full h-full object-cover"
                            animate={activeCard === deal.id ? {
                              scale: 1.1,
                              rotate: [0, -2, 2, 0]
                            } : {}}
                            transition={{ duration: 0.5 }}
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'
                            }}
                          />

                          {/* Playful Overlays */}
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: activeCard === deal.id ? 1 : 0 }}
                            className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"
                          />

                          {/* Floating Discount Badge */}
                          <motion.div
                            animate={{
                              y: [0, -10, 0],
                              rotate: [-5, 5, -5]
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity
                            }}
                            className="absolute top-4 left-4 z-10"
                          >
                            <div
                              className="px-4 py-2 rounded-full font-black text-white shadow-2xl text-lg transform -rotate-12"
                              style={{ background: deal.color }}
                            >
                              {deal.discount}% OFF! 🎊
                            </div>
                          </motion.div>

                          {/* Tag Badge */}
                          <motion.div
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="absolute top-4 right-4 z-10"
                          >
                            <div className="px-3 py-1.5 bg-white rounded-full font-bold text-xs shadow-lg flex items-center gap-1">
                              <FiTag style={{ color: deal.color }} />
                              <span>{deal.tag}</span>
                            </div>
                          </motion.div>

                          {/* Wishlist Heart */}
                          <motion.button
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => toggleWishlist(deal.id, e)}
                            className="absolute bottom-4 right-4 z-10 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-xl"
                          >
                            <motion.div
                              animate={wishlist.has(deal.id) ? { scale: [1, 1.3, 1] } : {}}
                              transition={{ duration: 0.3 }}
                            >
                              <FiHeart
                                className={`w-6 h-6 ${wishlist.has(deal.id) ? 'fill-current' : ''}`}
                                style={{ color: wishlist.has(deal.id) ? colors.zomato : '#666' }}
                              />
                            </motion.div>
                          </motion.button>

                          {/* Quick Add Button */}
                          <motion.button
                            initial={{ y: 100, opacity: 0 }}
                            animate={activeCard === deal.id ? { y: 0, opacity: 1 } : { y: 100, opacity: 0 }}
                            onClick={(e) => handleAddToCart(deal, e)}
                            className="absolute bottom-4 left-4 right-20 z-10 text-white px-6 py-3 rounded-full font-bold flex items-center justify-center gap-2 shadow-xl"
                            style={{ background: deal.color }}
                          >
                            <FiShoppingCart className="w-5 h-5" />
                            <span>Add to Cart</span>
                          </motion.button>
                        </div>

                        {/* Product Info */}
                        <div className="p-5">
                          {/* Emoji + Rating */}
                          <div className="flex items-center justify-between mb-3">
                            <motion.span
                              animate={{ rotate: [0, 10, -10, 0] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="text-4xl"
                            >
                              {deal.emoji}
                            </motion.span>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ backgroundColor: `${colors.blinkit}20` }}>
                              <FiStar className="w-4 h-4 fill-current" style={{ color: colors.blinkit }} />
                              <span className="font-bold text-sm">{deal.rating}</span>
                              <span className="text-xs text-gray-500">({deal.reviews})</span>
                            </div>
                          </div>

                          {/* Product Name */}
                          <h3 className="text-xl font-black text-gray-900 mb-3 line-clamp-2">
                            {deal.name}
                          </h3>

                          {/* Price with animation */}
                          <div className="flex items-baseline gap-3 mb-4">
                            <motion.span
                              animate={{ scale: [1, 1.05, 1] }}
                              transition={{ duration: 1, repeat: Infinity }}
                              className="text-3xl font-black"
                              style={{ color: deal.color }}
                            >
                              ${deal.flashPrice}
                            </motion.span>
                            <span className="text-lg text-gray-400 line-through font-semibold">
                              ${deal.originalPrice}
                            </span>
                            <span className="text-sm font-bold px-2 py-1 rounded-lg" style={{
                              backgroundColor: `${deal.color}20`,
                              color: deal.color
                            }}>
                              Save ${deal.originalPrice - deal.flashPrice}
                            </span>
                          </div>

                          {/* Fun Progress Bar */}
                          <div className="mb-2">
                            <div className="flex items-center justify-between text-xs font-bold mb-2">
                              <span style={{ color: deal.color }}>🏃 {deal.soldPercentage}% Sold!</span>
                              <span className="text-gray-500">Only {deal.stock} left</span>
                            </div>
                            <div className="h-3 bg-gray-100 rounded-full overflow-hidden relative">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${deal.soldPercentage}%` }}
                                transition={{ duration: 1, delay: index * 0.1 }}
                                className="h-full rounded-full relative overflow-hidden"
                                style={{ background: `linear-gradient(90deg, ${deal.color}, ${deal.color}dd)` }}
                              >
                                {/* Shimmer effect */}
                                <motion.div
                                  animate={{ x: [-300, 300] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                                />
                              </motion.div>
                            </div>
                          </div>

                          {/* Stock warning */}
                          {deal.stock < 15 && (
                            <motion.div
                              animate={{ scale: [1, 1.05, 1] }}
                              transition={{ duration: 0.5, repeat: Infinity }}
                              className="flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-lg"
                              style={{ backgroundColor: `${colors.zomato}15`, color: colors.zomato }}
                            >
                              <motion.div
                                animate={{ scale: [1, 1.5, 1] }}
                                transition={{ duration: 0.8, repeat: Infinity }}
                              >
                                🔥
                              </motion.div>
                              <span>Almost Gone! Hurry Up!</span>
                            </motion.div>
                          )}
                        </div>
                      </motion.div>

                      {/* Floating shadow */}
                      <motion.div
                        animate={{ scale: activeCard === deal.id ? 1.1 : 1 }}
                        className="absolute -bottom-2 left-4 right-4 h-8 rounded-full blur-xl opacity-30 -z-10"
                        style={{ background: deal.color }}
                      />
                    </div>
                  </Link>
                </motion.div>
              ))}

              {/* Fun View All Card */}
              <motion.div
                variants={cardVariants}
                whileHover={{ y: -10, rotate: 2 }}
                className="flex-shrink-0 w-80"
              >
                <Link href="/flash-deals">
                  <div
                    className="h-full min-h-[500px] rounded-3xl shadow-2xl flex flex-col items-center justify-center text-white p-10 text-center relative overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${colors.zomato}, ${colors.swiggy}, ${colors.blinkit}, ${colors.purple})`
                    }}
                  >
                    {/* Animated pattern background */}
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                      className="absolute inset-0 opacity-20"
                      style={{
                        backgroundImage: 'radial-gradient(circle, white 2px, transparent 2px)',
                        backgroundSize: '40px 40px'
                      }}
                    />

                    {/* Content */}
                    <div className="relative z-10">
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          rotate: [0, 10, -10, 0]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-8xl mb-6"
                      >
                        🎁
                      </motion.div>
                      <h3 className="text-4xl font-black mb-3">More Deals!</h3>
                      <p className="text-xl mb-6 opacity-90">
                        {deals.length}+ More Crazy Offers Waiting! 🎉
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="bg-white text-gray-900 px-8 py-4 rounded-full font-black text-lg shadow-2xl"
                      >
                        Explore All Deals →
                      </motion.button>
                    </div>

                    {/* Floating decorations */}
                    {['🎊', '✨', '💫', '⭐'].map((emoji, i) => (
                      <motion.div
                        key={i}
                        className="absolute text-4xl"
                        animate={{
                          y: [0, -30, 0],
                          x: [0, 15, 0],
                          rotate: [0, 360]
                        }}
                        transition={{
                          duration: 3 + i,
                          repeat: Infinity,
                          delay: i * 0.5
                        }}
                        style={{
                          left: `${10 + i * 20}%`,
                          top: `${10 + i * 15}%`
                        }}
                      >
                        {emoji}
                      </motion.div>
                    ))}
                  </div>
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  )
}
