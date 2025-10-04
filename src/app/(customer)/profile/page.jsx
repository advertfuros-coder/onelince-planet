// app/(customer)/profile/page.jsx
'use client'
import { useAuth } from '@/lib/context/AuthContext'
import { useState } from 'react'
import Button from '@/components/ui/Button'
import { FiUser } from 'react-icons/fi'

export default function ProfilePage() {
  const { user, isAuthenticated, logout, updateProfile } = useAuth()
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  })
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <p className="text-lg text-gray-600 mb-6">Please <a className="text-blue-600 underline" href="/login">login</a> to view your profile.</p>
      </div>
    )
  }

  const handleSave = async () => {
    setLoading(true)
    await updateProfile(form)
    setEditing(false)
    setLoading(false)
  }

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <FiUser className="w-8 h-8 text-blue-600" />
          <h2 className="font-semibold text-lg">{user.name}</h2>
        </div>
        {editing ? (
          <div className="space-y-3">
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={form.name}
              onChange={e => setForm(x => ({ ...x, name: e.target.value }))}
              placeholder="Your Name"
            />
            <input
              type="email"
              className="w-full border rounded px-3 py-2"
              value={form.email}
              onChange={e => setForm(x => ({ ...x, email: e.target.value }))}
              placeholder="Your Email"
            />
            <input
              type="tel"
              className="w-full border rounded px-3 py-2"
              value={form.phone}
              onChange={e => setForm(x => ({ ...x, phone: e.target.value }))}
              placeholder="Your Phone"
            />
            <Button onClick={handleSave} loading={loading}>Save</Button>
            <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
          </div>
        ) : (
          <>
            <p><span className="text-gray-600">Email:</span> {user.email}</p>
            <p><span className="text-gray-600">Phone:</span> {user.phone || '-'}</p>
            <div className="flex gap-4 mt-4">
              <Button onClick={() => setEditing(true)}>Edit</Button>
              <Button variant="outline" onClick={logout}>Logout</Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
