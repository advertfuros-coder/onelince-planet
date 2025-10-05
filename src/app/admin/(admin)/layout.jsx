// app/(admin)/layout.jsx
import AdminSidebar from '@/components/admin/AdminSidebar.jsx'
import AdminHeader from '@/components/admin/AdminHeader.jsx'

export default function AdminLayout({ children }) {
  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
