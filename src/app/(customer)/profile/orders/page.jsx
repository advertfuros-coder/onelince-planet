'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/AuthContext'
import { FiArrowLeft, FiPackage, FiChevronRight, FiClock, FiSearch, FiFilter } from 'react-icons/fi'
import axios from 'axios'
import { toast } from 'react-hot-toast'

export default function OrdersPage() {
    const router = useRouter()
    const { token, isAuthenticated } = useAuth()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        fetchOrders()
    }, [isAuthenticated])

    const fetchOrders = async () => {
        try {
            setLoading(true)
            const res = await axios.get('/api/customer/orders', {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.data.success) {
                setOrders(res.data.orders)
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error)
            toast.error('Failed to load orders')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100 shadow-sm lg:hidden">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.push('/profile')} className="p-1">
                        <FiArrowLeft className="w-5 h-5 text-gray-800" />
                    </button>
                    <h1 className="text-sm font-semibold text-gray-800">My Orders</h1>
                </div>
            </div>

            <div className="max-w-4xl mx-auto lg:py-10 lg:px-4">
                <h1 className="text-2xl font-semibold mb-8 hidden lg:block">My Orders</h1>

                {/* Search & Filter */}
                <div className="flex gap-3 px-4 py-4 lg:px-0 lg:py-0 lg:mb-6">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="Search in orders"
                            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                        />
                        <FiSearch className="w-5 h-5 text-gray-400 absolute left-3.5 top-3.5" />
                    </div>
                    <button className="px-5 py-3 bg-white border border-gray-200 rounded-2xl flex items-center gap-2 text-sm font-semibold shadow-sm hover:bg-gray-50">
                        <FiFilter className="w-4 h-4" />
                        FILTER
                    </button>
                </div>

                {/* Orders List */}
                <div className="space-y-4 px-4 lg:px-0">
                    {loading ? (
                        <div className="py-20 flex justify-center">
                            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : orders.length > 0 ? (
                        orders.map(order => (
                            <div
                                key={order._id}
                                className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all cursor-pointer"
                                onClick={() => router.push(`/orders/${order._id}`)}
                            >
                                {/* Order Header */}
                                <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-50">
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${order.status === 'delivered' ? 'bg-green-100 text-green-600' :
                                        order.status === 'shipped' ? 'bg-blue-100 text-blue-600' :
                                            order.status === 'cancelled' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                                        }`}>
                                        {order.status === 'delivered' ? <FiPackage className="w-5 h-5" /> : <FiClock className="w-5 h-5" />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-semibold text-sm capitalize">{order.status === 'delivered' ? 'Delivered' : order.status === 'shipped' ? 'Shipped' : 'Processing'}</div>
                                        <div className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">
                                            On {new Date(order.createdAt).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
                                        </div>
                                    </div>
                                    <FiChevronRight className="text-gray-300 w-5 h-5" />
                                </div>

                                {/* Items Preview */}
                                <div className=" px-4 sy-4">
                                    {order.items?.map((item, idx) => (
                                        <div key={idx} className="flex gap-4">
                                            <div className="w-16 h-16 bg-gra y-50 rounded-2xl overflow-hidden flex-shrink-0 bor der border-gray-100">
                                                <img
                                                    src={item.images?.[0] || '/placeholder-product.png'}
                                                    alt={item.name}
                                                    className="w-full h-full object-contain p-2"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                <h4 className="font-semibold text-sm text-gray-900 line-clamp-2 truncate">{item.name}</h4>
                                                <p className="text-[10px] text-gray-500 mt-1 uppecase tracking-wid est font-semibold">Qty: {item.quantity}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-white rounded-3xl border border-dashed">
                            <FiPackage className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                            <p className="text-gray-500 font-semibold">No orders yet</p>
                            <button onClick={() => router.push('/')} className="mt-4 text-blue-600 font-semibold text-sm underline">Start Shopping</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
