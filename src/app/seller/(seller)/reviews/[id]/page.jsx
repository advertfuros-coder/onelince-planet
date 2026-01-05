// seller/(seller)/reviews/[id]/page.jsx
'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  FiStar,
  FiUser,
  FiCalendar,
  FiMessageCircle,
  FiSend,
  FiCheckCircle
} from 'react-icons/fi'
import Button from '@/components/ui/Button'
import { toast } from 'react-hot-toast'

export default function ReviewDetail() {
  const params = useParams()
  const router = useRouter()
  const [review, setReview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [replyText, setReplyText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadReview()
  }, [params.id])

  const loadReview = async () => {
    try {
      // Mock review data
      const mockReview = {
        id: params.id,
        customer: {
          name: 'John Doe',
          avatar: null,
          verified: true
        },
        product: {
          id: 'P001',
          name: 'Wireless Bluetooth Headphones',
          image: '/images/headphones.jpg'
        },
        rating: 5,
        title: 'Excellent Product!',
        comment: 'These headphones are absolutely amazing! The sound quality is crystal clear, and the noise cancellation feature works perfectly. I\'ve been using them for a month now, and the battery life is excellent. Highly recommend to anyone looking for quality wireless headphones.',
        date: '2025-09-28T14:30:00Z',
        verified: true,
        helpful: 12,
        images: ['/images/review-1.jpg', '/images/review-2.jpg'],
        reply: null,
        status: 'published'
      }
      setReview(mockReview)
    } catch (error) {
      toast.error('Error loading review details')
    } finally {
      setLoading(false)
    }
  }

  const handleReply = async () => {
    if (!replyText.trim()) {
      toast.error('Please enter a reply')
      return
    }

    setSubmitting(true)
    try {
      // API call to submit reply
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setReview(prev => ({
        ...prev,
        reply: {
          text: replyText,
          date: new Date().toISOString(),
          author: 'Seller'
        }
      }))
      
      setReplyText('')
      toast.success('Reply posted successfully!')
    } catch (error) {
      toast.error('Error posting reply')
    } finally {
      setSubmitting(false)
    }
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FiStar
        key={i}
        className={`w-5 h-5 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading review...</p>
        </div>
      </div>
    )
  }

  if (!review) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Review not found</h3>
        <Button onClick={() => router.push('/seller/reviews')} className="mt-4">
          Back to Reviews
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Review Details</h1>
          <p className="text-gray-600">Review for {review.product.name}</p>
        </div>
        <Button variant="outline" onClick={() => router.push('/seller/reviews')}>
          Back to Reviews
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Review Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* Review Header */}
            <div className="flex items-start space-x-4 mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-gray-600 font-medium">
                  {review.customer.name.charAt(0).toUpperCase()}
                </span>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium text-gray-900">{review.customer.name}</h3>
                  {review.customer.verified && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                      Verified Buyer
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-4 mt-1">
                  <div className="flex items-center">
                    {renderStars(review.rating)}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <FiCalendar className="w-4 h-4 mr-1" />
                    {new Date(review.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Review Content */}
            <div className="mb-6">
              {review.title && (
                <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
              )}
              <p className="text-gray-700 leading-relaxed">{review.comment}</p>
            </div>

            {/* Review Images */}
            {review.images && review.images.length > 0 && (
              <div className="mb-6">
                <h5 className="text-sm font-medium text-gray-900 mb-3">Customer Images</h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {review.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Review image ${index + 1}`}
                      className="w-full h-20 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => {/* Open image modal */}}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Review Stats */}
            <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
              <span>{review.helpful} people found this helpful</span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                review.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {review.status}
              </span>
            </div>

            {/* Existing Reply */}
            {review.reply && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2 mb-2">
                  <FiMessageCircle className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Your Reply</span>
                  <span className="text-xs text-blue-600">
                    {new Date(review.reply.date).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-blue-800 text-sm">{review.reply.text}</p>
              </div>
            )}

            {/* Reply Form */}
            {!review.reply && (
              <div className="border-t pt-6">
                <h5 className="text-lg font-medium text-gray-900 mb-4">Reply to Review</h5>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write your reply to this customer review..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-gray-500">
                    Your reply will be visible to all customers
                  </p>
                  <Button
                    onClick={handleReply}
                    loading={submitting}
                    className="flex items-center space-x-2"
                  >
                    <FiSend className="w-4 h-4" />
                    <span>Post Reply</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Product Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Product Details</h3>
            <div className="flex items-center space-x-3">
              <img
                src={review.product.image}
                alt={review.product.name}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div>
                <h4 className="font-medium text-gray-900">{review.product.name}</h4>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => router.push(`/seller/products/edit/${review.product.id}`)}
                >
                  View Product
                </Button>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Customer Info</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 font-medium">
                    {review.customer.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{review.customer.name}</p>
                  {review.customer.verified && (
                    <div className="flex items-center text-xs text-green-600">
                      <FiCheckCircle className="w-3 h-3 mr-1" />
                      Verified Buyer
                    </div>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/seller/customers/${review.customer.id}`)}
              >
                View Customer Profile
              </Button>
            </div>
          </div>

          {/* Review Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Review Actions</h3>
            <div className="space-y-3">
              <Button variant="outline" className="w-full">
                <FiMessageCircle className="w-4 h-4 mr-2" />
                Contact Customer
              </Button>
              
              {review.status === 'published' && (
                <Button variant="outline" className="w-full">
                  Hide Review
                </Button>
              )}
              
              <Button variant="outline" className="w-full text-red-600 border-red-300 hover:bg-red-50">
                Report Review
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
