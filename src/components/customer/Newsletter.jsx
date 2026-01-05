// components/customer/Newsletter.jsx
'use client'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import Button from '../ui/Button'
import Input from '../ui/Input'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Newsletter subscription logic here
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulated API call
      toast.success('Successfully subscribed to newsletter!')
      setEmail('')
    } catch (error) {
      toast.error('Failed to subscribe. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-semibold text-white mb-4">
          Stay Updated with OnlinePlanet
        </h2>
        <p className="text-xl text-blue-100 mb-8">
          Get the latest deals, new arrivals, and exclusive offers delivered to your inbox
        </p>
        
        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1"
            />
            <Button
              type="submit"
              loading={loading}
              className="bg-white text-blue-600 hover:bg-gray-100 whitespace-nowrap"
            >
              Subscribe Now
            </Button>
          </div>
        </form>
        
        <p className="text-sm text-blue-100 mt-4">
          No spam, unsubscribe at any time. We respect your privacy.
        </p>
      </div>
    </section>
  )
}
