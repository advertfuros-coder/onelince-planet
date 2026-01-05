// app/(admin)/users/[id]/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import {
  FiUser,
  FiMail,
  FiPhone,
  FiCalendar,
  FiShoppingBag,
  FiDollarSign,
  FiMapPin,
  FiEdit2,
  FiTrash2,
  FiCheckCircle,
  FiXCircle,
  FiArrowLeft,
  FiActivity,
} from 'react-icons/fi'
import Link from 'next/link'

export default function UserDetailPage({ params }) {
  const { token } = useAuth()
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [orders, setOrders] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({})

  useEffect(() => {
    if (token) {
      fetchUserDetails()
      fetchUserOrders()
    }
  }, [token, params.id])

  async function fetchUserDetails() {
    try {
      const res = await axios.get(`/api/admin/users/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.data.success) {
        setUser(res.data.user)
        setFormData({
          name: res.data.user.name,
          email: res.data.user.email,
          phone: res.data.user.phone,
          role: res.data.user.role,
          isActive: res.data.user.isActive,
          isVerified: res.data.user.isVerified,
        })
      }
    } catch (error) {
      console.error('Error fetching user:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchUserOrders() {
    try {
      const res = await axios.get(`/api/admin/users/${params.id}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.data.success) {
        setOrders(res.data.orders)
        setStats(res.data.stats)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    }
  }

  async function handleUpdate(e) {
    e.preventDefault()
    try {
      const res = await axios.put(`/api/admin/users/${params.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.data.success) {
        setUser(res.data.user)
        setIsEditing(false)
        alert('User updated successfully')
      }
    } catch (error) {
      console.error('Error updating user:', error)
      alert('Failed to update user')
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return

    try {
      const res = await axios.delete(`/api/admin/users/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.data.success) {
        router.push('/admin/users')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Failed to delete user')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-600 text-lg">User not found</p>
        <Link href="/admin/users" className="text-blue-600 hover:underline mt-4 inline-block">
          Back to Users
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
            <FiArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">User Details</h1>
            <p className="text-gray-600 mt-1">View and manage user information</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <FiEdit2 />
            <span>{isEditing ? 'Cancel' : 'Edit User'}</span>
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <FiTrash2 />
            <span>Delete</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - User Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center mb-4">
                <span className="text-white font-semibold text-3xl">{user.name[0].toUpperCase()}</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
              <p className="text-gray-600">{user.email}</p>

              <div className="flex items-center space-x-2 mt-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    user.role === 'admin'
                      ? 'bg-purple-100 text-purple-700'
                      : user.role === 'seller'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-green-100 text-green-700'
                  }`}
                >
                  {user.role}
                </span>
                {user.isActive ? (
                  <span className="flex items-center space-x-1 text-green-600 text-sm font-semibold">
                    <FiCheckCircle />
                    <span>Active</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-1 text-red-600 text-sm font-semibold">
                    <FiXCircle />
                    <span>Blocked</span>
                  </span>
                )}
              </div>
            </div>

            <div className="mt-6 space-y-3 border-t pt-4">
              <InfoRow icon={<FiMail />} label="Email" value={user.email} />
              <InfoRow icon={<FiPhone />} label="Phone" value={user.phone || 'Not provided'} />
              <InfoRow icon={<FiCalendar />} label="Joined" value={new Date(user.createdAt).toLocaleDateString('en-IN')} />
              <InfoRow
                icon={<FiCheckCircle />}
                label="Verified"
                value={user.isVerified ? 'Yes' : 'No'}
                valueColor={user.isVerified ? 'text-green-600' : 'text-red-600'}
              />
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Stats</h3>
            <div className="space-y-4">
              <StatItem label="Total Orders" value={stats.totalOrders || 0} icon={<FiShoppingBag />} />
              <StatItem label="Total Spent" value={`₹${(stats.totalSpent || 0).toLocaleString('en-IN')}`} icon={<FiDollarSign />} />
              <StatItem label="Avg Order Value" value={`₹${(stats.avgOrderValue || 0).toFixed(0)}`} icon={<FiActivity />} />
            </div>
          </div>
        </div>

        {/* Right Column - Details & Orders */}
        <div className="lg:col-span-2 space-y-6">
          {/* Edit Form or Details */}
          {isEditing ? (
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Edit User Information</h3>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                  <select
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="customer">Customer</option>
                    <option value="seller">Seller</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="flex items-center space-x-6">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Active</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.isVerified}
                      onChange={e => setFormData({ ...formData, isVerified: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Verified</span>
                  </label>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : null}

          {/* Order History */}
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="px-6 py-4 border-b">
              <h3 className="text-xl font-semibold text-gray-900">Order History</h3>
            </div>
            <div className="overflow-x-auto">
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <FiShoppingBag size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No orders yet</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {orders.map(order => (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">#{order._id.slice(-8)}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString('en-IN')}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                          ₹{order.totalAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              order.status === 'delivered'
                                ? 'bg-green-100 text-green-700'
                                : order.status === 'cancelled'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/admin/orders/${order._id}`}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ icon, label, value, valueColor = 'text-gray-900' }) {
  return (
    <div className="flex items-start space-x-3">
      <div className="text-gray-500 mt-0.5">{icon}</div>
      <div className="flex-1">
        <p className="text-sm text-gray-600">{label}</p>
        <p className={`font-medium ${valueColor}`}>{value}</p>
      </div>
    </div>
  )
}

function StatItem({ label, value, icon }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="text-blue-600">{icon}</div>
        <span className="text-sm text-gray-600">{label}</span>
      </div>
      <span className="text-lg font-semibold text-gray-900">{value}</span>
    </div>
  )
}
