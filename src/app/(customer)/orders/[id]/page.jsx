'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { FiArrowLeft, FiShare2, FiCopy, FiChevronRight, FiCheck } from 'react-icons/fi'
import { toast } from 'react-hot-toast'
import axios from 'axios'

export default function OrderDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrderDetails()
  }, [params.id])

  const fetchOrderDetails = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get(`/api/customer/orders/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data.success) {
        setOrder(res.data.order)
      }
    } catch (error) {
      toast.error('Failed to load order details')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const copyOrderId = () => {
    navigator.clipboard.writeText(order?.orderNumber || order?._id)
    toast.success('Order ID copied!')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
        <p className="text-gray-600 mb-4">Order not found</p>
        <button onClick={() => router.back()} className="text-blue-600 font-semibold">Go Back</button>
      </div>
    )
  }

  // Simplify time-based calculations
  const orderDate = new Date(order.createdAt)
  const formattedDate = (date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const deliveryDate = new Date(orderDate.getTime() + 4 * 24 * 60 * 60 * 1000) // Mock delivery 4 days after
  const dayName = (date) => date.toLocaleDateString('en-US', { weekday: 'short' })

  // Mapping internal status to display text/stage
  const stages = [
    { key: 'pending', label: 'Order Confirmed', date: formattedDate(orderDate) },
    { key: 'shipped', label: 'Shipped', date: 'Today' },
    { key: 'delivered', label: 'Delivery', date: formattedDate(deliveryDate) }
  ]

  const currentStageIndex = order.status === 'delivered' ? 2 : order.status === 'shipped' ? 1 : 0

  return (
    <div className="min-h-screen bg-[#F1F3F6] pb-10">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1">
            <FiArrowLeft className="w-5 h-5 text-gray-800" />
          </button>
          <h1 className="text-sm font-semibold text-gray-800">Order Details</h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="px-4 py-1.5 text-sm font-semibold border border-gray-300 rounded-lg text-gray-700">
            Help
          </button>
          <button className="p-1">
            <FiShare2 className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="bg-white p-4 space-y-4">
        {/* Main Product Section */}
        {order.items?.map((item, idx) => (
          <div key={idx} className="flex gap-4">
            <div className="w-16 h-16 rounded-lg  bg-white flex-shrink-0 flex items-center justify-center overflow-hidden">
              <img
                src={item.images?.[0] || '/placeholder-product.png'}
                alt={item.name}
                className="max-w-full max-h-full object-contain"
                onError={(e) => e.target.src = '/placeholder-product.png'}
              />
            </div>
            <div className="flex-1">
              <h2 className="text-[15px] font-semibold text-gray-800 line-clamp-1 pr-4">{item.name}</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {Object.entries(item.variant || {}).map(([key, value]) => `${key}: ${value}`).join(', ') || 'Standard'}
              </p>
            </div>
          </div>
        ))}

        {/* Order Identifier */}
        <div className="flex items-center gap-2 mt-2 pt-2">
          <span className="text-[12px] font-normal text-gray-500">Order #{order.orderNumber || order._id}</span>
          <button onClick={copyOrderId} className="text-[#2874f0]">
            <FiCopy className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Tracking Card (The Blue Box) */}
        <div className="mt-4 border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900 capitalize">{order.status === 'pending' ? 'Confirmed' : order.status}</h3>
              <span className="px-2 py-0.5 bg-[#00A36C] text-white text-[10px] font-semibold rounded">
                On Time
              </span>
            </div>
            <p className="text-[13px] text-gray-600 mt-1">
              {order.status === 'shipped'
                ? `${formattedDate(new Date())}: Product has left facilitating facility.`
                : order.status === 'delivered'
                  ? `Product delivered on ${formattedDate(orderDate)}`
                  : `Order confirmed on ${formattedDate(orderDate)}`}
            </p>

            {/* Timeline Horizontal */}
            <div className="relative mt-8 mb-4 px-2">
              {/* Progress Line */}
              <div className="absolute top-[15px] left-6 right-6 h-[3px] bg-gray-100 -z-0">
                <div
                  className={`h-full transition-all duration-1000 ${currentStageIndex >= 2 ? 'bg-[#00A36C]' : 'bg-[#00A36C]'}`}
                  style={{ width: `${(currentStageIndex / 2) * 100}%` }}
                ></div>
              </div>

              <div className="flex justify-between relative z-10">
                {stages.map((stage, idx) => (
                  <div key={idx} className="flex flex-col items-center w-24 text-center">
                    <div className={`w-[32px] h-[32px] rounded-full border-2 flex items-center justify-center transition-all ${idx < currentStageIndex
                        ? 'bg-[#00A36C] border-[#00A36C]'
                        : idx === currentStageIndex
                          ? 'bg-[#00A36C] border-[#00A36C]'
                          : 'bg-white border-gray-200'
                      }`}>
                      {idx <= currentStageIndex ? (
                        <FiCheck className="text-white w-5 h-5 font-semibold" />
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-white"></div>
                      )}
                    </div>
                    <p className={`text-[11px] mt-2 leading-tight ${idx <= currentStageIndex ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>
                      {stage.label}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {stage.date}
                    </p>
                    {idx === 2 && currentStageIndex < 2 && (
                      <p className="text-[9px] text-gray-400 font-medium whitespace-nowrap">(8:00 AM - 7:55 PM)</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Info Box */}
            <div className="flex gap-3 p-3 bg-[#F5F8FE] rounded-xl border border-blue-50">
              <div className="bg-white p-1 rounded-full border border-blue-100 shadow-sm flex-shrink-0">
                <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V7h2v2z" />
                </svg>
              </div>
              <p className="text-[12px] text-gray-600 leading-tight pt-0.5">
                Delivery Executive details will be available once the order is out for delivery
              </p>
            </div>

            <button className="w-full text-center text-[14px] font-semibold text-[#2874f0] py-4 border-t border-gray-50 mt-4 -mb-4">
              See all updates
            </button>
          </div>
        </div>
      </div>

      {/* Delivery Address Section */}
      <div className="mt-4 bg-white p-4">
        <h3 className="text-[15px] font-semibold text-gray-900 mb-3 flex items-center justify-between">
          Delivery Address
          <button className="text-blue-600 text-[12px] font-semibold">Change</button>
        </h3>
        <div className="space-y-1">
          <p className="text-[14px] font-semibold text-gray-800">{order.shippingAddress?.name}</p>
          <p className="text-[13px] text-gray-600 leading-tight">
            {order.shippingAddress?.addressLine1}
            {order.shippingAddress?.addressLine2 && `, ${order.shippingAddress.addressLine2}`}
          </p>
          <p className="text-[13px] text-gray-600">
            {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
          </p>
          <div className="flex items-center gap-2 pt-2">
            <span className="text-[13px] font-semibold text-gray-800">Phone number</span>
            <span className="text-[13px] text-gray-600">{order.shippingAddress?.phone}</span>
          </div>
        </div>
      </div>

      {/* Payment Details Section */}
      <div className="mt-4 bg-white p-4">
        <h3 className="text-[15px] font-semibold text-gray-900 mb-4">Price Details</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center text-[14px]">
            <span className="text-gray-600">List Price</span>
            <span className="text-gray-900">{order.shippingAddress?.country === 'India' ? '₹' : 'AED'} {order.shippingAddress?.country === 'India' ? order.pricing?.subtotal?.toFixed(0) : (order.pricing?.subtotal / 22.73).toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-[14px]">
            <span className="text-gray-600">Selling Price</span>
            <span className="text-gray-900 font-medium">{order.shippingAddress?.country === 'India' ? '₹' : 'AED'} {order.shippingAddress?.country === 'India' ? order.pricing?.subtotal?.toFixed(0) : (order.pricing?.subtotal / 22.73).toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-[14px]">
            <span className="text-gray-600">Handling Fee</span>
            <span className="text-gray-900">{order.shippingAddress?.country === 'India' ? '₹' : 'AED'} {order.shippingAddress?.country === 'India' ? order.pricing?.tax?.toFixed(0) : (order.pricing?.tax / 22.73).toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-[14px]">
            <span className="text-gray-600">Shipping Fee</span>
            <span className={`${order.pricing?.shipping > 0 ? 'text-gray-900' : 'text-[#00A36C] font-medium'}`}>
              {order.pricing?.shipping > 0 ? `${order.shippingAddress?.country === 'India' ? '₹' : 'AED'} ${order.shippingAddress?.country === 'India' ? order.pricing.shipping.toFixed(0) : (order.pricing.shipping / 22.73).toFixed(2)}` : 'FREE'}
            </span>
          </div>
          {order.pricing?.discount > 0 && (
            <div className="flex justify-between items-center text-[14px]">
              <span className="text-gray-600">Coupon Discount</span>
              <span className="text-[#00A36C] font-medium">-{order.shippingAddress?.country === 'India' ? '₹' : 'AED'} {order.shippingAddress?.country === 'India' ? order.pricing.discount.toFixed(0) : (order.pricing.discount / 22.73).toFixed(2)}</span>
            </div>
          )}
          <div className="pt-3 border-t border-dashed border-gray-200 flex justify-between items-center">
            <span className="text-[15px] font-semibold text-gray-900">Order Total</span>
            <span className="text-[15px] font-semibold text-gray-900">{order.shippingAddress?.country === 'India' ? '₹' : 'AED'} {order.shippingAddress?.country === 'India' ? order.pricing?.total?.toFixed(0) : (order.pricing?.total / 22.73).toFixed(2)}</span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          </div>
          <div>
            <p className="text-[12px] text-gray-500">Payment Mode</p>
            <p className="text-[13px] font-semibold text-gray-800 uppercase">{order.payment?.method || 'Card'}</p>
          </div>
        </div>
      </div>

      {/* Green Revolution Donation Impact - Only show if donated */}
      {order.pricing?.donation > 0 && (
        <div className="mt-4 bg-white p-4">
          <div className="bg-gradient-to-br from-[#E8F5E9] to-[#C8E6C9] rounded-2xl p-4 border border-[#A5D6A7]/30 shadow-sm relative overflow-hidden">
            {/* Subtle Splash Effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
            
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-14 h-14 bg-white rounded-full shadow-md flex items-center justify-center flex-shrink-0 animate-pulse">
                <svg className="w-8 h-8 text-[#2E7D32]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,11 14,9 14,9C14,9 12,13 13,16C11,14 11,13 11,13V11H9V13C7,11 6,10 6,10C6,10 3,13 13,18C12,17 11,15 11,15L17,8Z" />
                </svg>
              </div>
              <div>
                <h4 className="text-[15px] font-semibold text-[#1B5E20]">Green Revolution Hero! 🌿</h4>
                <p className="text-[12px] text-[#2E7D32] font-medium leading-tight mt-1">
                  Thank you for your donation of <span className="font-semibold">{order.shippingAddress?.country === 'India' ? '₹' : 'AED'} {order.shippingAddress?.country === 'India' ? order.pricing.donation : (order.pricing.donation / 22.73).toFixed(0)}</span>. 
                  You've just helped plant a tree today!
                </p>
              </div>
            </div>
            
            <div className="mt-3 flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className={`w-6 h-6 rounded-full border-2 border-white bg-gray-200 overflow-hidden`}>
                    <img src={`https://i.pravatar.cc/100?u=${i + 10}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-[#2E7D32] font-semibold">12k+ people already contributed this month</p>
            </div>
          </div>
        </div>
      )}

      {/* Doorstep Tips Section */}
      <div className="mt-4 bg-white p-4">
        <h3 className="text-[15px] font-semibold text-gray-900 mb-4">Keep in mind at doorstep</h3>
        <div className="flex items-center justify-between p-3 border border-gray-100 rounded-2xl bg-gray-50/30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white border border-gray-100 rounded-xl p-2 flex items-center justify-center flex-shrink-0 shadow-sm">
              <img src={order.items?.[0]?.images?.[0] || '/logo.png'} className="max-w-full max-h-full object-contain grayscale opacity-60" />
            </div>
            <div>
              <p className="font-semibold text-[14px] text-gray-800">Open box delivery</p>
              <p className="text-xs text-gray-500 mt-0.5">Verify item before sharing OTP</p>
            </div>
          </div>
          <FiChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* Attached products section */}
      <div className="mt-4 bg-white p-4">
        <h3 className="text-[15px] font-semibold text-gray-900 mb-4">Attached products</h3>
        <div className="p-4 border border-gray-100 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <img src="https://logowik.com/content/uploads/images/bajaj-fingerv3096.jpg" className="w-8" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800 line-clamp-1">Bajaj Digital Protection</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-semibold text-gray-900">AED 183</span>
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <span className="text-[11px] text-gray-500 font-medium">In progress</span>
              </div>
            </div>
          </div>
          <svg className="w-5 h-5 text-gray-400 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </div>
      </div>

      {/* Rate section */}
      <div className="mt-4 bg-white p-4">
        <h3 className="text-[15px] font-semibold text-gray-900 mb-4">Rate your experience</h3>
        <div className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl bg-gray-50/30">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
            <span className="text-[14px] font-semibold text-gray-700">Did you find this page helpful?</span>
          </div>
          <FiChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      </div>
    </div>
  )
}
