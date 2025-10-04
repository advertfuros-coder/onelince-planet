'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import axios from 'axios'
import Link from 'next/link'

export default function AdminDashboard() {
  const { token } = useAuth()
  const [stats, setStats] = useState({ users: 0, products: 0, orders: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    async function fetchStats() {
      try {
        setLoading(true)
        const { data } = await axios.get('/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (data.success) {
          setStats(data.stats)
        }
      } catch (error) {
        console.error('Failed to fetch admin stats', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [token])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="inline-block w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <main className="max-w-6xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        <Link
          href="/admin/users"
          className="rounded-lg border border-gray-300 p-6 text-center shadow-md hover:shadow-lg transition-shadow"
        >
          <h2 className="font-semibold text-2xl mb-2">Users</h2>
          <p className="text-5xl font-extrabold">{stats.users}</p>
        </Link>

        <Link
          href="/admin/products"
          className="rounded-lg border border-gray-300 p-6 text-center shadow-md hover:shadow-lg transition-shadow"
        >
          <h2 className="font-semibold text-2xl mb-2">Products</h2>
          <p className="text-5xl font-extrabold">{stats.products}</p>
        </Link>

        <Link
          href="/admin/orders"
          className="rounded-lg border border-gray-300 p-6 text-center shadow-md hover:shadow-lg transition-shadow"
        >
          <h2 className="font-semibold text-2xl mb-2">Orders</h2>
          <p className="text-5xl font-extrabold">{stats.orders}</p>
        </Link>
      </div>
    </main>
  )
}
