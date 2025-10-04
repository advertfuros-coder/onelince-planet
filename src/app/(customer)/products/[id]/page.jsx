'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import axios from 'axios'
import { FiStar } from 'react-icons/fi'
import Button from '@/components/ui/Button'
import { FiShoppingCart, FiHeart } from 'react-icons/fi'
import { useCart } from '@/lib/context/CartContext'

function StarRating({ rating }) {
  return (
    <div className="flex space-x-1 text-yellow-400">
      {[...Array(5)].map((_, i) => (
        <FiStar key={i} className={i < rating ? 'opacity-100' : 'opacity-30'} />
      ))}
    </div>
  )
}

export default function ProductPage() {
  const { id } = useParams()
    const { addToCart } = useCart()
  
  const [loading, setLoading] = useState(true)
  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [avgRating, setAvgRating] = useState(0)

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true)
        const res = await axios.get(`/api/customer/products/${id}`) // Your backend endpoint
        if (res.data.success) {
          setProduct(res.data.product)
          setReviews(res.data.reviews)
          setAvgRating(res.data.avgRating || 0)
        } else {
          setProduct(null)
        }
      } catch (error) {
        setProduct(null)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  if (loading)
    return (
      <div className="p-12 text-center text-lg text-gray-600">
        Loading product details...
      </div>
    )

  if (!product)
    return (
      <div className="p-12 text-center text-lg text-red-500">Product not found.</div>
    )

  const ratingCounts = [0, 1, 2, 3, 4, 5].map((star) => {
    return {
      star,
      count: reviews.filter((r) => r.rating === star).length,
    }
  })


   const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()

    addToCart(product, 1)
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-12 grid gap-12 md:grid-cols-3">
      {/* Left image gallery */}
      <div className="space-y-4 md:col-span-1">
        {product.images.map((img, idx) => (
          <img
            key={idx}
            src={img.url || '/placeholder.png'}
            alt={img.alt || product.name}
            className="rounded-lg border border-gray-300 object-cover w-full h-64 sm:h-80"
          />
        ))}
      </div>

      {/* Product details */}
      <div className="md:col-span-2">
        <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
        {product.shortDescription && (
          <p className="text-lg text-gray-700 mb-6">{product.shortDescription}</p>
        )}

        <p className="text-3xl font-extrabold mb-6">₹{product.pricing.salePrice || product.pricing.basePrice}</p>

        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-3">Specifications</h3>
          <ul className="list-disc list-inside text-gray-700">
            {product.specifications.map(({ key, value }, idx) => (
              <li key={idx}>
                <span className="font-semibold">{key}:</span> {value}
              </li>
            ))}
          </ul>
        </div>

        

 <Button
            onClick={handleAddToCart}
            className="w-full flex items-center justify-center space-x-2"
            size="sm"
          >
            <FiShoppingCart className="w-4 h-4" />
            <span>Add to Cart</span>
          </Button>


          <div className="mb-8 p-6 bg-gray-50 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-3">Seller Info</h3>
          <p>Name: {product.sellerId?.name || 'N/A'}</p>
          <p>Email: {product.sellerId?.email || 'N/A'}</p>
        </div>
        {/* Rating summary */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-6">Customer Reviews</h2>
          <div className="flex items-center mb-6">
            <div className="text-6xl font-bold mr-4 text-yellow-400">{avgRating.toFixed(1)}</div>
            <div>
              <StarRating rating={Math.round(avgRating)} />
              <p className="text-gray-600">{`${reviews.length} ratings & reviews`}</p>
            </div>
          </div>

          {ratingCounts
            .slice(1)
            .reverse()
            .map(({ star, count }) => {
              const percentage = reviews.length ? (count / reviews.length) * 100 : 0
              return (
                <div key={star} className="flex items-center mb-2">
                  <span className="w-10">{star} <FiStar className="inline text-yellow-400" /></span>
                  <div className="flex-1 h-3 rounded bg-gray-300 mr-4">
                    <div className="h-3 rounded bg-yellow-400" style={{ width: `${percentage}%` }}></div>
                  </div>
                  <span className="w-7 text-right">{count}</span>
                </div>
              )
            })}
        </section>

        {/* Reviews list */}
        <section>
          {reviews.length === 0 ? (
            <p>No reviews yet.</p>
          ) : (
            <ul className="space-y-6">
              {reviews.map((review) => (
                <li key={review._id} className="p-4 border rounded shadow">
                  <div className="flex items-center mb-4">
                    <div className="bg-gray-300 rounded-full w-12 h-12 flex items-center justify-center font-bold uppercase mr-4">
                      {review.customer.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <div className="font-semibold">{review.customer.name || 'User'}</div>
                      <StarRating rating={review.rating} />
                    </div>
                    <span className="ml-auto text-gray-500 text-sm">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {review.title && (
                    <div className="font-semibold text-lg mb-2">{review.title}</div>
                  )}
                  <p>{review.comment}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
