// seller/(seller)/reviews/page.jsx
'use client'
import { useState, useEffect } from 'react'
import { 
  FiStar,
  FiSearch,
  FiFilter,
  FiMessageCircle
} from 'react-icons/fi'
import Button from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils'
 
export default function SellerReviews() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [ratingFilter, setRatingFilter] = useState('all')

  useEffect(() => {
    loadReviews()
  }, [])

  const loadReviews = async () => {
    try {
      // Mock reviews data
      const mockReviews = [
        {
          id: '1',
          customer: {
            name: 'John Doe',
            avatar: null
          },
          product: {
            id: 'P001',
            name: 'Wireless Headphones',
            image: '/images/headphones.jpg'
          },
          rating: 5,
          comment: 'Excellent product! Great sound quality and comfortable to wear.',
          date: '2025-09-28',
          verified: true,
          helpful: 12,
          replied: false
        },
        {
          id: '2',
          customer: {
            name: 'Jane Smith',
            avatar: null
          },
          product: {
            id: 'P002',
            name: 'Smart Watch',
            image: '/images/smartwatch.jpg'
          },
          rating: 4,
          comment: 'Good product but battery life could be better.',
          date: '2025-09-25',
          verified: true,
          helpful: 8,
          replied: true,
          reply: 'Thank you for your feedback! We\'re working on improving battery life in the next version.'
        }
      ]
      setReviews(mockReviews)
    } catch (error) {
      console.error('Error loading reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FiStar
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRating = ratingFilter === 'all' || review.rating.toString() === ratingFilter
    return matchesSearch && matchesRating
  })

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : 0

  if (loading) {
    return <div className="p-6">Loading reviews...</div>
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
          <p className="text-gray-600">Manage customer reviews and feedback</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{averageRating}</div>
            <div className="flex items-center justify-center">
              {renderStars(Math.round(averageRating))}
            </div>
            <div className="text-sm text-gray-500">{reviews.length} reviews</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search reviews by product or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <div key={review.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 font-medium">
                    {review.customer.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-medium text-gray-900">{review.customer.name}</h3>
                    {review.verified && (
                      <span className="text-xs text-green-600 font-medium">Verified Purchase</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(review.date).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="flex items-center mb-2">
                  <div className="flex items-center mr-2">
                    {renderStars(review.rating)}
                  </div>
                  <span className="text-sm text-gray-600">for</span>
                  <span className="text-sm font-medium text-gray-900 ml-1">{review.product.name}</span>
                </div>
                
                <p className="text-gray-700 mb-3">{review.comment}</p>
                
                {review.replied && review.reply && (
                  <div className="bg-gray-50 p-3 rounded-lg mb-3">
                    <div className="flex items-center mb-1">
                      <span className="text-sm font-medium text-gray-900">Your Reply:</span>
                    </div>
                    <p className="text-sm text-gray-700">{review.reply}</p>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    {review.helpful} people found this helpful
                  </div>
                  <div className="flex items-center space-x-2">
                    {!review.replied && (
                      <Button size="sm" variant="outline" className="flex items-center space-x-1">
                        <FiMessageCircle className="w-4 h-4" />
                        <span>Reply</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
