// app/page.jsx - Completely Revamped Modern E-commerce Homepage
import HeroBanner from '@/components/customer/HeroBanner'
import CategoryCircles from '@/components/customer/CategoryCircles'
import TodaysBestDeals from '@/components/customer/TodaysBestDeals'
import SpecialOfferBanner from '@/components/customer/SpecialOfferBanner'
import FlashDealsSection from '@/components/customer/FlashDealsSection'
import PromotionalBanners from '@/components/customer/PromotionalBanners'
import CountdownBanner from '@/components/customer/CountdownBanner'
import BecomeSellerSection from '@/components/customer/BecomeSellerSection'
import FeaturesBar from '@/components/customer/FeaturesBar'
import FlashSales from '@/components/customer/FlashSales'
import TrendingProducts from '@/components/customer/TrendingProducts'
import BestSellers from '@/components/customer/BestSellers'
import NewArrivals from '@/components/customer/NewArrivals'
import TopBrands from '@/components/customer/TopBrands'
import FeaturesSection from '@/components/customer/FeaturesSection'
import PromotionalBanner from '@/components/customer/PromotionalBanner'
import TestimonialSection from '@/components/customer/TestimonialSection'
import StatisticsSection from '@/components/customer/StatisticsSection'
import Newsletter from '@/components/customer/Newsletter'
import Header from '@/components/customer/Header'
import Footer from '@/components/customer/Footer'
import WhyChooseUs from '@/components/customer/WhyChooseUs'
import FeaturedCollections from '@/components/customer/FeaturedCollections'
import DealOfTheDay from '@/components/customer/DealOfTheDay'
import ShopByPrice from '@/components/customer/ShopByPrice'
import StealDeals from '@/components/customer/StealDeals'
import CouponBanner from '@/components/customer/CouponBanner'
import PocketFriendlyBargain from '@/components/customer/PocketFriendlyBargain'
import DealsOfTheDay from '@/components/customer/DealsOfTheDay'
import PromotionalCards from '@/components/customer/PromotionalCards'

import { cookies } from 'next/headers'

// Fetch products on server side
async function getProducts(country = 'AE') {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/products?limit=20&country=${country}`, {
      cache: 'no-store' // Disable cache for fresh data
    })

    if (!res.ok) {
      return { products: [] }
    }

    const data = await res.json()
    return data
  } catch (error) {
    console.error('Error fetching products:', error)
    return { products: [] }
  }
}

export default async function HomePage() {
  const cookieStore = await cookies()
  const country = (await cookieStore.get('op-region'))?.value || 'AE'
  const { products } = await getProducts(country)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Sticky Navigation */}
      <Header />

      {/* Hero Section - Full-width immersive banner */}
      <HeroBanner />

      {/* Interactive Coupon Banner - High conversion driver */}
      <CouponBanner />

      {/* Categories - Horizontal scrollable with icons */}
      <CategoryCircles />

      {/* Pocket Friendly Bargain! - Category-based price filters */}
      <PocketFriendlyBargain />
      {/* Today's Best Deals - Featured products */}
      <TodaysBestDeals />

      {/* Steal Deals - Claimable low-price offers */}
      <StealDeals />

      {/* Deals of the Day - Price drop alerts with extra discounts */}
      <DealsOfTheDay />

      {/* Promotional Cards - Visual marketing banners */}
      <PromotionalCards />

      {/* New Arrivals - Latest products */}
      <NewArrivals />

      {/* Special Offer Banner - Countdown timer with featured deals */}
      <SpecialOfferBanner />

      {/* Promotional Banners - Two colorful promotional sections */}
      <PromotionalBanners />

      {/* Best Sellers - Popular products */}
      <BestSellers />



      {/* Trending Products - Hot items */}
      <TrendingProducts />

      {/* Countdown Banner - Flash sale timer */}
      <CountdownBanner />

      {/* Features Bar - Key benefits */}
      <FeaturesBar />

      {/* Why Choose Us - Trust indicators */}
      <WhyChooseUs />

      {/* Top Brands - Brand showcase */}
      <TopBrands />

      {/* Newsletter - Email subscription */}
      <Newsletter />

      {/* Statistics Section - Company stats */}
      <StatisticsSection />

      {/* Testimonials - Customer reviews */}
      <TestimonialSection />

      {/* Footer - Complete site map */}
      <Footer />
    </div>
  )
} 