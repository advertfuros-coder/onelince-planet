// app/page.jsx
import HeroBanner from '@/components/customer/HeroBanner'
import CategoryCircles from '@/components/customer/CategoryCircles'
import FlashDeals from '@/components/customer/FlashDeals'
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

// Fetch products on server side
async function getProducts() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/products?limit=12`, {
      cache: 'no-store' // Disable cache for fresh data
    })
    
    if (!res.ok) {
      return { products: [] }
    }
    
    const data = await res.json()
    console.log('Fetched products:' , data)
    return data
  } catch (error) {
    console.error('Error fetching products:', error)
    return { products: [] }
  }
}

export default async function HomePage() {
  const { products } = await getProducts()

  return (
    <div className="">
      <Header />
      <HeroBanner />
      <CategoryCircles />
      <FlashDeals products={products.slice(0, 4)} />
      <FeaturesSection />
      <TrendingProducts products={products.slice(0, 6)} />
      <PromotionalBanner />
      <BestSellers products={products.slice(0, 4)} />
      <NewArrivals products={products.slice(0, 4)} />
      <TopBrands />
      <StatisticsSection />
      <TestimonialSection />
      <Newsletter />
      <Footer />
    </div>
  )
}