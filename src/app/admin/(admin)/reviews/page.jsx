// app/(admin)/reviews/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import axios from 'axios'
import {
  FiSearch,
  FiFilter,
  FiStar,
  FiCheckCircle,
  FiXCircle,
  FiTrash2,
  FiEye,
  FiThumbsUp,
  FiThumbsDown,
  FiDownload,
  FiImage,
  FiAlertCircle,
} from 'react-icons/fi'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

export default function AdminReviewsPage() {
  const { token } = useAuth()
  const [reviews, setReviews] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [selectedReviews, setSelectedReviews] = useState([])
  const [viewingReview, setViewingReview] = useState(null)

  // Filters
  const [search, setSearch] = useState('')
  const [ratingFilter, setRatingFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [order, setOrder] = useState('desc')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({})

  useEffect(() => {
    if (token) fetchReviews()
  }, [token, page, ratingFilter, statusFilter, sortBy, order])

  async function fetchReviews() {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page,
        limit: 20,
        ...(search && { search }),
        ...(ratingFilter && { rating: ratingFilter }),
        ...(statusFilter && { status: statusFilter }),
        sortBy,
        order,
      })

      const res = await axios.get(`/api/admin/reviews?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.data.success) {
        setReviews(res.data.reviews)
        setStats(res.data.stats)
        setPagination(res.data.pagination)
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  function toggleReviewSelection(reviewId) {
    setSelectedReviews((prev) =>
      prev.includes(reviewId) ? prev.filter((id) => id !== reviewId) : [...prev, reviewId]
    )
  }

  function toggleSelectAll() {
    if (selectedReviews.length === reviews.length) {
      setSelectedReviews([])
    } else {
      setSelectedReviews(reviews.map((r) => r._id))
    }
  }

  async function handleBulkAction(action) {
    if (selectedReviews.length === 0) {
      toast.error('Please select reviews first')
      return
    }

    const actionText = action === 'delete' ? 'delete' : action === 'approve' ? 'approve' : 'reject'
    if (!confirm(`Are you sure you want to ${actionText} ${selectedReviews.length} review(s)?`)) return

    try {
      const res = await axios.patch(
        '/api/admin/reviews',
        { reviewIds: selectedReviews, action },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (res.data.success) {
        toast.success(res.data.message)
        setSelectedReviews([])
        fetchReviews()
      }
    } catch (error) {
      toast.error('Failed to update reviews')
    }
  }

  const renderStars = (rating) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
          />
        ))}
      </div>
    )
  }

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Review Management</h1>
            <p className="text-gray-600 mt-1">Manage customer reviews and ratings</p>
          </div>
          <Link href="/admin/reviews/bulk" className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
             <span>Add Bulk Reviews</span>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            label="Total Reviews"
            value={stats.totalReviews || 0}
            icon={<FiStar />}
            color="text-yellow-600"
            bgColor="bg-yellow-50"
          />
          <StatCard
            label="Published"
            value={stats.publishedReviews || 0}
            icon={<FiCheckCircle />}
            color="text-green-600"
            bgColor="bg-green-50"
          />
          <StatCard
  label="Return Requests"
  value={stats.returnedOrders || 0}
  icon={<FiAlertCircle />}
  color="text-red-600"
  bgColor="bg-red-50"
  small
/>
          <StatCard
            label="Pending"
            value={stats.pendingReviews || 0}
            icon={<FiXCircle />}
            color="text-orange-600"
            bgColor="bg-orange-50"
          />
          <StatCard
            label="Avg Rating"
            value={(stats.averageRating || 0).toFixed(1)}
            icon={<FiStar />}
            color="text-blue-600"
            bgColor="bg-blue-50"
          />
        </div>

        {/* Rating Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Rating Distribution</h3>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats[`${['one', 'two', 'three', 'four', 'five'][rating - 1]}Star`] || 0
              const percentage = stats.totalReviews ? (count / stats.totalReviews) * 100 : 0
              return (
                <div key={rating} className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1 w-20">
                    <span className="text-sm font-medium text-gray-700">{rating}</span>
                    <FiStar className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-yellow-500 h-3 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700 w-16 text-right">{count}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <form onSubmit={(e) => { e.preventDefault(); fetchReviews(); }} className="md:col-span-2">
              <div className="relative">
                <FiSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reviews..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </form>

            {/* Rating Filter */}
            <select
              value={ratingFilter}
              onChange={(e) => {
                setRatingFilter(e.target.value)
                setPage(1)
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>

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
              <option value="published">Published</option>
              <option value="pending">Pending</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="createdAt">Date</option>
              <option value="rating">Rating</option>
              <option value="helpful">Most Helpful</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedReviews.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-blue-900">{selectedReviews.length} review(s) selected</p>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleBulkAction('approve')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleBulkAction('reject')}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reviews Table */}
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
                          checked={selectedReviews.length === reviews.length && reviews.length > 0}
                          onChange={toggleSelectAll}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                        Product
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                        Customer
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                        Rating
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                        Review
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {reviews.map((review) => (
                      <tr key={review._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedReviews.includes(review._id)}
                            onChange={() => toggleReviewSelection(review._id)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <img
                              src={review.productId?.images?.[0] || '/images/placeholder-product.jpg'}
                              alt={review.productId?.name}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                            <div>
                              <p className="font-medium text-gray-900">{review.productId?.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{review.userId?.name}</p>
                            <p className="text-sm text-gray-600">{review.userId?.email}</p>
                            {review.isVerifiedPurchase && (
                              <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-semibold">
                                Verified Purchase
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            {renderStars(review.rating)}
                            <div className="flex items-center space-x-3 text-xs text-gray-600">
                              <span className="flex items-center space-x-1">
                                <FiThumbsUp className="w-3 h-3" />
                                <span>{review.helpful}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <FiThumbsDown className="w-3 h-3" />
                                <span>{review.unhelpful}</span>
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 max-w-xs">
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{review.title}</p>
                            <p className="text-sm text-gray-600 line-clamp-2 mt-1">{review.comment}</p>
                            {review.images && review.images.length > 0 && (
                              <div className="flex items-center space-x-1 mt-2">
                                <FiImage className="w-4 h-4 text-gray-500" />
                                <span className="text-xs text-gray-600">{review.images.length} image(s)</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{formatDate(review.createdAt)}</td>
                        <td className="px-6 py-4">
                          {review.isApproved ? (
                            <span className="inline-flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                              <FiCheckCircle />
                              <span>Published</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                              <FiXCircle />
                              <span>Pending</span>
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setViewingReview(review)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          >
                            <FiEye />
                          </button>
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
                    {Math.min(page * pagination.limit, pagination.total)} of {pagination.total} reviews
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

      {/* Review Detail Modal */}
      {viewingReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900">Review Details</h3>
                <button
                  onClick={() => setViewingReview(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <FiXCircle />
                </button>
              </div>

              <div className="space-y-4">
                {/* Product Info */}
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <img
                    src={viewingReview.productId?.images?.[0] || '/images/placeholder-product.jpg'}
                    alt={viewingReview.productId?.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">{viewingReview.productId?.name}</p>
                    <p className="text-sm text-gray-600">Product ID: {viewingReview.productId?._id}</p>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Customer</p>
                  <p className="font-medium text-gray-900">{viewingReview.userId?.name}</p>
                  <p className="text-sm text-gray-600">{viewingReview.userId?.email}</p>
                  {viewingReview.isVerifiedPurchase && (
                    <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                      Verified Purchase
                    </span>
                  )}
                </div>

                {/* Rating */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Rating</p>
                  {renderStars(viewingReview.rating)}
                </div>

                {/* Review Content */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Review</p>
                  <h4 className="font-semibold text-gray-900 mb-2">{viewingReview.title}</h4>
                  <p className="text-gray-700">{viewingReview.comment}</p>
                </div>

                {/* Images */}
                {viewingReview.images && viewingReview.images.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Images</p>
                    <div className="grid grid-cols-3 gap-2">
                      {viewingReview.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`Review ${idx + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Helpful Stats */}
                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <FiThumbsUp className="w-4 h-4 text-green-600" />
                    <span className="font-medium">{viewingReview.helpful} helpful</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FiThumbsDown className="w-4 h-4 text-red-600" />
                    <span className="font-medium">{viewingReview.unhelpful} unhelpful</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-3 pt-4 border-t">
                  {!viewingReview.isApproved ? (
                    <button
                      onClick={async () => {
                        await handleBulkAction('approve')
                        setViewingReview(null)
                      }}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Approve
                    </button>
                  ) : (
                    <button
                      onClick={async () => {
                        await handleBulkAction('reject')
                        setViewingReview(null)
                      }}
                      className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                    >
                      Unpublish
                    </button>
                  )}
                  <button
                    onClick={async () => {
                      if (confirm('Are you sure you want to delete this review?')) {
                        setSelectedReviews([viewingReview._id])
                        await handleBulkAction('delete')
                        setViewingReview(null)
                      }
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function StatCard({ label, value, icon, color, bgColor }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3">
        <div className={`p-3 rounded-lg ${bgColor}`}>
          <div className={`${color} text-xl`}>{icon}</div>
        </div>
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  )
}
