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
  FiShieldOff,
  FiRefreshCw
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
  const [donationAmount, setDonationAmount] = useState(20)
  const { country, exchangeRates } = useCurrency()
  
  // Base donation options in INR
  const donationOptions = [10, 20, 50, 100]

  // Delivery dates
  const [deliveryDates, setDeliveryDates] = useState({
    standard: '5-7 business days',
    express: '2-3 business days'
  })

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
  const finalTotal = subtotal + deliveryCost - discount + donationTotal + platformFee

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
        theme: { color: '#FF3F6C' },
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
    <div className="min-h-screen bg-[#F1F3F6] pb-24">
      {/* Mobile Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-1">
            <FiArrowLeft className="w-6 h-6 text-gray-800" />
          </button>
          <h1 className="text-sm font-semibold text-gray-800 tracking-tight uppercase">Checkout</h1>
        </div>
        <FiShield className="w-6 h-6 text-[#14C2AD]" />
      </div>

      {/* Stepper */}
      <div className="bg-white px-4 py-3 border-b border-gray-100 mb-2">
        <div className="flex items-center justify-between max-w-xs mx-auto text-[10px] font-semibold uppercase tracking-widest text-gray-400">
           <div className="flex flex-col items-center gap-1.5 opacity-50">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
              <span>Bag</span>
           </div>
           <div className="flex-1 h-[1px] bg-emerald-500 mx-2 -mt-4"></div>
           <div className="flex flex-col items-center gap-1.5 ">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-50"></div>
              <span className="text-emerald-600">Address</span>
           </div>
           <div className="flex-1 h-[1px] bg-gray-200 mx-2 -mt-4"></div>
           <div className="flex flex-col items-center gap-1.5 opacity-50">
              <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
              <span>Payment</span>
           </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 lg:py-8 lg:bg-white lg:rounded-2xl lg:shadow-sm lg:mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Area */}
          <div className="lg:col-span-8">
            {currentStep === 1 && (
              <div className="bg-white p-6 rounded-xl border border-gray-100 mb-6 lg:border-none lg:p-0">
                <div className="flex items-center gap-2 mb-6">
                   <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-widest">Shipping Address</h3>
                </div>
                <div className="space-y-4">
                  <Input label="Full Name" value={shippingInfo.name} onChange={e => setShippingInfo({ ...shippingInfo, name: e.target.value })} placeholder="John Doe" />
                  <Input label="Email Address" type="email" value={shippingInfo.email} onChange={e => setShippingInfo({ ...shippingInfo, email: e.target.value })} placeholder="john@example.com" />
                  <Input label="Phone Number" value={shippingInfo.phone} onChange={e => setShippingInfo({ ...shippingInfo, phone: e.target.value })} placeholder="+91 98765 43210" />
                  <Input label="Address Line 1" value={shippingInfo.addressLine1} onChange={e => setShippingInfo({ ...shippingInfo, addressLine1: e.target.value })} placeholder="Flat No, House Name" />
                  <Input label="Address Line 2 (Optional)" value={shippingInfo.addressLine2} onChange={e => setShippingInfo({ ...shippingInfo, addressLine2: e.target.value })} placeholder="Landmark/Area" />
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="City" value={shippingInfo.city} onChange={e => setShippingInfo({ ...shippingInfo, city: e.target.value })} />
                    <Input label="State" value={shippingInfo.state} onChange={e => setShippingInfo({ ...shippingInfo, state: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Pincode" value={shippingInfo.pincode} onChange={e => setShippingInfo({ ...shippingInfo, pincode: e.target.value })} />
                    <Input label="Country" value={shippingInfo.country} onChange={e => setShippingInfo({ ...shippingInfo, country: e.target.value })} />
                  </div>
                  <button 
                    onClick={() => { if (validateShipping()) setCurrentStep(2) }}
                    className="w-full py-4 bg-[#FF3F6C] text-white font-semibold rounded uppercase tracking-widest shadow-lg shadow-[#FF3F6C]/20 active:scale-95 transition-all mt-4"
                  >
                    CONTINUE
                  </button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="bg-white p-6 rounded-xl border border-gray-100 mb-6 lg:border-none lg:p-0">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-widest mb-6">Delivery Method</h3>
                <div className="space-y-4">
                  {[
                    { id: 'standard', name: 'Standard Delivery', time: deliveryDates.standard, price: 'FREE', icon: FiTruck },
                    { id: 'express', name: 'Express Delivery', time: deliveryDates.express, price: formatPrice(99), icon: FiZap }
                  ].map(method => (
                    <div 
                      key={method.id}
                      onClick={() => setDeliveryMethod(method.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${deliveryMethod === method.id ? 'border-[#FF3F6C] bg-pink-50/30' : 'border-gray-100 hover:bg-gray-50'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <method.icon className={deliveryMethod === method.id ? 'text-[#FF3F6C]' : 'text-gray-400'} />
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{method.name}</p>
                            <p className="text-[11px] text-gray-500 font-medium">{method.time}</p>
                          </div>
                        </div>
                        <span className={`text-sm font-semibold ${method.price === 'FREE' ? 'text-emerald-600' : 'text-gray-900'}`}>{method.price}</span>
                      </div>
                    </div>
                  ))}
                  <button 
                    onClick={() => setCurrentStep(3)}
                    className="w-full py-4 bg-[#FF3F6C] text-white font-semibold rounded uppercase tracking-widest shadow-lg active:scale-95 transition-all mt-6"
                  >
                    PROCEED TO PAYMENT
                  </button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="bg-white p-6 rounded-xl border border-gray-100 mb-6 lg:border-none lg:p-0">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-widest mb-6">Payment Options</h3>
                <div className="space-y-3">
                  {[
                    { id: 'online', name: 'Online Payment', sub: 'Cards, Netbanking, Wallets', icon: FiCreditCard },
                    { id: 'upi', name: 'UPI (GPay/PhonePe)', sub: 'Instant & Secure', icon: FiSmartphone },
                    { id: 'cod', name: 'Cash On Delivery', sub: 'Pay when you receive', icon: FaRegMoneyBillAlt }
                  ].map(opt => (
                    <div 
                      key={opt.id}
                      onClick={() => setPaymentMethod(opt.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === opt.id ? 'border-[#FF3F6C] bg-pink-50/30' : 'border-gray-100 hover:bg-gray-50'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${paymentMethod === opt.id ? 'bg-[#FF3F6C] text-white' : 'bg-gray-50 text-gray-400'}`}>
                           <opt.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900 tracking-tight">{opt.name}</p>
                          <p className="text-[11px] text-gray-400 font-medium">{opt.sub}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === opt.id ? 'border-[#FF3F6C]' : 'border-gray-200'}`}>
                           {paymentMethod === opt.id && <div className="w-2.5 h-2.5 bg-[#FF3F6C] rounded-full"></div>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4">
             {/* Donation Section */}
             <div className="bg-white p-6 rounded-xl border border-gray-100 mb-4">
                <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-4">Support Social Work</h3>
                <label className="flex items-center gap-3 cursor-pointer group mb-4">
                   <div className="relative">
                      <input 
                        type="checkbox" 
                        checked={isDonationChecked}
                        onChange={() => setIsDonationChecked(!isDonationChecked)}
                        className="w-5 h-5 rounded border-gray-300 text-[#FF3F6C] focus:ring-[#FF3F6C]" 
                      />
                   </div>
                   <span className="text-[13px] font-semibold text-gray-800">Donate and make a difference</span>
                </label>
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
                   {donationOptions.map(amt => (
                      <button 
                        key={amt}
                        onClick={() => {
                           setDonationAmount(amt)
                           setIsDonationChecked(true)
                        }}
                        className={`min-w-[50px] px-3 py-2 rounded-full border text-[11px] font-black transition-all ${isDonationChecked && donationAmount === amt ? 'border-[#FF3F6C] bg-white text-[#FF3F6C]' : 'border-gray-200 bg-white text-gray-600'}`}
                      >
                         {currencyConfig.symbol}{amt}
                      </button>
                   ))}
                   <span className="text-[10px] font-semibold text-[#FF3F6C] uppercase min-w-fit ml-auto">Know More</span>
                </div>
             </div>

             {/* Coupons */}
             <div className="bg-white p-4 rounded-xl border border-gray-100 mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <BiTagAlt className="w-5 h-5 text-gray-700" />
                   <span className="text-[13px] font-semibold text-gray-800 uppercase tracking-widest">Coupons</span>
                </div>
                <button className="text-[11px] font-bold text-[#FF3F6C] border border-[#FF3F6C] px-3 py-1.5 rounded uppercase active:scale-95 transition-all">Apply</button>
             </div>

             {/* Price Details */}
             <div className="bg-white p-6 rounded-xl border border-gray-100">
                <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-4">Price Details</h3>
                <div className="space-y-4 text-[13px]">
                   <div className="flex justify-between items-center text-gray-600">
                      <span>Total MRP</span>
                      <span className="text-gray-900 font-medium">{currencyConfig.symbol}{Math.round(totalMRP).toLocaleString()}</span>
                   </div>
                   <div className="flex justify-between items-center text-gray-600">
                      <span>Discount on MRP</span>
                      <span className="text-emerald-500 font-semibold">-{currencyConfig.symbol}{Math.round(discountOnMRP).toLocaleString()}</span>
                   </div>
                   <div className="flex justify-between items-center text-gray-600">
                      <span>Platform Fee</span>
                      <span className="text-gray-900 font-medium">+{currencyConfig.symbol}{platformFee}</span>
                   </div>
                   <div className="flex justify-between items-center text-gray-600">
                      <span>Shipping Fee</span>
                      <span className="text-emerald-500 font-semibold uppercase">{deliveryCost > 0 ? formatPrice(deliveryCost) : 'FREE'}</span>
                   </div>
                   {isDonationChecked && (
                      <div className="flex justify-between items-center text-gray-600">
                         <span>Donation</span>
                         <span className="text-gray-900 font-medium">+{currencyConfig.symbol}{donationAmount}</span>
                      </div>
                   )}
                   <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-[16px] font-semibold text-gray-900">
                      <span>Total Amount</span>
                      <span>{currencyConfig.symbol}{Math.round(finalTotal).toLocaleString()}</span>
                   </div>
                </div>

                <button 
                  onClick={handlePlaceOrder}
                  disabled={loading || currentStep < 3}
                  className={`w-full py-4 mt-8 bg-[#FF3F6C] text-white font-semibold rounded shadow-xl uppercase tracking-widest transition-all ${loading || currentStep < 3 ? 'opacity-50 cursor-not-allowed' : 'active:scale-95 shadow-[#FF3F6C]/20'}`}
                >
                   {loading ? 'Processing...' : 'Confirm Order'}
                </button>
             </div>

             {/* Trust Markers */}
             <div className="mt-8 grid grid-cols-3 gap-2 px-2 pb-10">
                <div className="flex flex-col items-center gap-2">
                   <FiShieldOff className="w-8 h-8 text-gray-300" />
                   <span className="text-[9px] font-semibold text-gray-400 text-center uppercase">100% Genuine<br/>Products</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                   <FiRefreshCw className="w-8 h-8 text-gray-300" />
                   <span className="text-[9px] font-semibold text-gray-400 text-center uppercase">Secure<br/>Payments</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                   <FiTruck className="w-8 h-8 text-gray-300" />
                   <span className="text-[9px] font-semibold text-gray-400 text-center uppercase">Contactless<br/>Delivery</span>
                </div>
             </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  )
}

function FiTagAlt(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 7h.01" />
      <path d="M15.59 3.41a2 2 0 0 1 2.82 0l2.18 2.18a2 2 0 0 1 0 2.82L12 17l-9-9 9-9 8.59 8.59" />
      <path d="M5 19h14" />
    </svg>
  )
}
