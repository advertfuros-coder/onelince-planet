// app/(seller)/layout.jsx
import ModernSellerSidebar from '../../../components/seller/ModernSellerSidebar.jsx'
import SellerHeader from '../../../components/seller/SellerHeader.jsx'
import ProtectedRoute from '@/components/ProtectedRoute'
import ForcePasswordChange from '@/components/seller/ForcePasswordChange'

export default function SellerLayout({ children }) {
  return (
    <ProtectedRoute allowedRoles={['seller']}>
      <ForcePasswordChange />
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
        <ModernSellerSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <SellerHeader />
          <main className="flex-1 overflow-x-hidden overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
