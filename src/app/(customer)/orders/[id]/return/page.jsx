'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import axios from 'axios'
import { FiUpload, FiSend } from 'react-icons/fi'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'react-hot-toast'

export default function ReturnRequestPage() {
  const { token } = useAuth()
  const router = useRouter()
  const { id } = useParams()

  const [title, setTitle] = useState('')
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [images, setImages] = useState([])
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleImageUpload = async (e) => {
    const files = e.target.files
    if (!files.length) return

    setUploading(true)
    try {
      const formData = new FormData()
      for (let file of files) formData.append('images', file)

      // 👇 replace this with your own image upload API (Cloudinary, S3, etc.)
      const res = await axios.post('/api/upload', formData)
      setImages(res.data.urls)
    } catch (err) {
      toast.error('Image upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      const res = await axios.post(`/api/orders/${id}/return`, 
        { title, reason, description, images },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (res.data.success) {
        toast.success('Return request submitted!')
        router.push('/client/orders')
      } else {
        toast.error(res.data.message)
      }
    } catch (err) {
      toast.error('Failed to submit return request')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-xl shadow-sm p-8 mt-6">
      <h1 className="text-2xl font-semibold mb-6 text-gray-900">Return Product</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold mb-2">Title</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter short title (e.g., Damaged item)"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Reason</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for return"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Description</label>
          <textarea
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the issue..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Upload Images</label>
          <input type="file" multiple accept="image/*" onChange={handleImageUpload} />
          {uploading && <p className="text-sm text-gray-500 mt-1">Uploading...</p>}
          <div className="flex flex-wrap mt-3 gap-3">
            {images.map((url, i) => (
              <img key={i} src={url} className="w-20 h-20 rounded-lg object-cover border" />
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiSend />
          <span>{submitting ? 'Submitting...' : 'Submit Return Request'}</span>
        </button>
      </form>
    </div>
  )
}