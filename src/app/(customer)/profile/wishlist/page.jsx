'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/AuthContext'
import { FiArrowLeft, FiHeart, FiShoppingCart, FiTrash2, FiSearch } from 'react-icons/fi'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import Button from '@/components/ui/Button'

export default function WishlistPage() {
    const router = useRouter()
    const { token, isAuthenticated } = useAuth()
    const [wishlist, setWishlist] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        fetchWishlist()
    }, [isAuthenticated])

    const fetchWishlist = async () => {
        try {
            setLoading(true)
            const res = await axios.get('/api/customer/dashboard', {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.data.success) {
                // Mock wishlist from dashboard data or common source
                // In a real app, use a dedicated wishlist API
                setWishlist(res.data.stats?.wishlistItems || [])
            }
        } catch (error) {
            console.error('Failed to fetch wishlist:', error)
        } finally {
            setLoading(false)
        }
    }

    const removeWishlist = async (id) => {
        toast.success('Removed from wishlist')
        setWishlist(wishlist.filter(item => item._id !== id))
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100 shadow-sm lg:hidden">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/profile')} className="p-1">
            <FiArrowLeft className="w-5 h-5 text-gray-800" />
          </button>
          <h1 className="text-sm font-semibold text-gray-800">My Wishlist</h1>
        </div>
      </div>

            <div className="max-w-6xl mx-auto lg:py-10 lg:px-4 px-4 py-6">
                <h1 className="text-2xl font-semibold mb-8 hidden lg:block">My Wishlist</h1>

                {loading ? (
                    <div className="py-20 flex justify-center">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : wishlist.length > 0 ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                        {wishlist.map((item) => (
                            <div key={item._id} className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm relative group hover:shadow-xl transition-all duration-300">
                                <button
                                    onClick={() => removeWishlist(item._id)}
                                    className="absolute top-3 right-3 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full text-red-500 shadow-sm hover:scale-110 transition-transform"
                                >
                                    <FiTrash2 className="w-4 h-4" />
                                </button>

                                <div
                                    className="aspect-square bg-gray-50 p-6 flex items-center justify-center cursor-pointer"
                                    onClick={() => router.push(`/product/${item._id}`)}
                                >
                                    <img
                                        src={item.images?.[0] || '/placeholder-product.png'}
                                        alt={item.name}
                                        className="max-w-full max-h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                                    />
                                </div>

                                <div className="p-4 bg-white">
                                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 min-h-[40px] uppercase tracking-tight">{item.name}</h3>
                                    <div className="flex items-center justify-between mt-4">
                                        <p className="font-semibold text-gray-900 text-lg">AED {item.price}</p>
                                        <button className="w-8 h-8 bg-black text-white rounded-xl flex items-center justify-center hover:bg-blue-600 transition-colors">
                                            <FiShoppingCart className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-[40px] shadow-sm border border-gray-50">
                        <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-6 text-pink-500">
                            <FiHeart className="w-10 h-10" />
                        </div>
                        <p className="text-gray-900 font-extrabold text-xl">Your wishlist is empty</p>
                        <p className="text-gray-400 text-sm mt-2 max-w-xs mx-auto">Add items you love to find them later and get price alerts</p>
                        <button
                            onClick={() => router.push('/')}
                            className="mt-8 px-10 py-4 bg-blue-600 text-white rounded-2xl font-semibold shadow-lg shadow-blue-200 hover:scale-105 transition-transform"
                        >
                            Explore Products
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
