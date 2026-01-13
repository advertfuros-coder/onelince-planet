'use client'
import Header from '@/components/customer/Header'
import HeroBanner from '@/components/customer/HeroBanner'
import PocketFriendlyBargain from '@/components/customer/PocketFriendlyBargain'
import TodaysBestDeals from '@/components/customer/TodaysBestDeals'
import PromotionalCards from '@/components/customer/PromotionalCards'
import Footer from '@/components/customer/Footer'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <HeroBanner />
        <PocketFriendlyBargain />
        <TodaysBestDeals />
        <PromotionalCards />
      </main>
      <Footer />
    </div>
  )
}
