// seller/(seller)/customers/page.jsx
'use client'
import { useState, useEffect } from 'react'
import { 
  FiSearch,
  FiMail,
  FiPhone,
  FiMapPin,
  FiShoppingBag,
  FiStar
} from 'react-icons/fi'
import Button from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils'
 
export default function SellerCustomers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
    try {
      // Mock customer data
      const mockCustomers = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+91-9876543210',
          location: 'Mumbai, Maharashtra',
          totalOrders: 12,
          totalSpent: 28450,
          averageOrderValue: 2371,
          lastOrder: '2025-09-28',
          customerSince: '2024-12-15',
          status: 'active'
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '+91-9876543211',
          location: 'Delhi, NCR',
          totalOrders: 8,
          totalSpent: 15620,
          averageOrderValue: 1953,
          lastOrder: '2025-09-25',
          customerSince: '2025-01-20',
          status: 'active'
        }
      ]
      setCustomers(mockCustomers)
    } catch (error) {
      console.error('Error loading customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <div className="p-6">Loading customers...</div>
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600">Manage your customer relationships</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="relative max-w-md">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search customers by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => (
          <div key={customer.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-lg">
                    {customer.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    customer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {customer.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <FiMail className="w-4 h-4 mr-2" />
                {customer.email}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <FiPhone className="w-4 h-4 mr-2" />
                {customer.phone}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <FiMapPin className="w-4 h-4 mr-2" />
                {customer.location}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">{customer.totalOrders}</div>
                <div className="text-xs text-gray-500">Total Orders</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">{formatPrice(customer.totalSpent)}</div>
                <div className="text-xs text-gray-500">Total Spent</div>
              </div>
            </div>

            <div className="text-center mb-4">
              <div className="text-sm font-medium text-gray-900">{formatPrice(customer.averageOrderValue)}</div>
              <div className="text-xs text-gray-500">Average Order Value</div>
            </div>

            <div className="text-xs text-gray-500 text-center mb-4">
              Last order: {new Date(customer.lastOrder).toLocaleDateString()}
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="flex-1">
                <FiMail className="w-4 h-4 mr-1" />
                Message
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <FiShoppingBag className="w-4 h-4 mr-1" />
                Orders
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
