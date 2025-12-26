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
  Image as ImageIcon
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
    <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-500 group-focus-within:text-blue-600 transition-colors">
      {Icon && <Icon size={12} />}
      {label}
    </label>
    <div className="relative">
      <input
        name={name}
        className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-700 placeholder-slate-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all"
        {...props}
      />
    </div>
  </div>
)

export default function AddProductPage() {
  const router = useRouter()
  const { token } = useAuth()
  const [loading, setLoading] = useState(false)
  const [activeSection, setActiveSection] = useState('basic')

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
    freeShipping: false,
    shippingFee: '',
    specifications: [{ key: '', value: '' }],
    images: [],
    // Variant state
    options: [], // [{ name: 'Color', values: ['Red', 'Blue'] }]
    variants: [] // [{ name: 'Red - S', price: 100, stock: 10, ... }]
  })

  // Temporary state for adding options
  const [newOptionName, setNewOptionName] = useState('')
  const [newOptionValue, setNewOptionValue] = useState('')

  const formSections = [
    { id: 'basic', label: 'Identity', icon: <Package size={18} /> },
    { id: 'media', label: 'Media', icon: <ImageIcon size={18} /> },
    { id: 'pricing', label: 'Pricing', icon: <DollarSign size={18} /> },
    { id: 'variants', label: 'Variants', icon: <Layers size={18} /> },
    { id: 'inventory', label: 'Inventory', icon: <Database size={18} /> },
    { id: 'logistics', label: 'Logistics', icon: <Truck size={18} /> },
    { id: 'specs', label: 'Features', icon: <LayoutGrid size={18} /> }
  ]

  // --- Variant Logic ---

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
    const newOptions = [...form.options]
    if (!newOptions[optionIndex].values.includes(value)) {
      newOptions[optionIndex].values.push(value)
      setForm(prev => ({ ...prev, options: newOptions }))
      generateVariants(newOptions)
    }
    setNewOptionValue('')
  }

  const removeOptionValue = (optionIndex, valueIndex) => {
    const newOptions = [...form.options]
    newOptions[optionIndex].values.splice(valueIndex, 1)
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
        // Simple check: do attributes match?
        return JSON.stringify(v.attributes) === JSON.stringify(combo)
      })

      return {
        name: name,
        attributes: combo,
        price: existing?.price || form.basePrice || 0,
        stock: existing?.stock || 0,
        sku: existing?.sku || `${form.sku || 'SKU'}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`
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
        toast.success('Matrix Synchronized: Product Live')
        router.push('/seller/products')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Synchronization Failure')
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
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter text-slate-400 hover:text-slate-900 transition-colors mb-2"
              >
                <ChevronLeft size={14} /> Back to Nexus
              </button>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Supply Hub <span className="text-blue-600">.</span></h1>
              <p className="text-slate-400 font-bold text-sm mt-1">Deploying new inventory to the global marketplace.</p>
            </div>
          </div>

          {/* Stepper Navigation */}
          <div className="flex bg-white/50 backdrop-blur-md p-2 rounded-3xl border border-slate-100 shadow-sm overflow-x-auto no-scrollbar">
            {formSections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shrink-0 ${activeSection === s.id ? 'bg-slate-900 text-white shadow-xl translate-y-[-2px]' : 'text-slate-400 hover:text-slate-700'}`}
              >
                {s.icon}
                {s.label}
              </button>
            ))}
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {activeSection === 'basic' && (
                <motion.div
                  key="basic"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-xl shadow-slate-200/20 space-y-8"
                >
                  <div className="space-y-6">
                    <InputField
                      label="Product Matrix Identity"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="e.g., Quantum Edge Smartphone"
                      required
                    />

                    <div className="grid grid-cols-2 gap-6">
                      <InputField label="Brand Name" name="brand" value={form.brand} onChange={handleChange} placeholder="e.g., Zenith" />
                      <InputField label="Custom SKU ID" name="sku" value={form.sku} onChange={handleChange} placeholder="Auto-gen if empty" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">Market Segment</label>
                      <div className="grid grid-cols-3 gap-3">
                        {CATEGORIES.map(cat => (
                          <button
                            type="button"
                            key={cat.name}
                            onClick={() => setForm(f => ({ ...f, category: cat.name }))}
                            className={`py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest border transition-all ${form.category === cat.name ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-blue-200'}`}
                          >
                            {cat.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">Signal Description</label>
                      <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        rows={4}
                        className="w-full bg-slate-50/50 border border-slate-100 rounded-3xl px-6 py-5 text-sm font-bold text-slate-700 placeholder-slate-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all resize-none"
                        placeholder="Detailed product specifications and history..."
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {activeSection === 'media' && (
                <motion.div
                  key="media"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-xl shadow-slate-200/20 space-y-8"
                >
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2">Visual Assets</h3>
                    <p className="text-xs font-bold text-slate-400 mb-6">Upload high-fidelity imagery. Drag to reorder. First image is master cover.</p>
                    <ImageUpload
                      images={form.images}
                      token={token}
                      onChange={(imgs) => setForm(f => ({ ...f, images: imgs }))}
                    />
                  </div>
                </motion.div>
              )}

              {activeSection === 'pricing' && (
                <motion.div
                  key="pricing"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-xl shadow-slate-200/20 space-y-8"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <InputField label="Base Price (AED)" name="basePrice" type="number" value={form.basePrice} onChange={handleChange} icon={DollarSign} required />
                    <InputField label="Sale Price (LEDGE)" name="salePrice" type="number" value={form.salePrice} onChange={handleChange} icon={BadgePercent} />
                  </div>
                  <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                    <div className="flex items-center gap-3 text-blue-600 mb-3">
                      <Info size={16} />
                      <span className="text-[11px] font-black uppercase tracking-widest">Pricing Intelligence</span>
                    </div>
                    <p className="text-xs font-bold text-slate-400 italic">Effective margin analysis suggests a 15% delta between cost and base price for optimal competitiveness.</p>
                  </div>
                </motion.div>
              )}

              {activeSection === 'variants' && (
                <motion.div
                  key="variants"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-xl shadow-slate-200/20 space-y-8"
                >
                  {/* Option Creator */}
                  <div className="space-y-6 border-b border-slate-100 pb-8">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Variant Architecture</h3>

                    <div className="flex items-end gap-4">
                      <div className="flex-1">
                        <InputField
                          label="New Option Type"
                          value={newOptionName}
                          onChange={(e) => setNewOptionName(e.target.value)}
                          placeholder="e.g. Color, Ram, Size"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={addOption}
                        className="h-[52px] px-8 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all"
                      >
                        Add Option
                      </button>
                    </div>

                    {/* Options List */}
                    <div className="space-y-4">
                      {form.options.map((option, idx) => (
                        <div key={idx} className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs">{option.name}</h4>
                            <button type="button" onClick={() => removeOption(idx)} className="text-rose-500 hover:text-rose-600"><X size={14} /></button>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {option.values.map((val, vIdx) => (
                              <span key={vIdx} className="bg-white border border-slate-200 px-3 py-1 rounded-full text-[10px] font-bold text-slate-600 flex items-center gap-2">
                                {val}
                                <button type="button" onClick={() => removeOptionValue(idx, vIdx)} className="hover:text-rose-500"><X size={10} /></button>
                              </span>
                            ))}
                            <div className="flex items-center gap-2 min-w-[120px]">
                              <input
                                className="bg-transparent border-b border-slate-300 px-2 py-1 text-xs font-bold focus:border-blue-500 outline-none w-20"
                                placeholder="New value"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addOptionValue(idx, e.target.value);
                                    e.target.value = '';
                                  }
                                }}
                              />
                              <button type="button" className="text-slate-400 hover:text-blue-600"><Plus size={14} /></button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Variant Matrix Table */}
                  {form.variants.length > 0 && (
                    <div className="overflow-hidden rounded-2xl border border-slate-100">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Variant</th>
                            <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest w-32">Price</th>
                            <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest w-32">Stock</th>
                            <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest w-40">SKU</th>
                            <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest w-24">Img</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {form.variants.map((variant, idx) => (
                            <tr key={idx} className="bg-white hover:bg-blue-50/50 transition-colors">
                              <td className="px-6 py-4 text-xs font-bold text-slate-900">{variant.name}</td>
                              <td className="px-6 py-4">
                                <input
                                  type="number"
                                  value={variant.price}
                                  onChange={(e) => {
                                    const newVariants = [...form.variants];
                                    newVariants[idx].price = Number(e.target.value);
                                    setForm({ ...form, variants: newVariants });
                                  }}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold"
                                />
                              </td>
                              <td className="px-6 py-4">
                                <input
                                  type="number"
                                  value={variant.stock}
                                  onChange={(e) => {
                                    const newVariants = [...form.variants];
                                    newVariants[idx].stock = Number(e.target.value);
                                    setForm({ ...form, variants: newVariants });
                                  }}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold"
                                />
                              </td>
                              <td className="px-6 py-4">
                                <input
                                  type="text"
                                  value={variant.sku}
                                  onChange={(e) => {
                                    const newVariants = [...form.variants];
                                    newVariants[idx].sku = e.target.value;
                                    setForm({ ...form, variants: newVariants });
                                  }}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-mono"
                                />
                              </td>
                              <td className="px-6 py-4">
                                <select
                                  value={variant.imageIndex || 0}
                                  onChange={(e) => {
                                    const newVariants = [...form.variants];
                                    newVariants[idx].imageIndex = Number(e.target.value);
                                    setForm({ ...form, variants: newVariants });
                                  }}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-1 py-1 text-[10px] font-bold"
                                >
                                  {form.images.map((_, i) => (
                                    <option key={i} value={i}>#{i + 1}</option>
                                  ))}
                                  {form.images.length === 0 && <option value={0}>N/A</option>}
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </motion.div>
              )}


              {activeSection === 'inventory' && (
                <motion.div
                  key="inventory"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-xl shadow-slate-200/20 space-y-8"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <InputField label="Initial Stock Batch (Master)" name="stock" type="number" value={form.stock} onChange={handleChange} icon={Box} required={form.variants.length === 0} disabled={form.variants.length > 0} placeholder={form.variants.length > 0 ? "Managed by Variants" : ""} />
                    <InputField label="Critical Threshold" name="lowStockThreshold" type="number" value={form.lowStockThreshold} onChange={handleChange} icon={AlertCircle} />
                  </div>
                  <label className="flex items-center gap-4 cursor-pointer group bg-slate-50 p-6 rounded-3xl border border-slate-100 hover:border-blue-200 transition-all">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${form.trackInventory ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                      <Zap size={20} className={form.trackInventory ? 'animate-pulse' : ''} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-black text-slate-900 uppercase tracking-wide">Live Telemetry</p>
                      <p className="text-[10px] font-bold text-slate-400">Sync inventory across all global nodes in real-time.</p>
                    </div>
                    <input type="checkbox" name="trackInventory" checked={form.trackInventory} onChange={handleChange} className="hidden" />
                    <div className={`w-10 h-6 rounded-full relative transition-all ${form.trackInventory ? 'bg-blue-600' : 'bg-slate-300'}`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${form.trackInventory ? 'right-1' : 'left-1'}`} />
                    </div>
                  </label>
                </motion.div>
              )}

              {activeSection === 'logistics' && (
                <motion.div
                  key="logistics"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-xl shadow-slate-200/20 space-y-8"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <InputField label="Weight Metric (kg)" name="weight" type="number" value={form.weight} onChange={handleChange} placeholder="0.5" />
                    <InputField label="Sync Fee" name="shippingFee" type="number" value={form.shippingFee} onChange={handleChange} disabled={form.freeShipping} placeholder="50" />
                  </div>
                  <label className="flex items-center gap-4 cursor-pointer group bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${form.freeShipping ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                      <Truck size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-black text-emerald-900 uppercase tracking-wide">Prime Logistics</p>
                      <p className="text-[10px] font-bold text-emerald-600">Apply zero-cost shipping for this asset.</p>
                    </div>
                    <input type="checkbox" name="freeShipping" checked={form.freeShipping} onChange={handleChange} className="hidden" />
                    <div className={`w-10 h-6 rounded-full relative transition-all ${form.freeShipping ? 'bg-emerald-600' : 'bg-slate-300'}`}>
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
                  className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-xl shadow-slate-200/20 space-y-6"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">Advanced Attributes</h2>
                    <button type="button" onClick={addSpecification} className="flex items-center gap-2 text-[10px] font-black uppercase bg-slate-900 text-white px-4 py-2 rounded-xl hover:scale-105 active:scale-95 transition-all">
                      <Plus size={14} /> Add Parameter
                    </button>
                  </div>

                  <div className="space-y-4">
                    {form.specifications.map((spec, index) => (
                      <div key={index} className="flex gap-4 group">
                        <div className="flex-1 grid grid-cols-2 gap-4">
                          <input
                            placeholder="Key ID (e.g., Battery)"
                            value={spec.key}
                            onChange={(e) => handleSpecChange(index, 'key', e.target.value)}
                            className="bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 transition-all"
                          />
                          <input
                            placeholder="Value (e.g., 5000mAh)"
                            value={spec.value}
                            onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                            className="bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 transition-all"
                          />
                        </div>
                        {form.specifications.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSpecification(index)}
                            className="w-10 h-10 border border-rose-100 text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-xl flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Global Actions */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-5 rounded-[2rem] text-sm font-black uppercase tracking-widest shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/40 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:scale-100 transition-all flex items-center justify-center gap-3"
              >
                {loading ? 'Synchronizing Intelligence...' : 'Initialize Product Manifest'}
                {!loading && <ChevronRight size={18} />}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-10 py-5 bg-white border border-slate-200 text-slate-600 rounded-[2rem] text-sm font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
              >
                Abort
              </button>
            </div>
          </form>
        </div>

        {/* Right: Live Preview Card */}
        <div className="lg:w-[380px] space-y-6">
          <div className="sticky top-28">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4 px-2">Visualizing Signal</h3>

            {/* The Premium Card */}
            <div className="bg-slate-900 rounded-[3rem] p-8 text-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-white/10 relative overflow-hidden group">
              {/* Animated Background Decor */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 blur-[60px] rounded-full group-hover:w-48 group-hover:h-48 transition-all" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-600/10 blur-[60px] rounded-full" />

              <div className="relative z-10 space-y-6">
                <div className="w-full aspect-square bg-white shadow-inner rounded-[2rem] mb-6 flex items-center justify-center overflow-hidden border border-white/5 group-hover:scale-[1.02] transition-transform">
                  {form.images[0]?.url ? (
                    <img src={form.images[0].url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="text-slate-200" size={48} />
                  )}
                </div>

                <div>
                  <span className="bg-blue-600 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                    {form.category || 'Asset'}
                  </span>
                  <h2 className="text-xl font-black mt-3 leading-tight truncate">
                    {form.name || 'Spectral Entity'}
                  </h2>
                  <p className="text-slate-400 text-[10px] font-bold mt-2 uppercase tracking-tight">
                    {form.brand ? `Powered by ${form.brand}` : 'Engineering Manifest v1.0'}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-white/10 pt-6">
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Market Value</p>
                    <p className="text-2xl font-black mt-1">
                      {form.basePrice ? `AED ${form.basePrice}` : '--'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Supply</p>
                    <p className="text-xl font-black mt-1 text-emerald-400">
                      {form.variants.length > 0
                        ? form.variants.reduce((a, b) => a + Number(b.stock), 0)
                        : (form.stock || '0')}
                      <span className="text-[10px] text-slate-500"> Units</span>
                    </p>
                  </div>
                </div>

                <div className="bg-white/5 rounded-2xl p-4 flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">SKU Vector</span>
                  <span className="text-[10px] font-mono text-blue-400">
                    {form.sku || 'GT-#-####'}
                  </span>
                </div>
              </div>
            </div>

            {/* Meta Stats */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-white p-5 rounded-[2rem] border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Visibility</p>
                <p className="text-xs font-black text-slate-900">High Frequency</p>
              </div>
              <div className="bg-white p-5 rounded-[2rem] border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Ship Mode</p>
                <p className="text-xs font-black text-slate-900">{form.freeShipping ? 'Prime' : 'Standard'}</p>
              </div>
            </div>
          </div>
        </div>

      </motion.div>
    </div>
  )
}
