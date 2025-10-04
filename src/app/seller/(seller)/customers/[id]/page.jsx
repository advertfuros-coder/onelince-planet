// seller/(seller)/customers/[id]/page.jsx
'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  FiMail,
  FiPhone,
  FiMapPin,
  FiShoppingBag,
  FiStar,
  FiCalendar,
  FiTrendingUp,
  FiMessageCircle
} from 'react-icons/fi'
import Button from '../../../../components/ui/Button'
import { formatPrice } from '../../../../lib/utils'
import { toast } from 'react-hot-toast'

export default function CustomerDetail() {
  const params = useParams()
  const router = useRouter()
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    loadCustomer()
  }, [params.id])

  const loadCustomer = async () => {
    try {
      // Mock customer data
      const mockCustomer = {
        id: params.id,
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+91-9876543210',
        location: 'Mumbai, Maharashtra',
        avatar: null,
        joinDate: '2024-12-15',
        totalOrders: 12,
        totalSpent: 28450,
        averageOrderValue: 2371,
        lastOrder: '2025-09-28',
        status: 'active',
        orders: [
          {
            id: 'OP001234',
            date: '2025-09-28',
            total: 2499,
            status: 'delivered',
            items: [
              { name: 'Wireless Headphones', quantity: 1, price: 2499 }
            ]
          },
          {
            id: 'OP001235',
            date: '2025-09-25',
            total: 1899,
            status: 'shipped',
            items: [
              { name: 'Smart Watch', quantity: 1, price: 1899 }
            ]
          }
        ],
        reviews: [
          {
            id: '1',
            productName: 'Wireless Headphones',
            rating: 5,
            comment: 'Excellent product! Great sound quality.',
            date: '2025-09-29'
          },
          {
            id: '2',
            productName: 'Smart Watch',
            rating: 4,
            comment: 'Good product, fast delivery.',
            date: '2025-09-26'
          }
        ],
        loyaltyPoints: 284,
        preferredCategories: ['Electronics', 'Gadgets'],
        paymentMethods: ['UPI', 'Credit Card'],
        addresses: [
          {
            type: 'home',
            street: '123 Main Street',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400001'
          }
        ]
      }
      setCustomer(mockCustomer)
    } catch (error) {
      toast.error('Error loading customer details')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading customer details...</p>
        </div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Customer not found</h3>
        <Button onClick={() => router.push('/seller/customers')} className="mt-4">
          Back to Customers
        </Button>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', name: 'Overview' },
    { id: 'orders', name: 'Orders' },
    { id: 'reviews', name: 'Reviews' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-semibold text-xl">
              {customer.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
            <p className="text-gray-600">Customer since {new Date(customer.joinDate).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <FiMessageCircle className="w-4 h-4 mr-2" />
            Message
          </Button>
          <Button variant="outline">
            <FiMail className="w-4 h-4 mr-2" />
            Email
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{customer.totalOrders}</p>
            </div>
            <FiShoppingBag className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">{formatPrice(customer.totalSpent)}</p>
            </div>
            <FiTrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
              <p className="text-2xl font-bold text-gray-900">{formatPrice(customer.averageOrderValue)}</p>
            </div>
            <FiStar className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Loyalty Points</p>
              <p className="text-2xl font-bold text-gray-900">{customer.loyaltyPoints}</p>
            </div>
            <FiCalendar className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <FiMail className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">{customer.email}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FiPhone className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">{customer.phone}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FiMapPin className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">{customer.location}</span>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-8">Preferences</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Preferred Categories:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {customer.preferredCategories.map((category, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Payment Methods:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {customer.paymentMethods.map((method, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                        >
                          {method}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="text-sm">
                    <span className="text-gray-600">Last Order:</span>
                    <span className="text-gray-900 ml-1">
                      {new Date(customer.lastOrder).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">Account Status:</span>
                    <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                      customer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {customer.status}
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-8">Addresses</h3>
                <div className="space-y-3">
                  {customer.addresses.map((address, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-900 capitalize">{address.type}</p>
                      <p className="text-sm text-gray-600">
                        {address.street}, {address.city}, {address.state} {address.pincode}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order History</h3>
              <div className="space-y-4">
                {customer.orders.map((order) => (
                  <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">Order #{order.id}</h4>
                        <p className="text-sm text-gray-600">{new Date(order.date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{formatPrice(order.total)}</p>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {order.items.map((item, idx) => (
                        <span key={idx}>
                          {item.name} × {item.quantity}
                          {idx < order.items.length - 1 && ', '}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Reviews</h3>
              <div className="space-y-4">
                {customer.reviews.map((review) => (
                  <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{review.productName}</h4>
                        <div className="flex items-center space-x-1">
                          {Array.from({ length: 5 }, (_, i) => (
                            <FiStar
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-500">{new Date(review.date).toLocaleDateString()}</p>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
