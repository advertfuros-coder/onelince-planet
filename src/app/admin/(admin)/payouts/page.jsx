// app/(admin)/payouts/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import axios from 'axios'
import {
  FiSearch,
  FiDownload,
  FiPlus,
  FiDollarSign,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiTrendingUp,
  FiAlertCircle,
} from 'react-icons/fi'
import { toast } from 'react-hot-toast'

export default function AdminPayoutsPage() {
  const { token } = useAuth()
  const [payouts, setPayouts] = useState([])
  const [sellers, setSellers] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [selectedPayouts, setSelectedPayouts] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedSellers, setSelectedSellers] = useState([])
  const [creating, setCreating] = useState(false)

  // Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sellerFilter, setSellerFilter] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [order, setOrder] = useState('desc')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({})

  useEffect(() => {
    if (token) fetchPayouts()
  }, [token, page, statusFilter, sellerFilter, sortBy, order])

  async function fetchPayouts() {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page,
        limit: 20,
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
        ...(sellerFilter && { seller: sellerFilter }),
        sortBy,
        order,
      })

      const res = await axios.get(`/api/admin/payouts?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.data.success) {
        setPayouts(res.data.payouts)
        setSellers(res.data.sellers)
        setStats(res.data.stats)
        setPagination(res.data.pagination)
      }
    } catch (error) {
      console.error('Error fetching payouts:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreatePayouts() {
    if (selectedSellers.length === 0) {
      toast.error('Please select sellers')
      return
    }

    setCreating(true)
    try {
      const res = await axios.post(
        '/api/admin/payouts',
        { sellerIds: selectedSellers },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (res.data.success) {
        toast.success(res.data.message)
        setShowCreateModal(false)
        setSelectedSellers([])
        fetchPayouts()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create payouts')
    } finally {
      setCreating(false)
    }
  }

  function togglePayoutSelection(payoutId) {
    setSelectedPayouts((prev) =>
      prev.includes(payoutId) ? prev.filter((id) => id !== payoutId) : [...prev, payoutId]
    )
  }

  function toggleSelectAll() {
    if (selectedPayouts.length === payouts.length) {
      setSelectedPayouts([])
    } else {
      setSelectedPayouts(payouts.map((p) => p._id))
    }
  }

  async function handleBulkStatusUpdate(status) {
    if (selectedPayouts.length === 0) {
      toast.error('Please select payouts first')
      return
    }

    if (!confirm(`Update ${selectedPayouts.length} payout(s) to ${status}?`)) return

    try {
      const res = await axios.patch(
        '/api/admin/payouts',
        { payoutIds: selectedPayouts, status },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (res.data.success) {
        toast.success(res.data.message)
        setSelectedPayouts([])
        fetchPayouts()
      }
    } catch (error) {
      toast.error('Failed to update payouts')
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const formatPrice = (price) => `₹${(price || 0).toLocaleString('en-IN')}`

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payout Management</h1>
            <p className="text-gray-600 mt-1">Manage seller payouts and transactions</p>
          </div>
          <div className="flex space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <FiDownload />
              <span>Export</span>
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <FiPlus />
              <span>Create Payouts</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <StatCard
            label="Total Payouts"
            value={stats.totalPayouts || 0}
            icon={<FiDollarSign />}
            color="text-blue-600"
            bgColor="bg-blue-50"
          />
          <StatCard
            label="Pending Amount"
            value={formatPrice(stats.pendingAmount)}
            icon={<FiClock />}
            color="text-yellow-600"
            bgColor="bg-yellow-50"
          />
          <StatCard
            label="Completed"
            value={stats.completedPayouts || 0}
            icon={<FiCheckCircle />}
            color="text-green-600"
            bgColor="bg-green-50"
          />
          <StatCard
            label="Total Paid"
            value={formatPrice(stats.totalAmount)}
            icon={<FiTrendingUp />}
            color="text-purple-600"
            bgColor="bg-purple-50"
          />
          <StatCard
  label="Return Requests"
  value={stats.returnedOrders || 0}
  icon={<FiAlertCircle />}
  color="text-red-600"
  bgColor="bg-red-50"
  small
/>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            label="Pending"
            value={stats.pendingPayouts || 0}
            icon={<FiClock />}
            color="text-yellow-600"
            bgColor="bg-yellow-50"
            small
          />
          <StatCard
            label="Processing"
            value={stats.processingPayouts || 0}
            icon={<FiAlertCircle />}
            color="text-blue-600"
            bgColor="bg-blue-50"
            small
          />
          <StatCard
            label="Failed"
            value={stats.failedPayouts || 0}
            icon={<FiXCircle />}
            color="text-red-600"
            bgColor="bg-red-50"
            small
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>

            {/* Seller Filter */}
            <select
              value={sellerFilter}
              onChange={(e) => {
                setSellerFilter(e.target.value)
                setPage(1)
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Sellers</option>
              {sellers.map((seller) => (
                <option key={seller._id} value={seller._id}>
                  {seller.businessInfo?.businessName}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="createdAt">Date</option>
              <option value="amount">Amount</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedPayouts.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-blue-900">{selectedPayouts.length} payout(s) selected</p>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleBulkStatusUpdate('processing')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  Mark Processing
                </button>
                <button
                  onClick={() => handleBulkStatusUpdate('completed')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                >
                  Mark Completed
                </button>
                <button
                  onClick={() => handleBulkStatusUpdate('failed')}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                >
                  Mark Failed
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payouts Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-4 text-left">
                        <input
                          type="checkbox"
                          checked={selectedPayouts.length === payouts.length && payouts.length > 0}
                          onChange={toggleSelectAll}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                        Payout ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                        Seller
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                        Orders
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {payouts.map((payout) => (
                      <tr key={payout._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedPayouts.includes(payout._id)}
                            onChange={() => togglePayoutSelection(payout._id)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-mono text-sm text-gray-900">
                            {payout._id.slice(-8).toUpperCase()}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{payout.sellerId?.businessName}</p>
                            <p className="text-sm text-gray-600">{payout.sellerId?.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-900">{formatPrice(payout.amount)}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{payout.orders?.length || 0}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(
                              payout.status
                            )}`}
                          >
                            {payout.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {new Date(payout.createdAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="bg-gray-50 px-6 py-4 border-t flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    Showing {(page - 1) * pagination.limit + 1} to{' '}
                    {Math.min(page * pagination.limit, pagination.total)} of {pagination.total} payouts
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                      disabled={page === pagination.pages}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Create Payout Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Create Payouts</h3>

            <div className="space-y-3 mb-6">
              {sellers.map((seller) => (
                <label
                  key={seller._id}
                  className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedSellers.includes(seller._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedSellers([...selectedSellers, seller._id])
                      } else {
                        setSelectedSellers(selectedSellers.filter((id) => id !== seller._id))
                      }
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{seller.businessInfo?.businessName}</p>
                    <p className="text-sm text-gray-600">{seller.email}</p>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setSelectedSellers([])
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePayouts}
                disabled={creating || selectedSellers.length === 0}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {creating ? 'Creating...' : `Create ${selectedSellers.length} Payout(s)`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function StatCard({ label, value, icon, color, bgColor, small = false }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3">
        <div className={`p-3 rounded-lg ${bgColor}`}>
          <div className={`${color} ${small ? 'text-lg' : 'text-xl'}`}>{icon}</div>
        </div>
        <div>
          <p className={`text-sm text-gray-600 ${small ? 'text-xs' : ''}`}>{label}</p>
          <p className={`font-bold text-gray-900 ${small ? 'text-lg' : 'text-2xl'}`}>{value}</p>
        </div>
      </div>
    </div>
  )
}
