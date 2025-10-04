// app/seller/layout.jsx
import ProtectedRoute from '@/components/ProtectedRoute'

export default function SellerLayout({ children }) {
  return (
    <ProtectedRoute allowedRoles={['seller']}>
      <div className="seller-layout">
        {/* Seller Sidebar/Header */}
        <main>{children}</main>
      </div>
    </ProtectedRoute>
  )
}
