'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  FiHeart,
  FiShare2,
  FiStar,
  FiTruck,
  FiShield,
  FiRefreshCw,
  FiCheck,
  FiChevronRight,
  FiMinus,
  FiPlus,
  FiPackage,
  FiMapPin,
  FiCreditCard,
  FiPercent,
  FiAward,
  FiZap,
  FiBox,
  FiThumbsUp,
  FiMessageCircle,
  FiChevronDown,
  FiChevronUp,
  FiAlertCircle,
  FiImage
} from 'react-icons/fi'
import { FaHeart, FaStar } from 'react-icons/fa'
import Button from '@/components/ui/Button'
import { useCart } from '@/lib/context/CartContext'
import { toast } from 'react-hot-toast'
import { extractIdFromSlug } from '@/lib/utils/productUrl'
import ProductCard from '@/components/customer/ProductCard'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { addToCart } = useCart()

  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [reviewStats, setReviewStats] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [similarProducts, setSimilarProducts] = useState([])
  const [recentlyViewed, setRecentlyViewed] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedOptions, setSelectedOptions] = useState({}) // { Color: 'Red', Size: 'M' }
  const [activeVariant, setActiveVariant] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [pincode, setPincode] = useState('')
  const [pincodeChecked, setPincodeChecked] = useState(false)
  const [deliveryInfo, setDeliveryInfo] = useState(null)
  const [shippingLoading, setShippingLoading] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [showAllReviews, setShowAllReviews] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    description: true,
    specifications: false,
    warranty: false
  })

  // Fetch product data and reviews from API
  useEffect(() => {
    const fetchProductData = async () => {
      if (!params.id) return

      const productId = extractIdFromSlug(params.id)

      try {
        setLoading(true)

        const productResponse = await fetch(`/api/products/${productId}`)

        if (!productResponse.ok) {
          throw new Error('Product not found')
        }

        const productData = await productResponse.json()

        console.log(productData)

        if (productData.success && productData.product) {
          const product = {
            ...productData.product,
            price: productData.product.pricing?.salePrice || productData.product.pricing?.basePrice || 0,
            originalPrice: productData.product.pricing?.basePrice,
            discount: productData.product.pricing?.basePrice && productData.product.pricing?.salePrice
              ? Math.round(((productData.product.pricing.basePrice - productData.product.pricing.salePrice) / productData.product.pricing.basePrice) * 100)
              : 0,
            rating: productData.product.ratings?.average || 0,
            reviews: productData.product.ratings?.count || 0,
            inStock: productData.product.inventory?.stock > 0,
            options: productData.product.options || [],
            variants: productData.product.variants || [],
            colors: productData.product.variants?.colors || [
              { name: 'Default', code: '#E5E7EB', available: true }
            ],
            images: productData.product.images?.map(img => img.url) || [],
            seller: {
              name: productData.product.sellerId?.storeInfo?.storeName ||
                productData.product.sellerId?.businessInfo?.businessName ||
                productData.product.sellerId?.personalDetails?.fullName ||
                'Official Store',
              logo: productData.product.sellerId?.storeInfo?.storeLogo,
              rating: productData.product.sellerId?.ratings?.average || 0,
              products: productData.product.sellerProductCount || 0
            },
            specifications: productData.product.specifications || [],
            description: productData.product.description || '',
            features: productData.product.features || [],
            highlights: productData.product.highlights || []
          }

          setProduct(product)

          if (productData.product.relatedProducts) {
            setRelatedProducts(productData.product.relatedProducts)
          }

          try {
            const similarResponse = await fetch(`/api/products?category=${productData.product.category}&limit=8`)
            if (similarResponse.ok) {
              const similarData = await similarResponse.json()
              if (similarData.success) {
                const filtered = (similarData.products || []).filter(p => p._id !== productId)
                setSimilarProducts(filtered.slice(0, 8))
              }
            }
          } catch (similarError) {
            console.error('Failed to fetch similar products:', similarError)
          }

          try {
            const reviewsResponse = await fetch(`/api/products/${productId}/reviews`)
            if (reviewsResponse.ok) {
              const reviewsData = await reviewsResponse.json()
              if (reviewsData.success) {
                setReviews(reviewsData.reviews || [])
                setReviewStats(reviewsData.stats || null)
              }
            }
          } catch (reviewError) {
            console.error('Failed to fetch reviews:', reviewError)
          }

          try {
            const recentlyViewedIds = JSON.parse(localStorage.getItem('recentlyViewed') || '[]')
            const updatedIds = [productId, ...recentlyViewedIds.filter(id => id !== productId)].slice(0, 10)
            localStorage.setItem('recentlyViewed', JSON.stringify(updatedIds))

            if (updatedIds.length > 1) {
              const recentIds = updatedIds.slice(1, 9)
              const recentResponse = await fetch(`/api/products?ids=${recentIds.join(',')}`)
              if (recentResponse.ok) {
                const recentData = await recentResponse.json()
                if (recentData.success) {
                  setRecentlyViewed(recentData.products || [])
                }
              }
            }
          } catch (recentError) {
            console.error('Failed to manage recently viewed:', recentError)
          }
        } else {
          setProduct(null)
        }
      } catch (error) {
        console.error('Failed to fetch product:', error)
        setProduct(null)
      } finally {
        setLoading(false)
      }
    }

    fetchProductData()

    return () => {
      setProduct(null)
      setReviews([])
      setReviewStats(null)
      setRelatedProducts([])
      setSimilarProducts([])
      setRecentlyViewed([])
      setSelectedImage(0)
      setSelectedOptions({})
      setActiveVariant(null)
      setQuantity(1)
    }
  }, [params.id])

  // New Effect: Find Active Variant
  useEffect(() => {
    if (product && product.variants?.length > 0) {
      const variant = product.variants.find(v => {
        const vAttrs = v.attributes instanceof Map ? Object.fromEntries(v.attributes) : v.attributes;
        // Robust object comparison
        const keys = Object.keys(vAttrs);
        const selectedKeys = Object.keys(selectedOptions);
        if (keys.length !== selectedKeys.length) return false;
        return keys.every(k => vAttrs[k] === selectedOptions[k]);
      })
      setActiveVariant(variant || null)

      // If variant has a specific image, switch to it (if we added it to schema)
      if (variant && variant.imageIndex !== undefined) {
        setSelectedImage(variant.imageIndex)
      }
    }
  }, [selectedOptions, product])

  // New logic to initialize selectedOptions when product is loaded
  useEffect(() => {
    if (product && product.options?.length > 0) {
      const initial = {}
      product.options.forEach(opt => {
        if (opt.values?.length > 0) initial[opt.name] = opt.values[0]
      })
      setSelectedOptions(initial)
    }
  }, [product])

  const checkPincode = async (codeToORUse) => {
    const code = codeToORUse || pincode;
    if (code.length === 6) {
      try {
        setShippingLoading(true)
        const productId = extractIdFromSlug(params.id)

        const response = await fetch('/api/shipping/estimate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, deliveryPincode: code })
        })

        const data = await response.json()

        if (data.success && data.estimate) {
          setPincodeChecked(true)
          const edd = new Date(data.estimate.etd)

          setDeliveryInfo({
            standardDate: edd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            expressDate: 'Tomorrow',
            location: localStorage.getItem('userLocation') || 'your location',
            courier: data.estimate.courier
          })

          if (!codeToORUse) toast.success(`Delivery available via ${data.estimate.courier}!`)
        } else {
          toast.error(data.message || 'Delivery not available for this pincode')
          setPincodeChecked(false)
        }
      } catch (error) {
        console.error('Failed to check shipping:', error)
        toast.error('Failed to check delivery serviceability')
      } finally {
        setShippingLoading(false)
      }
    } else {
      toast.error('Please enter a valid 6-digit pincode')
    }
  }

  // Auto-check shipping if pincode exists in localStorage
  useEffect(() => {
    if (product) {
      const savedPincode = localStorage.getItem('userPincode')
      if (savedPincode) {
        setPincode(savedPincode)
        checkPincode(savedPincode)
      }
    }
  }, [product])

  const handleAddToCart = () => {
    if (!product) return

    addToCart(product, quantity, activeVariant || null)

    toast.success('Added to cart!')
  }

  const handleBuyNow = () => {
    handleAddToCart()
    router.push('/cart')
  }

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading product...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiPackage className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product not found</h2>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all"
          >
            Browse all products
            <FiChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-[#FDFDFF]">
        {/* Premium Mobile App-Style Sticky Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 p-4 z-50 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsWishlisted(!isWishlisted)}
              className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded-2xl group active:scale-90 transition-all"
            >
              {isWishlisted ? (
                <FaHeart className="w-5 h-5 text-[#FF2E5B] animate-bounce" />
              ) : (
                <FiHeart className="w-5 h-5 text-gray-500 group-hover:text-[#FF2E5B]" />
              )}
            </button>
            <div className="flex-1 flex gap-2">
              <button
                onClick={handleAddToCart}
                className="flex-1 py-4 bg-[#111111] text-white font-bold rounded-2xl hover:bg-black transition-all shadow-xl shadow-gray-200 active:scale-95 text-sm uppercase tracking-wider"
              >
                Add to Bag
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 py-4 bg-gradient-to-r from-[#FF9900] to-[#FF6B00] text-white font-bold rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-orange-100 active:scale-95 text-sm uppercase tracking-wider"
              >
                Get it Now
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8 pb-24 lg:pb-12">
          {/* Minimalist Breadcrumb */}
          <nav className="mb-10 px-2">
            <ol className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em]">
              <li>
                <Link href="/" className="text-gray-400 hover:text-black transition-colors">
                  Home
                </Link>
              </li>
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              <li>
                <Link href="/products" className="text-gray-400 hover:text-black transition-colors">
                  Shop
                </Link>
              </li>
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              <li className="text-black font-black truncate max-w-[150px]">{product.name}</li>
            </ol>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Left Column - Image Gallery */}
            <div className="lg:col-span-6">
              <div className="sticky top-28 space-y-6">
                {/* Image Container with Custom Shadow */}
                <div className="relative bg-white rounded-[2rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] border border-gray-50 group">
                  {/* Visual Badges */}
                  <div className="absolute top-8 left-8 z-10 space-y-3">
                    {product.discount > 0 && (
                      <div className="bg-[#111] text-white px-4 py-2 rounded-xl font-black text-[12px] tracking-widest shadow-xl backdrop-blur-md">
                        -{product.discount}% OFF
                      </div>
                    )}
                    <div className="bg-white/90 px-4 py-2 rounded-xl font-black text-[10px] tracking-[0.15em] border border-gray-100 shadow-sm text-gray-900">
                      PREMIUM
                    </div>
                  </div>

                  {/* Main Action Buttons on Image */}
                  <div className="absolute top-8 right-8 z-10 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 group-hover:translate-x-0">
                    <button
                      onClick={() => setIsWishlisted(!isWishlisted)}
                      className={`w-12 h-12 ${isWishlisted ? 'bg-white text-[#FF2E5B]' : 'bg-white/80 text-gray-900'} backdrop-blur-md rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-90 transition-all`}
                    >
                      {isWishlisted ? <FaHeart className="w-5 h-5" /> : <FiHeart className="w-5 h-5" />}
                    </button>
                    <button className="w-12 h-12 bg-white/80 text-gray-900 backdrop-blur-md rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-all">
                      <FiShare2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Main Product Viewer */}
                  <div className="aspect-[4/5] relative flex items-center justify-center p-12 lg:p-16">
                    {product.images[selectedImage] ? (
                      <img
                        src={product.images[selectedImage]}
                        alt={product.name}
                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-50">
                        <FiImage className="w-20 h-20 text-gray-200" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Minimalist Thumbnail Scroller */}
                {product.images.length > 1 && (
                  <div className="flex justify-center gap-4 py-2">
                    {product.images.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`relative w-16 h-20 rounded-2xl overflow-hidden border-2 transition-all hover:scale-110 ${selectedImage === index
                          ? 'border-black shadow-lg ring-4 ring-gray-100'
                          : 'border-transparent opacity-50 hover:opacity-100'
                          }`}
                      >
                        <img src={img} alt={`View ${index + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square bg-white rounded-xl p-2 border-2 transition-all hover:scale-105 ${selectedImage === index
                      ? 'border-blue-600 ring-2 ring-blue-100'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <img src={img} alt={`View ${index + 1}`} className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Product Details */}
        <div className="lg:col-span-6 lg:pl-4">
          <div className="space-y-8">
            {/* Title & Stats */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="bg-[#E7F7ED] text-[#00B058] px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">Verified Quality</span>
                {product.brand && <span className="text-gray-400 font-bold text-[10px] tracking-[0.2em] uppercase">{product.brand}</span>}
              </div>
              <h1 className="text-3xl lg:text-5xl font-black text-[#111] leading-[1.1] tracking-tight">
                {product.name}
              </h1>

              <div className="flex items-center gap-6">
                {product.rating > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-black text-white px-3 py-1.5 rounded-xl">
                      <span className="font-bold text-sm tracking-tighter">{product.rating.toFixed(1)}</span>
                      <FiStar className="w-3.5 h-3.5 fill-[#FFB800] text-[#FFB800]" />
                    </div>
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                      {product.reviews.toLocaleString()} Reviews
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${product.inStock ? 'bg-[#00B058]' : 'bg-red-500'} animate-pulse`} />
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
              </div>
            </div>

            {/* Price Area - Blinkit Style */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.03)] border border-gray-50">
              <div className="flex flex-col gap-1 mb-8">
                <div className="flex items-baseline gap-4">
                  <span className="text-5xl lg:text-6xl font-[1000] text-[#111] tracking-tighter">
                    ₹{(activeVariant?.price || product.price).toLocaleString()}
                  </span>
                  {product.originalPrice > (activeVariant?.price || product.price) && (
                    <span className="text-2xl text-gray-300 line-through font-medium">
                      ₹{product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
                {product.discount > 0 && (
                  <div className="inline-flex items-center gap-2 mt-2">
                    <span className="bg-[#FFEDE1] text-[#FF6B00] px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider">
                      Save ₹{(product.originalPrice - (activeVariant?.price || product.price)).toLocaleString()}
                    </span>
                    <span className="text-gray-400 text-xs font-medium">on this purchase</span>
                  </div>
                )}
              </div>

              {/* Exclusive Offers - Swiggy Style */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex gap-4 p-5 rounded-[1.5rem] bg-[#F8FAFF] border border-[#E8EEFF] group hover:bg-[#EEF3FF] transition-all cursor-pointer">
                  <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0">
                    <FiCreditCard className="text-[#4B88FF]" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-[#111]">Bank Offer</h4>
                    <p className="text-[10px] text-gray-500 mt-1 font-medium leading-relaxed">Flat 10% Discount on major Cards</p>
                  </div>
                </div>
                <div className="flex gap-4 p-5 rounded-[1.5rem] bg-[#F9FEF9] border border-[#E9FEE9] group hover:bg-[#F2FEF2] transition-all cursor-pointer">
                  <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0">
                    <FiZap className="text-[#00B058]" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-[#111]">Rush Delivery</h4>
                    <p className="text-[10px] text-gray-500 mt-1 font-medium leading-relaxed">Free ship on prepaid orders</p>
                  </div>
                </div>
              </div>

              {/* Blitz Highlights */}
              {product.highlights && product.highlights.length > 0 && (
                <div className="mt-8 pt-8 border-t border-gray-100 grid grid-cols-2 gap-y-4">
                  {product.highlights.slice(0, 4).map((highlight, idx) => (
                    <div key={idx} className="flex items-center gap-3 font-medium text-gray-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-black flex-shrink-0" />
                      <span className="text-[11px] font-black uppercase tracking-widest text-[#555] line-clamp-1">
                        {highlight}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Variant Selection Logic */}
            {product.options && product.options.filter(opt => opt.values?.length > 0).map((option, optIdx) => (
              <div key={optIdx} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-[1000] text-gray-400 uppercase tracking-[0.3em]">
                    Select {option.name}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-4">
                  {option.values.map((val, valIdx) => {
                    const linkedVariant = product.variants?.find(v => {
                      const vAttrs = v.attributes instanceof Map ? Object.fromEntries(v.attributes) : v.attributes;
                      return vAttrs[option.name] === val;
                    });
                    const hasImage = linkedVariant && linkedVariant.imageIndex !== undefined && product.images[linkedVariant.imageIndex];

                    return (
                      <button
                        key={valIdx}
                        onClick={() => setSelectedOptions(prev => ({ ...prev, [option.name]: val }))}
                        className={`group relative flex items-center gap-2 rounded-2xl border-2 transition-all duration-300 ${selectedOptions[option.name] === val
                          ? 'border-black bg-black text-white hover:bg-[#1a1a1a]'
                          : 'border-gray-100 hover:border-black bg-white'
                          } ${hasImage ? 'p-1.5 pr-6' : 'px-8 py-3'}`}
                      >
                        {hasImage && (
                          <div className="w-12 h-12 rounded-[0.75rem] overflow-hidden bg-white flex-shrink-0">
                            <img
                              src={product.images[linkedVariant.imageIndex]}
                              alt={val}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        )}
                        <span className="text-[11px] font-black uppercase tracking-widest">
                          {val}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Quantity Selector */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-[1000] text-gray-400 uppercase tracking-[0.3em]">
                Quantity
              </h3>
              <div className="flex items-center gap-6">
                <div className="inline-flex items-center bg-gray-50 border border-gray-100 rounded-2xl p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-black hover:bg-white rounded-xl transition-all"
                  >
                    <FiMinus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-black text-sm text-[#111]">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-black hover:bg-white rounded-xl transition-all"
                  >
                    <FiPlus className="w-4 h-4" />
                  </button>
                </div>
                {(activeVariant ? activeVariant.stock : product.inventory?.stock) !== undefined && (
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00B058]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#00B058]">
                      {activeVariant ? activeVariant.stock : product.inventory.stock} Left in Stock
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Action Buttons */}
            <div className="hidden lg:grid grid-cols-2 gap-4 pt-4">
              <button
                onClick={handleAddToCart}
                className="group relative h-20 bg-white border-[3px] border-black rounded-[1.5rem] font-black uppercase tracking-[0.1em] text-sm overflow-hidden transition-all hover:bg-black hover:text-white active:scale-95"
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  <FiPackage className="w-5 h-5 group-hover:animate-bounce" />
                  Move to Bag
                </span>
              </button>
              <button
                onClick={handleBuyNow}
                className="h-20 bg-gradient-to-r from-[#FF9900] to-[#FF6B00] text-white rounded-[1.5rem] font-black uppercase tracking-[0.1em] text-sm shadow-[0_20px_40px_-15px_rgba(255,153,0,0.4)] transition-all hover:scale-[1.02] hover:shadow-[0_25px_50px_-12px_rgba(255,153,0,0.5)] active:scale-95"
              >
                Buy Instantly
              </button>
            </div>
          </div>

          {/* Advanced Delivery Card - Swiggy/Blinkit Style */}
          <div className="bg-[#111] rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-[1.25rem] flex items-center justify-center">
                    <FiTruck className="w-6 h-6 text-[#FFCC00]" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg">Blitz Delivery</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-0.5">Hyper-Fast Fulfilment</p>
                  </div>
                </div>
                {pincodeChecked && (
                  <button
                    onClick={() => {
                      setPincodeChecked(false)
                      setPincode('')
                      setDeliveryInfo(null)
                    }}
                    className="text-[11px] font-black text-white/50 hover:text-white uppercase tracking-widest transition-colors underline underline-offset-8"
                  >
                    Change
                  </button>
                )}
              </div>

              {!pincodeChecked ? (
                <div className="space-y-6">
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <FiMapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="text"
                        placeholder="Checking shipping to..."
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="w-full h-16 bg-white/5 border-2 border-white/10 rounded-[1.25rem] pl-16 pr-6 text-sm font-bold focus:border-[#FFCC00] focus:ring-0 transition-all outline-none"
                        maxLength={6}
                      />
                    </div>
                    <button
                      onClick={() => checkPincode()}
                      disabled={shippingLoading || !pincode.trim()}
                      className="px-10 h-16 bg-[#FFCC00] text-black font-black uppercase tracking-widest text-xs rounded-[1.25rem] hover:scale-105 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {shippingLoading ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" /> : 'Check'}
                    </button>
                  </div>
                  <div className="flex items-center gap-3 text-white/50 px-4">
                    <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
                    <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">Usually delivered in 2-4 days across India</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-6 p-6 bg-white/5 rounded-[1.5rem] border border-white/10">
                    <div className="w-12 h-12 bg-[#00B058]/20 rounded-full flex items-center justify-center">
                      <FiCheck className="w-6 h-6 text-[#00B058]" />
                    </div>
                    <div>
                      <p className="text-[11px] text-white/50 font-black uppercase tracking-widest mb-1">Delivering to {deliveryInfo?.location || 'Your Home'}</p>
                      <p className="text-xl font-bold">Standard Delivery by <span className="text-[#FFCC00]">{deliveryInfo?.standardDate}</span></p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6 pt-4">
                    {[
                      { icon: FiShield, title: 'Secure', sub: 'Shipping' },
                      { icon: FiRefreshCw, title: 'Easy', sub: 'Return' },
                      { icon: FiCreditCard, title: 'COD', sub: 'Enabled' }
                    ].map((item, idx) => (
                      <div key={idx} className="text-center group cursor-pointer">
                        <div className="w-12 h-12 bg-white/5 rounded-[1rem] flex items-center justify-center mx-auto mb-3 group-hover:bg-[#FFCC00] group-hover:text-black transition-all duration-300">
                          <item.icon className="w-5 h-5" />
                        </div>
                        <h4 className="text-[9px] font-black text-white/50 uppercase tracking-[0.2em]">{item.title}</h4>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em]">{item.sub}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Brand Store Card - Dribbble Style */}
          {product.sellerId && (
            <div className="bg-white rounded-[2.5rem] p-8 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.06)] border border-gray-50 group hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] transition-all duration-500">
              <div className="flex items-center gap-3 mb-8">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400">Merchant Profile</h3>
              </div>

              <div className="flex items-center gap-6 mb-10">
                <div className="w-24 h-24 rounded-[2rem] bg-gray-50 flex items-center justify-center text-gray-900 border-4 border-gray-50 shadow-inner group-hover:rotate-6 transition-transform duration-700 overflow-hidden">
                  {product.sellerId.storeInfo?.storeLogo ? (
                    <img src={product.sellerId.storeInfo.storeLogo} alt={product.sellerId.storeInfo.storeName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-black">{product.sellerId.storeInfo?.storeName?.charAt(0) || 'S'}</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-2xl font-black text-gray-900 tracking-tighter">
                      {product.sellerId.storeInfo?.storeName || product.sellerId.businessInfo?.businessName}
                    </h4>
                    <div className="flex items-center gap-1 bg-[#E7F7ED] text-[#00B058] px-2 py-0.5 rounded-lg">
                      <FiCheck className="w-3 h-3" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 bg-black text-white px-3 py-1 rounded-xl text-[10px] font-bold">
                      <FiStar className="w-3 h-3 fill-[#FFB800] text-[#FFB800]" />
                      {product.sellerId.ratings?.average ? product.sellerId.ratings.average.toFixed(1) : '0.0'}
                    </div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{product.seller.products || 0} Products Live</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Link
                  href={`/seller/store/${product.sellerId._id}`}
                  className="h-16 flex items-center justify-center bg-gray-50 border border-gray-100 text-black font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-black hover:text-white transition-all duration-300"
                >
                  Explore Store
                </Link>
                <button className="h-16 bg-white border-2 border-black text-black font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-gray-50 transition-all duration-300">
                  Message
                </button>
              </div>
            </div>
          )}

          {/* Product Information - Accordion Style */}
          <div className="space-y-3">
            {/* Description */}
            {product.description && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <button
                  onClick={() => toggleSection('description')}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <FiPackage className="w-5 h-5 text-blue-600" />
                    Product Description
                  </h3>
                  {expandedSections.description ? (
                    <FiChevronUp className="w-5 h-5 text-gray-600" />
                  ) : (
                    <FiChevronDown className="w-5 h-5 text-gray-600" />
                  )}
                </button>
                {expandedSections.description && (
                  <div className="px-6 pb-6">
                    <div className="prose max-w-none">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line mb-6">
                        {product.description}
                      </p>

                      {product.features && product.features.length > 0 && (
                        <div>
                          <h4 className="text-base font-bold text-gray-900 mb-4">Key Features</h4>
                          <ul className="space-y-3">
                            {product.features.map((feature, index) => (
                              <li key={index} className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <FiCheck className="w-4 h-4 text-green-600" />
                                </div>
                                <span className="text-gray-700 flex-1">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Specifications */}
            {product.specifications && (Array.isArray(product.specifications) ? product.specifications.length > 0 : Object.keys(product.specifications).length > 0) && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <button
                  onClick={() => toggleSection('specifications')}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <FiCheck className="w-5 h-5 text-green-600" />
                    Specifications
                  </h3>
                  {expandedSections.specifications ? (
                    <FiChevronUp className="w-5 h-5 text-gray-600" />
                  ) : (
                    <FiChevronDown className="w-5 h-5 text-gray-600" />
                  )}
                </button>
                {expandedSections.specifications && (
                  <div className="px-6 pb-6">
                    <div className="divide-y divide-gray-100">
                      {Array.isArray(product.specifications) ? (
                        product.specifications.map((spec, index) => (
                          <div key={spec._id || index} className="flex justify-between py-4 gap-4">
                            <span className="text-gray-600 font-medium">{spec.key}</span>
                            <span className="font-bold text-gray-900 text-right">
                              {typeof spec.value === 'object' ? JSON.stringify(spec.value) : String(spec.value)}
                            </span>
                          </div>
                        ))
                      ) : (
                        Object.entries(product.specifications).map(([key, value]) => (
                          <div key={key} className="flex justify-between py-4 gap-4">
                            <span className="text-gray-600 font-medium">{key}</span>
                            <span className="font-bold text-gray-900 text-right">
                              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Warranty & Returns */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <button
                onClick={() => toggleSection('warranty')}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <FiShield className="w-5 h-5 text-orange-600" />
                  Warranty & Returns
                </h3>
                {expandedSections.warranty ? (
                  <FiChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <FiChevronDown className="w-5 h-5 text-gray-600" />
                )}
              </button>
              {expandedSections.warranty && (
                <div className="px-6 pb-6 space-y-6">
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FiTruck className="w-4 h-4 text-blue-600" />
                      </div>
                      Shipping Information
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-700 ml-10">
                      <li className="flex items-start gap-2">
                        <FiCheck className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        Free standard shipping on orders above ₹500
                      </li>
                      <li className="flex items-start gap-2">
                        <FiCheck className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        Express shipping available at ₹99
                      </li>
                      <li className="flex items-start gap-2">
                        <FiCheck className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        Standard delivery: 5-7 business days
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                        <FiRefreshCw className="w-4 h-4 text-orange-600" />
                      </div>
                      Return Policy
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-700 ml-10">
                      <li className="flex items-start gap-2">
                        <FiCheck className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        7-day easy return policy
                      </li>
                      <li className="flex items-start gap-2">
                        <FiCheck className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        Product must be unused and in original packaging
                      </li>
                      <li className="flex items-start gap-2">
                        <FiCheck className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        Free return pickup available
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <FiAward className="w-4 h-4 text-green-600" />
                      </div>
                      Warranty Coverage
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-700 ml-10">
                      <li className="flex items-start gap-2">
                        <FiCheck className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        1-year manufacturer warranty
                      </li>
                      <li className="flex items-start gap-2">
                        <FiCheck className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        Covers manufacturing defects
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Ratings & Reviews */}
          {reviews && reviews.length > 0 && (
            <div className="bg-white rounded-2xl p-6 mt-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <FiStar className="w-5 h-5 text-yellow-600" />
                </div>
                <h3 className="font-bold text-gray-900">Customer Reviews</h3>
              </div>

              {/* Rating Summary */}
              {reviewStats && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-gray-200">
                  <div className="flex flex-col items-center justify-center text-center bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6">
                    <div className="text-6xl font-black text-gray-900 mb-3">
                      {reviewStats.averageRating?.toFixed(1) || '0.0'}
                    </div>
                    <div className="flex text-yellow-400 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <FiStar
                          key={i}
                          className={`w-6 h-6 ${i < Math.floor(reviewStats.averageRating || 0)
                            ? 'fill-yellow-400'
                            : ''
                            }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 font-bold">
                      Based on {reviewStats.totalReviews || 0} reviews
                    </p>
                  </div>

                  <div className="space-y-3">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = reviewStats.distribution?.[star] || 0
                      const percentage = reviewStats.totalReviews > 0
                        ? Math.round((count / reviewStats.totalReviews) * 100)
                        : 0
                      return (
                        <div key={star} className="flex items-center gap-3">
                          <span className="text-sm font-bold text-gray-700 w-8">{star}</span>
                          <FiStar className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-bold text-gray-500 w-12 text-right">
                            {percentage}%
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Reviews List */}
              <div className="space-y-6">
                {(showAllReviews ? reviews : reviews.slice(0, 3)).map((review, index) => (
                  <div
                    key={review._id || index}
                    className="border-b border-gray-100 pb-6 last:border-0"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 ${[
                          'bg-blue-100 text-blue-600',
                          'bg-green-100 text-green-600',
                          'bg-purple-100 text-purple-600',
                          'bg-orange-100 text-orange-600',
                          'bg-pink-100 text-pink-600'
                        ][index % 5]
                          }`}
                      >
                        {review.userId?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-bold text-gray-900">
                            {review.userId?.name || 'Anonymous'}
                          </h4>
                          {review.verifiedPurchase && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded flex items-center gap-1">
                              <FiCheck className="w-3 h-3" />
                              Verified
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <FiStar
                                key={i}
                                className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400' : ''}`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>

                        {review.title && (
                          <h5 className="font-bold text-gray-900 mb-2">{review.title}</h5>
                        )}

                        <p className="text-gray-700 leading-relaxed mb-4">{review.comment}</p>

                        {review.photos && review.photos.length > 0 && (
                          <div className="grid grid-cols-3 gap-3 mb-4">
                            {review.photos.map((photo, photoIndex) => (
                              <div
                                key={photoIndex}
                                className="aspect-square bg-gray-100 rounded-xl overflow-hidden"
                              >
                                <img
                                  src={photo.url}
                                  alt={photo.caption || `Review ${photoIndex + 1}`}
                                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-300 cursor-pointer"
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-4">
                          <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors text-sm font-semibold">
                            <FiThumbsUp className="w-4 h-4" />
                            Helpful ({review.helpful?.count || 0})
                          </button>
                          <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors text-sm font-semibold">
                            <FiMessageCircle className="w-4 h-4" />
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {reviews.length > 3 && (
                <button
                  onClick={() => setShowAllReviews(!showAllReviews)}
                  className="w-full mt-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {showAllReviews ? (
                    <>
                      Show Less
                      <FiChevronUp className="w-5 h-5" />
                    </>
                  ) : (
                    <>
                      View All {reviews.length} Reviews
                      <FiChevronDown className="w-5 h-5" />
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recommended & History Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 space-y-24">
        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="bg-white rounded-[3rem] p-12 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.06)] border border-gray-50">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2">Our Curated Picks</h3>
                <h2 className="text-4xl font-black text-gray-900 tracking-tight">You May Also Like</h2>
              </div>
              <Link href="/products" className="group flex items-center gap-3 bg-black text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:scale-105 transition-all active:scale-95">
                View All
                <FiChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {relatedProducts.slice(0, 4).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        )}

        {/* Similar Products */}
        {similarProducts && similarProducts.length > 0 && (
          <div className="bg-white rounded-[3rem] p-12 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.06)] border border-gray-50">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2">Similar Experience</h3>
                <h2 className="text-4xl font-black text-gray-900 tracking-tight">From this Category</h2>
              </div>
              <Link href={`/products?category=${product?.category}`} className="group flex items-center gap-3 bg-black text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:scale-105 transition-all active:scale-95">
                View All
                <FiChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {similarProducts.slice(0, 4).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        )}

        {/* Recently Viewed */}
        {recentlyViewed && recentlyViewed.length > 0 && (
          <div className="bg-white rounded-[3rem] p-12 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.06)] border border-gray-50">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2">Your History</h3>
                <h2 className="text-4xl font-black text-gray-900 tracking-tight">Recently Viewed</h2>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {recentlyViewed.slice(0, 4).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
