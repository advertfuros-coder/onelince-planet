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

        if (productData.success && productData.product) {
          const product = {
            ...productData.product,
            price: productData.product.pricing?.salePrice || productData.product.pricing?.basePrice || 0,
            originalPrice: productData.product.pricing?.basePrice,
            discount: productData.product.pricing?.basePrice && productData.product.pricing?.salePrice
              ? Math.round(((productData.product.pricing.basePrice - productData.product.pricing.salePrice) / productData.product.pricing.basePrice) * 100)
              : 0,
            rating: productData.product.ratings?.average || 0,
            reviews: productData.product.ratings?.totalReviews || 0,
            inStock: productData.product.inventory?.stock > 0,
            colors: productData.product.variants?.colors || [
              { name: 'Default', code: '#E5E7EB', available: true }
            ],
            images: productData.product.images?.map(img => img.url) || [],
            seller: {
              name: productData.product.sellerId?.storeInfo?.storeName || 'Official Store',
              rating: 4.5,
              products: 234
            },
            specifications: productData.product.specifications || {},
            description: productData.product.description || '',
            features: productData.product.features || []
          }

          setProduct(product)
          setSelectedColor(0)

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
        // Compare attributes with selectedOptions
        return JSON.stringify(vAttrs) === JSON.stringify(selectedOptions)
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

  const checkPincode = () => {
    if (pincode.length === 6) {
      setPincodeChecked(true)
      const today = new Date()
      const standardDeliveryDate = new Date(today.setDate(today.getDate() + 5))
      const expressDeliveryDate = new Date()
      expressDeliveryDate.setDate(expressDeliveryDate.getDate() + 1)

      setDeliveryInfo({
        standardDate: standardDeliveryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        expressDate: expressDeliveryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        location: 'Mumbai'
      })
      toast.success('Delivery available to your location!')
    } else {
      toast.error('Please enter a valid 6-digit pincode')
    }
  }

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
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sticky Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50 shadow-2xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsWishlisted(!isWishlisted)}
            className="w-12 h-12 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:border-red-500 hover:bg-red-50 transition-all"
          >
            {isWishlisted ? (
              <FaHeart className="w-5 h-5 text-red-500" />
            ) : (
              <FiHeart className="w-5 h-5 text-gray-600" />
            )}
          </button>
          <button
            onClick={handleAddToCart}
            className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg"
          >
            Add to Cart
          </button>
          <button
            onClick={handleBuyNow}
            className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
          >
            Buy Now
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 pb-24 lg:pb-6">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center gap-2 text-sm flex-wrap">
            <li>
              <Link href="/" className="text-gray-600 hover:text-blue-600 transition-colors">
                Home
              </Link>
            </li>
            <FiChevronRight className="w-4 h-4 text-gray-400" />
            <li>
              <Link href="/products" className="text-gray-600 hover:text-blue-600 transition-colors">
                Products
              </Link>
            </li>
            <FiChevronRight className="w-4 h-4 text-gray-400" />
            <li className="text-gray-900 font-medium truncate max-w-xs">{product.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Left Column - Image Gallery */}
          <div className="lg:col-span-5">
            <div className="sticky top-6">
              {/* Sale Badge */}
              {product.discount > 0 && (
                <div className="absolute top-4 left-4 z-10 bg-red-500 text-white px-3 py-1.5 rounded-full font-bold text-sm shadow-lg flex items-center gap-1">
                  <FiPercent className="w-4 h-4" />
                  {product.discount}% OFF
                </div>
              )}

              {/* Wishlist & Share Buttons */}
              <div className="absolute top-4 right-4 z-10 flex gap-2">
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                >
                  {isWishlisted ? (
                    <FaHeart className="w-5 h-5 text-red-500" />
                  ) : (
                    <FiHeart className="w-5 h-5 text-gray-700" />
                  )}
                </button>
                <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                  <FiShare2 className="w-5 h-5 text-gray-700" />
                </button>
              </div>

              {/* Main Image */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 mb-4">
                <div className="aspect-square relative group">
                  {product.images[selectedImage] ? (
                    <img
                      src={product.images[selectedImage]}
                      alt={product.name}
                      className="w-full h-full object-contain p-8"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <FiImage className="w-20 h-20 text-gray-300" />
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
          <div className="lg:col-span-7">
            {/* Product Title & Rating */}
            <div className="bg-white rounded-2xl p-6 mb-4 shadow-sm border border-gray-100">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                {product.name}
              </h1>

              {/* Rating & Reviews */}
              <div className="flex items-center flex-wrap gap-4 mb-6">
                {product.rating > 0 && (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-green-600 text-white px-2.5 py-1 rounded-md">
                        <span className="font-bold text-sm">{product.rating.toFixed(1)}</span>
                        <FiStar className="w-3.5 h-3.5 fill-white" />
                      </div>
                      <span className="text-sm text-gray-600 font-medium">
                        {product.reviews.toLocaleString()} ratings
                      </span>
                    </div>
                    {reviews.length > 0 && (
                      <>
                        <div className="w-1 h-1 rounded-full bg-gray-300" />
                        <span className="text-sm text-gray-600 font-medium">
                          {reviews.length} reviews
                        </span>
                      </>
                    )}
                  </>
                )}

                {product.inStock && (
                  <>
                    <div className="w-1 h-1 rounded-full bg-gray-300" />
                    <div className="flex items-center gap-2 text-green-600">
                      <div className="w-2 h-2 rounded-full bg-green-600 animate-pulse" />
                      <span className="text-sm font-bold">In Stock</span>
                    </div>
                  </>
                )}
              </div>

              {/* Price Section */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 mb-6 border border-blue-100">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-4xl lg:text-5xl font-black text-gray-900">
                    ₹{(activeVariant?.price || product.price).toLocaleString()}
                  </span>
                  {product.originalPrice > (activeVariant?.price || product.price) && (
                    <>
                      <span className="text-xl text-gray-400 line-through">
                        ₹{product.originalPrice.toLocaleString()}
                      </span>
                      <span className="px-2.5 py-1 bg-green-500 text-white text-sm font-bold rounded-md">
                        {Math.round(((product.originalPrice - (activeVariant?.price || product.price)) / product.originalPrice) * 100)}% OFF
                      </span>
                    </>
                  )}
                </div>
                <p className="text-xs text-gray-600 mb-3">Inclusive of all taxes</p>

                {/* Offers */}
                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-sm">
                    <FiCreditCard className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      <strong>Bank Offer:</strong> 10% instant discount on HDFC Cards
                    </span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <FiPercent className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      <strong>Cashback:</strong> Extra 5% cashback on prepaid orders
                    </span>
                  </div>
                </div>
              </div>

              {/* Variant Selection Logic */}
              {product.options && product.options.map((option, optIdx) => (
                <div key={optIdx} className="mb-6 pb-6 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                      Select {option.name}
                    </h3>
                    <span className="text-sm text-blue-600 font-semibold">
                      {selectedOptions[option.name]}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {option.values.map((val, valIdx) => (
                      <button
                        key={valIdx}
                        onClick={() => setSelectedOptions(prev => ({ ...prev, [option.name]: val }))}
                        className={`px-4 py-2 rounded-xl border-2 transition-all hover:scale-105 text-sm font-bold ${selectedOptions[option.name] === val
                            ? 'border-blue-600 bg-blue-50 text-blue-600 ring-2 ring-blue-100 scale-105'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/* Quantity Selector */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">
                  Quantity
                </h3>
                <div className="flex items-center gap-4">
                  <div className="inline-flex items-center bg-gray-100 rounded-lg border-2 border-gray-200">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-12 h-12 flex items-center justify-center text-gray-700 hover:bg-gray-200 rounded-l-lg transition-all active:scale-95"
                    >
                      <FiMinus className="w-5 h-5" />
                    </button>
                    <span className="w-16 text-center font-bold text-lg text-gray-900">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-12 h-12 flex items-center justify-center text-gray-700 hover:bg-gray-200 rounded-r-lg transition-all active:scale-95"
                    >
                      <FiPlus className="w-5 h-5" />
                    </button>
                  </div>
                  {(activeVariant ? activeVariant.stock : product.inventory?.stock) !== undefined && (
                    <span className="text-sm text-gray-600">
                      <strong className="text-gray-900">{activeVariant ? activeVariant.stock : product.inventory.stock}</strong> units available
                    </span>
                  )}
                </div>
              </div>

              {/* Desktop Action Buttons */}
              <div className="hidden lg:grid grid-cols-2 gap-4">
                <button
                  onClick={handleAddToCart}
                  className="py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-200 active:scale-95"
                >
                  <FiPackage className="w-5 h-5" />
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  className="py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-200 active:scale-95"
                >
                  Buy Now
                </button>
              </div>
            </div>

            {/* Delivery & Services */}
            <div className="bg-white rounded-2xl p-6 mb-4 shadow-sm border border-gray-100">
              {/* Delivery Check */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FiTruck className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-gray-900">Delivery Options</h3>
                </div>

                {!pincodeChecked ? (
                  <div>
                    <div className="flex gap-3 mb-3">
                      <div className="relative flex-1">
                        <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Enter delivery pincode"
                          value={pincode}
                          onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          maxLength={6}
                        />
                      </div>
                      <button
                        onClick={checkPincode}
                        className="px-6 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all whitespace-nowrap shadow-lg shadow-blue-200 active:scale-95"
                      >
                        Check
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 flex items-start gap-2">
                      <FiAlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      Enter your pincode to check delivery availability and expected delivery dates
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between p-4 bg-green-50 border-2 border-green-200 rounded-xl mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                          <FiCheck className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">Delivery Available</p>
                          <p className="text-sm text-gray-600">Pincode: {pincode} - {deliveryInfo?.location}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setPincodeChecked(false)
                          setPincode('')
                          setDeliveryInfo(null)
                        }}
                        className="text-blue-600 text-sm font-bold hover:text-blue-700 underline"
                      >
                        Change
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FiTruck className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 mb-1">Standard Delivery</p>
                            <p className="text-2xl font-black text-green-600 mb-1">FREE</p>
                            <p className="text-sm text-gray-600">by {deliveryInfo?.standardDate}</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FiZap className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 mb-1">Express Delivery</p>
                            <p className="text-2xl font-black text-purple-600 mb-1">₹99</p>
                            <p className="text-sm text-gray-600">by {deliveryInfo?.expressDate}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Services Grid */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-100">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <FiShield className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-xs font-bold text-gray-900">1 Year</p>
                  <p className="text-xs text-gray-600">Warranty</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <FiRefreshCw className="w-6 h-6 text-orange-600" />
                  </div>
                  <p className="text-xs font-bold text-gray-900">7 Days</p>
                  <p className="text-xs text-gray-600">Easy Return</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <FiCreditCard className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-xs font-bold text-gray-900">Cash on</p>
                  <p className="text-xs text-gray-600">Delivery</p>
                </div>
              </div>
            </div>

            {/* Seller Information */}
            {product.seller && (
              <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-6 mb-4 shadow-sm border border-purple-100">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <FiPackage className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900">Sold By</h3>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-2xl shadow-lg flex-shrink-0">
                    {product.seller.name?.charAt(0)?.toUpperCase() || 'S'}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-lg mb-1">{product.seller.name}</h4>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex items-center gap-1 bg-green-600 text-white px-2 py-0.5 rounded">
                        <FaStar className="w-3 h-3" />
                        <span className="font-bold">{product.seller.rating?.toFixed(1) || '4.5'}</span>
                      </div>
                      <span className="text-gray-600">•</span>
                      <span className="text-gray-700 font-medium">{product.seller.products || 0} Products</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button className="py-3 bg-white border-2 border-indigo-600 text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-all text-sm flex items-center justify-center gap-2 active:scale-95">
                    <FiBox className="w-4 h-4" />
                    Visit Store
                  </button>
                  <button className="py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95">
                    <FiMessageCircle className="w-4 h-4" />
                    Chat Now
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

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">You May Also Like</h2>
              <Link
                href="/products"
                className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-1 group"
              >
                View All
                <FiChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {relatedProducts.slice(0, 4).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        )}

        {/* Similar Products */}
        {similarProducts && similarProducts.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Similar Products</h2>
              <Link
                href={`/products?category=${product?.category}`}
                className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-1 group"
              >
                View All
                <FiChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {similarProducts.slice(0, 4).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        )}

        {/* Recently Viewed */}
        {recentlyViewed && recentlyViewed.length > 0 && (
          <div className="mt-12 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recently Viewed</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {recentlyViewed.slice(0, 4).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
