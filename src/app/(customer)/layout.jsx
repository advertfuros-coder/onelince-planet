// app/(customer)/layout.jsx
import Header from '@/components/customer/Header'
import Footer from '@/components/customer/Footer'

export default function CustomerLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        {children}
      </main>
      <Footer />
    </div>
  )
}
