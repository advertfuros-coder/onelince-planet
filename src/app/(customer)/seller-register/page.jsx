// app/seller/register/page.jsx
'use client'
import { useState } from 'react'
import axios from 'axios'
import Button from '@/components/ui/Button'
import { toast } from 'react-hot-toast'

const initialForm = {
  name: '', email: '', phone: '',
  storeName: '', storeDescription: '', storeWebsite: '',
  addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', country: 'India',
  gstin: '', pan: '',
  businessType: 'individual',
  documents: []
}

export default function SellerRegisterPage() {
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }
  function handleFile(e) {
    setForm(f => ({ ...f, documents: Array.from(e.target.files) }))
  }
  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        ...form,
        storeAddress: {
          addressLine1: form.addressLine1,
          addressLine2: form.addressLine2,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
          country: form.country
        },
        documents: undefined
      }
      const res = await axios.post('/api/seller/register', payload)
      if (res.data.success) {
        toast.success(res.data.message)
        setForm(initialForm)
      } else {
        toast.error(res.data.message)
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Submission failed')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-lg my-12">
      <h1 className="text-3xl font-bold mb-6 text-center">Become a Seller on OnlinePlanet</h1>
      <p className="mb-10 text-center text-gray-600 max-w-xl mx-auto">
        Fill out the application form below to register your business and start selling on our platform. Our team will review your submission and contact you after approval.
      </p>
      <form className="space-y-8" onSubmit={handleSubmit}>
        {/* Personal Info */}
        <section>
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Personal & Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <input className="input" name="name" type="text" placeholder="Full Name" value={form.name} onChange={handleChange} required />
            <input className="input" name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
            <input className="input" name="phone" type="tel" placeholder="Phone Number" value={form.phone} onChange={handleChange} required />
          </div>
        </section>

        {/* Store Info */}
        <section>
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Store Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input className="input" name="storeName" type="text" placeholder="Store/Brand Name" value={form.storeName} onChange={handleChange} required />
            <input className="input" name="storeWebsite" type="url" placeholder="Store Website (optional)" value={form.storeWebsite} onChange={handleChange} />
            <textarea className="input col-span-full" name="storeDescription" placeholder="Store Description" value={form.storeDescription} onChange={handleChange} required />
          </div>
        </section>

        {/* Store Address */}
        <section>
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Store Address</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <input className="input col-span-full md:col-span-2 lg:col-span-3" name="addressLine1" type="text" placeholder="Address Line 1" value={form.addressLine1} onChange={handleChange} required />
            <input className="input col-span-full md:col-span-2 lg:col-span-3" name="addressLine2" type="text" placeholder="Address Line 2 (optional)" value={form.addressLine2} onChange={handleChange} />
            <input className="input" name="city" type="text" placeholder="City" value={form.city} onChange={handleChange} required />
            <input className="input" name="state" type="text" placeholder="State" value={form.state} onChange={handleChange} required />
            <input className="input" name="pincode" type="text" placeholder="Pincode" value={form.pincode} onChange={handleChange} required />
            <input className="input" name="country" type="text" placeholder="Country" value={form.country} onChange={handleChange} required />
          </div>
        </section>

        {/* Business Info */}
        <section>
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Business Verification</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <select className="input" name="businessType" value={form.businessType} onChange={handleChange} required>
              <option value="individual">Individual</option>
              <option value="company">Company</option>
              <option value="partnership">Partnership</option>
            </select>
            <input className="input" name="gstin" type="text" placeholder="GSTIN" value={form.gstin} onChange={handleChange} required />
            <input className="input" name="pan" type="text" placeholder="PAN Number" value={form.pan} onChange={handleChange} required />
          </div>
        </section>

        {/* Documents */}
        <section>
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Upload Verification Documents</h2>
          <input className="block w-full text-gray-600" name="documents" type="file" multiple onChange={e => setForm(f => ({ ...f, documents: Array.from(e.target.files) }))} required />
          <p className="text-xs text-gray-400 mt-1">
            Upload scans or photos of GST, PAN, Bank Proof, etc.
          </p>
        </section>

        <div className="text-center">
          <Button type="submit" loading={loading} className="w-full max-w-sm">Submit Application</Button>
        </div>
      </form>
    </div>
  )
}
