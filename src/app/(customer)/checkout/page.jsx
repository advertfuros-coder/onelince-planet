'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

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
  FiGlobe,
  FiArrowLeft,
  FiHeart,
  FiRefreshCw,
  FiCheckCircle,
  FiLock as FiLockAlt
} from 'react-icons/fi'
import { FaRegMoneyBillAlt } from 'react-icons/fa'
import { BiWallet, BiBarcodeReader, BiLeaf, BiTagAlt } from 'react-icons/bi'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useCart } from '@/lib/context/CartContext'
import { useAuth } from '@/lib/context/AuthContext'
import { useCurrency } from '@/lib/context/CurrencyContext'
import Price from '@/components/ui/Price'
import { toast } from 'react-hot-toast'
import axios from 'axios'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal, shipping, total, clearCart } = useCart()
  const { user } = useAuth()
  const { formatPrice, currencyConfig } = useCurrency()
  const [loading, setLoading] = useState(false)

  // Steps: 1=Address & Shipping, 2=Payment & Rewards
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
  const [donationAmount, setDonationAmount] = useState(20)
  const { country, exchangeRates } = useCurrency()

  // Base donation options in INR
  const donationOptions = [10, 20, 50, 100]

  // Delivery dates
  const [deliveryDates, setDeliveryDates] = useState({
    standard: '5-7 business days',
    express: '2-3 business days'
  })

  // BRAND COLORS
  const BRAND_PRIMARY = '#2563eb' // Blue 600
  const BRAND_SECONDARY = '#FFD23F' // Planet Yellow

  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart')
    } else {
      fetchDeliveryEstimates()
    }
  }, [items, router])

  const fetchDeliveryEstimates = async () => {
    const pincode = localStorage.getItem('userPincode')
    if (!pincode || items.length === 0) return

    try {
      const productId = items[0].productId || items[0]._id || items[0].id
      const response = await axios.post('/api/shipping/estimate', {
        productId: productId,
        deliveryPincode: pincode
      })
      if (response.data.success && response.data.estimate) {
        const { etd, express_days } = response.data.estimate
        const edd = new Date(etd)
        const standardDate = edd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        const today = new Date()
        const expressEdd = new Date(today)
        expressEdd.setDate(today.getDate() + (express_days || 2))
        const expressDate = expressEdd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        setDeliveryDates({
          standard: `By ${standardDate}`,
          express: `By ${expressDate}`
        })
      }
    } catch (error) {
      console.error('Failed to fetch delivery estimates:', error)
    }
  }

  const validateShipping = () => {
    const required = ['name', 'email', 'phone', 'addressLine1', 'city', 'state', 'pincode', 'country']
    for (const field of required) {
      if (!shippingInfo[field] || !shippingInfo[field].trim()) {
        toast.error(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`)
        return false
      }
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(shippingInfo.email)) {
      toast.error('Please enter a valid email address')
      return false
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

  const deliveryCost = deliveryMethod === 'express' ? 99 : 0
  const donationTotal = isDonationChecked ? donationAmount : 0
  const totalMRP = subtotal * 1.4
  const discountOnMRP = totalMRP - subtotal
  const platformFee = items.length > 0 ? 20 : 0
  const tax = subtotal * 0.05

  // Incentive: 10% Extra for COD
  const codFee = paymentMethod === 'cod' ? (subtotal * 0.1) : 0
  const finalTotal = subtotal + deliveryCost - discount + donationTotal + platformFee + codFee

  const handleRazorpayPayment = async () => {
    if (typeof window.Razorpay === 'undefined') {
      toast.error('Payment gateway not available. Please refresh the page.')
      return
    }
    setLoading(true)
    try {
      const orderResponse = await axios.post('/api/payment/razorpay/create-order', {
        amount: finalTotal,
        currency: 'INR',
        receipt: `order_${Date.now()}`
      })
      if (!orderResponse.data.success) throw new Error('Failed to create payment order')
      const { orderId, amount, currency } = orderResponse.data
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
        theme: { color: BRAND_PRIMARY },
        handler: async function (response) {
          try {
            const verifyResponse = await axios.post('/api/payment/razorpay/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })
            if (verifyResponse.data.success) {
              await placeOrder(response.razorpay_payment_id, paymentMethod)
            } else {
              toast.error('Payment verification failed')
              setLoading(false)
            }
          } catch (error) {
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
      toast.error('Failed to initialize payment')
      setLoading(false)
    }
  }

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
          email: shippingInfo.email || user?.email || '',
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
        customerId: user?._id || user?.id || null,
        guestEmail: !user ? (shippingInfo.email || '') : null,
        isGuestOrder: !user,
        subtotal,
        tax,
        shipping: deliveryCost,
        donation: donationTotal,
        total: finalTotal
      }
      const token = localStorage.getItem('token')
      const headers = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`
      const response = await axios.post('/api/customer/orders', orderData, { headers })
      if (response.data.success) {
        clearCart()
        toast.success('Order placed successfully!')
        const orderNumber = response.data.orderNumber || 'OP-' + Date.now()
        router.push(`/orders/success?orderNumber=${orderNumber}&total=${finalTotal}&donation=${donationTotal}&email=${encodeURIComponent(shippingInfo.email || user?.email || '')}&guest=${!user}`)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order')
      setLoading(false)
    }
  }

  const handlePlaceOrder = async () => {
    if (paymentMethod === 'cod') {
      setLoading(true)
      await placeOrder(null, 'cod')
    } else {
      await handleRazorpayPayment()
    }
  }

  return (
    <div className="min-h-screen md:bg-blue-50/30 bg-white pb-24">
      {/* Mobile Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-1 px-0 text-blue-600">
            <FiArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-[14px] font-semibold text-gray-800 tighter">Secure Checkout</h1>
        </div>
       
      </div>

      {/* Stepper */}
      <div className="bg-white md:block hidden px-4 py-6 border-b border-gray-100">
        <div className="flex items-center justify-between max-w-sm mx-auto">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold shadow-lg shadow-blue-200">
              <FiCheck className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-semibold text-blue-600">Bag</span>
          </div>
          <div className="flex-1 h-[2px] bg-blue-600 mx-2 -mt-6"></div>
          <div className="flex flex-col items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${currentStep >= 1 ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-gray-100 text-gray-400'}`}>
              {currentStep > 1 ? <FiCheck className="w-4 h-4" /> : '2'}
            </div>
            <span className={`text-[10px] font-semibold ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>Address</span>
          </div>
          <div className={`flex-1 h-[2px] mx-2 -mt-6 transition-colors ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          <div className="flex flex-col items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${currentStep === 2 ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-gray-100 text-gray-400'}`}>
              3
            </div>
            <span className={`text-[10px] font-semibold ${currentStep === 2 ? 'text-blue-600' : 'text-gray-400'}`}>Payment</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto md:px-4 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          {/* Main Area */}
          <div className="lg:col-span-8 space-6">

            {/* Address Details */}
            <div className={`bg-white md:rounded-[40px] rounded-none overflow-hidden transition-all duration-500 md:border border-gray-100 md:shadow-xl md:shadow-blue-900/5 ${currentStep !== 1 ? 'max-h-[200px] opacity-100' : 'max-h-[2000px]'}`}>
              <div className={`transition-all duration-500 ${currentStep !== 1 ? 'md:p-6 p-4' : 'md:p-8 px-4 py-8'}`}>
                <div className={`flex justify-between items-center transition-all ${currentStep !== 1 ? 'mb-4' : 'mb-8'}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                      <FiMapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-[13px] font-semibold text-gray-900 tighter">Delivery Address</h3>
                      {currentStep === 1 && (
                        <p className="text-[10px] text-gray-400 font-semibold">Where should we deliver your planet bag?</p>
                      )}
                    </div>
                  </div>
                  {currentStep > 1 && (
                    <button onClick={() => setCurrentStep(1)} className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-5 py-2.5 rounded-2xl">Change</button>
                  )}
                </div>

                {currentStep === 1 ? (
                  <div className="space-y-8 animate-slideUp">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-6">
                        <Input label="Receiver Full Name" value={shippingInfo.name} onChange={e => setShippingInfo({ ...shippingInfo, name: e.target.value })} placeholder="Enter name" />
                        <Input label="Email for Invoice" type="email" value={shippingInfo.email} onChange={e => setShippingInfo({ ...shippingInfo, email: e.target.value })} placeholder="email@example.com" />
                        <Input label="Primary Mobile" value={shippingInfo.phone} onChange={e => setShippingInfo({ ...shippingInfo, phone: e.target.value })} placeholder="+91 / +971" />
                      </div>
                      <div className="space-y-6">
                        <Input label="Street / Building" value={shippingInfo.addressLine1} onChange={e => setShippingInfo({ ...shippingInfo, addressLine1: e.target.value })} placeholder="Building Name / H.No" />
                        <Input label="Area / Landmark" value={shippingInfo.addressLine2} onChange={e => setShippingInfo({ ...shippingInfo, addressLine2: e.target.value })} placeholder="Sector / Landmark" />
                        <div className="grid grid-cols-2 gap-4">
                          <Input label="City" value={shippingInfo.city} onChange={e => setShippingInfo({ ...shippingInfo, city: e.target.value })} />
                          <Input label="Pincode" value={shippingInfo.pincode} onChange={e => setShippingInfo({ ...shippingInfo, pincode: e.target.value })} />
                        </div>
                      </div>
                    </div>

                    <div className="pt-8 border-t border-gray-100">
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="text-[13px] font-semibold text-gray-900 tighter">Shipping Speed</h4>
                        <span className="text-[10px] font-semibold text-blue-600 px-3 py-1 bg-blue-50 rounded-lg wider">Eco-Friendly Shipping</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { id: 'standard', name: 'Standard Logistics', time: deliveryDates.standard, price: 'FREE', icon: FiTruck, desc: 'Eco-responsible shipping' },
                          { id: 'express', name: 'Planet Express', time: deliveryDates.express, price: formatPrice(99), icon: FiZap, desc: 'Priority air delivery' }
                        ].map(method => (
                          <div
                            key={method.id}
                            onClick={() => setDeliveryMethod(method.id)}
                            className={`p-6 rounded-[28px] border-2 transition-all cursor-pointer group relative overflow-hidden ${deliveryMethod === method.id ? 'border-blue-600 bg-blue-50/20' : 'border-gray-50 bg-gray-50 hover:border-gray-200'}`}
                          >
                            {deliveryMethod === method.id && (
                              <div className="absolute top-0 right-0 p-2">
                                <FiCheckCircle className="text-blue-600 w-5 h-5" />
                              </div>
                            )}
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm ${deliveryMethod === method.id ? 'bg-blue-600 text-white' : 'bg-white text-gray-400'}`}>
                                <method.icon className="w-6 h-6" />
                              </div>
                              <div>
                                <p className="text-[13px] font-semibold text-gray-900 tighter">{method.name}</p>
                                <p className="text-[10px] text-gray-400 font-semibold">{method.time} • {method.desc}</p>
                              </div>
                            </div>
                            <div className="mt-4 flex justify-between items-center">
                              <span className={`text-[13px] font-semibold tighter ${method.price === 'FREE' ? 'text-emerald-500' : 'text-gray-900'}`}>{method.price}</span>
                              {method.id === 'express' && <span className="text-[9px] bg-blue-100 text-blue-600 px-2 py-1 rounded-md font-semibold widest">Recommended</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => { if (validateShipping()) setCurrentStep(2) }}
                      className="w-full py-5 bg-blue-600 text-white font-semibold rounded-[24px] shadow-xl shadow-blue-600/20 active:scale-[0.98] transition-all hidden md:block text-[14px] wider"
                    >
                      Confirm Address & Choose Payment
                    </button>
                  </div>
                ) : (
                  <div className="bg-blue-50/30 md:p-5 p-4 rounded-[28px] border border-blue-100/50 flex items-center justify-between">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                        <FiCheckCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[14px] font-semibold text-gray-900 tighter">{shippingInfo.name}</p>
                        <p className="text-[10px] text-blue-600/70 font-semibold mt-1">{deliveryMethod.charAt(0).toUpperCase() + deliveryMethod.slice(1)} Delivery • {deliveryDates[deliveryMethod]}</p>
                        <p className="text-[10px] text-gray-400 font-semibold mt-1">{shippingInfo.addressLine1}, {shippingInfo.city}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Payment & Rewards */}
            <div className={`bg-white md:rounded-[40px] rounded-none overflow-hidden transition-all duration-500 md:border border-gray-100 md:shadow-xl md:shadow-blue-900/5 ${currentStep !== 2 ? 'max-h-[120px] opacity-100' : 'max-h- [3000px]'}`}>
              {currentStep === 2 && (
                <div className="md:p-8 px-4 py-8">

                  {/* Coupon Section Refined */}
                  <div className="mb-4 md:bg-blue-50/30 md:border border-blue-100 md:p-8 p-0 md:rounded-[32px] rounded-none relative md:overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600/5 rounded-full blur-3xl"></div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-[#FFD23F]">
                          <BiTagAlt className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-gray-900 tighter">Available Promotions</p>
                          <p className="text-[10px] text-gray-400 font-semibold">Maximize your planet savings</p>
                        </div>
                      </div>
                      {appliedCoupon && (
                        <button onClick={() => { setAppliedCoupon(null); setDiscount(0); }} className="text-xs font-semibold text-red-500">Remove Coupon</button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3 relative z-10">
                      <input
                        type="text"
                        placeholder="Enter Promo Code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="flex-1 px-6 py-2 bg-white border border-gray-100 rounded-2xl text-[13px] font-semibold focus:ring-2 focus:ring-blue-600/20 placeholder:text-gray-300 transition-all"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        className="px-8 bg-blue-600 text-white text-[12px] font-semibold rounded-2xl shadow-lg shadow-blue-600/10 active:scale-95 transition-all wider"
                      >
                        Apply Code
                      </button>
                    </div>
                    {!appliedCoupon && (
                      <div className="mt-4 flex items-center gap-2 px-1">
                        <span className="text-[9px] font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded widest">SAVE20</span>
                        <p className="text-[10px] text-gray-400 font-semibold">Use code <span className="text-blue-600 font-semibold">SAVE20</span> for 20% flat discount!</p>
                      </div>
                    )}
                  </div>

                  {/* Donation Section - Second in Sequence */}
                  <div className="bg-gradient-to-br from-green-600 to-green-900 md:p-8 p-4 md:rounded-[40px] rounded-[32px] mb-8 text-white relative overflow-hidden shadow-2xl shadow-blue-900/10">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <BiLeaf className="w-24 h-24" />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center">
                          <BiLeaf className="text-[#FFD23F] w-7 h-7" />
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold tighter">Green Orbit Contribution</p>
                          <p className="text-[10px] text-blue-100/70 font-semibold italic">Empower your carbon neutrality</p>
                        </div>
                      </div>

                      <label className="flex items-center gap-4 cursor-pointer group bg-white/5 p-4 mb-2 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                        <input
                          type="checkbox"
                          checked={isDonationChecked}
                          onChange={() => setIsDonationChecked(!isDonationChecked)}
                          className="w-6 h-6 rounded-lg border-2 border-white/20 bg-transparent text-[#FFD23F] focus:ring-0 checked:bg-[#FFD23F] transition-all"
                        />
                        <div>
                          <span className="text-[11px] font-semibold block tighter">Plant a tree with this package</span>
                         </div>
                      </label>


                      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
                        {donationOptions.map(amt => (
                          <button
                            key={amt}
                            onClick={() => {
                              setDonationAmount(amt)
                              setIsDonationChecked(true)
                            }}
                            className={`min-w-[70px] px-1 py-1 rounded-2xl border-2 text-[14px] font-semibold transition-all tighter ${isDonationChecked && donationAmount === amt ? 'border-[#FFD23F] bg-[#FFD23F] text-blue-900 shadow-lg shadow-amber-400/20' : 'border-white/10 bg-white/5 text-white hover:bg-white/10'}`}
                          >
                            {currencyConfig.symbol}{amt}
                          </button>
                        ))}
                      </div>


                    </div>
                  </div>

                  {/* Payment Method UI - Third in Sequence */}
                  <div className="mb-8">
                    <h4 className="text-[13px] font-semibold text-gray-900 mb-6 wider tighter">Payment Method</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {[
                        { id: 'online', name: 'Secure Online', sub: 'Cards, Wallet, Netbanking', icon: FiShield, highlight: 'Speedy & Secure', badge: 'Recommended', color: 'blue' },
                        { id: 'upi', name: 'Instant UPI', sub: 'GPay, PhonePe, WhatsApp', icon: FiSmartphone, highlight: 'Zero Latency', color: 'emerald' },
                      ].map(opt => (
                        <div
                          key={opt.id}
                          onClick={() => setPaymentMethod(opt.id)}
                          className={`md:p-8 p-6 md:rounded-[32px] rounded-[24px] border-2 transition-all cursor-pointer relative group ${paymentMethod === opt.id ? 'border-blue-600 bg-blue-50/40 shadow-xl shadow-blue-900/5' : 'border-gray-50 bg-gray-50/50 hover:border-gray-200'}`}
                        >
                          {opt.badge && (
                            <span className="absolute top-4 right-4 text-[9px] font-semibold bg-emerald-500 text-white px-2.5 py-1 rounded-full uppercase tracking-tighter shadow-sm">{opt.badge}</span>
                          )}
                          <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${paymentMethod === opt.id ? 'bg-blue-600 text-white scale-110 shadow-lg' : 'bg-white text-gray-400'}`}>
                              <opt.icon className="w-7 h-7" />
                            </div>
                            <div>
                              <p className="text-[13px] font-semibold text-gray-900 tighter">{opt.name}</p>
                              <p className="text-[10px] text-gray-400 font-semibold mt-1">{opt.sub}</p>
                            </div>
                          </div>

                        </div>
                      ))}
                    </div>

                    {/* Cash on Delivery Card (Incentivized) */}
                    <div
                      onClick={() => setPaymentMethod('cod')}
                      className={`mt-2 md:p-8 p-6 md:rounded-[32px] rounded-[24px] border-2 transition-all cursor-pointer relative ${paymentMethod === 'cod' ? 'border-amber-500 bg-amber-50/30' : 'border-gray-50 bg-gray-50/50 hover:border-gray-200'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${paymentMethod === 'cod' ? 'bg-amber-500 text-white' : 'bg-white text-gray-400'}`}>
                            <FaRegMoneyBillAlt className="w-7 h-7" />
                          </div>
                          <div>
                            <p className="text-[13px] font-semibold text-gray-900 flex items-center gap-2 tighter">
                              Cash on Delivery
                              <span className="text-[9px] font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded italic widest">Higher Friction</span>
                            </p>
                            <p className="text-[10px] text-gray-400 font-semibold mt-1">Pay 10% convenience fee for manual collection</p>
                          </div>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-amber-500 bg-amber-500' : 'border-gray-200'}`}>
                          {paymentMethod === 'cod' && <FiCheck className="text-white w-3 h-3" />}
                        </div>
                      </div>
                      {paymentMethod === 'cod' && (
                        <div className="mt-6 p-4 bg-white/50 border border-amber-200/50 rounded-2xl flex items-start gap-3 animate-slideUp">
                          <FiInfo className="text-amber-600 w-4 h-4 shrink-0 mt-0.5" />
                          <p className="text-[11px] text-amber-800 font-medium">A convenience fee of 10% ({currencyConfig.symbol}{Math.round(codFee)}) will be added to your total due to high logistics overhead for cash handling.</p>
                        </div>
                      )}
                    </div>
                  </div>



                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="w-full py-6 bg-blue-600 text-white font-semibold rounded-[28px] shadow-2xl shadow-blue-600/20 active:scale-[0.98] transition-all hidden md:block mt-10 text-[14px] wider"
                  >
                    {loading ? 'Processing Transaction...' : 'Complete Payment & Order'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-[40px] border border-gray-100 shadow-2xl shadow-blue-900/5 p-8 sticky top-28">
              <h3 className="text-[10px] font-semibold text-gray-400 mb-8 [3px]">Financial Ledger</h3>
              <div className="space-y-5 mb-8 text-[13px]">
                <div className="flex justify-between items-center font-semibold text-gray-500">
                  <span className="font-medium text-[11px]  widest">Gross Market Value</span>
                  <StrikePrice amount={totalMRP} className="text-gray-300 font-medium" />
                </div>
                <div className="flex justify-between items-center font-semibold text-gray-900">
                  <span className="font-medium text-[11px]  widest">Operational Total</span>
                  <span>{currencyConfig.symbol}{Math.round(subtotal).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center font-semibold text-emerald-500">
                  <span className="font-medium text-[11px]  widest">Savings Applied</span>
                  <span>-{currencyConfig.symbol}{Math.round(discountOnMRP).toLocaleString()}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between items-center text-[14px] font-semibold text-blue-600">
                    <span className="font-medium">Planet Reward ({appliedCoupon.code})</span>
                    <span>-{currencyConfig.symbol}{Math.round(discount).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-center font-semibold text-gray-900">
                  <span className="font-medium text-[11px]  widest">Logistics Fee</span>
                  <span>{deliveryCost > 0 ? formatPrice(deliveryCost) : 'FREE'}</span>
                </div>
                {isDonationChecked && (
                  <div className="flex justify-between items-center text-[14px] font-semibold text-blue-600">
                    <span className="font-medium">Green Contribution</span>
                    <span>+{currencyConfig.symbol}{donationAmount}</span>
                  </div>
                )}
                {paymentMethod === 'cod' && (
                  <div className="flex justify-between items-center text-[14px] font-semibold text-amber-600 px-4 py-3 bg-amber-50 rounded-2xl border border-amber-100">
                    <span className="font-medium flex flex-col">
                      Cash Handling
                      <span className="text-[9px] font-medium text-amber-500">10% Convenience Fee</span>
                    </span>
                    <span>+{currencyConfig.symbol}{Math.round(codFee).toLocaleString()}</span>
                  </div>
                )}
                <div className="pt-8 border-t border-dashed border-gray-100 flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-semibold text-blue-600  [3px]">Net Payable Amount</span>
                    <span className="text-[11px] text-gray-400 font-semibold mt-1 flex items-center gap-1"><FiLockAlt className="w-3 h-3 text-emerald-500" /> Secure Checkout</span>
                  </div>
                  <span className="text-xl font-semibold text-blue-600 tighter">{currencyConfig.symbol}{Math.round(finalTotal).toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50/50 border border-gray-100">
                  <FiTruck className="text-blue-600 w-5 h-5 shrink-0" />
                  <div>
                    <p className="text-[11px] font-semibold text-gray-900">Smart Logistics</p>
                    <p className="text-[9px] text-gray-400 font-medium">Real-time planetary tracking enabled</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 px-6 flex items-center justify-around pb-12">
              <div className="flex flex-col items-center gap-2">
                <FiShield className="w-9 h-9 text-blue-50" />
                <span className="text-[8px] font-semibold text-gray-300 text-center leading-tight">100% Authentic<br />Planet</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <FiRefreshCw className="w-9 h-9 text-blue-50" />
                <span className="text-[8px] font-semibold text-gray-300 text-center leading-tight">Secure<br />Stream</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <FiBox className="w-9 h-9 text-blue-50" />
                <span className="text-[8px] font-semibold text-gray-300 text-center leading-tight">Premium<br />Logistics</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Action Bar */}
      <div className="fixed bottom-16 left-0 right-0 bg-white/95 backdrop-blur-2xl border-t border-blue-50 p-5 z-40 lg:hidden shadow-[0_-15px_40px_rgba(37,99,235,0.08)]">
        <div className="flex items-center justify-between gap-6">
          <div className="flex flex-col">
            <span className="text-xl font-semibold text-blue-600 tighter">{currencyConfig.symbol}{Math.round(finalTotal).toLocaleString()}</span>
            <button className="text-[9px] font-semibold text-gray-400 flex items-center gap-1.5 mt-0.5">Summary <FiChevronRight className="w-3 h-3" /></button>
          </div>
          <button
            onClick={() => {
              if (currentStep === 1) {
                if (validateShipping()) setCurrentStep(2)
              } else {
                handlePlaceOrder()
              }
            }}
            disabled={loading}
            className="flex-1 py-3 bg-blue-600 text-white font-semibold text-[14px] rounded-[24px] shadow-2xl shadow-blue-600/30 active:scale-95 transition-all text-center wider"
          >
            {loading ? 'Wait...' : (currentStep === 1 ? 'Go to Payment' : 'Confirm Order')}
          </button>
        </div>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideUp { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  )
}

function StrikePrice({ amount, className = '' }) {
  const { formatPrice } = useCurrency()
  return <span className={`line-through opacity-50 ${className}`}>{formatPrice(amount)}</span>
}
