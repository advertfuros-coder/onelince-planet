'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import {
  FiArrowLeft,
  FiCamera,
  FiCheckCircle,
  FiAlertCircle,
  FiInfo,
  FiBox,
  FiZap,
  FiTrash2
} from 'react-icons/fi'
import { toast } from 'react-hot-toast'
import axios from 'axios'

function ReturnRequestContent() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const [order, setOrder] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Form State
  const [type, setType] = useState(searchParams.get('type') || 'return')
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [images, setImages] = useState([])
  const [uploading, setUploading] = useState(false)
  const [answers, setAnswers] = useState({
    sealBroken: 'no',
    tagsIntact: 'yes',
    itemUsed: 'no'
  })

  const QUESTIONS = [
    { id: 'sealBroken', label: 'Is the product seal broken?', options: ['yes', 'no'] },
    { id: 'tagsIntact', label: 'Are the original tags and labels still attached?', options: ['yes', 'no'] },
    { id: 'itemUsed', label: 'Has the item been used or worn?', options: ['yes', 'no'] }
  ]

  const REASONS = [
    "Defective/Functional issue",
    "Damaged on arrival",
    "Wrong item received",
    "Quality not as expected",
    "Missing parts/accessories",
    "Size/Fit issue",
    "Changed my mind"
  ]

  useEffect(() => {
    fetchOrder()
  }, [params.id])

  const fetchOrder = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get(`/api/customer/orders/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data.success) {
        setOrder(res.data.order)
        const prodId = searchParams.get('productId')
        const sku = searchParams.get('sku')
        const item = res.data.order.items.find(i =>
          i.product._id === prodId && (!sku || i.sku === sku)
        )
        setSelectedItem(item)
      }
    } catch (err) {
      toast.error("Failed to load order details")
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length + images.length > 5) {
      return toast.error("Max 5 images allowed")
    }

    setUploading(true)
    const formData = new FormData()
    files.forEach(file => formData.append('file', file))

    try {
      const token = localStorage.getItem('token')
      const res = await axios.post('/api/upload', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })
      if (res.data.success) {
        setImages(prev => [...prev, res.data.url])
      }
    } catch (err) {
      toast.error("Image upload failed")
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async () => {
    if (!reason) return toast.error("Please select a reason")
    if (!description || description.length < 10) return toast.error("Please provide a detailed description (min 10 chars)")
    if (images.length === 0) return toast.error("Please upload at least one photo as evidence")

    setSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      const payload = {
        orderId: order._id,
        items: [{
          productId: selectedItem.product._id,
          variantSku: selectedItem.sku,
          name: selectedItem.name,
          price: selectedItem.price,
          quantity: selectedItem.quantity,
          reason,
          type
        }],
        evidence: images,
        description: `
Condition Report:
- Seal Broken: ${answers.sealBroken}
- Tags Intact: ${answers.tagsIntact}
- Item Used: ${answers.itemUsed}

User Comments:
${description}
        `.trim()
      }

      const res = await axios.post('/api/returns', payload, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (res.data.success) {
        toast.success(`${type === 'return' ? 'Return' : 'Replacement'} request submitted!`)
        router.push(`/orders/${order._id}`)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit request")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  if (!selectedItem) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <FiAlertCircle size={48} className="text-red-500 mb-4" />
      <h2 className="text-xl font-bold">Item not found</h2>
      <button onClick={() => router.back()} className="mt-4 text-blue-600 font-bold">Go Back</button>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-50 px-4 py-4 backdrop-blur-md bg-white/80">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-full transition-all">
            <FiArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Request {type === 'return' ? 'Return' : 'Replacement'}</h1>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Order #{order.orderNumber || order._id.slice(-8)}</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4 space-y-4">
        {/* Product Card */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex gap-4">
          <div className="w-20 h-20 rounded-2xl bg-slate-50 border p-2 flex-shrink-0">
            <img src={selectedItem.images?.[0]} className="w-full h-full object-contain" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-slate-800 text-sm leading-tight">{selectedItem.name}</h3>
            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">
              {Object.entries(selectedItem.variant || {}).map(([k, v]) => `${k}:${v}`).join(', ') || 'Standard Item'}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm font-bold text-slate-900">AED {selectedItem.price}</span>
              <span className="text-[10px] font-bold text-slate-400">QTY: {selectedItem.quantity}</span>
            </div>
          </div>
        </div>

        {/* Reason Section */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FiInfo size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest">Reason for {type}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Select the best matching reason</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {REASONS.map((r) => (
              <button
                key={r}
                onClick={() => setReason(r)}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all text-left group ${reason === r ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-500/10' : 'bg-white border-slate-100 hover:border-slate-200'}`}
              >
                <span className={`text-sm font-bold ${reason === r ? 'text-blue-700' : 'text-slate-600'}`}>{r}</span>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${reason === r ? 'bg-blue-600 border-blue-600' : 'border-slate-200 group-hover:border-slate-300'}`}>
                  {reason === r && <FiCheckCircle className="text-white w-4 h-4" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Questionnaire Section */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <FiCheckCircle size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest">Condition Check</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Help us verify the product status</p>
            </div>
          </div>

          <div className="space-y-6">
            {QUESTIONS.map((q) => (
              <div key={q.id} className="flex flex-col gap-3">
                <label className="text-sm font-bold text-slate-700">{q.label}</label>
                <div className="flex gap-3">
                  {q.options.map(opt => (
                    <button
                      key={opt}
                      onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                      className={`flex-1 py-3 rounded-xl border font-bold text-xs uppercase tracking-widest transition-all ${answers[q.id] === opt ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200'}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Evidence Section */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <FiCamera size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest">Evidence & Details</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Proof helps sellers approve requests faster</p>
            </div>
          </div>

          <div className="space-y-6">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what happened... (e.g., box was opened, item won't turn on)"
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500 transition-all min-h-[120px] shadow-inner placeholder:text-slate-300"
            />

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {images.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-100 group">
                  <img src={url} className="w-full h-full object-cover" />
                  <button
                    onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FiTrash2 size={12} />
                  </button>
                </div>
              ))}
              {images.length < 5 && (
                <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-blue-300 transition-all text-slate-400 group">
                  <input type="file" className="hidden" multiple accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mb-2 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                    <FiCamera size={20} />
                  </div>
                  <span className="text-[8px] font-extrabold uppercase tracking-widest">{uploading ? 'Processing' : 'Add Proof'}</span>
                </label>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Action Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t z-50">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={handleSubmit}
            disabled={submitting || uploading}
            className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-bold text-xs tracking-widest uppercase transition-all shadow-xl shadow-blue-600/10 ${submitting ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white active:scale-[0.98] hover:bg-blue-700'}`}
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <FiSend className="mb-0.5" />
            )}
            <span>{submitting ? 'Processing Submission' : `Submit ${type} Request`}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ReturnRequestPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>}>
      <ReturnRequestContent />
    </Suspense>
  )
}

function FiSend(props) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      height="1em"
      width="1em"
      {...props}
    >
      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  );
}