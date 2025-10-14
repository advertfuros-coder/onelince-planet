'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Script from 'next/script'
import Image from 'next/image'
import { 
  FiCreditCard,
  FiMapPin,
  FiUser,
  FiPhone,
  FiMail,
  FiLock,
  FiCheck,
  FiAlertCircle,
  FiTag,
  FiX
} from 'react-icons/fi'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useCart } from '@/lib/context/CartContext'
import { useAuth } from '@/lib/context/AuthContext'
import { formatPrice } from '@/lib/utils'
import { toast } from 'react-hot-toast'
import axios from 'axios'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal, tax, shipping, total, clearCart } = useCart()
  const { user, token, isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)

  const [shippingInfo, setShippingInfo] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India'
  })

  const [paymentMethod, setPaymentMethod] = useState('cod')

  // Coupon state
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [discount, setDiscount] = useState(0)

  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart')
    }
  }, [items])

  const validateShipping = () => {
    const required = ['name', 'phone', 'addressLine1', 'city', 'state', 'pincode']
    for (const field of required) {
      if (!shippingInfo[field].trim()) {
        toast.error(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`)
        return false
      }
    }
    return true
  }

  const handleShippingSubmit = () => {
    if (validateShipping()) {
      setStep(2)
    }
  }

  // Apply Coupon
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code')
      return
    }

    setCouponLoading(true)
    try {
      const response = await axios.post('/api/coupons/validate', {
        code: couponCode,
        subtotal,
        items: items.map(item => ({ productId: item.productId, quantity: item.quantity }))
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.data.success) {
        setAppliedCoupon(response.data.coupon)
        setDiscount(response.data.discount)
        toast.success(`Coupon applied! You saved ₹${response.data.discount}`)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid coupon code')
    } finally {
      setCouponLoading(false)
    }
  }

  // Remove Coupon
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode('')
    setDiscount(0)
    toast.success('Coupon removed')
  }

  // Calculate final total with discount
  const finalTotal = total - discount

  // Razorpay Payment Handler
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
          ondismiss: function() {
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

  // Place Order Function
  const placeOrder = async (paymentId = null, paymentMethod = 'cod') => {
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
        paymentMethod,
        paymentId: paymentId,
        couponCode: appliedCoupon?.code || null
      }

      const response = await axios.post('/api/customer/orders', orderData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.data.success) {
        clearCart()
        toast.success('Order placed successfully!')
        router.push(`/orders/${response.data.orderNumber}`)
      }
    } catch (error) {
      console.error('Order error:', error)
      toast.error(error.response?.data?.message || 'Failed to place order')
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Handle Place Order based on payment method
  const handlePlaceOrder = async () => {
    if (paymentMethod === 'cod') {
      setLoading(true)
      await placeOrder(null, 'cod')
    } else {
      // For online payments (UPI, Card, Net Banking) - use Razorpay
      await handleRazorpayPayment()
    }
  }

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ]

  return (
    <>
      {/* Load Razorpay Script */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setRazorpayLoaded(true)}
        onError={() => {
          toast.error('Failed to load payment gateway')
          setRazorpayLoaded(false)
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                {step > 1 ? <FiCheck /> : '1'}
              </div>
              <span className="ml-2 text-sm font-medium">Shipping</span>
            </div>
            <div className={`w-24 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                {step > 2 ? <FiCheck /> : '2'}
              </div>
              <span className="ml-2 text-sm font-medium">Payment</span>
            </div>
            <div className={`w-24 h-1 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                3
              </div>
              <span className="ml-2 text-sm font-medium">Review</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Shipping Information */}
            {step === 1 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <FiMapPin className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Shipping Information</h2>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Full Name *"
                      value={shippingInfo.name}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, name: e.target.value })}
                      placeholder="John Doe"
                    />
                    <Input
                      label="Phone Number *"
                      type="tel"
                      value={shippingInfo.phone}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                      placeholder="+91-9876543210"
                    />
                  </div>

                  <Input
                    label="Email Address *"
                    type="email"
                    value={shippingInfo.email}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                    placeholder="you@example.com"
                  />

                  <Input
                    label="Address Line 1 *"
                    value={shippingInfo.addressLine1}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, addressLine1: e.target.value })}
                    placeholder="House No., Building, Street"
                  />

                  <Input
                    label="Address Line 2"
                    value={shippingInfo.addressLine2}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, addressLine2: e.target.value })}
                    placeholder="Landmark, Area (Optional)"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label="City *"
                      value={shippingInfo.city}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                      placeholder="Mumbai"
                    />
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State *
                      </label>
                      <select
                        value={shippingInfo.state}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select State</option>
                        {indianStates.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>

                    <Input
                      label="Pincode *"
                      value={shippingInfo.pincode}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, pincode: e.target.value })}
                      placeholder="400001"
                      maxLength={6}
                    />
                  </div>

                  <Button onClick={handleShippingSubmit} className="w-full">
                    Continue to Payment
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Payment Method */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center space-x-2 mb-6">
                    <FiCreditCard className="w-5 h-5 text-blue-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Payment Method</h2>
                  </div>

                  <div className="space-y-4">
                    {/* Cash on Delivery */}
                    <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === 'cod' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">Cash on Delivery</span>
                          <span className="text-sm text-gray-500">Pay when you receive</span>
                        </div>
                      </div>
                    </label>

                    {/* Online Payment (Razorpay) */}
                    <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === 'online' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="online"
                        checked={paymentMethod === 'online'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">Pay Online</span>
                          <span className="text-sm text-gray-500">UPI, Card, Net Banking</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">Powered by Razorpay</p>
                      </div>
                    </label>
                  </div>

                  <div className="flex space-x-4 mt-6">
                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                      Back
                    </Button>
                    <Button onClick={() => setStep(3)} className="flex-1">
                      Review Order
                    </Button>
                  </div>
                </div>

                {/* Security Badge */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <FiLock className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-blue-900">Secure Payment</h3>
                      <p className="text-sm text-blue-700">
                        Your payment information is encrypted and secure. We never store your card details.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Review Order */}
            {step === 3 && (
              <div className="space-y-6">
                {/* Shipping Address Review */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Shipping Address</h2>
                    <Button variant="outline" size="sm" onClick={() => setStep(1)}>
                      Edit
                    </Button>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p className="font-medium text-gray-900">{shippingInfo.name}</p>
                    <p>{shippingInfo.addressLine1}</p>
                    {shippingInfo.addressLine2 && <p>{shippingInfo.addressLine2}</p>}
                    <p>{shippingInfo.city}, {shippingInfo.state} {shippingInfo.pincode}</p>
                    <p className="mt-2">{shippingInfo.phone}</p>
                    <p>{shippingInfo.email}</p>
                  </div>
                </div>

                {/* Payment Method Review */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Payment Method</h2>
                    <Button variant="outline" size="sm" onClick={() => setStep(2)}>
                      Change
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 capitalize">
                    {paymentMethod === 'cod' && 'Cash on Delivery'}
                    {paymentMethod === 'online' && 'Online Payment (UPI/Card/Net Banking)'}
                  </p>
                </div>

                {/* Order Items */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={`${item.productId}-${JSON.stringify(item.variant)}`} className="flex items-center space-x-4">
                        <img
                          src={item.image || '/images/placeholder-product.jpg'}
                          alt={item.name}
                          width={60}
                          height={60}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{item.name}</h3>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        </div>
                        <p className="font-medium text-gray-900">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Place Order Button */}
                <div className="flex space-x-4">
                  <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                    Back
                  </Button>
                  <Button
                    onClick={handlePlaceOrder}
                    loading={loading}
                    className="flex-1"
                  >
                    {paymentMethod === 'cod' ? 'Place Order' : 'Proceed to Payment'}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24 space-y-4">
              <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal ({items.length} items)</span>
                  <span className="text-gray-900">{formatPrice(subtotal)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900">
                    {shipping === 0 ? (
                      <span className="text-green-600 font-medium">Free</span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (18% GST)</span>
                  <span className="text-gray-900">{formatPrice(tax)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Discount</span>
                    <span className="text-green-600 font-semibold">-{formatPrice(discount)}</span>
                  </div>
                )}
              </div>

              {/* Coupon Code Section */}
              <div className="border-t border-b py-4">
                <div className="flex items-center space-x-2 mb-3">
                  <FiTag className="w-4 h-4 text-gray-600" />
                  <h4 className="font-medium text-gray-900">Apply Coupon</h4>
                </div>

                {!appliedCoupon ? (
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter coupon code"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={couponLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                    >
                      {couponLoading ? 'Applying...' : 'Apply'}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <FiCheck className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-900">{appliedCoupon.code}</span>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="pt-4">
                <div className="flex justify-between mb-6">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="font-bold text-xl text-gray-900">
                    {formatPrice(finalTotal)}
                  </span>
                </div>
              </div>

              {/* Delivery Estimate */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <FiCheck className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-900 text-sm">Estimated Delivery</h4>
                    <p className="text-xs text-green-700 mt-1">
                      Expected delivery in 3-5 business days
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
