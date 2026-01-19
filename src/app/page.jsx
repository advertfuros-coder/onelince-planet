'use client'
import HeroBanner from '@/components/customer/HeroBanner'
import PocketFriendlyBargain from '@/components/customer/PocketFriendlyBargain'
import PromotionalCards from '@/components/customer/PromotionalCards'
import CategoryCircles from '@/components/customer/CategoryCircles'
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
import CategoryGrid from '@/components/customer/CategoryGrid'
import ValentinesSpecial from '@/components/customer/ValentinesSpecial'
 import DealsOfTheDay from '@/components/customer/DealsOfTheDay'
import TodaysBestDeals from '@/components/customer/TodaysBestDeals'
import TrendingNow from '@/components/customer/TrendingNow'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
         <HeroBanner />
         <CouponBanner />
         <CategoryGrid />
         <ValentinesSpecial />

        <PocketFriendlyBargain />
         <TodaysBestDeals />

        {/* Steal Deals - Claimable low-price offers */}
        <StealDeals />



        {/* Deals of the Day - Price drop alerts with extra discounts */}
        <DealsOfTheDay />

        {/* Promotional Cards - Visual marketing banners */}
        <PromotionalCards />

        

        {/* Features Bar - Key benefits */}
        <FeaturesBar />

        {/* Top Brands - Brand showcase */}
        <TopBrands />

        {/* Trending Now - Admin configurable trending products */}
        <TrendingNow />

        {/* Footer - Complete site map */}
      </main>
      <Footer />
    </div>
  )
}
