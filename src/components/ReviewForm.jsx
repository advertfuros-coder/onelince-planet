'use client'
import { useState } from 'react'
import axios from 'axios'
import { useAuth } from '@/lib/context/AuthContext'
import Button from '@/components/ui/Button'

export default function ReviewForm({ orderId, productId, onSuccess }) {
  const { token } = useAuth()
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!comment.trim()) return
    setLoading(true)
    try {
      const res = await axios.post(
        `/api/orders/${orderId}/review`,
        { productId, rating, title, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (res.data.success) {
        alert('Review submitted')
        onSuccess && onSuccess()
        setTitle('')
        setComment('')
      } else {
        alert(res.data.message || 'Failed to submit')
      }
    } catch (error) {
      alert('Failed to submit')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded">
      <label>
        Rating:
        <select
          value={rating}
          onChange={e => setRating(parseInt(e.target.value))}
          className="ml-2 border rounded px-2 py-1"
        >
          {[5, 4, 3, 2, 1].map(n => (
            <option key={n} value={n}>
              {n} Star{n > 1 ? 's' : ''}
            </option>
          ))}
        </select>
      </label>
      <label>
        Title:
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          maxLength={100}
          className="w-full border rounded p-2"
          placeholder="Review title (optional)"
        />
      </label>
      <label>
        Comment:
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          maxLength={1000}
          required
          className="w-full border rounded p-2"
          placeholder="Write your review"
        />
      </label>
      <Button type="submit" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Review'}
      </Button>
    </form>
  )
}
