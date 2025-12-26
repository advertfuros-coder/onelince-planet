// app/page.jsx - Completely Revamped Modern E-commerce Homepage
import HeroBanner from '@/components/customer/HeroBanner'
import CategoryCircles from '@/components/customer/CategoryCircles'
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
import AppDownloadBanner from '@/components/customer/AppDownloadBanner'

// Fetch products on server side
async function getProducts() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/products?limit=20`, {
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
  const { products } = await getProducts()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Sticky Navigation */}
      <Header />

      {/* Hero Section - Full-width immersive banner */}
      <HeroBanner />

      {/* Categories - Horizontal scrollable with icons */}
      <CategoryCircles />

      {/* Flash Sales - Time-sensitive deals with countdown */}
      <FlashSales />

      {/* Deal of the Day - Single hero product */}
      <DealOfTheDay products={products.slice(0, 1)} />

      {/* Shop by Price - Budget-friendly options */}
      <ShopByPrice />

      {/* Featured Collections - Curated product groups */}
      <FeaturedCollections products={products.slice(0, 8)} />

      {/* Why Choose Us - Trust indicators & benefits */}
      <WhyChooseUs />

      {/* Trending Products - Social proof & popular items */}
      <TrendingProducts products={products.slice(0, 8)} />

      {/* Promotional Banner - Mid-page CTA */}
      <PromotionalBanner />

      {/* Best Sellers - Top performing products */}
      <BestSellers products={products.slice(0, 6)} />

      {/* New Arrivals - Latest products */}
      <NewArrivals products={products.slice(4, 10)} />

      {/* Top Brands - Partner showcase */}
      <TopBrands />

      {/* Features Section - Service highlights */}
      <FeaturesSection />

      {/* Statistics - Social proof numbers */}
      <StatisticsSection />

      {/* Testimonials - Customer reviews */}
      <TestimonialSection />

      {/* App Download Banner - Mobile app promotion */}
      <AppDownloadBanner />

      {/* Newsletter - Lead capture */}
      <Newsletter />

      {/* Footer - Complete site map */}
      <Footer />
    </div>
  )
}