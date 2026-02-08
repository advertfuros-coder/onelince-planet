'use client'
import { useState, useEffect, Suspense } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import {
    FiPackage, FiTruck, FiCheckCircle, FiClock, FiMapPin,
    FiMail, FiPhone, FiCalendar, FiDollarSign, FiAlertCircle
} from 'react-icons/fi'
import Price from '@/components/ui/Price'
import { toast } from 'react-hot-toast'
import axios from 'axios'

function TrackOrderDetailsContent() {
    const params = useParams()
    const searchParams = useSearchParams()
    const router = useRouter()

    const orderNumber = params.orderNumber
    const email = searchParams.get('email')

    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!orderNumber || !email) {
            setError('Missing order number or email')
            setLoading(false)
            return
        }

        fetchOrder()
    }, [orderNumber, email])

    const fetchOrder = async () => {
        try {
            setLoading(true)
            const response = await axios.get(`/api/orders/track`, {
                params: {
                    orderNumber,
                    email
                }
            })

            if (response.data.success) {
                setOrder(response.data.order)
            } else {
                setError(response.data.message || 'Order not found')
            }
        } catch (err) {
            console.error('Order fetch error:', err)
            setError(err.response?.data?.message || 'Failed to fetch order details')
        } finally {
            setLoading(false)
        }
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'delivered':
                return <FiCheckCircle className="w-6 h-6 text-green-500" />
            case 'shipped':
            case 'out_for_delivery':
                return <FiTruck className="w-6 h-6 text-blue-500" />
            case 'confirmed':
            case 'processing':
            case 'packed':
                return <FiPackage className="w-6 h-6 text-orange-500" />
            default:
                return <FiClock className="w-6 h-6 text-gray-500" />
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'delivered':
                return 'bg-green-100 text-green-800 border-green-300'
            case 'shipped':
            case 'out_for_delivery':
                return 'bg-blue-100 text-blue-800 border-blue-300'
            case 'confirmed':
            case 'processing':
            case 'packed':
                return 'bg-orange-100 text-orange-800 border-orange-300'
            case 'cancelled':
                return 'bg-red-100 text-red-800 border-red-300'
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300'
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-semibold">Loading order details...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiAlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">Order Not Found</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => router.push('/track-order')}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        )
    }

    if (!order) return null

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">

                {/* Header */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900">
                                Order #{order.orderNumber}
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>
                        <div className={`px-4 py-2 rounded-full border-2 font-semibold ${getStatusColor(order.status)}`}>
                            {order.status.toUpperCase().replace('_', ' ')}
                        </div>
                    </div>
                </div>

                {/* Order Timeline */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Timeline</h2>
                    <div className="space-y-4">
                        {order.timeline?.map((event, index) => (
                            <div key={index} className="flex items-start gap-4">
                                <div className="shrink-0">
                                    {getStatusIcon(event.status)}
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-900">{event.description}</p>
                                    <p className="text-sm text-gray-500">
                                        {new Date(event.timestamp).toLocaleString('en-US', {
                                            dateStyle: 'medium',
                                            timeStyle: 'short'
                                        })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Order Items */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Items</h2>
                    <div className="space-y-4">
                        {order.items?.map((item, index) => (
                            <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                                <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                                    <FiPackage className="w-8 h-8 text-gray-400" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                </div>
                                <div className="text-right">
                                    <Price amount={item.price * item.quantity} className="font-semibold text-gray-900" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FiMapPin className="w-5 h-5" />
                        Shipping Address
                    </h2>
                    <div className="text-gray-700">
                        <p className="font-semibold">{order.shippingAddress.name}</p>
                        <p>{order.shippingAddress.addressLine1}</p>
                        {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                        <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                        <p>{order.shippingAddress.country}</p>
                        <p className="mt-2 flex items-center gap-2">
                            <FiPhone className="w-4 h-4" />
                            {order.shippingAddress.phone}
                        </p>
                        <p className="flex items-center gap-2">
                            <FiMail className="w-4 h-4" />
                            {order.shippingAddress.email}
                        </p>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
                    <div className="space-y-3">
                        <div className="flex justify-between text-gray-700">
                            <span>Subtotal</span>
                            <Price amount={order.pricing.subtotal} />
                        </div>
                        <div className="flex justify-between text-gray-700">
                            <span>Shipping</span>
                            <Price amount={order.pricing.shipping} />
                        </div>
                        <div className="flex justify-between text-gray-700">
                            <span>Tax</span>
                            <Price amount={order.pricing.tax} />
                        </div>
                        {order.pricing.discount > 0 && (
                            <div className="flex justify-between text-green-600">
                                <span>Discount</span>
                                <span>-<Price amount={order.pricing.discount} /></span>
                            </div>
                        )}
                        <div className="border-t-2 border-gray-200 pt-3 flex justify-between text-xl font-semibold text-gray-900">
                            <span>Total</span>
                            <Price amount={order.pricing.total} />
                        </div>
                        <div className="pt-3 border-t border-gray-200">
                            <p className="text-sm text-gray-600">
                                <strong>Payment Method:</strong> {order.payment.method.toUpperCase()}
                            </p>
                            <p className="text-sm text-gray-600">
                                <strong>Payment Status:</strong> {order.payment.status}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex gap-4">
                    <button
                        onClick={() => router.push('/track-order')}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-xl transition-all"
                    >
                        Track Another Order
                    </button>
                    <button
                        onClick={() => router.push('/')}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all"
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function TrackOrderDetailsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-semibold">Loading track details...</p>
                </div>
            </div>
        }>
            <TrackOrderDetailsContent />
        </Suspense>
    )
}
