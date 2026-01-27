'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import {
  Package,
  Tag,
  DollarSign,
  Database,
  Truck,
  ChevronRight,
  Plus,
  X,
  ChevronLeft,
  Camera,
  Info,
  CheckCircle2,
  AlertCircle,
  LayoutGrid,
  Zap,
  Box,
  BadgePercent,
  Target,
  ShoppingBag,
  Layers,
  Image as ImageIcon,
  Save,
  Trash2,
  ShieldCheck,
  Search
} from 'lucide-react'
import { useAuth } from '@/lib/context/AuthContext'
import { toast } from 'react-hot-toast'
import ImageUpload from '@/components/ui/ImageUpload'

const CATEGORIES = [
  { name: 'Electronics', icon: <Zap size={16} /> },
  { name: 'Fashion', icon: <Tag size={16} /> },
  { name: 'Home & Decor', icon: <LayoutGrid size={16} /> },
  { name: 'Beauty', icon: <Zap size={16} /> },
  { name: 'Books', icon: <Tag size={16} /> },
  { name: 'Sports', icon: <Target size={16} /> },
  { name: 'Others', icon: <ShoppingBag size={16} /> }
]

const InputField = ({ label, name, icon: Icon, ...props }) => (
  <div className="group space-y-2">
    <label className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-slate-500 group-focus-within:text-blue-600 transition-colors">
      {Icon && <Icon size={12} />}
      {label}
    </label>
    <div className="relative">
      <input
        name={name}
        className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-semibold text-slate-700 placeholder-slate-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all"
        {...props}
      />
    </div>
  </div>
)

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const { token } = useAuth()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [activeSection, setActiveSection] = useState('essentials')
  const [showVariants, setShowVariants] = useState(false)

  const [form, setForm] = useState({
    name: '',
    description: '',
    shortDescription: '',
    category: '',
    subCategory: '',
    brand: '',
    sku: '',
    basePrice: '',
    salePrice: '',
    costPrice: '',
    stock: '',
    lowStockThreshold: '10',
    trackInventory: true,
    weight: '',
    unit: 'kg', // kg | g | l | ml | units
    freeShipping: false,
    shippingFee: '',
    specifications: [{ key: '', value: '' }],
    images: [],
    options: [],
    variants: []
  })

  const [newOptionName, setNewOptionName] = useState('')
  const [activeOptionInputs, setActiveOptionInputs] = useState({})

  const formSections = [
    { id: 'essentials', label: '1. Product Info', icon: <Package size={18} /> },
    { id: 'pricing_stock', label: '2. Price & Stock', icon: <DollarSign size={18} /> },
    { id: 'variants', label: '3. Variations', icon: <Layers size={18} /> },
    { id: 'shipping', label: '4. Shipping', icon: <Truck size={18} /> },
    { id: 'specs', label: '5. Meta & Details', icon: <LayoutGrid size={18} /> },
    { id: 'review', label: '6. Quality Check', icon: <ShieldCheck size={18} /> }
  ]

  const [declaration, setDeclaration] = useState(false)

  useEffect(() => {
    if (token && params.id) {
      loadProduct()
    }
  }, [token, params.id])

  const loadProduct = async () => {
    try {
      const response = await axios.get(`/api/seller/products/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.data.success) {
        const p = response.data.product
        setForm({
          name: p.name || '',
          description: p.description || '',
          shortDescription: p.shortDescription || '',
          category: p.category || '',
          subCategory: p.subCategory || '',
          brand: p.brand || '',
          sku: p.sku || '',
          basePrice: p.pricing?.basePrice || '',
          salePrice: p.pricing?.salePrice || '',
          costPrice: p.pricing?.costPrice || '',
          stock: p.inventory?.stock || '',
          lowStockThreshold: p.inventory?.lowStockThreshold || '10',
          trackInventory: p.inventory?.trackInventory ?? true,
          weight: p.shipping?.weight || '',
          unit: p.shipping?.unit || 'kg',
          freeShipping: p.shipping?.freeShipping ?? false,
          shippingFee: p.shipping?.shippingFee || '',
          specifications: p.specifications?.length > 0 ? p.specifications : [{ key: '', value: '' }],
          images: p.images || [],
          options: p.options || [],
          variants: (p.variants || []).map(v => ({
            ...v,
            image: v.image || (v.imageIndex !== undefined && p.images[v.imageIndex] ? p.images[v.imageIndex].url : '')
          })),
          isDraft: p.isDraft || false,
          highlights: p.highlights || [''],
          keywords: p.keywords?.join(', ') || '',
          hsnCode: p.hsnCode || ''
        })
        if (p.variants?.length > 0) setShowVariants(true)
      }
    } catch (error) {
      toast.error('Failed to load product')
      console.error(error)
    } finally {
      setInitialLoading(false)
    }
  }

  const [hasLocalDraft, setHasLocalDraft] = useState(false)

  // -- 10s Auto Save Logic --
  useEffect(() => {
    const timer = setInterval(() => {
      if (form.name || form.category) {
        localStorage.setItem(`op_edit_draft_${params.id}`, JSON.stringify({
          form,
          activeSection,
          timestamp: Date.now()
        }))
      }
    }, 10000)
    return () => clearInterval(timer)
  }, [form, activeSection, params.id])

  // -- Check for local draft on mount --
  useEffect(() => {
    if (!params.id) return
    const saved = localStorage.getItem(`op_edit_draft_${params.id}`)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Date.now() - parsed.timestamp < 86400000) {
          setHasLocalDraft(true)
        }
      } catch (e) {
        localStorage.removeItem(`op_edit_draft_${params.id}`)
      }
    }
  }, [params.id])

  const restoreDraft = () => {
    const saved = localStorage.getItem(`op_edit_draft_${params.id}`)
    if (saved) {
      const parsed = JSON.parse(saved)
      setForm(parsed.form)
      setActiveSection(parsed.activeSection || 'essentials')
      setHasLocalDraft(false)
      toast.success('Local changes restored')
    }
  }

  const discardDraft = () => {
    localStorage.removeItem(`op_edit_draft_${params.id}`)
    setHasLocalDraft(false)
    toast('Local draft cleared', { icon: '🧹' })
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      const target = e.target
      if (target.tagName !== 'TEXTAREA') {
        e.preventDefault()
      }
    }
  }

  const handleSaveDraft = async () => {
    setLoading(true)
    try {
      const payload = {
        name: form.name,
        description: form.description,
        shortDescription: form.shortDescription,
        category: form.category || undefined,
        subCategory: form.subCategory,
        brand: form.brand,
        sku: form.sku || undefined,
        pricing: {
          basePrice: form.basePrice ? Number(form.basePrice) : undefined,
          salePrice: form.salePrice ? Number(form.salePrice) : undefined,
        },
        inventory: {
          stock: form.stock ? Number(form.stock) : 0,
          trackInventory: form.trackInventory
        },
        images: form.images,
        options: form.options,
        variants: form.variants.map(v => ({
          ...v,
          sku: v.sku || undefined,
          price: v.price ? Number(v.price) : undefined,
          stock: v.stock ? Number(v.stock) : 0,
        })),
        isDraft: true
      }

      const res = await axios.put(`/api/seller/products/${params.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data.success) {
        localStorage.removeItem(`op_edit_draft_${params.id}`)
        toast.success('Draft saved to server')
        router.push('/seller/products?status=draft')
      }
    } catch (err) {
      toast.error('Draft update failed')
    } finally {
      setLoading(false)
    }
  }

  // --- Variant Logic (Shared with New Product) ---

  const handleVariantImageUpload = async (variantIdx, file) => {
    const currentVariant = form.variants[variantIdx]
    if (currentVariant.images?.length >= 7) return toast.error('Max 7 images per variation')

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      })
      if (res.data.success) {
        const imageUrl = res.data.url
        let newImages = [...form.images]

        // 1. Add to global images if not already there
        if (!newImages.some(img => img.url === imageUrl)) {
          const newImg = { url: imageUrl, alt: form.name, isPrimary: newImages.length === 0 }
          newImages = [...newImages, newImg]
          setForm(prev => ({ ...prev, images: newImages }))
        }

        // 2. Assign to specific variant's gallery
        const newVariants = [...form.variants]
        if (!newVariants[variantIdx].images) newVariants[variantIdx].images = []
        newVariants[variantIdx].images = [...newVariants[variantIdx].images, imageUrl]

        // Also set the first one as lead for backward compatibility/preview
        newVariants[variantIdx].image = newVariants[variantIdx].images[0]
        newVariants[variantIdx].imageIndex = newImages.findIndex(img => img.url === newVariants[variantIdx].image)

        setForm(prev => ({ ...prev, variants: newVariants }))
        toast.success(`Slot ${newVariants[variantIdx].images.length}/7 occupied`)
      }
    } catch (err) {
      console.error(err)
      toast.error('Upload failed')
    }
  }

  const removeVariantImage = (variantIdx, imgIdx) => {
    const newVariants = [...form.variants]
    newVariants[variantIdx].images = newVariants[variantIdx].images.filter((_, i) => i !== imgIdx)
    newVariants[variantIdx].image = newVariants[variantIdx].images[0] || ''
    newVariants[variantIdx].imageIndex = form.images.findIndex(img => img.url === newVariants[variantIdx].image)
    setForm(prev => ({ ...prev, variants: newVariants }))
  }

  const [previewMode, setPreviewMode] = useState('desktop')

  const calculateHealth = () => {
    let score = 0
    if (form.name?.length > 20) score += 15
    if (form.description?.length > 100) score += 15
    if (form.images.length >= 3) score += 20
    if (form.highlights && form.highlights.filter(h => h.length > 5).length >= 3) score += 15
    if (form.category) score += 10
    if (form.sku) score += 10
    if (form.keywords?.length > 10) score += 15
    return Math.min(score, 100)
  }

  const getHealthChecklist = () => {
    const list = []
    if (form.name?.length < 20) list.push({ text: 'Make title longer (min 20 chars)', impact: '+15%' })
    if (form.description?.length < 100) list.push({ text: 'Detail your description', impact: '+15%' })
    if (form.images.length < 3) list.push({ text: 'Add at least 3 photos', impact: '+20%' })
    if (!form.highlights || form.highlights.filter(h => h.length > 5).length < 3) list.push({ text: 'Add 3+ key highlights', impact: '+15%' })
    if (!form.keywords || form.keywords.length < 10) list.push({ text: 'Add SEO keywords', impact: '+15%' })
    return list
  }

  const addOption = () => {
    if (!newOptionName) return toast.error('Enter option name (e.g. Color)')
    setForm(prev => {
      const updatedOptions = [...prev.options, { name: newOptionName, values: [] }]
      return { ...prev, options: updatedOptions }
    })
    setNewOptionName('')
  }

  const removeOption = (index) => {
    const newOptions = form.options.filter((_, i) => i !== index)
    setForm(prev => ({ ...prev, options: newOptions }))
    generateVariants(newOptions)
  }

  const addOptionValue = (optionIndex, value) => {
    if (!value) return
    const newOptions = form.options.map((opt, i) =>
      i === optionIndex ? { ...opt, values: [...opt.values, value] } : opt
    )

    setForm(prev => ({ ...prev, options: newOptions }))
    generateVariants(newOptions)

    // Clear input for this option
    const optionName = form.options[optionIndex].name
    setActiveOptionInputs(prev => ({ ...prev, [optionName]: '' }))
  }

  const removeOptionValue = (optionIndex, valueIndex) => {
    const newOptions = form.options.map((opt, i) => {
      if (i === optionIndex) {
        return { ...opt, values: opt.values.filter((_, vi) => vi !== valueIndex) }
      }
      return opt
    })
    setForm(prev => ({ ...prev, options: newOptions }))
    generateVariants(newOptions)
  }

  const generateVariants = (options = form.options) => {
    if (options.length === 0) {
      setForm(prev => ({ ...prev, variants: [] }))
      return
    }

    const validOptions = options.filter(opt => opt.values.length > 0)
    if (validOptions.length === 0) {
      setForm(prev => ({ ...prev, variants: [] }))
      return
    }

    const combine = (index, currentAttributes) => {
      if (index === validOptions.length) {
        return [currentAttributes]
      }
      const option = validOptions[index]
      let combinations = []
      for (const value of option.values) {
        combinations = [
          ...combinations,
          ...combine(index + 1, { ...currentAttributes, [option.name]: value })
        ]
      }
      return combinations
    }

    const combinations = combine(0, {})

    const newVariants = combinations.map(combo => {
      const name = Object.values(combo).join(' / ')
      const existing = form.variants.find(v => {
        const vAttrs = v.attributes instanceof Map ? Object.fromEntries(v.attributes) : v.attributes;
        return JSON.stringify(vAttrs) === JSON.stringify(combo)
      })

      return {
        name: name,
        attributes: combo,
        price: existing?.price || form.basePrice || 0,
        stock: existing?.stock || 0,
        sku: existing?.sku || `${form.sku || 'SKU'}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
        image: existing?.image || '',
        imageIndex: existing?.imageIndex ?? -1,
        images: existing?.images || []
      }
    })

    setForm(prev => ({ ...prev, variants: newVariants }))
  }


  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  function handleSpecChange(index, field, value) {
    const newSpecs = [...form.specifications]
    newSpecs[index][field] = value
    setForm(prev => ({ ...prev, specifications: newSpecs }))
  }

  function addSpecification() {
    setForm(prev => ({
      ...prev,
      specifications: [...prev.specifications, { key: '', value: '' }]
    }))
  }

  function removeSpecification(index) {
    setForm(prev => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index)
    }))
  }

  async function handleSubmit(e) {
    if (!declaration) return toast.error('Check: Please confirm listing accuracy')
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        name: form.name,
        description: form.description,
        shortDescription: form.shortDescription,
        category: form.category,
        subCategory: form.subCategory,
        brand: form.brand,
        sku: form.sku,
        pricing: {
          basePrice: Number(form.basePrice),
          salePrice: form.salePrice ? Number(form.salePrice) : undefined,
          costPrice: form.costPrice ? Number(form.costPrice) : undefined
        },
        inventory: {
          stock: Number(form.stock),
          lowStockThreshold: Number(form.lowStockThreshold),
          trackInventory: form.trackInventory
        },
        shipping: {
          weight: form.weight ? Number(form.weight) : undefined,
          unit: form.unit,
          freeShipping: form.freeShipping,
          shippingFee: form.shippingFee ? Number(form.shippingFee) : undefined
        },
        specifications: form.specifications.filter(spec => spec.key && spec.value),
        images: form.images,
        options: form.options,
        variants: form.variants,
        highlights: form.highlights.filter(h => h.trim()),
        keywords: form.keywords.split(',').map(k => k.trim()).filter(k => k),
        hsnCode: form.hsnCode,
        isDraft: false // Final publish sets it to not a draft
      }

      const response = await axios.put(`/api/seller/products/${params.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data.success) {
        toast.success('Product Updated Successfully')
        router.push('/seller/products')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update Failed')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone and it will be removed from your store immediately.')) return
    setLoading(true)
    try {
      const response = await axios.delete(`/api/seller/products/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.data.success) {
        toast.success('Product Deleted')
        router.push('/seller/products')
      }
    } catch (error) {
      toast.error('Deletion Failed')
    } finally {
      setLoading(false)
    }
  }



  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Loading Product Details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20 max-w-[1200px] mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row gap-10"
      >
        {/* Left: Navigation & Form */}
        <div className="flex-1 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-tighter text-slate-400 hover:text-slate-900 transition-colors mb-2"
              >
                <ChevronLeft size={14} /> Back to Products
              </button>
              <h1 className="text-4xl font-semibold text-slate-900 tracking-tight">Edit Product <span className="text-blue-600">.</span></h1>
              <p className="text-slate-400 font-semibold text-sm mt-1">Update your product information and stock levels.</p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.push('/seller/products')}
                className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-400 rounded-2xl text-[10px] font-semibold uppercase tracking-widest hover:border-slate-900 hover:text-slate-900 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveDraft}
                className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-semibold uppercase tracking-widest hover:bg-slate-200 transition-all"
              >
                <Save size={14} /> Update Draft
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-6 py-3 bg-rose-50 text-rose-600 rounded-2xl text-[10px] font-semibold uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-sm"
              >
                <Trash2 size={14} /> Delete Product
              </button>
            </div>
          </div>

          {hasLocalDraft && (
            <div className="bg-blue-600 rounded-3xl p-6 text-white flex items-center justify-between gap-6 shadow-xl shadow-blue-500/30">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Database size={20} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest">Local Session Found</p>
                  <p className="text-[10px] font-semibold text-blue-100 uppercase mt-0.5">We found unsaved local changes. Would you like to restore them?</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={restoreDraft} className="px-6 py-2.5 bg-white text-blue-600 rounded-xl text-[10px] font-semibold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">Restore</button>
                <button onClick={discardDraft} className="px-6 py-2.5 bg-blue-700 text-white rounded-xl text-[10px] font-semibold uppercase tracking-widest hover:bg-blue-800 transition-all">Discard</button>
              </div>
            </div>
          )}

          {/* Stepper Navigation */}
          <div className="flex bg-white/50 backdrop-blur-md p-2 rounded-3xl border border-slate-100 shadow-sm overflow-x-auto no-scrollbar scroll-smooth">
            {formSections.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveSection(s.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-semibold uppercase tracking-widest transition-all shrink-0 ${activeSection === s.id ? 'bg-slate-900 text-white shadow-xl translate-y-[-2px]' : 'text-slate-400 hover:text-slate-700'}`}
              >
                {s.icon}
                {s.label}
              </button>
            ))}
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-6">
            <AnimatePresence mode="wait">
              {activeSection === 'essentials' && (
                <motion.div
                  key="essentials"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-xl shadow-slate-200/20 space-y-8">
                    <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-widest">Basics</h3>
                    <div className="space-y-6">
                      <InputField
                        label="Product Name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="e.g., Apple iPhone 15 Pro"
                        required
                      />

                      <div className="grid grid-cols-2 gap-6">
                        <InputField label="Brand" name="brand" value={form.brand} onChange={handleChange} placeholder="e.g., Apple" />
                        <InputField label="SKU" name="sku" value={form.sku} onChange={handleChange} disabled />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Category</label>
                        <div className="grid grid-cols-3 gap-3">
                          {CATEGORIES.map(cat => (
                            <button
                              type="button"
                              key={cat.name}
                              onClick={() => setForm(f => ({ ...f, category: cat.name }))}
                              className={`py-3 rounded-2xl text-[11px] font-semibold uppercase tracking-widest border transition-all ${form.category === cat.name ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-blue-200'}`}
                            >
                              {cat.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Description</label>
                        <textarea
                          name="description"
                          value={form.description}
                          onChange={handleChange}
                          rows={4}
                          className="w-full bg-slate-50/50 border border-slate-100 rounded-3xl px-6 py-5 text-sm font-semibold text-slate-700 placeholder-slate-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all resize-none"
                          placeholder="Tell customers about your product..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-xl shadow-slate-200/20">
                    <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-widest mb-2">Product Imagery</h3>
                    <p className="text-[10px] font-semibold text-slate-400 mb-6 uppercase tracking-wider">Upload high-quality photos. Drag to reorder. The first image is your cover.</p>
                    <ImageUpload
                      images={form.images}
                      token={token}
                      onChange={(imgs) => setForm(f => ({ ...f, images: imgs }))}
                    />
                  </div>
                </motion.div>
              )}

              {activeSection === 'pricing_stock' && (
                <motion.div
                  key="pricing_stock"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-xl shadow-slate-200/20 space-y-8">
                    <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-widest">Pricing</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <InputField label="Base Price (AED)" name="basePrice" type="number" value={form.basePrice} onChange={handleChange} icon={DollarSign} required />
                      <InputField label="Selling Price (Discounted)" name="salePrice" type="number" value={form.salePrice} onChange={handleChange} icon={BadgePercent} />
                    </div>
                  </div>

                  <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-xl shadow-slate-200/20 space-y-8">
                    <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-widest">Stock Management</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <InputField label="Current Stock Level" name="stock" type="number" value={form.stock} onChange={handleChange} icon={Box} required={form.variants.length === 0} disabled={form.variants.length > 0} placeholder={form.variants.length > 0 ? "Managed by Variations" : ""} />
                      <InputField label="Low Stock Alert" name="lowStockThreshold" type="number" value={form.lowStockThreshold} onChange={handleChange} icon={AlertCircle} />
                    </div>
                    <label className="flex items-center gap-4 cursor-pointer group bg-slate-50 p-6 rounded-3xl border border-slate-100 hover:border-blue-200 transition-all">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${form.trackInventory ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                        <Zap size={20} className={form.trackInventory ? 'animate-pulse' : ''} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Track Stock Automatically</p>
                        <p className="text-[10px] font-semibold text-slate-400">Keep inventory accurate across the store.</p>
                      </div>
                      <input type="checkbox" name="trackInventory" checked={form.trackInventory} onChange={handleChange} className="hidden" />
                      <div className={`w-10 h-6 rounded-full relative transition-all ${form.trackInventory ? 'bg-blue-600' : 'bg-slate-300'}`}>
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${form.trackInventory ? 'right-1' : 'left-1'}`} />
                      </div>
                    </label>
                  </div>
                </motion.div>
              )}

              {activeSection === 'variants' && (
                <motion.div
                  key="variants"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-xl shadow-slate-200/20 space-y-8">
                    <div className="flex items-center justify-between bg-slate-50 p-6 rounded-3xl border border-slate-100">
                      <div>
                        <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-widest">Does this have variations?</h4>
                        <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mt-1">Like multiple colors, sizes, or models.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowVariants(!showVariants)}
                        className={`w-14 h-8 rounded-full transition-all relative ${showVariants ? 'bg-blue-600' : 'bg-slate-200'}`}
                      >
                        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-sm ${showVariants ? 'right-1' : 'left-1'}`} />
                      </button>
                    </div>

                    {showVariants && (
                      <div className="space-y-8 pt-4">
                        <div className="space-y-6 border-b border-slate-100 pb-8">
                          <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Setup Options</h3>
                            <button type="button" onClick={() => generateVariants()} className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-[10px] font-semibold uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all border border-blue-100">
                              Update Variations
                            </button>
                          </div>

                          <div className="flex items-end gap-4">
                            <div className="flex-1">
                              <InputField
                                label="New Option Type"
                                value={newOptionName}
                                onChange={(e) => setNewOptionName(e.target.value)}
                                placeholder="e.g. Color, Size"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={addOption}
                              className="h-[52px] px-8 bg-slate-900 text-white rounded-2xl text-[10px] font-semibold uppercase tracking-widest hover:bg-black transition-all"
                            >
                              Add
                            </button>
                          </div>

                          <div className="space-y-4">
                            {form.options.map((option, idx) => (
                              <div key={idx} className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                <div className="flex items-center justify-between mb-4">
                                  <h4 className="font-semibold text-slate-900 uppercase tracking-widest text-xs">{option.name}</h4>
                                  <button type="button" onClick={() => removeOption(idx)} className="text-rose-500 hover:text-rose-600"><X size={14} /></button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {option.values.map((val, vIdx) => (
                                    <span key={vIdx} className="bg-white border border-slate-200 px-3 py-1 rounded-full text-[10px] font-semibold text-slate-600 flex items-center gap-2 shadow-sm">
                                      {val}
                                      <button type="button" onClick={() => removeOptionValue(idx, vIdx)} className="hover:text-rose-500"><X size={10} /></button>
                                    </span>
                                  ))}
                                  <div className="flex items-center gap-2 min-w-[120px]">
                                    <input
                                      className="bg-transparent border-b border-slate-300 px-2 py-1 text-xs font-semibold focus:border-blue-500 outline-none w-20"
                                      placeholder="New value"
                                      value={activeOptionInputs[option.name] || ''}
                                      onChange={(e) => setActiveOptionInputs(prev => ({ ...prev, [option.name]: e.target.value }))}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          e.preventDefault();
                                          addOptionValue(idx, activeOptionInputs[option.name]);
                                        }
                                      }}
                                    />
                                    <button type="button" onClick={() => addOptionValue(idx, activeOptionInputs[option.name])} className="text-slate-400 hover:text-blue-600 transition-colors">
                                      <Plus size={14} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Simplified Variant Manager */}
                        {form.variants.length > 0 && (
                          <div className="space-y-6">
                            <div className="flex items-center justify-between">
                              <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Variation Manager ({form.variants.length})</h3>
                              <button 
                                type="button"
                                onClick={() => {
                                  const newVariants = form.variants.map(v => ({
                                    ...v,
                                    price: form.basePrice || v.price,
                                    stock: form.stock || v.stock
                                  }));
                                  setForm({ ...form, variants: newVariants });
                                  toast.success('Synced with base price/stock');
                                }}
                                className="text-[9px] font-bold text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-colors bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100"
                              >
                                Sync Base Details
                              </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {form.variants.map((variant, idx) => (
                                <div key={idx} className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all group">
                                  <div className="flex items-start justify-between mb-6">
                                    <div>
                                      <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md uppercase tracking-tighter mb-2 inline-block">Variation #{idx + 1}</span>
                                      <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{variant.name}</h4>
                                      <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">{variant.sku}</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                      <Layers size={20} />
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="space-y-1.5">
                                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Price (AED)</label>
                                      <input
                                        type="number"
                                        value={variant.price}
                                        onChange={(e) => {
                                          const v = [...form.variants];
                                          v[idx].price = Number(e.target.value);
                                          setForm({ ...form, variants: v });
                                        }}
                                        className="w-full bg-slate-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                                      />
                                    </div>
                                    <div className="space-y-1.5">
                                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Stock</label>
                                      <input
                                        type="number"
                                        value={variant.stock}
                                        onChange={(e) => {
                                          const v = [...form.variants];
                                          v[idx].stock = Number(e.target.value);
                                          setForm({ ...form, variants: v });
                                        }}
                                        className="w-full bg-slate-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                                      />
                                    </div>
                                  </div>

                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Variant Photos</label>
                                      <span className="text-[8px] font-extrabold text-blue-500 uppercase">{variant.images?.length || 0}/7</span>
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-2.5">
                                      {variant.images?.map((img, imgIdx) => (
                                        <div key={imgIdx} className="relative group/photo w-14 h-14">
                                          <img src={img} className="w-full h-full object-cover rounded-xl border-2 border-slate-50 shadow-sm" />
                                          <button
                                            type="button"
                                            onClick={() => removeVariantImage(idx, imgIdx)}
                                            className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white rounded-full p-1 opacity-100 md:opacity-0 group-hover/photo:opacity-100 transition-all hover:scale-110 shadow-lg z-10"
                                          >
                                            <X size={10} />
                                          </button>
                                          {imgIdx === 0 && (
                                            <div className="absolute inset-x-0 bottom-0 bg-blue-600/80 text-white text-[6px] font-bold uppercase py-0.5 text-center rounded-b-xl">Lead</div>
                                          )}
                                        </div>
                                      ))}

                                      {(!variant.images || variant.images.length < 7) && (
                                        <label className="w-14 h-14 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group/upload">
                                          <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => handleVariantImageUpload(idx, e.target.files[0])}
                                          />
                                          <Camera size={16} className="text-slate-300 group-hover/upload:text-blue-500 transition-all" />
                                          <span className="text-[6px] font-bold text-slate-400 group-hover/upload:text-blue-500 mt-1 uppercase">Add</span>
                                        </label>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {!showVariants && (
                      <div className="py-24 text-center space-y-5">
                        <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto text-slate-300 transform -rotate-12 border border-slate-100">
                          <Layers size={40} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-base font-semibold text-slate-900 uppercase tracking-widest">Single Item Flow</h4>
                          <p className="text-[10px] font-semibold text-slate-400 max-w-xs mx-auto uppercase leading-relaxed tracking-widest">Perfect for simple products without multiple choices like size or color.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeSection === 'shipping' && (
                <motion.div
                  key="shipping"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-xl shadow-slate-200/20 space-y-8"
                >
                  <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-widest">Delivery Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="group space-y-2">
                      <label className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-slate-500 group-focus-within:text-blue-600 transition-colors">
                        <Truck size={12} />
                        Weight / Volume
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          name="weight"
                          value={form.weight}
                          onChange={handleChange}
                          placeholder="e.g. 500"
                          className="flex-1 bg-slate-50/50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-semibold text-slate-700 placeholder-slate-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all"
                        />
                        <select
                          name="unit"
                          value={form.unit}
                          onChange={handleChange}
                          className="w-24 bg-slate-50/50 border border-slate-100 rounded-2xl px-3 py-3.5 text-sm font-semibold text-slate-700 outline-none focus:bg-white focus:border-blue-500 transition-all cursor-pointer"
                        >
                          <option value="kg">kg</option>
                          <option value="g">g</option>
                          <option value="l">l</option>
                          <option value="ml">ml</option>
                          <option value="units">units</option>
                        </select>
                      </div>
                    </div>
                    <InputField label="Shipping Fee (AED)" name="shippingFee" type="number" value={form.shippingFee} onChange={handleChange} icon={DollarSign} disabled={form.freeShipping} />
                  </div>
                  <label className="flex items-center gap-4 cursor-pointer group bg-slate-50 p-6 rounded-3xl border border-slate-100 hover:border-blue-200 transition-all">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${form.freeShipping ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                      <Truck size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Free Shipping</p>
                      <p className="text-[10px] font-semibold text-slate-400">Offer this product with zero shipping cost.</p>
                    </div>
                    <input type="checkbox" name="freeShipping" checked={form.freeShipping} onChange={handleChange} className="hidden" />
                    <div className={`w-10 h-6 rounded-full relative transition-all ${form.freeShipping ? 'bg-green-600' : 'bg-slate-300'}`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${form.freeShipping ? 'right-1' : 'left-1'}`} />
                    </div>
                  </label>
                </motion.div>
              )}

              {activeSection === 'specs' && (
                <motion.div
                  key="specs"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-xl shadow-slate-200/20 space-y-12"
                >
                  {/* Highlights Section */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                          <Target size={16} className="text-blue-600" /> Key Feature Highlights
                        </h3>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest leading-relaxed">Add high-impact bullet points to boost conversion</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, highlights: [...prev.highlights, ''] }))}
                        className="px-6 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-semibold uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all"
                      >
                        Add Point
                      </button>
                    </div>
                    <div className="grid gap-3">
                      {form.highlights.map((h, i) => (
                        <div key={i} className="group flex gap-2">
                          <input
                            value={h}
                            onChange={(e) => {
                              const newH = [...form.highlights]
                              newH[i] = e.target.value
                              setForm({ ...form, highlights: newH })
                            }}
                            placeholder="e.g. 48-hour Battery Life with Pro-charge Technology"
                            className="flex-1 bg-slate-50/50 border border-slate-100 rounded-2xl px-6 py-4 text-xs font-semibold focus:bg-white focus:border-blue-500 transition-all outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setForm(prev => ({ ...prev, highlights: prev.highlights.filter((_, idx) => idx !== i) }))}
                            className="w-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Search Engine Optimization */}
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                        <Search size={16} className="text-blue-600" /> Search Intelligence
                      </h3>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Hidden keywords to improve global discoverability</p>
                    </div>
                    <div className="p-8 bg-slate-900 rounded-[2rem] space-y-4">
                      <label className="text-[9px] font-semibold text-slate-500 uppercase tracking-[0.2em]">Backend Search Tags</label>
                      <textarea
                        value={form.keywords}
                        onChange={(e) => setForm({ ...form, keywords: e.target.value })}
                        placeholder="e.g. wireless, bluetooth, noise cancelling, audiophile, luxury"
                        rows={3}
                        className="w-full bg-white/5 border border-blue-500/10 rounded-2xl px-6 py-4 text-xs font-semibold text-white placeholder-slate-600 focus:bg-white/10 focus:border-blue-500 transition-all outline-none"
                      />
                      <p className="text-[8px] font-semibold text-slate-600 uppercase tracking-widest">Separate with commas.</p>
                    </div>
                  </div>

                  {/* Technical Parameters */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                          <LayoutGrid size={16} className="text-blue-600" /> Technical Parameters
                        </h3>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest leading-relaxed">Detailed specifications index</p>
                      </div>
                      <button
                        type="button"
                        onClick={addSpecification}
                        className="px-6 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-semibold uppercase tracking-widest hover:bg-md-600 transition-all"
                      >
                        Add Spec
                      </button>
                    </div>

                    <div className="space-y-4">
                      {form.specifications.map((spec, index) => (
                        <div key={index} className="flex gap-4 group">
                          <input
                            placeholder="Feature"
                            value={spec.key}
                            onChange={(e) => updateSpecification(index, 'key', e.target.value)}
                            className="flex-1 bg-slate-50/50 border border-slate-100 rounded-2xl px-5 py-3.5 text-xs font-semibold focus:bg-white focus:border-blue-500 outline-none transition-all"
                          />
                          <input
                            placeholder="Value"
                            value={spec.value}
                            onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                            className="flex-1 bg-slate-50/50 border border-slate-100 rounded-2xl px-5 py-3.5 text-xs font-semibold focus:bg-white focus:border-blue-500 outline-none transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => removeSpecification(index)}
                            className="p-3 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeSection === 'review' && (
                <motion.div
                  key="review"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-xl shadow-slate-200/20 space-y-10">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="text-xl font-semibold text-slate-900 uppercase tracking-tighter">Listing Health Review</h3>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Improve your listing for better sales</p>
                      </div>
                      <div className="flex items-center gap-6 bg-slate-50 px-8 py-5 rounded-[2rem] border border-slate-100 relative group overflow-hidden">
                        <div className="absolute inset-0 bg-blue-600/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                        <div className="text-right relative z-10">
                          <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">Health Score</p>
                          <p className={`text-3xl font-semibold ${calculateHealth() > 80 ? 'text-emerald-500' : 'text-blue-600'}`}>
                            {calculateHealth()}%
                          </p>
                        </div>
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl relative z-10 ${calculateHealth() > 80 ? 'bg-emerald-500 shadow-emerald-200' : 'bg-blue-600 shadow-blue-200'}`}>
                          <ShieldCheck size={28} />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Health Checklist */}
                      <div className="space-y-6">
                        <h4 className="text-[11px] font-semibold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                          <Zap size={14} className="text-amber-500" /> Improvement Tips
                        </h4>
                        <div className="space-y-3">
                          {getHealthChecklist().length > 0 ? (
                            getHealthChecklist().map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:border-blue-500 transition-all">
                                <div className="flex items-center gap-3">
                                  <div className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-blue-500 transition-colors" />
                                  <span className="text-xs font-semibold text-slate-600">{item.text}</span>
                                </div>
                                <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{item.impact}</span>
                              </div>
                            ))
                          ) : (
                            <div className="p-10 text-center bg-emerald-50 rounded-[2rem] border border-emerald-100 space-y-3">
                              <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white mx-auto shadow-lg shadow-emerald-200">
                                <CheckCircle2 size={24} />
                              </div>
                              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest leading-relaxed">Perfect Listing Achieved<br /><span className="text-[10px] opacity-60">Your product is ready for customers</span></p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Summary View */}
                      <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white space-y-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-3xl -mr-16 -mt-16" />
                        <h4 className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 relative z-10">Product Summary</h4>

                        <div className="space-y-6 relative z-10">
                          <div className="flex justify-between items-end border-b border-white/5 pb-4">
                            <div>
                              <p className="text-[10px] font-semibold text-slate-500 uppercase">Information</p>
                              <p className="text-sm font-semibold mt-1 uppercase tracking-tight">Complete</p>
                            </div>
                            <CheckCircle2 className="text-emerald-400" size={18} />
                          </div>
                          <div className="flex justify-between items-end border-b border-white/5 pb-4">
                            <div>
                              <p className="text-[10px] font-semibold text-slate-500 uppercase">Variations</p>
                              <p className="text-sm font-semibold mt-1 uppercase tracking-tight">{form.variants.length} Options</p>
                            </div>
                            <Layers className="text-blue-400" size={18} />
                          </div>
                          <div className="flex justify-between items-end border-b border-white/5 pb-4">
                            <div>
                              <p className="text-[10px] font-semibold text-slate-500 uppercase">Shipping</p>
                              <p className="text-sm font-semibold mt-1 uppercase tracking-tight">{form.freeShipping ? 'Free Shipping' : 'Paid Shipping'}</p>
                            </div>
                            <Truck className="text-amber-400" size={18} />
                          </div>
                        </div>

                        <div className="pt-4 relative z-10">
                          <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
                            <div className="flex items-center gap-3">
                              {form.images[0]?.url && <img src={form.images[0].url} className="w-10 h-10 object-cover rounded-lg border border-white/10" />}
                              <div>
                                <p className="text-[9px] font-semibold text-slate-500 uppercase">Main Image</p>
                                <p className="text-xs font-semibold truncate max-w-[150px]">{form.name || 'Product Name'}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Declaration */}
                    <div className="pt-6 border-t border-slate-100">
                      <label
                        className={`flex items-start gap-4 p-6 rounded-3xl border transition-all cursor-pointer group ${declaration ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-100 hover:border-blue-200'}`}
                        onClick={() => setDeclaration(!declaration)}
                      >
                        <div className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${declaration ? 'bg-green-600 border-green-600 text-white' : 'border-slate-300 bg-white group-hover:border-blue-500'}`}>
                          {declaration && <CheckCircle2 size={14} />}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-slate-900 uppercase tracking-wide">Accuracy Declaration</p>
                          <p className="text-[10px] font-semibold text-slate-500 mt-1 uppercase leading-relaxed">I certify that all updates made to this listing, including variants and photos, are correct. I understand these changes may undergo re-verification by the quality team.</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-4 pt-4">
              {activeSection !== 'review' ? (
                <button
                  type="button"
                  onClick={() => {
                    const currentIdx = formSections.findIndex(s => s.id === activeSection)
                    if (currentIdx < formSections.length - 1) {
                      setActiveSection(formSections[currentIdx + 1].id)
                    }
                  }}
                  className="flex-1 bg-slate-900 text-white py-5 rounded-[2rem] text-xs font-semibold uppercase tracking-widest shadow-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Save & Continue
                  <ChevronRight size={18} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading || !declaration}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-5 rounded-[2rem] text-sm font-semibold uppercase tracking-widest shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale hover:shadow-blue-500/20 shadow-xl transition-all"
                >
                  {loading ? 'Synchronizing Updates...' : 'Publish Changes'}
                  {!loading && <ShieldCheck size={18} />}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right: Live Preview & Preview Controls */}
        <div className="lg:w-[420px] space-y-6">
          <div className="sticky top-28 space-y-6">
            {/* Display Mode Control */}
            <div className="bg-white/80 backdrop-blur-md rounded-[2rem] border border-slate-100 p-2 flex items-center gap-2 shadow-xl shadow-slate-200/20">
              <button
                onClick={() => setPreviewMode('desktop')}
                className={`flex-1 py-3 px-4 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-widest transition-all ${previewMode === 'desktop' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                <Box size={14} /> Desktop View
              </button>
              <button
                onClick={() => setPreviewMode('mobile')}
                className={`flex-1 py-3 px-4 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-widest transition-all ${previewMode === 'mobile' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                <Target size={14} /> Mobile View
              </button>
            </div>

            <div className={`transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${previewMode === 'mobile' ? 'w-[320px] mx-auto scale-95 border-[12px] border-slate-950 rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] h-[650px] overflow-hidden' : 'w-full'}`}>
              <div className={`bg-slate-900 h-full text-white border border-white/10 relative overflow-hidden group ${previewMode === 'mobile' ? 'rounded-none' : 'rounded-[3rem] p-8'}`}>
                {/* Mobile UI Overlay */}
                {previewMode === 'mobile' && (
                  <div className="absolute top-0 left-0 right-0 h-8 flex justify-center items-end py-1 z-50">
                    <div className="w-20 h-5 bg-black rounded-b-2xl" />
                  </div>
                )}

                <div className={`relative z-10 space-y-6 ${previewMode === 'mobile' ? 'p-6 pt-12' : ''}`}>
                  <div className={`w-full aspect-square bg-white rounded-[2rem] flex items-center justify-center overflow-hidden shadow-2xl ${previewMode === 'mobile' ? 'rounded-[1.5rem]' : ''}`}>
                    {form.images[0]?.url ? <img src={form.images[0].url} className="w-full h-full object-cover" /> : <Camera className="text-slate-200" size={previewMode === 'mobile' ? 32 : 48} />}
                  </div>
                  <div>
                    <span className="bg-blue-600 text-[9px] font-semibold px-3 py-1 rounded-full uppercase">{form.category || 'Category'}</span>
                    <h2 className={`${previewMode === 'mobile' ? 'text-lg' : 'text-xl'} font-semibold mt-3 truncate`}>{form.name || 'Product Name'}</h2>
                  </div>

                  {/* Feature Highlights Preview */}
                  {form.highlights?.some(h => h) && (
                    <div className="space-y-2 border-t border-white/10 pt-4">
                      {form.highlights.filter(h => h).slice(0, 3).map((h, i) => (
                        <div key={i} className="flex gap-2 items-start">
                          <CheckCircle2 size={12} className="text-emerald-400 shrink-0 mt-0.5" />
                          <p className="text-[10px] text-slate-300 leading-tight">{h}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t border-white/10 pt-6">
                    <div>
                      <p className="text-[10px] font-semibold text-slate-500">Price</p>
                      <p className={`${previewMode === 'mobile' ? 'text-xl' : 'text-2xl'} font-semibold`}>AED {form.basePrice || '--'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Stock</p>
                      <p className={`${previewMode === 'mobile' ? 'text-lg' : 'text-xl'} font-semibold mt-1 text-emerald-400`}>
                        {form.variants.length > 0
                          ? form.variants.reduce((a, b) => a + Number(b.stock), 0)
                          : (form.stock || '0')}
                        <span className="text-[10px] text-slate-500"> Units</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
