'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import {
    FiArrowLeft,
    FiArrowRight,
    FiHeart,
    FiShoppingBag,
    FiCheck,
    FiZap
} from 'react-icons/fi'
import { FaHeart } from 'react-icons/fa'
import { createProductUrl } from '@/lib/utils/productUrl'
import { useCart } from '@/lib/context/CartContext'
import { useWishlist } from '@/lib/hooks/useWishlist'
import Price, { StrikePrice } from '@/components/ui/Price'

// Fallback high-quality steal deals data for seamless dev/staging experience
const FALLBACK_STEAL_DEALS = [
    {
        _id: 'steal-fallback-1',
        name: 'Minimalist Matte Leather Crossbody Sling',
        slug: 'minimalist-matte-leather-crossbody-sling',
        images: [{ url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80' }],
        pricing: {
            salePrice: 42,
            basePrice: 119
        },
        discountPercentage: 65,
        limitedStock: true,
        stockRemaining: 4
    },
    {
        _id: 'steal-fallback-2',
        name: 'Over-Ear Active Noise Cancelling Studio Headphones',
        slug: 'over-ear-anc-studio-headphones',
        images: [{ url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80' }],
        pricing: {
            salePrice: 79,
            basePrice: 229
        },
        discountPercentage: 66,
        limitedStock: true,
        stockRemaining: 6
    },
    {
        _id: 'steal-fallback-3',
        name: 'Brushed Titanium Sapphire Automatic Timepiece',
        slug: 'brushed-titanium-automatic-timepiece',
        images: [{ url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80' }],
        pricing: {
            salePrice: 129,
            basePrice: 380
        },
        discountPercentage: 66,
        limitedStock: true,
        stockRemaining: 3
    },
    {
        _id: 'steal-fallback-4',
        name: 'Handcrafted Japanese Ceramic Pour-Over Set',
        slug: 'handcrafted-japanese-ceramic-pour-over',
        images: [{ url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80' }],
        pricing: {
            salePrice: 28,
            basePrice: 75
        },
        discountPercentage: 63,
        limitedStock: true,
        stockRemaining: 9
    },
    {
        _id: 'steal-fallback-5',
        name: 'Anodized Aircraft Aluminum Laptop Riser',
        slug: 'anodized-aluminum-laptop-riser',
        images: [{ url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80' }],
        pricing: {
            salePrice: 34,
            basePrice: 95
        },
        discountPercentage: 64,
        limitedStock: true,
        stockRemaining: 7
    },
    {
        _id: 'steal-fallback-6',
        name: 'Magnetic Wireless Charging Station 3-in-1',
        slug: 'magnetic-wireless-charging-station',
        images: [{ url: 'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=800&auto=format&fit=crop&q=80' }],
        pricing: {
            salePrice: 39,
            basePrice: 110
        },
        discountPercentage: 65,
        limitedStock: true,
        stockRemaining: 5
    },
    {
        _id: 'steal-fallback-7',
        name: 'Organic Heavyweight Fleece Boxy Hoodie',
        slug: 'organic-heavyweight-fleece-hoodie',
        images: [{ url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80' }],
        pricing: {
            salePrice: 48,
            basePrice: 135
        },
        discountPercentage: 64,
        limitedStock: true,
        stockRemaining: 8
    }
]

export default function StealDeals() {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [canScrollLeft, setCanScrollLeft] = useState(false)
    const [canScrollRight, setCanScrollRight] = useState(true)
    const [scrollProgress, setScrollProgress] = useState(0)
    const scrollContainerRef = useRef(null)

    useEffect(() => {
        fetchDeals()
    }, [])

    const fetchDeals = async () => {
        try {
            const response = await fetch('/api/admin/steal-deals')
            const data = await response.json()
            if (data.success && Array.isArray(data.deals) && data.deals.length > 0) {
                setProducts(data.deals)
            } else {
                setProducts(FALLBACK_STEAL_DEALS)
            }
        } catch (error) {
            console.error('Error fetching steal deals:', error)
            setProducts(FALLBACK_STEAL_DEALS)
        } finally {
            setLoading(false)
        }
    }

    const checkScrollButtons = useCallback(() => {
        const el = scrollContainerRef.current
        if (!el) return

        const { scrollLeft, scrollWidth, clientWidth } = el
        setCanScrollLeft(scrollLeft > 8)
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 8)

        const maxScroll = scrollWidth - clientWidth
        if (maxScroll > 0) {
            setScrollProgress(Math.min(100, Math.max(0, (scrollLeft / maxScroll) * 100)))
        } else {
            setScrollProgress(100)
        }
    }, [])

    useEffect(() => {
        const el = scrollContainerRef.current
        if (!el) return

        checkScrollButtons()
        const handleScroll = () => checkScrollButtons()
        el.addEventListener('scroll', handleScroll, { passive: true })
        window.addEventListener('resize', handleScroll)

        return () => {
            el.removeEventListener('scroll', handleScroll)
            window.removeEventListener('resize', handleScroll)
        }
    }, [products, checkScrollButtons])

    const handleScroll = (direction) => {
        const el = scrollContainerRef.current
        if (!el) return

        const scrollAmount = el.clientWidth * 0.75
        el.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
        })
    }

    if (loading) {
        return <StealDealsSkeleton />
    }

    if (products.length === 0) {
        return null
    }

    return (
        <section className="w-full bg-[#FAFAFA] border-y border-neutral-200/70 py-12 md:py-16 overflow-hidden relative">
            {/* Full Width Header Container */}
            <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 mb-8 md:mb-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    {/* Title & Metadata */}
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 text-neutral-100 text-[11px] font-semibold tracking-wider uppercase mb-3.5 shadow-sm">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span>Live Drop</span>
                            <span className="text-neutral-500">•</span>
                            <span className="text-neutral-300 font-normal">Limited Quantities</span>
                        </div>

                        <div className="flex items-baseline gap-3">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-neutral-900 uppercase leading-none font-sans">
                                Steal Deals
                            </h2>
                            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-mono font-semibold px-2 py-0.5 rounded bg-neutral-200/80 text-neutral-700">
                                <FiZap className="w-3.5 h-3.5 text-amber-600" />
                                Up to 70% off
                            </span>
                        </div>

                        <p className="text-neutral-500 text-sm sm:text-base font-normal mt-2.5 max-w-xl leading-relaxed">
                            Hand-picked flash markdowns on signature pieces. Once the vault allocations run dry, original prices resume.
                        </p>
                    </div>

                    {/* Navigation Controls & Counter */}
                    <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
                        <Link
                            href="/products?sort=discount"
                            className="text-xs sm:text-sm font-semibold text-neutral-900 hover:text-neutral-600 transition-colors mr-2 underline underline-offset-4 decoration-neutral-300 hover:decoration-neutral-900"
                        >
                            View all drops
                        </Link>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleScroll('left')}
                                disabled={!canScrollLeft}
                                aria-label="Scroll left"
                                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-neutral-300 bg-white text-neutral-800 flex items-center justify-center hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-all duration-200 shadow-sm active:scale-95 disabled:opacity-25 disabled:pointer-events-none"
                            >
                                <FiArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                            <button
                                onClick={() => handleScroll('right')}
                                disabled={!canScrollRight}
                                aria-label="Scroll right"
                                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-neutral-300 bg-white text-neutral-800 flex items-center justify-center hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-all duration-200 shadow-sm active:scale-95 disabled:opacity-25 disabled:pointer-events-none"
                            >
                                <FiArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Full Width Edge-to-Edge Carousel Row */}
            <div
                ref={scrollContainerRef}
                className="w-full flex gap-4 sm:gap-5 lg:gap-6 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 py-2"
            >
                {products.map((product) => (
                    <div
                        key={product._id}
                        className="w-[260px] sm:w-[280px] md:w-[300px] lg:w-[320px] shrink-0 snap-start flex flex-col"
                    >
                        <StealDealCard product={product} />
                    </div>
                ))}
            </div>

            {/* Minimal Progress Indicator */}
            <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 mt-8 flex justify-center">
                <div className="w-48 sm:w-64 h-1 bg-neutral-200/80 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-neutral-900 rounded-full transition-all duration-150 ease-out"
                        style={{ width: `${Math.max(12, scrollProgress)}%` }}
                    />
                </div>
            </div>
        </section>
    )
}

/**
 * Modern Minimal Steal Deal Card
 */
function StealDealCard({ product }) {
    const { addToCart } = useCart()
    const { isInWishlist, toggleWishlist, actionLoading } = useWishlist()
    const [added, setAdded] = useState(false)

    const isWishlisted = isInWishlist(product._id)
    const productUrl = createProductUrl(product)

    const basePrice = product.pricing?.basePrice || 0
    const salePrice = product.pricing?.salePrice || basePrice
    const discount = product.discountPercentage ||
        (basePrice > 0 ? Math.round(((basePrice - salePrice) / basePrice) * 100) : 0)

    const imageUrl = product.images?.[0]?.url ||
        (typeof product.images?.[0] === 'string' ? product.images[0] : null) ||
        product.image ||
        'https://picsum.photos/seed/steal/600/750'

    const handleClaimDeal = (e) => {
        e.preventDefault()
        e.stopPropagation()

        addToCart({
            _id: product._id,
            id: product._id,
            name: product.name,
            slug: product.slug,
            images: product.images,
            pricing: product.pricing,
            price: salePrice,
            originalPrice: basePrice
        }, 1)

        setAdded(true)
        setTimeout(() => setAdded(false), 2000)
    }

    const handleWishlistClick = (e) => {
        e.preventDefault()
        e.stopPropagation()
        toggleWishlist(product._id)
    }

    // Realistic stock progress calculation for visual tension
    const stockLeft = product.stockRemaining !== undefined && product.stockRemaining !== null
        ? product.stockRemaining
        : (product.limitedStock ? 5 : null)

    return (
        <div className="group relative bg-white rounded-2xl border border-neutral-200/90 hover:border-neutral-400/90 transition-all duration-300 flex flex-col h-full overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_36px_-8px_rgba(0,0,0,0.08)]">
            {/* Image Container */}
            <div className="relative aspect-[4/5] bg-neutral-100 overflow-hidden">
                <Link href={productUrl} className="block w-full h-full">
                    <img
                        src={imageUrl}
                        alt={product.name || 'Steal deal product'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        loading="lazy"
                    />
                </Link>

                {/* Top Badges */}
                <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none z-10">
                    {discount > 0 ? (
                        <span className="pointer-events-auto bg-neutral-950 text-white font-mono text-[11px] font-bold px-2.5 py-1 rounded-md tracking-tight shadow-md">
                            -{discount}%
                        </span>
                    ) : <span />}

                    <button
                        onClick={handleWishlistClick}
                        disabled={actionLoading}
                        aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                        className="pointer-events-auto w-9 h-9 rounded-full bg-white/95 backdrop-blur-sm border border-neutral-200/80 flex items-center justify-center text-neutral-700 hover:text-rose-600 shadow-sm transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-50"
                    >
                        {isWishlisted ? (
                            <FaHeart className="w-4 h-4 text-rose-600" />
                        ) : (
                            <FiHeart className="w-4 h-4" />
                        )}
                    </button>
                </div>

                {/* Desktop Hover Quick Action CTA */}
                <div className="absolute inset-x-3 bottom-3 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out sm:block hidden z-10">
                    <button
                        onClick={handleClaimDeal}
                        className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${
                            added
                                ? 'bg-emerald-600 text-white'
                                : 'bg-neutral-950 hover:bg-neutral-800 text-white'
                        }`}
                    >
                        {added ? (
                            <>
                                <FiCheck className="w-4 h-4 stroke-[2.5]" />
                                <span>Claimed in Cart</span>
                            </>
                        ) : (
                            <>
                                <FiShoppingBag className="w-4 h-4" />
                                <span>Claim Deal</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Content Details */}
            <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between bg-white">
                <div>
                    {/* Scarcity Bar / Stock Indicator */}
                    {stockLeft !== null ? (
                        <div className="mb-2.5">
                            <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                                <span className="font-semibold text-rose-600 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                    Only {stockLeft} left
                                </span>
                                <span className="text-neutral-400">Vault stock</span>
                            </div>
                            <div className="w-full bg-neutral-100 h-1 rounded-full overflow-hidden">
                                <div
                                    className="bg-rose-500 h-full rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(100, Math.max(15, (stockLeft / 10) * 100))}%` }}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 font-mono uppercase tracking-wider mb-2">
                            <span>Vault Drop</span>
                            <span>•</span>
                            <span className="text-emerald-600 font-medium">Available Now</span>
                        </div>
                    )}

                    {/* Product Name */}
                    <Link href={productUrl} className="block">
                        <h3 className="font-medium text-neutral-900 text-sm sm:text-[15px] leading-snug line-clamp-2 hover:text-neutral-600 transition-colors">
                            {product.name}
                        </h3>
                    </Link>
                </div>

                {/* Price Section */}
                <div className="pt-4 border-t border-neutral-100 mt-4">
                    <div className="flex items-baseline justify-between gap-2">
                        <div className="flex items-baseline gap-2">
                            <Price
                                amount={salePrice}
                                className="text-lg sm:text-xl font-bold font-mono tracking-tight text-neutral-950"
                            />
                            {basePrice > salePrice && (
                                <StrikePrice
                                    amount={basePrice}
                                    className="text-xs sm:text-sm text-neutral-400 font-mono"
                                />
                            )}
                        </div>

                        {discount > 0 && (
                            <span className="text-[11px] font-mono font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                                Save {discount}%
                            </span>
                        )}
                    </div>

                    {/* Mobile Quick Action Button */}
                    <button
                        onClick={handleClaimDeal}
                        className={`sm:hidden mt-3 w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                            added
                                ? 'bg-emerald-600 text-white'
                                : 'bg-neutral-950 text-white'
                        }`}
                    >
                        {added ? (
                            <>
                                <FiCheck className="w-3.5 h-3.5" />
                                <span>Claimed</span>
                            </>
                        ) : (
                            <>
                                <FiShoppingBag className="w-3.5 h-3.5" />
                                <span>Claim Deal</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

/**
 * Modern Full-Width Skeleton Loader
 */
function StealDealsSkeleton() {
    return (
        <section className="w-full bg-[#FAFAFA] border-y border-neutral-200/70 py-12 md:py-16 overflow-hidden">
            <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 mb-8 md:mb-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-pulse">
                    <div>
                        <div className="h-6 w-36 bg-neutral-200 rounded-full mb-3" />
                        <div className="h-10 sm:h-12 w-64 bg-neutral-200 rounded-lg" />
                        <div className="h-4 w-80 bg-neutral-200 rounded mt-3" />
                    </div>
                    <div className="flex gap-2">
                        <div className="w-11 h-11 bg-neutral-200 rounded-full" />
                        <div className="w-11 h-11 bg-neutral-200 rounded-full" />
                    </div>
                </div>
            </div>

            <div className="w-full flex gap-4 sm:gap-5 lg:gap-6 overflow-hidden px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="w-[260px] sm:w-[280px] md:w-[300px] lg:w-[320px] shrink-0 bg-white rounded-2xl border border-neutral-200 p-4 space-y-4 animate-pulse"
                    >
                        <div className="aspect-[4/5] bg-neutral-200 rounded-xl" />
                        <div className="space-y-2">
                            <div className="h-3 bg-neutral-200 rounded w-1/3" />
                            <div className="h-4 bg-neutral-200 rounded w-3/4" />
                            <div className="h-4 bg-neutral-200 rounded w-1/2" />
                        </div>
                        <div className="pt-2 flex justify-between items-center">
                            <div className="h-6 bg-neutral-200 rounded w-1/3" />
                            <div className="h-5 bg-neutral-200 rounded w-1/4" />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
