// app/(customer)/wishlist/page.jsx
'use client'
import { useAuth } from '@/lib/context/AuthContext'
import { useEffect, useState } from 'react'
import axios from 'axios'
import ProductCard from '@/components/customer/ProductCard'
import Link from 'next/link'
import { FiHeart } from 'react-icons/fi'

export default function WishlistPage() {
  const { token, isAuthenticated } = useAuth()
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isAuthenticated) {
      axios.get('/api/wishlist', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => setWishlist(res.data.wishlist || []))
        .finally(() => setLoading(false))
    }
  }, [isAuthenticated, token])

  if (!isAuthenticated) return (
    <div className="max-w-2xl mx-auto py-16 text-center">
      <p className="text-lg text-gray-600 mb-6">Please <Link className="text-blue-600 underline" href="/login">login</Link> to view your wishlist.</p>
    </div>
  )

  if (loading) return <div className="py-16 text-center">Loading...</div>
  if (wishlist.length === 0) return (
    <div className="max-w-2xl mx-auto py-16 text-center">
      <FiHeart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
      <p className="text-lg text-gray-600">Your wishlist is empty.</p>
      <Link href="/products" className="text-blue-600 underline mt-4 inline-block">Browse Products</Link>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Wishlist</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlist.map(product => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  )
}
