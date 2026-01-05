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
    FiPackage,
    FiShield,
    FiLock,
    FiClock,
    FiUsers,
    FiTrendingUp,
    FiGift,
    FiPercent
} from 'react-icons/fi'
import { FaApple, FaGoogle, FaRegMoneyBillAlt } from 'react-icons/fa'
import { BiWallet } from 'react-icons/bi'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useCart } from '@/lib/context/CartContext'
import { useAuth } from '@/lib/context/AuthContext'
import { useCurrency } from '@/lib/context/CurrencyContext'
import Price from '@/components/ui/Price'
import { toast } from 'react-hot-toast'
import axios from 'axios'

export default function CheckoutPageRedesigned() {
    const router = useRouter()
    const { items, subtotal, clearCart } = useCart()
    const { user } = useAuth()
    const { formatPrice } = useCurrency()
    const [loading, setLoading] = useState(false)

    // Shipping Info
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

    // Checkout State
    const [deliveryMethod, setDeliveryMethod] = useState('standard')
    const [paymentMethod, setPaymentMethod] = useState('online')
    const [couponCode, setCouponCode] = useState('')
    const [appliedCoupon, setAppliedCoupon] = useState(null)
    const [discount, setDiscount] = useState(0)
    const [isDonationChecked, setIsDonationChecked] = useState(false)

    // UI State
    const [showAddressForm, setShowAddressForm] = useState(!user)
    const [showPaymentMethods, setShowPaymentMethods] = useState(false)
    const [liveOrders, setLiveOrders] = useState(2341) // Simulated live counter

    const DONATION_AMOUNT = 20
    const deliveryCost = deliveryMethod === 'express' ? 99 : 0
    const donationTotal = isDonationChecked ? DONATION_AMOUNT : 0
    const tax = subtotal * 0.05
    const finalTotal = subtotal + deliveryCost - discount + donationTotal

    // Simulated live activity
    useEffect(() => {
        const interval = setInterval(() => {
            setLiveOrders(prev => prev + Math.floor(Math.random() * 3))
        }, 5000)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        if (items.length === 0) {
            router.push('/cart')
        }
    }, [items, router])

    // Validation
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

    // Coupon
    const handleApplyCoupon = () => {
        if (couponCode.toUpperCase() === 'SAVE100') {
            setAppliedCoupon({ code: 'SAVE100', discount: 100 })
            setDiscount(100)
            toast.success('Coupon applied successfully!')
        } else {
            toast.error('Invalid coupon code')
        }
    }

    // Place Order
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
                const isGuest = !user
                const successUrl = `/orders/success?orderNumber=${orderNumber}&total=${finalTotal}&donation=${donationTotal}&email=${encodeURIComponent(shippingInfo.email || user?.email || '')}&guest=${isGuest}`
                router.push(successUrl)
            }
        } catch (error) {
            console.error('Order error:', error)
            if (error.response?.status === 401) {
                toast.error('Unable to place order. Please try again or contact support.')
            } else {
                toast.error(error.response?.data?.message || 'Failed to place order')
            }
            setLoading(false)
        }
    }

    // Razorpay Payment
    const handleRazorpayPayment = async () => {
        if (typeof window.Razorpay === 'undefined') {
            toast.error('Payment gateway not available. Please refresh the page.')
            return
        }

        if (!validateShipping()) return

        setLoading(true)

        try {
            const orderResponse = await axios.post('/api/payment/razorpay/create-order', {
                amount: finalTotal,
                currency: 'INR',
                receipt: `order_${Date.now()}`
            })

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: orderResponse.data.amount,
                currency: orderResponse.data.currency,
                name: 'Online Planet',
                description: 'Order Payment',
                order_id: orderResponse.data.orderId,
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
            toast.error('Failed to initiate payment')
            setLoading(false)
        }
    }

    const handlePlaceOrder = async () => {
        if (!validateShipping()) return

        if (paymentMethod === 'cod') {
            setLoading(true)
            await placeOrder(null, 'cod')
        } else {
            await handleRazorpayPayment()
        }
    }

    // Express Checkout Handlers
    const handleExpressCheckout = (method) => {
        toast.success(`${method} checkout coming soon!`)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
            {/* Top Security Bar */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 px-4">
                <div className="max-w-7xl mx-auto flex items-center justify-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                        <FiShield className="w-4 h-4" />
                        <span>256-bit SSL Encryption</span>
                    </div>
                    <div className="hidden md:flex items-center gap-2">
                        <FiLock className="w-4 h-4" />
                        <span>Secure Payment</span>
                    </div>
                    <div className="hidden md:flex items-center gap-2">
                        <FiUsers className="w-4 h-4" />
                        <span>{liveOrders.toLocaleString()} orders in 24h</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
                        Secure Checkout
                    </h1>
                    <p className="text-gray-600">Complete your order in just a few clicks</p>
                </div>

                {/* EXPRESS CHECKOUT BAR */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-2 border-blue-100">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <FiZap className="w-5 h-5 text-yellow-500" />
                            Express Checkout
                        </h2>
                        <span className="text-sm text-gray-500">Skip the form →</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <button
                            onClick={() => handleExpressCheckout('Apple Pay')}
                            className="flex items-center justify-center gap-3 px-6 py-4 bg-black hover:bg-gray-900 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
                        >
                            <FaApple className="w-6 h-6" />
                            <span>Apple Pay</span>
                        </button>

                        <button
                            onClick={() => handleExpressCheckout('Google Pay')}
                            className="flex items-center justify-center gap-3 px-6 py-4 bg-white hover:bg-gray-50 border-2 border-gray-300 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
                        >
                            <FaGoogle className="w-5 h-5 text-blue-600" />
                            <span className="text-gray-900">Google Pay</span>
                        </button>

                        {user && (
                            <button
                                onClick={() => handleExpressCheckout('Saved Card')}
                                className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
                            >
                                <FiCreditCard className="w-5 h-5" />
                                <span>Card ****1234</span>
                            </button>
                        )}

                        <button
                            onClick={() => setShowAddressForm(true)}
                            className="flex items-center justify-center gap-3 px-6 py-4 bg-gray-100 hover:bg-gray-200 border-2 border-gray-300 rounded-xl font-semibold transition-all text-gray-700"
                        >
                            <span>Continue as Guest →</span>
                        </button>
                    </div>
                </div>

                {/* MAIN CHECKOUT GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LEFT COLUMN - Checkout Form */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* 1. DELIVERY INFORMATION */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                                        1
                                    </div>
                                    Delivery Information
                                </h2>
                                {!showAddressForm && (
                                    <button
                                        onClick={() => setShowAddressForm(true)}
                                        className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                                    >
                                        <FiEdit2 className="w-4 h-4" />
                                        Edit
                                    </button>
                                )}
                            </div>

                            {showAddressForm ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input
                                            label="Full Name"
                                            value={shippingInfo.name}
                                            onChange={e => setShippingInfo({ ...shippingInfo, name: e.target.value })}
                                            placeholder="John Doe"
                                            className="bg-gray-50"
                                        />
                                        <Input
                                            label="Email Address"
                                            type="email"
                                            value={shippingInfo.email}
                                            onChange={e => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                                            placeholder="john@example.com"
                                            className="bg-gray-50"
                                        />
                                    </div>

                                    <Input
                                        label="Phone Number"
                                        value={shippingInfo.phone}
                                        onChange={e => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                                        placeholder="+971 50 123 4567"
                                        className="bg-gray-50"
                                    />

                                    <Input
                                        label="Address Line 1"
                                        value={shippingInfo.addressLine1}
                                        onChange={e => setShippingInfo({ ...shippingInfo, addressLine1: e.target.value })}
                                        placeholder="Street address, P.O. box"
                                        className="bg-gray-50"
                                    />

                                    <Input
                                        label="Address Line 2 (Optional)"
                                        value={shippingInfo.addressLine2}
                                        onChange={e => setShippingInfo({ ...shippingInfo, addressLine2: e.target.value })}
                                        placeholder="Apartment, suite, unit, building, floor, etc."
                                        className="bg-gray-50"
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            label="City"
                                            value={shippingInfo.city}
                                            onChange={e => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                                            className="bg-gray-50"
                                        />
                                        <Input
                                            label="State/Emirate"
                                            value={shippingInfo.state}
                                            onChange={e => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                                            placeholder="Dubai"
                                            className="bg-gray-50"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            label="Pincode/Postal Code"
                                            value={shippingInfo.pincode}
                                            onChange={e => setShippingInfo({ ...shippingInfo, pincode: e.target.value })}
                                            placeholder="00000"
                                            className="bg-gray-50"
                                        />
                                        <Input
                                            label="Country"
                                            value={shippingInfo.country}
                                            onChange={e => setShippingInfo({ ...shippingInfo, country: e.target.value })}
                                            className="bg-gray-50"
                                        />
                                    </div>

                                    <button
                                        onClick={() => {
                                            if (validateShipping()) {
                                                setShowAddressForm(false)
                                                setShowPaymentMethods(true)
                                            }
                                        }}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all"
                                    >
                                        Continue to Delivery
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl border border-green-200">
                                    <FiMapPin className="w-6 h-6 text-green-600 mt-1" />
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-900">{shippingInfo.name}</p>
                                        <p className="text-gray-600">{shippingInfo.phone}</p>
                                        <p className="text-gray-600">{shippingInfo.addressLine1}</p>
                                        {shippingInfo.addressLine2 && <p className="text-gray-600">{shippingInfo.addressLine2}</p>}
                                        <p className="text-gray-600">{shippingInfo.city}, {shippingInfo.state} - {shippingInfo.pincode}</p>
                                        <p className="text-gray-600">{shippingInfo.country}</p>
                                    </div>
                                    <FiCheck className="w-6 h-6 text-green-600" />
                                </div>
                            )}
                        </div>

                        {/* 2. DELIVERY METHOD */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-6">
                                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                                    2
                                </div>
                                Delivery Method
                            </h2>

                            <div className="space-y-3">
                                <div
                                    onClick={() => setDeliveryMethod('standard')}
                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${deliveryMethod === 'standard'
                                            ? 'border-blue-600 bg-blue-50'
                                            : 'border-gray-200 hover:border-blue-300'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${deliveryMethod === 'standard' ? 'border-blue-600' : 'border-gray-300'
                                                }`}>
                                                {deliveryMethod === 'standard' && (
                                                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">Standard Delivery</p>
                                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                                    <FiClock className="w-4 h-4" />
                                                    5-7 business days
                                                </p>
                                            </div>
                                        </div>
                                        <p className="font-semibold text-green-600">FREE</p>
                                    </div>
                                </div>

                                <div
                                    onClick={() => setDeliveryMethod('express')}
                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${deliveryMethod === 'express'
                                            ? 'border-blue-600 bg-blue-50'
                                            : 'border-gray-200 hover:border-blue-300'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${deliveryMethod === 'express' ? 'border-blue-600' : 'border-gray-300'
                                                }`}>
                                                {deliveryMethod === 'express' && (
                                                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900 flex items-center gap-2">
                                                    Express Delivery
                                                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-semibold">
                                                        FAST
                                                    </span>
                                                </p>
                                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                                    <FiZap className="w-4 h-4" />
                                                    2-3 business days
                                                </p>
                                            </div>
                                        </div>
                                        <Price amount={99} className="font-semibold text-gray-900" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. PAYMENT METHOD */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-6">
                                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                                    3
                                </div>
                                Payment Method
                            </h2>

                            <div className="space-y-3">
                                {/* Online Payment */}
                                <div
                                    onClick={() => setPaymentMethod('online')}
                                    className={`p-5 rounded-xl border-2 cursor-pointer transition-all group ${paymentMethod === 'online'
                                            ? 'border-blue-600 bg-blue-50'
                                            : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'online' ? 'border-blue-600' : 'border-gray-300'
                                                }`}>
                                                {paymentMethod === 'online' && (
                                                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-900 flex items-center gap-2">
                                                    <FiCreditCard className="w-5 h-5 text-blue-600" />
                                                    Credit/Debit Card
                                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                                                        RECOMMENDED
                                                    </span>
                                                </p>
                                                <p className="text-sm text-gray-600 mt-1">Visa, Mastercard, Amex</p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <img src="https://img.icons8.com/color/48/visa.png" alt="Visa" className="h-6" />
                                                    <img src="https://img.icons8.com/color/48/mastercard.png" alt="Mastercard" className="h-6" />
                                                    <img src="https://img.icons8.com/color/48/amex.png" alt="Amex" className="h-6" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* UPI */}
                                <div
                                    onClick={() => setPaymentMethod('upi')}
                                    className={`p-5 rounded-xl border-2 cursor-pointer transition-all group ${paymentMethod === 'upi'
                                            ? 'border-green-600 bg-green-50'
                                            : 'border-gray-200 hover:border-green-300 hover:shadow-md'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'upi' ? 'border-green-600' : 'border-gray-300'
                                                }`}>
                                                {paymentMethod === 'upi' && (
                                                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-900 flex items-center gap-2">
                                                    <FiSmartphone className="w-5 h-5 text-green-600" />
                                                    UPI / QR Code
                                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                                                        INSTANT
                                                    </span>
                                                </p>
                                                <p className="text-sm text-gray-600 mt-1">Google Pay, PhonePe, Paytm</p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <img src="https://img.icons8.com/color/48/google-pay-india.png" alt="GPay" className="h-6" />
                                                    <img src="https://img.icons8.com/color/48/phonepe.png" alt="PhonePe" className="h-6" />
                                                    <img src="https://img.icons8.com/color/48/paytm.png" alt="Paytm" className="h-6" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* COD */}
                                <div
                                    onClick={() => setPaymentMethod('cod')}
                                    className={`p-5 rounded-xl border-2 cursor-pointer transition-all group ${paymentMethod === 'cod'
                                            ? 'border-gray-600 bg-gray-50'
                                            : 'border-gray-200 hover:border-gray-400 hover:shadow-md'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-gray-600' : 'border-gray-300'
                                                }`}>
                                                {paymentMethod === 'cod' && (
                                                    <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-900 flex items-center gap-2">
                                                    <FaRegMoneyBillAlt className="w-5 h-5 text-gray-600" />
                                                    Cash on Delivery
                                                </p>
                                                <p className="text-sm text-gray-600 mt-1">Pay when you receive</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Place Order Button (Mobile) */}
                        <div className="lg:hidden">
                            <Button
                                onClick={handlePlaceOrder}
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-4 rounded-xl shadow-lg text-lg"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Processing...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        <FiShield className="w-5 h-5" />
                                        Place Secure Order
                                    </span>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* RIGHT COLUMN - Order Summary (Sticky) */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-4 space-y-6">

                            {/* Order Summary */}
                            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                    <FiPackage className="w-5 h-5" />
                                    Order Summary
                                </h2>

                                {/* Items */}
                                <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                                    {items.map((item, index) => (
                                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                                <FiPackage className="w-6 h-6 text-gray-400" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-900 text-sm line-clamp-1">
                                                    {item.name || 'Product'}
                                                </p>
                                                <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                            </div>
                                            <Price amount={item.price * item.quantity} className="font-semibold text-gray-900" />
                                        </div>
                                    ))}
                                </div>

                                {/* Coupon */}
                                <div className="mb-6">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value)}
                                            placeholder="Enter coupon code"
                                            className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                                        />
                                        <button
                                            onClick={handleApplyCoupon}
                                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all"
                                        >
                                            Apply
                                        </button>
                                    </div>
                                    {appliedCoupon && (
                                        <div className="mt-2 flex items-center gap-2 text-green-600 text-sm">
                                            <FiCheck className="w-4 h-4" />
                                            <span>Coupon "{appliedCoupon.code}" applied!</span>
                                        </div>
                                    )}
                                </div>

                                {/* Price Breakdown */}
                                <div className="space-y-3 border-t border-gray-200 pt-4">
                                    <div className="flex justify-between text-gray-700">
                                        <span>Subtotal</span>
                                        <Price amount={subtotal} />
                                    </div>
                                    <div className="flex justify-between text-gray-700">
                                        <span>Shipping</span>
                                        {deliveryCost === 0 ? (
                                            <span className="text-green-600 font-semibold">FREE</span>
                                        ) : (
                                            <Price amount={deliveryCost} />
                                        )}
                                    </div>
                                    <div className="flex justify-between text-gray-700">
                                        <span>Tax (5%)</span>
                                        <Price amount={tax} />
                                    </div>
                                    {discount > 0 && (
                                        <div className="flex justify-between text-green-600 font-semibold">
                                            <span>Discount</span>
                                            <span>-<Price amount={discount} /></span>
                                        </div>
                                    )}
                                    {isDonationChecked && (
                                        <div className="flex justify-between text-blue-600">
                                            <span>Donation</span>
                                            <Price amount={donationTotal} />
                                        </div>
                                    )}
                                    <div className="border-t-2 border-gray-300 pt-3 flex justify-between text-xl font-semibold text-gray-900">
                                        <span>Total</span>
                                        <Price amount={finalTotal} />
                                    </div>
                                </div>

                                {/* Donation */}
                                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={isDonationChecked}
                                            onChange={(e) => setIsDonationChecked(e.target.checked)}
                                            className="mt-1 w-5 h-5 text-blue-600 rounded"
                                        />
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-900 flex items-center gap-2">
                                                <FiGift className="w-4 h-4 text-blue-600" />
                                                Support a cause
                                            </p>
                                            <p className="text-sm text-gray-600 mt-1">
                                                Add <Price amount={DONATION_AMOUNT} /> to help those in need
                                            </p>
                                        </div>
                                    </label>
                                </div>

                                {/* Place Order Button (Desktop) */}
                                <div className="hidden lg:block mt-6">
                                    <Button
                                        onClick={handlePlaceOrder}
                                        disabled={loading}
                                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-4 rounded-xl shadow-lg text-lg"
                                    >
                                        {loading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Processing...
                                            </span>
                                        ) : (
                                            <span className="flex items-center justify-center gap-2">
                                                <FiShield className="w-5 h-5" />
                                                Place Secure Order
                                            </span>
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {/* Trust Signals */}
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <FiShield className="w-5 h-5 text-green-600" />
                                    Your Purchase is Protected
                                </h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <FiCheck className="w-4 h-4 text-green-600" />
                                        <span>256-bit SSL Encryption</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <FiCheck className="w-4 h-4 text-green-600" />
                                        <span>Money-Back Guarantee</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <FiCheck className="w-4 h-4 text-green-600" />
                                        <span>Secure Payment by Razorpay</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <FiCheck className="w-4 h-4 text-green-600" />
                                        <span>Free & Easy Returns</span>
                                    </div>
                                </div>
                            </div>

                            {/* Social Proof */}
                            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-200">
                                <div className="flex items-center gap-3 mb-3">
                                    <FiTrendingUp className="w-5 h-5 text-purple-600" />
                                    <h3 className="font-semibold text-gray-900">Live Activity</h3>
                                </div>
                                <div className="space-y-2 text-sm text-gray-700">
                                    <p className="flex items-center gap-2">
                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                        <strong>{liveOrders.toLocaleString()}</strong> orders in last 24 hours
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                                        <strong>47</strong> people viewing this item
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
