// app/(customer)/layout.jsx
import Script from 'next/script'
import Header from '@/components/customer/Header'
import Footer from '@/components/customer/Footer'
import LocationPermissionModal from '@/components/customer/LocationPermissionModal'

export default function CustomerLayout({ children }) {
  return (
    <>
      {/* Preload Razorpay for faster checkout */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />

      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-gray-50">
          {children}
        </main>
        <Footer />
        <LocationPermissionModal />
      </div>
    </>
  )
}
