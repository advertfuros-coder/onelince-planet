'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Script from 'next/script'
import {
  FiCheck,
  FiTruck,
  FiCreditCard,
  FiSmartphone,
  FiMapPin,
  FiEdit2,
  FiZap,
  FiBox,
  FiChevronRight,
  FiArrowRight,
  FiShield,
  FiLock,
  FiPackage,
  FiInfo,
  FiGlobe
} from 'react-icons/fi'
import { FaRegMoneyBillAlt } from 'react-icons/fa'
import { BiWallet, BiBarcodeReader, BiLeaf } from 'react-icons/bi'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useCart } from '@/lib/context/CartContext'
import { useAuth } from '@/lib/context/AuthContext'
import { formatPrice } from '@/lib/utils'
import { toast } from 'react-hot-toast'
import axios from 'axios'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal, shipping, total, clearCart } = useCart()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  // Steps: 1=Address, 2=Delivery, 3=Payment
  const [currentStep, setCurrentStep] = useState(1)

  // Data States
  const [shippingInfo, setShippingInfo] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: 'Dubai',
    state: 'Dubai',
    pincode: '',
    country: 'UAE'
  })

  const [deliveryMethod, setDeliveryMethod] = useState('standard') // standard | express
  const [paymentMethod, setPaymentMethod] = useState('online') // online | upi | cod

  // Coupon
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [discount, setDiscount] = useState(0)

  // Donation
  const [isDonationChecked, setIsDonationChecked] = useState(false)
  const DONATION_AMOUNT = 20 // 20 INR / 2 AED

  // Payment Gateway
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)

  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart')
    }
  }, [items, router])

  const validateShipping = () => {
    const required = ['name', 'phone', 'addressLine1', 'city', 'country']
    for (const field of required) {
      if (!shippingInfo[field].trim()) {
        toast.error(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`)
        return false
      }
    }
    return true
  }

  const handleApplyCoupon = () => {
    if (couponCode === 'SAVE20') {
      setDiscount(subtotal * 0.2)
      setAppliedCoupon({ code: 'SAVE20', type: 'percentage', value: 20 })
      toast.success('Coupon applied successfully!')
    } else {
      toast.error('Invalid coupon code')
    }
  }

  const deliveryCost = deliveryMethod === 'express' ? 15.00 : 0
  const donationTotal = isDonationChecked ? DONATION_AMOUNT : 0
  const finalTotal = subtotal + deliveryCost - discount + donationTotal
  const tax = subtotal * 0.05

  // Handle Razorpay Payment
  const handleRazorpayPayment = async () => {
    if (!razorpayLoaded) {
      toast.error('Payment gateway is loading. Please wait...')
      return
    }

    setLoading(true)

    try {
      // Create Razorpay order
      const orderResponse = await axios.post('/api/payment/razorpay/create-order', {
        amount: finalTotal,
        currency: 'INR',
        receipt: `order_${Date.now()}`
      })

      if (!orderResponse.data.success) {
        throw new Error('Failed to create payment order')
      }

      const { orderId, amount, currency } = orderResponse.data

      // Razorpay options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount,
        currency: currency,
        name: 'Online Planet',
        description: 'Order Payment',
        order_id: orderId,
        prefill: {
          name: shippingInfo.name,
          email: shippingInfo.email || user?.email,
          contact: shippingInfo.phone
        },
        theme: {
          color: '#2563eb'
        },
        handler: async function (response) {
          try {
            // Verify payment signature
            const verifyResponse = await axios.post('/api/payment/razorpay/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })

            if (verifyResponse.data.success) {
              // Place order after successful payment
              await placeOrder(response.razorpay_payment_id, 'razorpay')
            } else {
              toast.error('Payment verification failed')
              setLoading(false)
            }
          } catch (error) {
            console.error('Payment verification error:', error)
            toast.error('Payment verification failed')
            setLoading(false)
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false)
            toast.error('Payment cancelled')
          }
        }
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()

    } catch (error) {
      console.error('Razorpay error:', error)
      toast.error('Failed to initialize payment')
      setLoading(false)
    }
  }

  // Place Order Backend Call
  const placeOrder = async (paymentId = null, method = 'cod') => {
    try {
      const orderData = {
        items: items.map(item => ({
          productId: item.productId || item._id,
          quantity: item.quantity
        })),
        shippingAddress: {
          name: shippingInfo.name,
          phone: shippingInfo.phone,
          email: shippingInfo.email || user?.email,
          addressLine1: shippingInfo.addressLine1,
          addressLine2: shippingInfo.addressLine2 || '',
          city: shippingInfo.city,
          state: shippingInfo.state,
          pincode: shippingInfo.pincode,
          country: shippingInfo.country || 'India'
        },
        paymentMethod: method,
        transactionId: paymentId,
        couponCode: appliedCoupon?.code || null,
        customerId: user?._id || user?.id, // Add user ID as fallback
        subtotal,
        tax,
        shipping: deliveryCost,
        donation: donationTotal,
        total: finalTotal
      }

      // Get auth token from localStorage
      const token = localStorage.getItem('token')

      const endpoint = '/api/customer/orders'

      const headers = {
        'Content-Type': 'application/json'
      }

      // Add authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await axios.post(endpoint, orderData, { headers })

      if (response.data.success) {
        clearCart()
        toast.success('Order placed successfully!')

        // Redirect to success page with order details
        const orderNumber = response.data.orderNumber || 'OP-' + Date.now()
        const successUrl = `/orders/success?orderNumber=${orderNumber}&total=${finalTotal}&donation=${donationTotal}&email=${encodeURIComponent(shippingInfo.email || user?.email || '')}`
        router.push(successUrl)
      }
    } catch (error) {
      console.error('Order error:', error)

      // Better error messaging
      if (error.response?.status === 401) {
        toast.error('Please login to place an order')
        router.push('/login?redirect=/checkout')
      } else {
        toast.error(error.response?.data?.message || 'Failed to place order')
      }
      setLoading(false)
    }
  }

  const handlePlaceOrder = async () => {
    if (paymentMethod === 'cod') {
      setLoading(true)
      await placeOrder(null, 'cod')
    } else {
      // For online payments (UPI, Card, Net Banking) - use Razorpay
      await handleRazorpayPayment()
    }
  }

  // --- Components ---

  const StepIndicator = ({ step, title, current, completed, onClick, children }) => (
    <div className={`relative transition-all duration-500 ease-in-out ${current ? 'opacity-100' : completed ? 'opacity-60 hover:opacity-100' : 'opacity-40'}`}>
      <div
        className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${current
          ? 'shadow-lg border-blue-600 ring-1 ring-blue-100'
          : completed
            ? 'border-green-100'
            : 'border-gray-100'
          }`}
      >
        <div className={`p-6 ${current ? 'bg-gradient-to-br from-white to-blue-50/20' : ''}`}>
          <div className="flex items-start gap-5">
            {/* Icon Bubble */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 shadow-sm transition-colors duration-300 ${completed
              ? 'bg-green-500 text-white ring-4 ring-green-100'
              : current
                ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                : 'bg-gray-100 text-gray-400'
              }`}>
              {completed ? <FiCheck className="w-5 h-5" /> : step}
            </div>

            <div className="flex-1">
              {/* Header */}
              <div className="flex justify-between items-center mb-2 h-10">
                <h3 className={`text-lg font-bold tracking-tight ${current ? 'text-gray-900' : 'text-gray-700'}`}>
                  {title}
                </h3>
                {completed && (
                  <button onClick={onClick} className="group flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 px-3 py-1 rounded-full hover:bg-blue-50 transition-all">
                    Edit <FiEdit2 className="w-3 h-3 group-hover:scale-110 transition-transform" />
                  </button>
                )}
              </div>

              {/* Content Area */}
              <div className={`transition-all duration-300 ${current ? 'opacity-100 mt-4' : completed ? 'opacity-80 mt-1' : 'h-0 opacity-0 overflow-hidden'}`}>
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Connecting Line */}
      {step < 3 && (
        <div className={`absolute left-[29px] top-[74px] bottom-[-24px] w-[2px] -z-10 transition-colors duration-500 ${completed ? 'bg-green-200' : 'bg-gray-100'}`} />
      )}
    </div>
  )

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setRazorpayLoaded(true)}
      />

      <div className="min-h-screen bg-[#F8F9FA] pb-12 f ont-sans">
        {/* Top Gradient Bar */}
        <div className="h-2 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 w-full" />

        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">

          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Secure Checkout</h1>
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1"><FiLock className="w-3 h-3" /> SSL Encrypted</span>
                <span className="w-1 h-1 rounded-full bg-gray-300" />
                <span>Step {currentStep} of 3</span>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="h-1 w-12 rounded-full bg-blue-600"></div>
              <div className={`h-1 w-12 rounded-full transition-colors ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              <div className={`h-1 w-12 rounded-full transition-colors ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Left Column - Main Stepper */}
            <div className="lg:col-span-8 space-y-6">

              {/* --- STEP 1: ADDRESS --- */}
              <StepIndicator
                step={1}
                title="Shipping Address"
                current={currentStep === 1}
                completed={currentStep > 1}
                onClick={() => setCurrentStep(1)}
              >
                {currentStep === 1 ? (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <Input label="Full Name" value={shippingInfo.name} onChange={e => setShippingInfo({ ...shippingInfo, name: e.target.value })} placeholder="John Doe" className="bg-gray-50 border-gray-200 focus:bg-white transition-all" />
                      <Input label="Phone Number" value={shippingInfo.phone} onChange={e => setShippingInfo({ ...shippingInfo, phone: e.target.value })} placeholder="+971 50 123 4567" className="bg-gray-50 border-gray-200 focus:bg-white transition-all" />
                    </div>
                    <Input label="Address Line 1" value={shippingInfo.addressLine1} onChange={e => setShippingInfo({ ...shippingInfo, addressLine1: e.target.value })} placeholder="Apartment, Studio, or Floor" className="bg-gray-50 border-gray-200 focus:bg-white transition-all" />
                    <div className="grid grid-cols-2 gap-5">
                      <Input label="City" value={shippingInfo.city} onChange={e => setShippingInfo({ ...shippingInfo, city: e.target.value })} className="bg-gray-50 border-gray-200 focus:bg-white transition-all" />
                      <Input label="Country" value={shippingInfo.country} onChange={e => setShippingInfo({ ...shippingInfo, country: e.target.value })} className="bg-gray-50 border-gray-200 focus:bg-white transition-all" />
                    </div>
                    <div className="flex justify-end pt-2">
                      <Button onClick={() => { if (validateShipping()) setCurrentStep(2) }} className="w-full md:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transform hover:-translate-y-0.5 transition-all">
                        Proceed to Delivery
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 text-gray-600 mt-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-500 shadow-sm">
                      <FiMapPin className="w-5 h-5" />
                    </div>
                    <div className="text-sm">
                      <p className="font-bold text-gray-900">{shippingInfo.name}</p>
                      <p className="text-gray-500">{shippingInfo.addressLine1}, {shippingInfo.city}</p>
                    </div>
                  </div>
                )}
              </StepIndicator>

              {/* --- STEP 2: DELIVERY --- */}
              <StepIndicator
                step={2}
                title="Delivery Method"
                current={currentStep === 2}
                completed={currentStep > 2}
                onClick={() => setCurrentStep(2)}
              >
                {currentStep === 2 ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { id: 'standard', title: 'Standard Delivery', price: 'Free', sub: 'Get it by Wed, 24 Jan', icon: FiTruck, color: 'blue' },
                        { id: 'express', title: 'Express Delivery', price: '$15.00', sub: 'Get it by Tomorrow', icon: FiZap, color: 'orange' }
                      ].map((opt) => (
                        <div
                          key={opt.id}
                          onClick={() => setDeliveryMethod(opt.id)}
                          className={`relative p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 flex items-start gap-4 ${deliveryMethod === opt.id
                            ? `border-${opt.color}-500 bg-${opt.color}-50/30 ring-1 ring-${opt.color}-500`
                            : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                          {deliveryMethod === opt.id && (
                            <div className={`absolute top-0 right-0 p-1.5 bg-${opt.color}-500 rounded-bl-xl text-white`}>
                              <FiCheck className="w-3 h-3" />
                            </div>
                          )}
                          <div className={`mt-1 p-2 rounded-lg ${deliveryMethod === opt.id ? `bg-${opt.color}-100 text-${opt.color}-600` : 'bg-gray-100 text-gray-400'}`}>
                            <opt.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="block font-bold text-gray-900">{opt.title}</span>
                            <span className="block text-xs text-gray-500 mt-1 mb-2">{opt.sub}</span>
                            <span className={`text-sm font-bold ${opt.id === 'standard' ? 'text-green-600' : 'text-gray-900'}`}>{opt.price}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end pt-2">
                      <Button onClick={() => setCurrentStep(3)} className="w-full md:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transform hover:-translate-y-0.5 transition-all">
                        Continue to Payment
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 text-gray-600 mt-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-500 shadow-sm">
                      {deliveryMethod === 'standard' ? <FiTruck className="w-5 h-5" /> : <FiZap className="w-5 h-5 text-orange-500" />}
                    </div>
                    <div className="text-sm">
                      <p className="font-bold text-gray-900 capitalize">{deliveryMethod} Delivery</p>
                      <p className="text-gray-500">{deliveryMethod === 'standard' ? 'Expected by Wed, 24 Jan' : 'Expected Tomorrow'}</p>
                    </div>
                  </div>
                )}
              </StepIndicator>

              {/* --- STEP 3: PAYMENT --- */}
              <StepIndicator
                step={3}
                title="Payment Details"
                current={currentStep === 3}
                completed={false}
                onClick={() => { }}
              >
                <div>
                  {/* Payment Tabs */}
                  <div className="flex items-center gap-2 mb-6 p-1 bg-gray-100/80 rounded-xl overflow-x-auto no-scrollbar">
                    {[
                      { id: 'online', label: 'Online Payment', icon: FiCreditCard },
                      { id: 'upi', label: 'UPI / QR', icon: FiSmartphone },
                      { id: 'cod', label: 'Cash on Delivery', icon: FaRegMoneyBillAlt },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setPaymentMethod(tab.id)}
                        className={`flex-1 py-3 px-4 text-sm font-bold flex items-center justify-center gap-2 rounded-lg transition-all whitespace-nowrap ${paymentMethod === tab.id
                          ? 'bg-white text-blue-600 shadow-sm ring-1 ring-gray-200'
                          : 'text-gray-500 hover:bg-gray-200/50 hover:text-gray-700'
                          }`}
                      >
                        <tab.icon className={paymentMethod === tab.id ? 'animate-pulse' : ''} />
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Online Payment (Card / Netbanking) */}
                  {paymentMethod === 'online' && (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-2xl border border-indigo-100 relative overflow-hidden">
                        <div className="flex gap-4 relative z-10 items-start">
                          <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-indigo-600 shrink-0">
                            <FiCreditCard className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 mb-1">Pay Online Securely</h4>
                            <p className="text-sm text-gray-600 leading-relaxed mb-4">
                              You will be redirected to our secure payment gateway (Razorpay) where you can pay using:
                            </p>
                            <div className="flex flex-wrap gap-2 mb-2">
                              {['Credit/Debit Cards', 'NetBanking', 'Wallets'].map(type => (
                                <span key={type} className="px-2 py-1 bg-white/60 border border-white rounded-md text-xs font-semibold text-indigo-800">{type}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* UPI Payment */}
                  {paymentMethod === 'upi' && (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100 relative overflow-hidden">
                        <div className="flex gap-4 relative z-10 items-start">
                          <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-green-600 shrink-0">
                            <BiBarcodeReader className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 mb-1">Pay via UPI / QR</h4>
                            <p className="text-sm text-gray-600 leading-relaxed mb-4">
                              Pay instantly using any UPI app. Scan QR code or enter your UPI ID on the next screen.
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {['Google Pay', 'PhonePe', 'Paytm', 'BHIM'].map(type => (
                                <span key={type} className="px-2 py-1 bg-white/60 border border-white rounded-md text-xs font-semibold text-green-800">{type}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* COD Info */}
                  {paymentMethod === 'cod' && (
                    <div className="p-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 relative overflow-hidden animate-fadeIn">
                      <div className="flex gap-4 relative z-10">
                        <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-gray-600 mb-2 shrink-0">
                          <FiPackage className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 mb-1">Pay on Delivery</h4>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            You can pay via Cash or UPI when the delivery agent arrives at your doorstep.
                            <span className="block mt-1 font-medium text-gray-800">Note: Please keep exact change handy.</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-8 flex items-center justify-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-500">
                    <FiShield className="text-green-500" />
                    <span>Payments processed securely by Razorpay. We do not store your card details.</span>
                  </div>
                </div>
              </StepIndicator>

            </div>

            {/* Right Column - Order Summary Sidebar */}
            <div className="lg:col-span-4 pl-0 lg:pl-4">
              <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 sticky top-8">
                <h2 className="text-xl font-extrabold text-gray-900 mb-6">Order Summary</h2>

                <div className="space-y-4 mb-6 custom-scrollbar max-h-[300px] overflow-y-auto pr-1">
                  {items.map(item => (
                    <div key={item.productId} className="flex gap-4 group">
                      <div className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 relative">
                        <Image
                          src={item.image || '/images/placeholder-product.jpg'}
                          alt={item.name}
                          fill
                          className="object-contain p-2 mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="flex-1 py-1">
                        <h4 className="text-sm font-bold text-gray-900 line-clamp-2 leading-tight mb-1">{item.name}</h4>
                        <p className="text-xs text-gray-500 mb-2">Variant: {Object.values(item.variant || {}).join(', ') || 'Standard'}</p>
                        <div className="flex justify-between items-end">
                          <span className="text-xs font-semibold px-2 py-0.5 bg-gray-100 rounded text-gray-600">x{item.quantity}</span>
                          <span className="font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Promo Input */}
                <div className="relative mb-6">
                  <input
                    type="text"
                    placeholder="Discount code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="w-full pl-4 pr-24 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400 font-medium"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-white text-gray-900 text-xs font-bold rounded-lg shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    Apply
                  </button>
                </div>

                {/* --- Green Planet Donation --- */}
                <div className="mb-6 rounded-2xl border border-green-200 bg-white relative overflow-hidden shadow-sm">
                  <div className="flex items-stretch">
                    {/* Left Side - Image */}
                    {/* <div className="w-1/3 relative overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=400&h=300&fit=crop"
                        alt="Planting Tree"
                        className="w-full h-full object-cover"
                      />
                    </div> */}

                    {/* Right Side - Content */}
                    <div className="flex-1 p-6 bg-gradient-to-br from-green-50/50 to-white">
                      {/* Header with Icon */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 bg-gradient-to-br from-blue-400 to-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-base">🌍</span>
                        </div>
                        <h3 className="text-base font-bold text-gray-800">
                          Make Our Planet Greener <span className="text-gray-500 font-normal text-sm">(Optional)</span>
                        </h3>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                        Your small contribution helps plant trees and support verified green initiatives.
                      </p>

                      {/* Price Badges */}
                      <div className="flex gap-3 mb-4">
                        <div className="px-6 py-2 bg-green-700 text-white rounded-full font-bold text-base shadow-sm">
                          ₹20
                        </div>
                        <div className="px-6 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-full font-bold text-base">
                          2 AED
                        </div>
                      </div>

                      {/* Checkbox */}
                      <label className="flex items-center gap-3 mb-4 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={isDonationChecked}
                            onChange={() => setIsDonationChecked(!isDonationChecked)}
                            className="w-5 h-5 border-2 border-gray-400 rounded appearance-none checked:bg-green-600 checked:border-green-600 cursor-pointer transition-all"
                          />
                          {isDonationChecked && (
                            <svg className="w-3.5 h-3.5 absolute text-white pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className="text-base font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                          Yes, I'd like to contribute
                        </span>
                      </label>

                      {/* Verification Badge */}
                      <div className="flex items-center gap-2 text-sm text-gray-600 bg-white/60 rounded-lg px-3 py-2 border border-green-100">
                        <BiLeaf className="w-4 h-4 text-green-600" />
                        <span className="font-medium">100% used for verified initiatives</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pricing Breakdown */}
                <div className="space-y-3 py-6 border-t border-dashed border-gray-200 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-semibold text-gray-900">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span className="flex items-center gap-1">Shipping <FiInfo className="w-3 h-3 text-gray-400" /></span>
                    <span className={`font-semibold ${deliveryCost === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                      {deliveryCost === 0 ? 'Free' : formatPrice(deliveryCost)}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span className="font-bold">-{formatPrice(discount)}</span>
                    </div>
                  )}
                  {isDonationChecked && (
                    <div className="flex justify-between text-green-700">
                      <span className="flex items-center gap-1"><BiLeaf className="w-3 h-3" /> Green Donation</span>
                      <span className="font-bold">{formatPrice(DONATION_AMOUNT)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>Estimated Tax</span>
                    <span className="font-semibold text-gray-900">{formatPrice(tax)}</span>
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-end pt-4 border-t border-gray-100 mb-8">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500">Total Amount</span>
                    <span className="text-xs text-gray-400">Including Taxes</span>
                  </div>
                  <span className="text-3xl font-extrabold text-blue-600 tracking-tight">{formatPrice(finalTotal)}</span>
                </div>

                {/* Main Action Button */}
                <Button
                  onClick={handlePlaceOrder}
                  className={`w-full py-4 text-base font-bold rounded-xl shadow-xl shadow-blue-200 flex items-center justify-center gap-2 group transition-all duration-300 ${currentStep < 3 ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' : 'bg-blue-600 hover:bg-blue-700 text-white transform hover:-translate-y-1'
                    }`}
                  disabled={currentStep < 3}
                >
                  {currentStep < 3 ? `Complete Steps ${currentStep}/3` : 'Confirm Order'}
                  {currentStep === 3 && <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                </Button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
