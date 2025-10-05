// app/(admin)/sellers/[id]/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import {
  FiArrowLeft,
  FiMail,
  FiPhone,
  FiGlobe,
  FiMapPin,
  FiCalendar,
  FiCheckCircle,
  FiXCircle,
  FiFileText,
  FiFacebook,
  FiInstagram,
  FiLinkedin,
  FiTwitter,
  FiYoutube,
  FiDollarSign,
  FiShoppingCart,
  FiPackage,
  FiUsers,
  FiTrendingUp,
  FiStar,
  FiClock,
  FiTruck,
  FiAward,
  FiEdit2,
  FiAlertCircle,
} from 'react-icons/fi'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
} from 'recharts'
import { useAuth } from '@/lib/context/AuthContext'

export default function SellerDetailPage({ params }) {
  const { token } = useAuth()
  const router = useRouter()
  const [seller, setSeller] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchSellerDetails()
  }, [params.id])

  async function fetchSellerDetails() {
    try {
      setLoading(true)
      const res = await axios.get(`/api/admin/sellers/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      console.log('Seller Details:', res.data.seller)
      if (res.data.success) {
        setSeller(res.data.seller)
      } else {
        router.push('/admin/sellers')
      }
    } catch (error) {
      console.error('Error:', error)
      router.push('/admin/sellers')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    )
  }

  if (!seller) return null

  // Prepare chart data
  const ratingData = [
    { name: '5★', value: seller.ratings?.breakdown?.five || 0, fill: '#10B981' },
    { name: '4★', value: seller.ratings?.breakdown?.four || 0, fill: '#3B82F6' },
    { name: '3★', value: seller.ratings?.breakdown?.three || 0, fill: '#F59E0B' },
    { name: '2★', value: seller.ratings?.breakdown?.two || 0, fill: '#F97316' },
    { name: '1★', value: seller.ratings?.breakdown?.one || 0, fill: '#EF4444' },
  ]

  const performanceData = [
    {
      name: 'Fulfillment',
      value: seller.performance?.orderFulfillmentRate || 0,
      fill: '#10B981',
    },
    {
      name: 'Satisfaction',
      value: (seller.performance?.customerSatisfactionScore || 0) * 20,
      fill: '#3B82F6',
    },
  ]

  const verificationData = Object.entries(seller.verificationSteps || {}).map(([key, value]) => ({
    name: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
    status: value ? 'Verified' : 'Pending',
    value: value ? 100 : 0,
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Banner */}
      <div className="relative">
        <img
          src={seller.storeInfo?.storeBanner || '/images/default-banner.jpg'}
          alt="Store Banner"
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="max-w-7xl mx-auto flex items-end space-x-6">
            <img
              src={seller.storeInfo?.storeLogo || '/images/default-logo.png'}
              alt={seller.businessName}
              className="w-24 h-24 rounded-xl border-4 border-white shadow-xl bg-white"
            />
            <div className="flex-1 pb-2">
              <h1 className="text-3xl font-bold text-white mb-1">{seller.businessName}</h1>
              <div className="flex items-center space-x-4 text-white/90">
                <span className="capitalize">{seller.businessCategory}</span>
                <span>•</span>
                <span className="capitalize">{seller.businessType.replace(/_/g, ' ')}</span>
                <span>•</span>
                <span>Est. {seller.establishedYear}</span>
              </div>
            </div>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-lg transition-colors flex items-center space-x-2"
            >
              <FiArrowLeft />
              <span>Back</span>
            </button>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                {seller.isActive ? (
                  <>
                    <FiCheckCircle className="text-green-600" />
                    <span className="text-green-700 font-semibold">Active</span>
                  </>
                ) : (
                  <>
                    <FiXCircle className="text-red-600" />
                    <span className="text-red-700 font-semibold">Inactive</span>
                  </>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {seller.isVerified ? (
                  <>
                    <FiCheckCircle className="text-blue-600" />
                    <span className="text-blue-700 font-semibold">Verified</span>
                  </>
                ) : (
                  <>
                    <FiAlertCircle className="text-yellow-600" />
                    <span className="text-yellow-700 font-semibold">
                      {seller.verificationStatus}
                    </span>
                  </>
                )}
              </div>
              <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold capitalize">
                {seller.subscriptionPlan} Plan
              </div>
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <FiEdit2 />
              <span>Edit Seller</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-8">
            {['overview', 'analytics', 'store', 'documents', 'warehouses'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 border-b-2 transition-colors capitalize ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600 font-semibold'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                icon={<FiDollarSign className="text-green-600" />}
                label="Total Revenue"
                value={`₹${(seller.salesStats?.totalRevenue || 0).toLocaleString('en-IN')}`}
                change="+12.5%"
                bgColor="bg-green-50"
              />
              <MetricCard
                icon={<FiShoppingCart className="text-blue-600" />}
                label="Total Orders"
                value={(seller.salesStats?.totalOrders || 0).toLocaleString()}
                change="+8.3%"
                bgColor="bg-blue-50"
              />
              <MetricCard
                icon={<FiPackage className="text-purple-600" />}
                label="Active Products"
                value={seller.salesStats?.activeProducts || 0}
                subtitle={`of ${seller.salesStats?.totalProducts || 0} total`}
                bgColor="bg-purple-50"
              />
              <MetricCard
                icon={<FiUsers className="text-orange-600" />}
                label="Total Customers"
                value={(seller.salesStats?.totalCustomers || 0).toLocaleString()}
                change="+15.2%"
                bgColor="bg-orange-50"
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Ratings Breakdown */}
              <ChartCard title="Customer Ratings Breakdown">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={ratingData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {ratingData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="text-center mt-4">
                  <div className="inline-flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-full">
                    <FiStar className="text-yellow-500" />
                    <span className="text-2xl font-bold text-gray-900">
                      {seller.ratings?.average || 0}
                    </span>
                    <span className="text-gray-600">/ 5.0</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Based on {seller.ratings?.totalReviews || 0} reviews
                  </p>
                </div>
              </ChartCard>

              {/* Performance Metrics */}
              <ChartCard title="Performance Indicators">
                <ResponsiveContainer width="100%" height={280}>
                  <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius="10%"
                    outerRadius="80%"
                    barSize={30}
                    data={performanceData}
                  >
                    <RadialBar
                      minAngle={15}
                      label={{ position: 'insideStart', fill: '#fff' }}
                      background
                      clockWise
                      dataKey="value"
                    />
                    <Legend
                      iconSize={10}
                      layout="vertical"
                      verticalAlign="middle"
                      align="right"
                    />
                    <Tooltip />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-center space-x-2 mb-1">
                      <FiTruck className="text-green-600" />
                      <span className="text-sm font-medium text-gray-700">Avg Shipping</span>
                    </div>
                    <p className="text-2xl font-bold text-green-700">
                      {seller.performance?.avgShippingTime || 0} days
                    </p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-center space-x-2 mb-1">
                      <FiCheckCircle className="text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">Fulfillment</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-700">
                      {seller.performance?.orderFulfillmentRate || 0}%
                    </p>
                  </div>
                </div>
              </ChartCard>
            </div>

            {/* Verification Status */}
            <ChartCard title="Verification Status">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {verificationData.map((item, index) => (
                  <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                    {item.value === 100 ? (
                      <FiCheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    ) : (
                      <FiXCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    )}
                    <p className="text-sm font-medium text-gray-900">{item.name}</p>
                    <p
                      className={`text-xs mt-1 ${
                        item.value === 100 ? 'text-green-600' : 'text-gray-500'
                      }`}
                    >
                      {item.status}
                    </p>
                  </div>
                ))}
              </div>
            </ChartCard>

            {/* Business Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <InfoCard title="Business Information">
                <InfoRow label="PAN" value={seller.pan} />
                <InfoRow label="GSTIN" value={seller.gstin} />
                <InfoRow label="Commission Rate" value={`${seller.commissionRate}%`} />
                <InfoRow
                  label="Joined"
                  value={new Date(seller.createdAt).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                />
                <InfoRow
                  label="Approved"
                  value={
                    seller.approvedAt
                      ? new Date(seller.approvedAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : 'Pending'
                  }
                />
              </InfoCard>

              <InfoCard title="Contact Information">
                <div className="flex items-center space-x-3 mb-3">
                  <FiMail className="text-gray-600" />
                  <a
                    href={`mailto:${seller.userId?.email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {seller.userId?.email}
                  </a>
                </div>
                <div className="flex items-center space-x-3 mb-3">
                  <FiPhone className="text-gray-600" />
                  <a
                    href={`tel:${seller.userId?.phone}`}
                    className="text-blue-600 hover:underline"
                  >
                    {seller.userId?.phone}
                  </a>
                </div>
                {seller.website && (
                  <div className="flex items-center space-x-3">
                    <FiGlobe className="text-gray-600" />
                    <a
                      href={seller.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {seller.website}
                    </a>
                  </div>
                )}
              </InfoCard>
            </div>

            {/* Subscription Details */}
            <InfoCard title="Subscription Details">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Plan</p>
                  <p className="text-lg font-semibold text-gray-900 capitalize">
                    {seller.subscriptionPlan}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Start Date</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(seller.subscriptionStartDate).toLocaleDateString('en-IN')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Expiry Date</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(seller.subscriptionExpiry).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>
            </InfoCard>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Sales Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                label="Total Sales"
                value={seller.salesStats?.totalSales || 0}
                icon={<FiDollarSign />}
                color="text-green-600"
              />
              <StatCard
                label="Average Order Value"
                value={`₹${(
                  (seller.salesStats?.totalRevenue || 0) / (seller.salesStats?.totalOrders || 1)
                ).toFixed(0)}`}
                icon={<FiTrendingUp />}
                color="text-blue-600"
              />
              <StatCard
                label="Customer Satisfaction"
                value={`${seller.performance?.customerSatisfactionScore || 0}/5`}
                icon={<FiStar />}
                color="text-yellow-600"
              />
            </div>

            {/* More analytics charts can be added here */}
            <ChartCard title="Sales Performance (Coming Soon)">
              <div className="h-64 flex items-center justify-center text-gray-500">
                <p>Detailed sales analytics charts will be displayed here</p>
              </div>
            </ChartCard>
          </div>
        )}

        {activeTab === 'store' && (
          <div className="space-y-6">
            <InfoCard title="Store Information">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Store Name</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {seller.storeInfo?.storeName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Store Slug</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {seller.storeInfo?.storeSlug}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Description</p>
                  <p className="text-gray-700">{seller.storeInfo?.storeDescription}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Categories</p>
                  <div className="flex flex-wrap gap-2">
                    {seller.storeInfo?.storeCategories?.map((cat, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </InfoCard>

            <InfoCard title="Policies">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">Shipping Policy</p>
                  <p className="text-gray-700">{seller.storeInfo?.shippingPolicy}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">Return Policy</p>
                  <p className="text-gray-700">{seller.storeInfo?.returnPolicy}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">Terms & Conditions</p>
                  <p className="text-gray-700">{seller.termsAndConditions}</p>
                </div>
              </div>
            </InfoCard>

            <InfoCard title="Customer Support">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <FiMail className="text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <a
                      href={`mailto:${seller.storeInfo?.customerSupportEmail}`}
                      className="text-blue-600 hover:underline"
                    >
                      {seller.storeInfo?.customerSupportEmail}
                    </a>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <FiPhone className="text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <a
                      href={`tel:${seller.storeInfo?.customerSupportPhone}`}
                      className="text-blue-600 hover:underline"
                    >
                      {seller.storeInfo?.customerSupportPhone}
                    </a>
                  </div>
                </div>
              </div>
            </InfoCard>

            <InfoCard title="Social Media">
              <div className="flex space-x-4">
                {seller.storeInfo?.socialMedia?.facebook && (
                  <a
                    href={seller.storeInfo.socialMedia.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <FiFacebook size={24} />
                  </a>
                )}
                {seller.storeInfo?.socialMedia?.instagram && (
                  <a
                    href={seller.storeInfo.socialMedia.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-pink-50 text-pink-600 rounded-lg hover:bg-pink-100 transition-colors"
                  >
                    <FiInstagram size={24} />
                  </a>
                )}
                {seller.storeInfo?.socialMedia?.twitter && (
                  <a
                    href={seller.storeInfo.socialMedia.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-sky-50 text-sky-600 rounded-lg hover:bg-sky-100 transition-colors"
                  >
                    <FiTwitter size={24} />
                  </a>
                )}
                {seller.storeInfo?.socialMedia?.linkedin && (
                  <a
                    href={seller.storeInfo.socialMedia.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <FiLinkedin size={24} />
                  </a>
                )}
                {seller.storeInfo?.socialMedia?.youtube && (
                  <a
                    href={seller.storeInfo.socialMedia.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <FiYoutube size={24} />
                  </a>
                )}
              </div>
            </InfoCard>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-4">
            {Object.entries(seller.documents || {}).map(([key, doc]) => {
              if (typeof doc === 'object' && doc.url) {
                return (
                  <DocumentCard
                    key={key}
                    title={key
                      .replace(/([A-Z])/g, ' $1')
                      .replace(/^./, (str) => str.toUpperCase())}
                    url={doc.url}
                    verified={doc.verified}
                    uploadedAt={doc.uploadedAt}
                    type={doc.type}
                  />
                )
              }
              return null
            })}
            {seller.documents?.agreementSigned && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
                <FiCheckCircle className="text-green-600 text-xl" />
                <div>
                  <p className="font-semibold text-green-900">Agreement Signed</p>
                  <p className="text-sm text-green-700">
                    Signed on{' '}
                    {new Date(seller.documents.agreementSignedAt).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'warehouses' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pickup Address */}
            <InfoCard title="Primary Pickup Address">
              <div className="space-y-2">
                <p className="font-medium text-gray-900">
                  {seller.pickupAddress?.addressLine1}
                </p>
                {seller.pickupAddress?.addressLine2 && (
                  <p className="text-gray-700">{seller.pickupAddress.addressLine2}</p>
                )}
                {seller.pickupAddress?.landmark && (
                  <p className="text-sm text-gray-600">
                    Landmark: {seller.pickupAddress.landmark}
                  </p>
                )}
                <p className="text-gray-700">
                  {seller.pickupAddress?.city}, {seller.pickupAddress?.state} -{' '}
                  {seller.pickupAddress?.pincode}
                </p>
                <p className="text-gray-700">{seller.pickupAddress?.country}</p>
                {seller.pickupAddress?.latitude && seller.pickupAddress?.longitude && (
                  <p className="text-sm text-gray-600">
                    Coordinates: {seller.pickupAddress.latitude}, {seller.pickupAddress.longitude}
                  </p>
                )}
              </div>
            </InfoCard>

            {/* Bank Details */}
            <InfoCard title="Bank Account Details">
              <div className="space-y-3">
                <InfoRow
                  label="Account Holder"
                  value={seller.bankDetails?.accountHolderName}
                />
                <InfoRow label="Account Number" value={seller.bankDetails?.accountNumber} />
                <InfoRow label="IFSC Code" value={seller.bankDetails?.ifscCode} />
                <InfoRow label="Bank Name" value={seller.bankDetails?.bankName} />
                <InfoRow label="Branch" value={seller.bankDetails?.branch} />
                <InfoRow
                  label="Account Type"
                  value={seller.bankDetails?.accountType?.toUpperCase()}
                />
                {seller.bankDetails?.upiId && (
                  <InfoRow label="UPI ID" value={seller.bankDetails.upiId} />
                )}
              </div>
            </InfoCard>

            {/* Warehouses */}
            {seller.warehouses?.map((warehouse, idx) => (
              <InfoCard
                key={warehouse._id}
                title={`${warehouse.name} ${warehouse.isActive ? '✓' : '✗'}`}
              >
                <div className="space-y-2">
                  <p className="font-medium text-gray-900">{warehouse.addressLine1}</p>
                  {warehouse.addressLine2 && (
                    <p className="text-gray-700">{warehouse.addressLine2}</p>
                  )}
                  <p className="text-gray-700">
                    {warehouse.city}, {warehouse.state} - {warehouse.pincode}
                  </p>
                  <div className="pt-3 border-t mt-3">
                    <InfoRow label="Contact Person" value={warehouse.contactPerson} />
                    <InfoRow label="Contact Phone" value={warehouse.contactPhone} />
                  </div>
                  <div
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      warehouse.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {warehouse.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
              </InfoCard>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Helper Components
function MetricCard({ icon, label, value, change, subtitle, bgColor }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-3 rounded-lg ${bgColor}`}>{icon}</div>
        {change && (
          <span className="text-sm font-semibold text-green-600 flex items-center">
            <FiTrendingUp className="mr-1" />
            {change}
          </span>
        )}
      </div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  )
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
      {children}
    </div>
  )
}

function InfoCard({ title, children }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
      {children}
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between py-2 border-b last:border-b-0">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value || 'N/A'}</span>
    </div>
  )
}

function StatCard({ label, value, icon, color }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3">
        <div className={`text-3xl ${color}`}>{icon}</div>
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  )
}

function DocumentCard({ title, url, verified, uploadedAt, type }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-blue-50 rounded-lg">
          <FiFileText className="text-blue-600 text-xl" />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">{title}</h4>
          {type && <p className="text-xs text-gray-500 capitalize">{type}</p>}
          <p className="text-xs text-gray-500">
            Uploaded: {new Date(uploadedAt).toLocaleDateString('en-IN')}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        {verified ? (
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold flex items-center space-x-1">
            <FiCheckCircle />
            <span>Verified</span>
          </span>
        ) : (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold flex items-center space-x-1">
            <FiAlertCircle />
            <span>Pending</span>
          </span>
        )}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          View
        </a>
      </div>
    </div>
  )
}
