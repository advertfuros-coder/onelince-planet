// app/(admin)/register/page.jsx
'use client'
import { useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'

export default function AdminRegister() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await axios.post('/api/admin/register', form)
      if (res.data.success) {
        setSuccess('Registration successful! You can now login.')
        setForm({ name: '', email: '', phone: '', password: '' })
        setTimeout(() => router.push('/admin/login'), 2000)
      } else {
        setError(res.data.message || 'Registration failed')
      }
    } catch (err) {
      setError(err.message || 'Registration error')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow mt-20">
      <h1 className="text-2xl font-bold mb-6">Admin Register</h1>
      {error && <p className="mb-4 text-red-600">{error}</p>}
      {success && <p className="mb-4 text-green-600">{success}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          required
          className="w-full p-3 border rounded"
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          required
          className="w-full p-3 border rounded"
        />
        <input
          type="text"
          placeholder="Phone"
          value={form.phone}
          onChange={e => setForm({ ...form, phone: e.target.value })}
          required
          className="w-full p-3 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
          required
          className="w-full p-3 border rounded"
          minLength={8}
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </Button>
      </form>
    </div>
  )
}
