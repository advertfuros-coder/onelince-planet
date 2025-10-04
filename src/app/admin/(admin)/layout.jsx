// my-app/src/app/admin/(admin)/layout.js
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AdminLayout({ children }) {
  const pathname = usePathname()

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard' },
    { href: '/admin/users', label: 'Users' },
    { href: '/admin/products', label: 'Products' },
    { href: '/admin/orders', label: 'Orders' },
    { href: '/admin/reviews', label: 'Reviews' },
  ]

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 font-bold uppercase text-xl border-b border-gray-200">
          <Link href="/admin/dashboard">Admin Panel</Link>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`block rounded px-3 py-2 text-gray-700 font-medium hover:bg-gray-200 ${
                pathname.startsWith(href) ? 'bg-gray-200 font-bold' : ''
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  )
}
