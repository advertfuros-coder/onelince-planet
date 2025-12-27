// app/(admin)/layout.jsx
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import GlobalSearch from '@/components/admin/GlobalSearch'

export default function AdminLayout({ children }) {
  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent p-6 lg:p-10">
          {children}
        </main>
      </div>
      {/* Global Search (Cmd+K) */}
      <GlobalSearch />
    </div>
  )
}
