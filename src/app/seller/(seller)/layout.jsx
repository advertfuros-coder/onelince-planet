// app/(seller)/layout.jsx
import SellerSidebar from '../../../components/seller/SellerSidebar.jsx'
import SellerHeader from '../../../components/seller/SellerHeader.jsx'

export default function SellerLayout({ children }) {
  return (
    <div className="flex h-screen bg-gray-100">
      <SellerSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <SellerHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
