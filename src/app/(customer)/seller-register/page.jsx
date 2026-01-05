// app/(auth)/seller-registration/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import {
  FiUser,
  FiMapPin,
  FiPhone,
  FiCreditCard,
  FiFileText,
  FiCheckCircle,
  FiArrowRight,
  FiArrowLeft,
  FiUpload,
  FiAlertCircle,
  FiShoppingBag,
  FiImage,
} from 'react-icons/fi'

const STEPS = [
  { id: 1, name: 'Business Info', icon: FiUser },
  { id: 2, name: 'Store Details', icon: FiShoppingBag },
  { id: 3, name: 'Pickup Address', icon: FiMapPin },
  { id: 4, name: 'Contact', icon: FiPhone },
  { id: 5, name: 'Bank Details', icon: FiCreditCard },
  { id: 6, name: 'Documents', icon: FiFileText },
]

const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Puducherry', 'Jammu and Kashmir', 'Ladakh'
]

const BUSINESS_CATEGORIES = [
  'Electronics', 'Fashion & Apparel', 'Home & Kitchen', 'Beauty & Personal Care',
  'Sports & Fitness', 'Books & Stationery', 'Toys & Games', 'Food & Beverages',
  'Health & Wellness', 'Automotive', 'Baby Products', 'Pet Supplies', 'Other'
]

