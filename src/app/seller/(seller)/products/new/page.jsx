'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
  Heart,
  Gift,
  Layers,
  Image as ImageIcon,
  ShieldCheck,
  Save,
  Search
} from 'lucide-react'
import { useAuth } from '@/lib/context/AuthContext'
import { toast } from 'react-hot-toast'
import ImageUpload from '@/components/ui/ImageUpload'
import CategorySelector from '@/components/seller/CategorySelector'

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

export default function AddProductPage() {
  const router = useRouter()
  const { token } = useAuth()
  const [loading, setLoading] = useState(false)
  const [activeSection, setActiveSection] = useState('essentials')

  const [form, setForm] = useState({
    name: '',
    description: '',
    shortDescription: '',
    category: '', // Final category name (for display/backwards compat)
    categoryId: '', // MongoDB ObjectId of selected category
    categoryPath: '', // Full path (e.g., "fashion/men/t-shirts")
    subCategory: '', // Deprecated but kept for backwards compat
    brand: '',
    sku: '',
    basePrice: '',
    salePrice: '',
    costPrice: '',
    stock: '',
    lowStockThreshold: '10',
    trackInventory: true,
    weight: '',
    freeShipping: false,
    shippingFee: '',
    specifications: [{ key: '', value: '' }],
    images: [],
    highlights: [''], // Key features
    keywords: '', // SEO backend terms
    hsnCode: '',
    // Variant state
    options: [], // [{ name: 'Color', values: ['Red', 'Blue'] }]
    variants: [] // [{ name: 'Red - S', price: 100, stock: 10, ... }]
  })

  const [previewMode, setPreviewMode] = useState('desktop') // 'desktop' or 'mobile'

  // Temporary state for adding options
  const [newOptionName, setNewOptionName] = useState('')
  const [activeOptionInputs, setActiveOptionInputs] = useState({}) // { optionIdx: 'inputValue' }

  const formSections = [
    { id: 'essentials', label: '1. Product Info', icon: <Package size={18} /> },
    { id: 'pricing_stock', label: '2. Price & Stock', icon: <DollarSign size={18} /> },
    { id: 'variants', label: '3. Variations', icon: <Layers size={18} /> },
    { id: 'shipping', label: '4. Shipping', icon: <Truck size={18} /> },
    { id: 'specs', label: '5. Meta & Details', icon: <LayoutGrid size={18} /> },
    { id: 'review', label: '6. Quality Check', icon: <ShieldCheck size={18} /> }
  ]

  const [declaration, setDeclaration] = useState(false)
  const [hasLocalDraft, setHasLocalDraft] = useState(false)

  // -- 10s Auto Save Logic --
  useEffect(() => {
    const timer = setInterval(() => {
      if (form.name || form.category || form.images.length > 0) {
        localStorage.setItem('op_product_new_draft', JSON.stringify({
          form,
          activeSection,
          timestamp: Date.now()
        }))
      }
    }, 10000)
    return () => clearInterval(timer)
  }, [form, activeSection])

  // -- Check for local draft on mount --
  useEffect(() => {
    const saved = localStorage.getItem('op_product_new_draft')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // If it's less than 24 hours old, show resume option
        if (Date.now() - parsed.timestamp < 86400000) {
          setHasLocalDraft(true)
        }
      } catch (e) {
        localStorage.removeItem('op_product_new_draft')
      }
    }
  }, [])

  const restoreDraft = () => {
    const saved = localStorage.getItem('op_product_new_draft')
    if (saved) {
      const parsed = JSON.parse(saved)
      setForm(parsed.form)
      setActiveSection(parsed.activeSection || 'essentials')
      setHasLocalDraft(false)
      toast.success('Work-in-progress restored')
    }
  }

  const discardDraft = () => {
    localStorage.removeItem('op_product_new_draft')
    setHasLocalDraft(false)
    toast('Draft cleared', { icon: '🧹' })
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
      // Create a structured payload for draft matching the DB schema
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
          costPrice: form.costPrice ? Number(form.costPrice) : undefined
        },
        inventory: {
          stock: Number(form.stock) || 0,
          lowStockThreshold: Number(form.lowStockThreshold) || 10,
          trackInventory: form.trackInventory
        },
        shipping: {
          weight: form.weight ? Number(form.weight) : undefined,
          freeShipping: form.freeShipping,
          shippingFee: form.shippingFee ? Number(form.shippingFee) : undefined
        },
        specifications: form.specifications.filter(s => s.key && s.value),
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

      const res = await axios.post('/api/seller/products', payload, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data.success) {
        localStorage.removeItem('op_product_new_draft')
        toast.success('Saved to server drafts')
        router.push('/seller/products?status=draft')
      }
    } catch (err) {
      console.error(err)
      toast.error('Draft sync failed')
    } finally {
      setLoading(false)
    }
  }

  const calculateHealth = () => {
    let score = 0
    if (form.name?.length > 20) score += 15
    if (form.description?.length > 100) score += 15
    if (form.images.length >= 3) score += 20
    if (form.highlights.filter(h => h.length > 5).length >= 3) score += 15
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
    if (form.highlights.filter(h => h.length > 5).length < 3) list.push({ text: 'Add 3+ key highlights', impact: '+15%' })
    if (!form.keywords || form.keywords.length < 10) list.push({ text: 'Add SEO keywords', impact: '+15%' })
    return list
  }

  const [showVariants, setShowVariants] = useState(false)

  // --- Variant Logic ---

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

  const addOption = () => {
    if (!newOptionName) return toast.error('Enter option name (e.g. Color)')
    setForm(prev => ({
      ...prev,
      options: [...prev.options, { name: newOptionName, values: [] }]
    }))
    setNewOptionName('')
  }

  const removeOption = (index) => {
    const newOptions = form.options.filter((_, i) => i !== index)
    setForm(prev => ({ ...prev, options: newOptions }))
    // Re-generate variants after removing option
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

  // Generate Cartesian Product of all options
  const generateVariants = (options) => {
    if (options.length === 0) {
      setForm(prev => ({ ...prev, variants: [] }))
      return
    }

    // Filter out options with no values
    const validOptions = options.filter(opt => opt.values.length > 0)
    if (validOptions.length === 0) {
      setForm(prev => ({ ...prev, variants: [] }))
      return
    }

    // Recursive function to generate combinations
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

    // Create variant objects
    const newVariants = combinations.map(combo => {
      const name = Object.values(combo).join(' / ')
      // Try to preserve existing data if variant already existed
      const existing = form.variants.find(v => {
        const vAttrs = v.attributes instanceof Map ? Object.fromEntries(v.attributes) : v.attributes;
        const keys = Object.keys(vAttrs || {});
        const comboKeys = Object.keys(combo);
        if (keys.length !== comboKeys.length) return false;
        return keys.every(k => vAttrs[k] === combo[k]);
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

  function updateSpecification(index, field, value) {
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
        sku: form.sku || `GT-SKU-${Date.now().toString().slice(-6)}`,
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
          freeShipping: form.freeShipping,
          shippingFee: form.shippingFee ? Number(form.shippingFee) : undefined
        },
        specifications: form.specifications.filter(spec => spec.key && spec.value),
        images: form.images, // Use actual uploaded images
        options: form.options,
        variants: form.variants
      }

      const response = await axios.post('/api/seller/products', payload, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data.success) {
        toast.success('Product Created Successfully')
        router.push('/seller/products')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to Create Product')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }



  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, staggerChildren: 0.1 } }
  }

  return (
    <div className="min-h-screen pb-20 max-w-[1200px] mx-auto px-6">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
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
              <h1 className="text-4xl font-semibold text-slate-900 tracking-tight">Add Product <span className="text-blue-600">.</span></h1>
              <p className="text-slate-400 font-semibold text-sm mt-1">List a new product on the marketplace.</p>
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
                <Save size={14} /> Save Draft
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
                  <p className="text-xs font-semibold uppercase tracking-widest">Unsaved Progress Detected</p>
                  <p className="text-[10px] font-semibold text-blue-100 uppercase mt-0.5">We found a draft from your last session. Would you like to resume?</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={restoreDraft} className="px-6 py-2.5 bg-white text-blue-600 rounded-xl text-[10px] font-semibold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">Resume Work</button>
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
                        <InputField label="SKU (Optional)" name="sku" value={form.sku} onChange={handleChange} placeholder="Business tracking ID" />
                      </div>
                    </div>
                  </div>

                  {/* Hierarchical Category Selector */}
                  <CategorySelector
                    selectedPath={form.categoryPath}
                    productDetails={{
                      name: form.name,
                      description: form.description,
                      brand: form.brand,
                      keywords: form.keywords ? form.keywords.split(',').map(k => k.trim()) : []
                    }}
                    onChange={(categoryData) => {
                      if (categoryData) {
                        setForm(prev => ({
                          ...prev,
                          categoryId: categoryData.categoryId,
                          categoryPath: categoryData.path,
                          category: categoryData.name, // Store final category name
                          // Store hierarchy for potential future use
                          categoryHierarchy: categoryData.hierarchy
                        }))
                      } else {
                        // Clear category selection
                        setForm(prev => ({
                          ...prev,
                          categoryId: '',
                          categoryPath: '',
                          category: '',
                          categoryHierarchy: null
                        }))
                      }
                    }}
                    required={true}
                  />

                  <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-xl shadow-slate-200/20">
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
                    <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-widest">Set Your Price</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <InputField label="Base Price (AED)" name="basePrice" type="number" value={form.basePrice} onChange={handleChange} icon={DollarSign} required />
                      <InputField label="Selling Price (Discounted)" name="salePrice" type="number" value={form.salePrice} onChange={handleChange} icon={BadgePercent} />
                    </div>
                    <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                      <div className="flex items-center gap-3 text-blue-600 mb-3">
                        <Info size={16} />
                        <span className="text-[11px] font-semibold uppercase tracking-widest">Pricing Tip</span>
                      </div>
                      <p className="text-[10px] font-semibold text-slate-400 leading-relaxed uppercase tracking-widest">Maintain at least a 15% margin for sustainable growth. Sale prices appear with a discount badge on the shop.</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-xl shadow-slate-200/20 space-y-8">
                    <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-widest">Stock Management</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <InputField label="Initial Stock level" name="stock" type="number" value={form.stock} onChange={handleChange} icon={Box} required={form.variants.length === 0} disabled={form.variants.length > 0} placeholder={form.variants.length > 0 ? "Managed by Variations" : ""} />
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
                        <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-widest">Does this product have options?</h4>
                        <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mt-1">Like different colors, sizes, or models.</p>
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
                          <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Setup Options</h3>
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

                        {form.variants.length > 0 && (
                          <div className="overflow-hidden rounded-[2rem] border border-slate-100 overflow-x-auto bg-slate-50/30">
                            <table className="w-full text-left min-w-[700px]">
                              <thead>
                                <tr className="border-b border-slate-100">
                                  <th className="px-8 py-5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Variation</th>
                                  <th className="px-6 py-5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest w-40">Price (AED)</th>
                                  <th className="px-6 py-5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest w-32">Stock</th>
                                  <th className="px-8 py-5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest w-32 text-center">Image</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {form.variants.map((variant, idx) => (
                                  <tr key={idx} className="hover:bg-white transition-colors group">
                                    <td className="px-8 py-5">
                                      <p className="text-xs font-semibold text-slate-900 truncate max-w-[200px]">{variant.name}</p>
                                      <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-tighter mt-1">{variant.sku}</p>
                                    </td>
                                    <td className="px-6 py-5">
                                      <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-400">AED</span>
                                        <input
                                          type="number"
                                          value={variant.price}
                                          onChange={(e) => {
                                            const v = [...form.variants];
                                            v[idx].price = Number(e.target.value);
                                            setForm({ ...form, variants: v });
                                          }}
                                          className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-semibold focus:border-blue-500 outline-none transition-all shadow-sm"
                                        />
                                      </div>
                                    </td>
                                    <td className="px-6 py-5">
                                      <input
                                        type="number"
                                        value={variant.stock}
                                        onChange={(e) => {
                                          const v = [...form.variants];
                                          v[idx].stock = Number(e.target.value);
                                          setForm({ ...form, variants: v });
                                        }}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold focus:border-blue-500 outline-none transition-all shadow-sm"
                                      />
                                    </td>
                                    <td className="px-8 py-5">
                                      <div className="flex flex-wrap justify-center gap-2 max-w-[150px] mx-auto">
                                        {/* Variant Gallery */}
                                        {variant.images?.map((img, imgIdx) => (
                                          <div key={imgIdx} className="relative group/mini w-10 h-10">
                                            <img src={img} className="w-full h-full object-cover rounded-lg border border-slate-200" />
                                            <button
                                              type="button"
                                              onClick={() => removeVariantImage(idx, imgIdx)}
                                              className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full p-0.5 opacity-0 group-hover/mini:opacity-100 transition-all hover:scale-110 shadow-lg"
                                            >
                                              <X size={8} />
                                            </button>
                                          </div>
                                        ))}

                                        {/* Add Slot */}
                                        {(!variant.images || variant.images.length < 7) && (
                                          <label className="w-10 h-10 rounded-lg border border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-white transition-all group/add">
                                            <input
                                              type="file"
                                              className="hidden"
                                              accept="image/*"
                                              onChange={(e) => handleVariantImageUpload(idx, e.target.files[0])}
                                            />
                                            <Plus size={14} className="text-slate-400 group-hover/add:text-blue-500 transition-all" />
                                          </label>
                                        )}
                                      </div>
                                      <p className="text-[8px] font-semibold text-slate-400 uppercase tracking-widest mt-2">{variant.images?.length || 0}/7 Images</p>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
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
                    <InputField label="Weight (KG)" name="weight" type="number" value={form.weight} onChange={handleChange} icon={Truck} placeholder="e.g. 0.5" />
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
                  {/* Highlights Section (New) */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                          <Target size={16} className="text-blue-600" /> Key Feature Highlights
                        </h3>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widestleading-relaxed">Add high-impact bullet points to boost conversion (Amazon style)</p>
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
                    <div className="p-8 bg-slate-50 rounded-[2rem] space-y-4">
                      <label className="text-[9px] font-semibold text-slate-500 uppercase tracking-[0.2em]">Backend Search Tags</label>
                      <textarea
                        value={form.keywords}
                        onChange={(e) => setForm({ ...form, keywords: e.target.value })}
                        placeholder="e.g. wireless, bluetooth, noise cancelling, audiophile, luxury"
                        rows={3}
                        className="w-full bg-white/5 border border-blue-500/10 rounded-2xl px-6 py-4 text-xs font-semibold  placeholder-slate-600 focus:bg-white/10 focus:border-blue-500 transition-all outline-none"
                      />
                      <p className="text-[8px] font-semibold text-slate-600 uppercase tracking-widest">Separate with commas. These are not visible to customers.</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                          <LayoutGrid size={16} className="text-blue-600" /> Dimensional Metrics
                        </h3>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Technical specifications and unit parameters</p>
                      </div>
                      <button
                        type="button"
                        onClick={addSpecification}
                        className="px-6 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-semibold uppercase tracking-widest hover:bg-blue-600 transition-all"
                      >
                        Add Spec
                      </button>
                    </div>

                    <div className="space-y-4">
                      {form.specifications.map((spec, index) => (
                        <div key={index} className="flex gap-4 group animate-in slide-in-from-right-4">
                          <div className="flex-1">
                            <input
                              placeholder="Feature (e.g. Material)"
                              value={spec.key}
                              onChange={(e) => updateSpecification(index, 'key', e.target.value)}
                              className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-5 py-3.5 text-xs font-semibold text-slate-700 placeholder-slate-300 focus:bg-white focus:border-blue-500 outline-none transition-all"
                            />
                          </div>
                          <div className="flex-1">
                            <input
                              placeholder="Value (e.g. Titanium)"
                              value={spec.value}
                              onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                              className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-5 py-3.5 text-xs font-semibold text-slate-700 placeholder-slate-300 focus:bg-white focus:border-blue-500 outline-none transition-all"
                            />
                          </div>
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
                  className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-xl shadow-slate-200/20 space-y-10"
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="text-xl font-semibold text-slate-900 uppercase tracking-tighter">Listing Quality Index</h3>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Global optimization signals for your storefront</p>
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
                        <Zap size={14} className="text-amber-500" /> Improvement Vector
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
                            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest leading-relaxed">Optimization Peak Achieved<br /><span className="text-[10px] opacity-60">Listing is ready for prime visibility</span></p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Summary View */}
                    <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white space-y-8 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-3xl -mr-16 -mt-16" />
                      <h4 className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 relative z-10">Compliance Summary</h4>

                      <div className="space-y-6 relative z-10">
                        <div className="flex justify-between items-end border-b border-white/5 pb-4">
                          <div>
                            <p className="text-[10px] font-semibold text-slate-500 uppercase">Essentials</p>
                            <p className="text-sm font-semibold mt-1 uppercase tracking-tight">Standardized</p>
                          </div>
                          <CheckCircle2 className="text-emerald-400" size={18} />
                        </div>
                        <div className="flex justify-between items-end border-b border-white/5 pb-4">
                          <div>
                            <p className="text-[10px] font-semibold text-slate-500 uppercase">Variations</p>
                            <p className="text-sm font-semibold mt-1 uppercase tracking-tight">{form.variants.length} Matrix Nodes</p>
                          </div>
                          <Layers className="text-blue-400" size={18} />
                        </div>
                        <div className="flex justify-between items-end border-b border-white/5 pb-4">
                          <div>
                            <p className="text-[10px] font-semibold text-slate-500 uppercase">Global Scope</p>
                            <p className="text-sm font-semibold mt-1 uppercase tracking-tight">{form.freeShipping ? 'Worldwide' : 'Standard'}</p>
                          </div>
                          <Truck className="text-amber-400" size={18} />
                        </div>
                      </div>

                      <div className="pt-4 relative z-10">
                        <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
                          <div className="flex items-center gap-3">
                            {form.images[0]?.url && <img src={form.images[0].url} className="w-10 h-10 object-cover rounded-lg border border-white/10" />}
                            <div>
                              <p className="text-[9px] font-semibold text-slate-500 uppercase">Primary Asset</p>
                              <p className="text-xs font-semibold truncate max-w-[150px]">{form.name || 'Spectral Project'}</p>
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
                        <p className="text-xs font-semibold text-slate-900 uppercase tracking-wide">Listing Accuracy Declaration</p>
                        <p className="text-[10px] font-semibold text-slate-500 mt-1 uppercase leading-relaxed">I certify that all product details, variation attributes, and associated images are 100% accurate. I understand that misconfigured listings may be rejected or lead to returns.</p>
                      </div>
                    </label>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Global Actions */}
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
                  {loading ? 'Synchronizing Listing...' : 'Submit for Review'}
                  {!loading && <ShieldCheck size={18} />}
                </button>
              )}
              <button
                type="button"
                onClick={() => router.back()}
                className="px-10 py-5 bg-white border border-slate-200 text-slate-600 rounded-[2rem] text-sm font-semibold uppercase tracking-widest hover:bg-slate-50 transition-all"
              >
                Abort
              </button>
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
                <Box size={14} /> Global View
              </button>
              <button
                onClick={() => setPreviewMode('mobile')}
                className={`flex-1 py-3 px-4 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-widest transition-all ${previewMode === 'mobile' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                <Target size={14} /> Micro View
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
                  </div>

                  {/* Meta Stats */}
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="bg-white p-5 rounded-[2rem] border border-slate-100">
                      <p className="text-[9px] font-semibold text-slate-400 uppercase mb-1">Visibility</p>
                      <p className="text-xs font-semibold text-slate-900">High Frequency</p>
                    </div>
                    <div className="bg-white p-5 rounded-[2rem] border border-slate-100">
                      <p className="text-[9px] font-semibold text-slate-400 uppercase mb-1">Ship Mode</p>
                      <p className="text-xs font-semibold text-slate-900">{form.freeShipping ? 'Prime' : 'Standard'}</p>
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
