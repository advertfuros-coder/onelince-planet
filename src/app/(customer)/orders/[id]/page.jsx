'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'
import { useAuth } from '@/lib/context/AuthContext'
import { FiCheckCircle, FiClock, FiPackage, FiTruck, FiX, FiStar } from 'react-icons/fi'
import Button from '@/components/ui/Button'
import Link from 'next/link'
import { formatPrice, formatDate } from '@/lib/utils/formatters'

const STATUS_STEPS = ['pending', 'processing', 'shipped', 'delivered']

function StarRating({ rating, setRating, editable }) {
  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          disabled={!editable}
          type="button"
          onClick={() => editable && setRating(star)}
          className={`text-2xl transition-colors duration-300 ${
            star <= rating ? 'text-yellow-400' : 'text-gray-300'
          }`}
          aria-label={`${star} Star`}
        >
          <FiStar />
        </button>
      ))}
    </div>
  )
}

export default function OrderDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { token, isAuthenticated } = useAuth()

  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState(null)
  const [reviewMap, setReviewMap] = useState({})
  const [reviewingProductId, setReviewingProductId] = useState(null)

  // Review form states
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewTitle, setReviewTitle] = useState('')
  const [reviewComment, setReviewComment] = useState('')
  const [reviewSubmitting, setReviewSubmitting] = useState(false)

  useEffect(() => {
    if (!token || !id) {
      if (!isAuthenticated) router.replace('/login')
      return
    }
    fetchOrder()
  }, [token, id])

  async function fetchOrder() {
    setLoading(true)
    try {
      const res = await axios.get(`/api/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.data.success) {
        setOrder(res.data.order)
        setReviewMap(res.data.reviewMap)
      } else setOrder(null)
    } catch {
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }

  async function submitReview(e) {
    e.preventDefault()
    if (!reviewComment.trim()) {
      alert('Please add a review comment')
      return
    }
    setReviewSubmitting(true)
    try {
      const res = await axios.post(
        `/api/orders/${id}/review`,
        {
          productId: reviewingProductId,
          rating: reviewRating,
          title: reviewTitle,
          comment: reviewComment,
          images: [],
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (res.data.success) {
        alert('Review submitted successfully')
        setReviewComment('')
        setReviewTitle('')
        setReviewRating(5)
        setReviewingProductId(null)
        fetchOrder()
      } else {
        alert(res.data.message || 'Failed to submit review')

        console.log(res.data)
      }
    } catch (error) {
      alert('Error submitting review')
    } finally {
      setReviewSubmitting(false)
    }
  }

  if (loading)
    return (
      <div className="p-10 text-center">
        <div className="inline-block w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Loading order details...</p>
      </div>
    )
  if (!order)
    return (
      <div className="p-10 text-center">
        <h2 className="text-2xl font-semibold mb-2">Order not found</h2>
        <Link href="/orders">
          <Button>Back to Orders</Button>
        </Link>
      </div>
    )

  const currentStepIndex = STATUS_STEPS.indexOf(order.status)

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">Order #{order.orderNumber}</h1>

      <div className="mb-12">
        {/* Order Status Stepper */}
        <div className="relative mb-6">
          <div className="absolute left-6 top-5 w-[calc(100%-48px)] border border-gray-300"></div>
          <div className="flex justify-between relative z-10">
            {STATUS_STEPS.map((step, idx) => (
              <div key={idx} className="text-center flex flex-col items-center w-1/4">
                <div
                  className={`w-12 h-12 rounded-full flex justify-center items-center font-semibold mb-2 ${
                    idx <= currentStepIndex
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {idx + 1}
                </div>
                <span
                  className={`capitalize text-sm font-medium ${
                    idx <= currentStepIndex ? 'text-gray-900' : 'text-gray-500'
                  }`}
                >
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Order Items */}
        {order.items.map((item) => (
          <div
            key={item._id}
            className="flex items-center border p-6 rounded shadow mb-8"
          >
            <img
              src={item.images?.[0] || '/placeholder.png'}
              alt={item.name}
              className="w-28 h-28 rounded border object-cover"
            />
            <div className="flex-1 ml-6">
              <h3 className="text-2xl font-semibold">{item.name}</h3>
              <p className="mt-1 text-gray-600">
                Quantity: <span className="font-medium">{item.quantity}</span>
              </p>
              <p className="mt-1 text-gray-600">
                Price: <span className="font-medium">{formatPrice(item.price)}</span>
              </p>
              <p className="mt-1 inline-block bg-gray-100 font-semibold rounded-md px-3 py-1 text-gray-700 capitalize">
                Status: {item.status}
              </p>
              {(order.status === 'delivered' && !reviewMap[item.product._id]) && (
                <Button
                  className="mt-4"
                  onClick={() => setReviewingProductId(item.product._id)}
                >
                  Write Review
                </Button>
              )}
            </div>
            <div className="text-right text-xl font-bold">
              {formatPrice(item.price * item.quantity)}
            </div>
          </div>
        ))}

        {/* Review Form Modal */}
        {reviewingProductId && (
          <div
            className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 px-4"
            onClick={() => setReviewingProductId(null)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg p-8 w-full max-w-lg"
            >
              <h2 className="text-2xl font-semibold mb-6">Write a review</h2>
              <form onSubmit={submitReview} className="space-y-6">
                <label className="block">
                  <span className="block mb-2 font-semibold">Rating</span>
                  <select
                    value={reviewRating}
                    onChange={(e) => setReviewRating(Number(e.target.value))}
                    className="block w-full border border-gray-300 rounded py-2 px-3"
                  >
                    {[5, 4, 3, 2, 1].map((val) => (
                      <option key={val} value={val}>
                        {val} Star{val > 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="block mb-2 font-semibold">Title (optional)</span>
                  <input
                    type="text"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    className="block w-full border border-gray-300 rounded py-2 px-3"
                    maxLength={100}
                  />
                </label>

                <label className="block">
                  <span className="block mb-2 font-semibold">Your review</span>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="block w-full border border-gray-300 rounded py-2 px-3"
                    rows={5}
                    maxLength={1000}
                    required
                  />
                </label>

                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setReviewingProductId(null)}
                    className="px-5 py-2 border rounded-lg mr-2"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="bg-blue-600 px-5 py-2 rounded-lg text-white font-semibold hover:bg-blue-700"
                  >
                    {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Payment and Shipping */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          <div className="p-6 bg-gray-50 rounded shadow">
            <h3 className="text-xl font-semibold mb-4">Payment Details</h3>
            <p className="text-gray-700">
              <span className="font-semibold">Method</span>: {order.payment.method.toUpperCase()}
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">Status</span>:{' '}
              <span
                className={`font-semibold ${
                  order.payment.status === 'paid' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {order.payment.status.toUpperCase()}
              </span>
            </p>
            <p className="mt-2 text-lg font-bold">Total: {formatPrice(order.pricing.total)}</p>
          </div>

          <div className="p-6 bg-gray-50 rounded shadow">
            <h3 className="text-xl font-semibold mb-4">Shipping Address</h3>
            <p>{order.shippingAddress.name}</p>
            <p>{order.shippingAddress.addressLine1}</p>
            {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
            <p>
              {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
            </p>
            <p>Phone: {order.shippingAddress.phone}</p>
            {order.shippingAddress.email && <p>Email: {order.shippingAddress.email}</p>}
            {order.shipping?.estimatedDelivery && (
              <p className="mt-4 font-semibold">
                Expected Delivery: {new Date(order.shipping.estimatedDelivery).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>


        {order.items.map((item) => (
  <div key={item._id} className="flex items-center border p-6 rounded shadow mb-8">
    <img
      src={item.images?.[0] || "/placeholder.png"}
      alt={item.name}
      className="w-28 h-28 rounded border object-cover"
    />
    <div className="flex-1 ml-6">
      <h3 className="text-2xl font-semibold">{item.name}</h3>
      <p className="mt-1 text-gray-600">
        Quantity: <span className="font-medium">{item.quantity}</span>
      </p>
      <p className="mt-1 text-gray-600">
        Price: <span className="font-medium">{formatPrice(item.price)}</span>
      </p>
      <p className="mt-1 inline-block bg-gray-100 font-semibold rounded-md px-3 py-1 text-gray-700 capitalize">
        Status: {item.status}
      </p>

      {/* Show review or review button if order is delivered */}
      {order.status === "delivered" && (
        <>
          {/* If review exists, show it */}
          {reviewMap[item.product._id] ? (
            <div className="mt-4 p-4 bg-blue-50 rounded border">
              <h4 className="font-semibold text-lg">
                Your Review - {reviewMap[item.product._id].rating} / 5 ⭐
              </h4>
              <p className="font-semibold">{reviewMap[item.product._id].title}</p>
              <p>{reviewMap[item.product._id].comment}</p>
            </div>
          ) : (
            <Button
              className="mt-4"
              onClick={() => setReviewingProductId(item.product._id)}
            >
              Write Review
            </Button>
          )}
        </>
      )}
    </div>
    <div className="text-right text-xl font-bold">
      {formatPrice(item.price * item.quantity)}
    </div>
  </div>
))}


        {/* Timeline */}
        <section className="bg-gray-50 rounded mt-12 p-6">
          <h3 className="text-xl font-semibold mb-4">Order Timeline</h3>
          <ol className="list-decimal pl-6 space-y-3 text-gray-700">
            {order.timeline.map((event, idx) => (
              <li key={idx}>
                <p className="capitalize font-semibold">{event.status.replace(/_/g, ' ')}</p>
                <p>{event.description}</p>
                <p className="text-sm">{new Date(event.timestamp).toLocaleString()}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  )
}