export default function SellerRegistrationPage() {
  const { token, user } = useAuth()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(true)

  const [formData, setFormData] = useState({
    // Business Information
    businessName: '',
    gstin: '',
    pan: '',
    businessType: 'individual',
    businessCategory: 'retailer',
    establishedYear: new Date().getFullYear(),
    
    // Store Information
    storeInfo: {
      storeName: '',
      storeDescription: '',
      storeLogo: '',
      storeBanner: '',
      website: '',
      storeCategories: [],
      customerSupportEmail: '',
      customerSupportPhone: '',
      socialMedia: {
        facebook: '',
        instagram: '',
        twitter: '',
        linkedin: '',
        youtube: '',
      },
    },
    
    // Pickup Address
    pickupAddress: {
      addressLine1: '',
      addressLine2: '',
      landmark: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
    },
    
    // Bank Details
    bankDetails: {
      accountNumber: '',
      ifscCode: '',
      accountHolderName: '',
      bankName: '',
      accountType: 'current',
      branch: '',
      upiId: '',
    },
    
    // Documents
    documents: {
      panCard: '',
      gstCertificate: '',
      idProof: '',
      idProofType: 'aadhaar',
      addressProof: '',
      bankStatement: '',
      cancelledCheque: '',
      tradeLicense: '',
      agreementSigned: false,
    },
  })

  useEffect(() => {
    if (token) {
      checkSellerStatus()
    }
  }, [token])

  async function checkSellerStatus() {
    try {
      const res = await axios.get('/api/seller/register', {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.data.hasSeller) {
        router.push('/seller/dashboard')
      }
    } catch (error) {
      console.error('Error checking seller status:', error)
    } finally {
      setCheckingStatus(false)
    }
  }

  async function handleSubmit() {
    setLoading(true)
    try {
      const res = await axios.post('/api/seller/register', formData, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.data.success) {
        toast.success('Registration submitted successfully!')
        setTimeout(() => {
          router.push('/seller/dashboard')
        }, 2000)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  function nextStep() {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1)
    }
  }

  function prevStep() {
    setCurrentStep(currentStep - 1)
  }

  function validateStep(step) {
    switch (step) {
      case 1:
        if (!formData.businessName || !formData.gstin || !formData.pan) {
          toast.error('Please fill all required fields')
          return false
        }
        if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstin)) {
          toast.error('Invalid GSTIN format')
          return false
        }
        if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan)) {
          toast.error('Invalid PAN format')
          return false
        }
        return true

      case 2:
        if (!formData.storeInfo.storeName) {
          toast.error('Store name is required')
          return false
        }
        return true

      case 3:
        if (!formData.pickupAddress.addressLine1 || !formData.pickupAddress.city || 
            !formData.pickupAddress.state || !formData.pickupAddress.pincode) {
          toast.error('Please fill all address fields')
          return false
        }
        if (!/^\d{6}$/.test(formData.pickupAddress.pincode)) {
          toast.error('Invalid pincode')
          return false
        }
        return true

      case 4:
        if (!formData.storeInfo.customerSupportEmail || !formData.storeInfo.customerSupportPhone) {
          toast.error('Email and phone are required')
          return false
        }
        return true

      case 5:
        if (!formData.bankDetails.accountNumber || !formData.bankDetails.ifscCode || 
            !formData.bankDetails.accountHolderName) {
          toast.error('Please fill all required bank details')
          return false
        }
        if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.bankDetails.ifscCode)) {
          toast.error('Invalid IFSC code format')
          return false
        }
        return true

      default:
        return true
    }
  }

  if (checkingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Become a Seller
          </h1>
          <p className="text-xl text-gray-600">
            Join thousands of successful sellers and grow your business
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12 overflow-x-auto">
          <div className="flex items-center justify-between min-w-max px-4">
            {STEPS.map((step, index) => {
              const Icon = step.icon
              const isCompleted = currentStep > step.id
              const isActive = currentStep === step.id

              return (
                <div key={step.id} className="flex-1 relative">
                  <div className="flex items-center">
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                        isCompleted
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                          : isActive
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-110'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {isCompleted ? <FiCheckCircle className="text-2xl" /> : <Icon className="text-xl" />}
                    </div>

                    {index < STEPS.length - 1 && (
                      <div
                        className={`h-1 flex-1 mx-2 transition-all ${
                          isCompleted ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gray-200'
                        }`}
                      ></div>
                    )}
                  </div>

                  <p
                    className={`text-sm mt-3 font-semibold text-center ${
                      isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                    }`}
                  >
                    {step.name}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-10">
          {/* Step 1: Business Information */}
          {currentStep === 1 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-semibold text-gray-900 mb-3">Business Information</h2>
                <p className="text-gray-600 text-lg">Let's start with your business details</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Business/Company Name *
                  </label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                    placeholder="Enter registered business name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    GSTIN (GST Number) *
                  </label>
                  <input
                    type="text"
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                    className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-mono"
                    placeholder="22AAAAA0000A1Z5"
                    maxLength={15}
                  />
                  <p className="text-xs text-gray-500 mt-2">15-character GST Identification Number</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    PAN Number *
                  </label>
                  <input
                    type="text"
                    value={formData.pan}
                    onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                    className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-mono"
                    placeholder="ABCDE1234F"
                    maxLength={10}
                  />
                  <p className="text-xs text-gray-500 mt-2">10-character Permanent Account Number</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Business Type *
                  </label>
                  <select
                    value={formData.businessType}
                    onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                    className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  >
                    <option value="individual">Individual</option>
                    <option value="proprietorship">Proprietorship</option>
                    <option value="partnership">Partnership</option>
                    <option value="pvt_ltd">Private Limited</option>
                    <option value="public_ltd">Public Limited</option>
                    <option value="llp">LLP</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Business Category *
                  </label>
                  <select
                    value={formData.businessCategory}
                    onChange={(e) => setFormData({ ...formData, businessCategory: e.target.value })}
                    className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  >
                    <option value="manufacturer">Manufacturer</option>
                    <option value="wholesaler">Wholesaler</option>
                    <option value="retailer">Retailer</option>
                    <option value="reseller">Reseller</option>
                    <option value="brand">Brand</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Established Year
                  </label>
                  <input
                    type="number"
                    value={formData.establishedYear}
                    onChange={(e) => setFormData({ ...formData, establishedYear: parseInt(e.target.value) })}
                    className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Store Details */}
          {currentStep === 2 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-semibold text-gray-900 mb-3">Store Details</h2>
                <p className="text-gray-600 text-lg">Create your online store identity</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Store Name *
                  </label>
                  <input
                    type="text"
                    value={formData.storeInfo.storeName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        storeInfo: { ...formData.storeInfo, storeName: e.target.value },
                      })
                    }
                    className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                    placeholder="Your store display name"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Store Description
                  </label>
                  <textarea
                    value={formData.storeInfo.storeDescription}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        storeInfo: { ...formData.storeInfo, storeDescription: e.target.value },
                      })
                    }
                    rows={4}
                    className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                    placeholder="Tell customers about your store..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Store Logo URL
                  </label>
                  <input
                    type="url"
                    value={formData.storeInfo.storeLogo}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        storeInfo: { ...formData.storeInfo, storeLogo: e.target.value },
                      })
                    }
                    className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                    placeholder="https://example.com/logo.png"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Store Banner URL
                  </label>
                  <input
                    type="url"
                    value={formData.storeInfo.storeBanner}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        storeInfo: { ...formData.storeInfo, storeBanner: e.target.value },
                      })
                    }
                    className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                    placeholder="https://example.com/banner.png"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Website (Optional)
                  </label>
                  <input
                    type="url"
                    value={formData.storeInfo.website}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        storeInfo: { ...formData.storeInfo, website: e.target.value },
                      })
                    }
                    className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                    placeholder="https://yourwebsite.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Store Categories
                  </label>
                  <select
                    multiple
                    value={formData.storeInfo.storeCategories}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        storeInfo: {
                          ...formData.storeInfo,
                          storeCategories: Array.from(e.target.selectedOptions, (option) => option.value),
                        },
                      })
                    }
                    className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                    size={5}
                  >
                    {BUSINESS_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-2">Hold Ctrl/Cmd to select multiple</p>
                </div>

                {/* Social Media */}
                <div className="md:col-span-2 border-t pt-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Social Media (Optional)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="url"
                      value={formData.storeInfo.socialMedia.facebook}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          storeInfo: {
                            ...formData.storeInfo,
                            socialMedia: { ...formData.storeInfo.socialMedia, facebook: e.target.value },
                          },
                        })
                      }
                      className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                      placeholder="Facebook URL"
                    />
                    <input
                      type="url"
                      value={formData.storeInfo.socialMedia.instagram}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          storeInfo: {
                            ...formData.storeInfo,
                            socialMedia: { ...formData.storeInfo.socialMedia, instagram: e.target.value },
                          },
                        })
                      }
                      className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                      placeholder="Instagram URL"
                    />
                    <input
                      type="url"
                      value={formData.storeInfo.socialMedia.twitter}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          storeInfo: {
                            ...formData.storeInfo,
                            socialMedia: { ...formData.storeInfo.socialMedia, twitter: e.target.value },
                          },
                        })
                      }
                      className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                      placeholder="Twitter URL"
                    />
                    <input
                      type="url"
                      value={formData.storeInfo.socialMedia.linkedin}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          storeInfo: {
                            ...formData.storeInfo,
                            socialMedia: { ...formData.storeInfo.socialMedia, linkedin: e.target.value },
                          },
                        })
                      }
                      className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                      placeholder="LinkedIn URL"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Pickup Address */}
          {currentStep === 3 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-semibold text-gray-900 mb-3">Pickup Address</h2>
                <p className="text-gray-600 text-lg">Where should orders be picked up from?</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Address Line 1 *
                  </label>
                  <input
                    type="text"
                    value={formData.pickupAddress.addressLine1}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pickupAddress: { ...formData.pickupAddress, addressLine1: e.target.value },
                      })
                    }
                    className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                    placeholder="Building name, floor, street"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    value={formData.pickupAddress.addressLine2}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pickupAddress: { ...formData.pickupAddress, addressLine2: e.target.value },
                      })
                    }
                    className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                    placeholder="Area, locality"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Landmark
                  </label>
                  <input
                    type="text"
                    value={formData.pickupAddress.landmark}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pickupAddress: { ...formData.pickupAddress, landmark: e.target.value },
                      })
                    }
                    className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                    placeholder="Nearby landmark"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.pickupAddress.city}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pickupAddress: { ...formData.pickupAddress, city: e.target.value },
                      })
                    }
                    className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                    placeholder="City"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    State *
                  </label>
                  <select
                    value={formData.pickupAddress.state}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pickupAddress: { ...formData.pickupAddress, state: e.target.value },
                      })
                    }
                    className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  >
                    <option value="">Select State</option>
                    {STATES.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    value={formData.pickupAddress.pincode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pickupAddress: { ...formData.pickupAddress, pincode: e.target.value },
                      })
                    }
                    className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                    placeholder="6-digit pincode"
                    maxLength={6}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Contact Information */}
          {currentStep === 4 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-semibold text-gray-900 mb-3">Contact Information</h2>
                <p className="text-gray-600 text-lg">Customer support contact details</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Support Email *
                  </label>
                  <input
                    type="email"
                    value={formData.storeInfo.customerSupportEmail}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        storeInfo: { ...formData.storeInfo, customerSupportEmail: e.target.value },
                      })
                    }
                    className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                    placeholder="support@yourbusiness.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Support Phone *
                  </label>
                  <input
                    type="tel"
                    value={formData.storeInfo.customerSupportPhone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        storeInfo: { ...formData.storeInfo, customerSupportPhone: e.target.value },
                      })
                    }
                    className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                    placeholder="10-digit mobile number"
                    maxLength={10}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Bank Details */}
          {currentStep === 5 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-semibold text-gray-900 mb-3">Bank Account Details</h2>
                <p className="text-gray-600 text-lg">For receiving payments</p>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6 flex items-start space-x-4">
                <FiAlertCircle className="text-blue-600 text-2xl mt-1" />
                <div>
                  <p className="text-blue-900 font-semibold text-lg">Secure & Encrypted</p>
                  <p className="text-blue-800 mt-1">
                    Your bank details are encrypted and will only be used for payment processing
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Account Holder Name *
                  </label>
                  <input
                    type="text"
                    value={formData.bankDetails.accountHolderName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bankDetails: { ...formData.bankDetails, accountHolderName: e.target.value },
                      })
                    }
                    className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                    placeholder="As per bank account"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Account Number *
                  </label>
                  <input
                    type="text"
                    value={formData.bankDetails.accountNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bankDetails: { ...formData.bankDetails, accountNumber: e.target.value },
                      })
                    }
                    className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-mono"
                    placeholder="Enter account number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    IFSC Code *
                  </label>
                  <input
                    type="text"
                    value={formData.bankDetails.ifscCode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bankDetails: {
                          ...formData.bankDetails,
                          ifscCode: e.target.value.toUpperCase(),
                        },
                      })
                    }
                    className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-mono"
                    placeholder="SBIN0001234"
                    maxLength={11}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Bank Name *
                  </label>
                  <input
                    type="text"
                    value={formData.bankDetails.bankName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bankDetails: { ...formData.bankDetails, bankName: e.target.value },
                      })
                    }
                    className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                    placeholder="State Bank of India"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Account Type
                  </label>
                  <select
                    value={formData.bankDetails.accountType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bankDetails: { ...formData.bankDetails, accountType: e.target.value },
                      })
                    }
                    className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  >
                    <option value="savings">Savings</option>
                    <option value="current">Current</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Branch Name
                  </label>
                  <input
                    type="text"
                    value={formData.bankDetails.branch}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bankDetails: { ...formData.bankDetails, branch: e.target.value },
                      })
                    }
                    className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                    placeholder="Branch name"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    UPI ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.bankDetails.upiId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bankDetails: { ...formData.bankDetails, upiId: e.target.value },
                      })
                    }
                    className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                    placeholder="yourname@upi"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Documents */}
          {currentStep === 6 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-semibold text-gray-900 mb-3">Upload Documents</h2>
                <p className="text-gray-600 text-lg">Upload required documents for verification</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DocumentUpload
                  label="PAN Card *"
                  value={formData.documents.panCard}
                  onChange={(url) =>
                    setFormData({
                      ...formData,
                      documents: { ...formData.documents, panCard: url },
                    })
                  }
                  required
                />

                <DocumentUpload
                  label="GST Certificate *"
                  value={formData.documents.gstCertificate}
                  onChange={(url) =>
                    setFormData({
                      ...formData,
                      documents: { ...formData.documents, gstCertificate: url },
                    })
                  }
                  required
                />

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ID Proof Type
                  </label>
                  <select
                    value={formData.documents.idProofType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        documents: { ...formData.documents, idProofType: e.target.value },
                      })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 mb-3"
                  >
                    <option value="aadhaar">Aadhaar Card</option>
                    <option value="passport">Passport</option>
                    <option value="driving_license">Driving License</option>
                    <option value="voter_id">Voter ID</option>
                  </select>
                  <DocumentUpload
                    label="ID Proof *"
                    value={formData.documents.idProof}
                    onChange={(url) =>
                      setFormData({
                        ...formData,
                        documents: { ...formData.documents, idProof: url },
                      })
                    }
                    required
                  />
                </div>

                <DocumentUpload
                  label="Address Proof *"
                  value={formData.documents.addressProof}
                  onChange={(url) =>
                    setFormData({
                      ...formData,
                      documents: { ...formData.documents, addressProof: url },
                    })
                  }
                  required
                />

                <DocumentUpload
                  label="Bank Statement"
                  value={formData.documents.bankStatement}
                  onChange={(url) =>
                    setFormData({
                      ...formData,
                      documents: { ...formData.documents, bankStatement: url },
                    })
                  }
                />

                <DocumentUpload
                  label="Cancelled Cheque *"
                  value={formData.documents.cancelledCheque}
                  onChange={(url) =>
                    setFormData({
                      ...formData,
                      documents: { ...formData.documents, cancelledCheque: url },
                    })
                  }
                  required
                />

                <DocumentUpload
                  label="Trade License (If Applicable)"
                  value={formData.documents.tradeLicense}
                  onChange={(url) =>
                    setFormData({
                      ...formData,
                      documents: { ...formData.documents, tradeLicense: url },
                    })
                  }
                />
              </div>

              {/* Agreement */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-8 mt-8">
                <div className="flex items-start space-x-4">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.documents.agreementSigned}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          documents: { ...formData.documents, agreementSigned: e.target.checked },
                        })
                      }
                      className="w-6 h-6 text-green-600 rounded focus:ring-green-500 mt-1"
                    />
                    <div>
                      <p className="text-green-900 font-semibold text-lg">Terms & Agreement *</p>
                      <p className="text-green-800 mt-2">
                        I agree to the seller terms and conditions, commission structure, and return/refund policies.
                        I confirm that all information provided is accurate and complete.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Benefits Card */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
                <div className="flex items-start space-x-4">
                  <FiCheckCircle className="text-4xl flex-shrink-0" />
                  <div>
                    <h3 className="text-2xl font-semibold mb-4">You're Almost There!</h3>
                    <p className="text-blue-100 mb-4">
                      Your application will be reviewed within 24-48 hours. Once approved, you'll get:
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-center space-x-3">
                        <FiCheckCircle className="flex-shrink-0" />
                        <span>Access to comprehensive seller dashboard</span>
                      </li>
                      <li className="flex items-center space-x-3">
                        <FiCheckCircle className="flex-shrink-0" />
                        <span>List unlimited products across all categories</span>
                      </li>
                      <li className="flex items-center space-x-3">
                        <FiCheckCircle className="flex-shrink-0" />
                        <span>Real-time order and inventory management</span>
                      </li>
                      <li className="flex items-center space-x-3">
                        <FiCheckCircle className="flex-shrink-0" />
                        <span>Direct payment transfers to your bank account</span>
                      </li>
                      <li className="flex items-center space-x-3">
                        <FiCheckCircle className="flex-shrink-0" />
                        <span>Marketing tools and analytics dashboard</span>
                      </li>
                      <li className="flex items-center space-x-3">
                        <FiCheckCircle className="flex-shrink-0" />
                        <span>24/7 seller support and training</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-12 pt-8 border-t-2 border-gray-200">
            {currentStep > 1 ? (
              <button
                onClick={prevStep}
                className="flex items-center space-x-2 px-8 py-4 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-semibold text-lg transition-all"
              >
                <FiArrowLeft />
                <span>Previous</span>
              </button>
            ) : (
              <div></div>
            )}

            {currentStep < STEPS.length ? (
              <button
                onClick={nextStep}
                className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-semibold text-lg shadow-lg transition-all"
              >
                <span>Continue</span>
                <FiArrowRight />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading || !formData.documents.agreementSigned}
                className="flex items-center space-x-2 px-10 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg shadow-xl transition-all"
              >
                {loading ? (
                  <>
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <FiCheckCircle className="text-2xl" />
                    <span>Submit Application</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function DocumentUpload({ label, value, onChange, required }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>
      <div className="border-3 border-dashed border-gray-300 rounded-xl p-6 hover:border-blue-400 transition-all bg-gray-50">
        <div className="text-center">
          <FiUpload className="text-gray-400 text-4xl mx-auto mb-3" />
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500"
            placeholder="Enter document URL"
            required={required}
          />
          <p className="text-xs text-gray-500 mt-3">Upload image/PDF and enter URL</p>
        </div>
      </div>
    </div>
  )
}
    