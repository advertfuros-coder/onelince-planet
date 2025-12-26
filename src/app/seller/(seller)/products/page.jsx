// app/(seller)/products/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import axios from 'axios'
import Link from 'next/link'
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Package,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Eye,
  Filter,
  Download,
  Upload,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  LayoutGrid,
  List,
  ArrowUpRight,
  RefreshCw,
  MoreVertical,
  Star,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import BulkUploadModal from '@/components/seller/BulkUploadModal'
import { SellerBadges } from '@/components/seller/SellerBadge'

export default function SellerProductsPage() {
  const { token, user } = useAuth()
  const [products, setProducts] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({})
  const [showBulkUpload, setShowBulkUpload] = useState(false)
  const [sellerBadges, setSellerBadges] = useState([])
  const [viewMode, setViewMode] = useState('list') // list or grid

  useEffect(() => {
    if (token) {
      fetchProducts()
      fetchSellerBadges()
    }
  }, [token, search, selectedCategory, selectedStatus, page])

  async function fetchSellerBadges() {
    try {
      const res = await axios.get('/api/seller/verification', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.data.success) {
        setSellerBadges(res.data.verification?.badges || [])
      }
    } catch (error) {
      console.log('Could not fetch badges')
    }
  }

  async function fetchProducts() {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        ...(search && { search }),
        ...(selectedCategory && { category: selectedCategory }),
        ...(selectedStatus && { status: selectedStatus }),
      })

      const res = await axios.get(`/api/seller/products?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.data.success) {
        setProducts(res.data.products)
        setStats(res.data.stats)
        setPagination(res.data.pagination)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const res = await axios.delete(`/api/seller/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.data.success) {
        toast.success('Product deleted successfully')
        fetchProducts()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete product')
    }
  }

  async function toggleProductStatus(productId, currentStatus) {
    try {
      const res = await axios.put(
        `/api/seller/products/${productId}`,
        { isActive: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (res.data.success) {
        toast.success(`Product ${!currentStatus ? 'activated' : 'deactivated'}`)
        fetchProducts()
      }
    } catch (error) {
      toast.error('Failed to update product status')
    }
  }

  const formatCurrency = (value) => `₹${(value || 0).toLocaleString('en-IN')}`

  const categories = [...new Set(products.map((p) => p.category))]

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-8">
      <div className="max-w-[1500px] mx-auto space-y-8">

        {/* Modern Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-10">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20 ring-4 ring-blue-50">
                <Package size={20} />
              </div>
              <span className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em] bg-blue-50/50 backdrop-blur-sm px-4 py-1.5 rounded-full border border-blue-100">Inventory Hub</span>
            </div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter flex items-center gap-4">
              Supply Terminal <span className="text-blue-600">.</span>
              {sellerBadges.length > 0 && (
                <div className="hidden md:flex gap-1">
                  <SellerBadges badges={sellerBadges} maxDisplay={2} size="sm" />
                </div>
              )}
            </h1>
            <p className="text-slate-400 font-bold text-base max-w-xl leading-relaxed">System-wide control for your storefront assets, inventory telemetry, and global visibility signals.</p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => setShowBulkUpload(true)}
              className="group flex items-center gap-3 px-6 py-4 bg-white border border-slate-100 rounded-[2rem] font-black text-[12px] uppercase tracking-widest text-slate-600 hover:bg-slate-900 hover:text-white hover:shadow-2xl hover:shadow-slate-900/20 transition-all active:scale-95"
            >
              <Upload size={18} className="group-hover:-translate-y-1 transition-transform" />
              <span>Bulk Matrix</span>
            </button>
            <Link
              href="/seller/products/new"
              className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-[2rem] font-black text-[12px] uppercase tracking-widest hover:bg-blue-700 hover:scale-[1.02] transition-all shadow-2xl shadow-blue-500/20 active:scale-95"
            >
              <Plus size={20} />
              <span>Deploy Asset</span>
            </Link>
          </div>
        </div>

        {/* Intelligence Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
          <ModernStatCard
            label="Total Catalog"
            value={stats.total}
            icon={Package}
            color="blue"
            delay={0.1}
          />
          <ModernStatCard
            label="Live Storefront"
            value={stats.active}
            icon={CheckCircle2}
            color="emerald"
            delay={0.2}
          />
          <ModernStatCard
            label="Low Telemery"
            value={stats.lowStock}
            icon={AlertCircle}
            color="orange"
            delay={0.3}
            alert
          />
          <ModernStatCard
            label="Approval Queue"
            value={stats.pending}
            icon={RefreshCw}
            color="amber"
            delay={0.4}
          />
          <ModernStatCard
            label="Shadowed"
            value={stats.inactive}
            icon={XCircle}
            color="rose"
            delay={0.5}
          />
        </div>

        {/* Filtering and Actions Bar */}
        <div className="bg-white rounded-[2rem] p-4 lg:p-6 shadow-sm border border-gray-100/50 flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col lg:flex-row gap-4 w-full lg:w-auto items-center">
            <div className="relative group w-full lg:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search products by SKU or name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>

            <div className="flex gap-2 w-full lg:w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="flex-1 lg:w-48 px-4 py-3 bg-gray-50 border-none rounded-2xl text-xs font-black uppercase tracking-tight focus:ring-2 focus:ring-blue-100"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="flex-1 lg:w-48 px-4 py-3 bg-gray-50 border-none rounded-2xl text-xs font-black uppercase tracking-tight focus:ring-2 focus:ring-blue-100"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-gray-50 p-1 rounded-xl flex items-center lg:mr-2">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}
              >
                <List size={18} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}
              >
                <LayoutGrid size={18} />
              </button>
            </div>
            <button className="flex items-center gap-2 px-5 py-3 border border-gray-100 rounded-2xl font-black text-gray-600 hover:bg-gray-50 transition-all">
              <Download size={18} />
            </button>
          </div>
        </div>

        {/* Product Listing Section */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100/50 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Syncing Catalog...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-32">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="w-10 h-10 text-blue-300" />
              </div>
              <h3 className="text-2xl font-black text-gray-900">Virtual Shelf is Empty</h3>
              <p className="text-gray-500 font-medium mt-2 mb-8">Start adding your premium collection to reach thousands of customers.</p>
              <Link
                href="/seller/products/new"
                className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition-all shadow-lg active:scale-95"
              >
                <Plus size={20} />
                <span>Add First Product</span>
              </Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-50 bg-gray-50/30">
                      <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Product Information</th>
                      <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">SKU & Category</th>
                      <th className="px-6 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Pricing</th>
                      <th className="px-6 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Inventory</th>
                      <th className="px-6 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Visibility</th>
                      <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {products.map((product) => (
                      <tr key={product._id} className="group hover:bg-gray-50/30 transition-all">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gray-50 overflow-hidden border border-gray-100 flex-shrink-0 p-1 group-hover:scale-105 transition-transform">
                              {product.images?.[0]?.url ? (
                                <img
                                  src={product.images[0].url}
                                  alt=""
                                  className="w-full h-full object-cover rounded-xl"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300 rounded-xl">
                                  <Package size={24} />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-black text-gray-900 mb-0.5 truncate max-w-[200px]">{product.name}</p>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-gray-400">{product.brand || 'No Brand'}</span>
                                {product.ratings?.average > 0 && (
                                  <div className="flex items-center gap-0.5 text-amber-500">
                                    <Star size={10} fill="currentColor" />
                                    <span className="text-[10px] font-black">{product.ratings.average}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="space-y-1">
                            <code className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-tighter">SKU: {product.sku}</code>
                            <p className="text-xs font-bold text-gray-500">{product.category}</p>
                          </div>
                        </td>
                        <td className="px-6 py-6 text-right">
                          <div className="space-y-0.5">
                            <p className="text-sm font-black text-gray-900">{formatCurrency(product.pricing.salePrice || product.pricing.basePrice)}</p>
                            {product.pricing.salePrice && (
                              <p className="text-gray-300 line-through text-[10px] font-bold">{formatCurrency(product.pricing.basePrice)}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-6 text-center">
                          <div className="flex flex-col items-center gap-1.5">
                            <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: `${Math.min((product.inventory.stock / 100) * 100, 100)}%` }}
                                className={`h-full rounded-full ${product.inventory.stock <= product.inventory.lowStockThreshold ? 'bg-rose-500' : 'bg-emerald-500'}`}
                              />
                            </div>
                            <span className={`text-[11px] font-black ${product.inventory.stock <= product.inventory.lowStockThreshold ? 'text-rose-600' : 'text-gray-900'}`}>{product.inventory.stock} Left</span>
                          </div>
                        </td>
                        <td className="px-6 py-6 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <ModernStatusBadge status={product.isActive ? 'active' : 'inactive'} />
                            {!product.isApproved && (
                              <span className="text-[9px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Pending Hub Approval</span>
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => toggleProductStatus(product._id, product.isActive)}
                              className={`p-2.5 rounded-xl transition-all ${product.isActive
                                ? 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                }`}
                              title={product.isActive ? 'Pause Sale' : 'Resume Sale'}
                            >
                              {product.isActive ? <XCircle size={18} /> : <CheckCircle2 size={18} />}
                            </button>
                            <Link
                              href={`/seller/products/${product._id}`}
                              className="p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-all"
                            >
                              <Edit2 size={18} />
                            </Link>
                            <button
                              onClick={() => handleDelete(product._id)}
                              className="p-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl transition-all"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Modern Pagination Section */}
              {pagination.pages > 1 && (
                <div className="px-8 py-6 bg-gray-50/30 border-t border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                    Displaying {(page - 1) * pagination.limit + 1} - {Math.min(page * pagination.limit, pagination.total)} <span className="text-gray-300">of</span> {pagination.total} Units
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-blue-600 hover:shadow-md disabled:opacity-30 disabled:hover:text-gray-400 transition-all font-black text-xs"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(pagination.pages, 5) }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setPage(i + 1)}
                          className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${page === i + 1 ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-400 hover:bg-gray-50'}`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={page === pagination.pages}
                      className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-blue-600 hover:shadow-md disabled:opacity-30 disabled:hover:text-gray-400 transition-all font-black text-xs"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals Container */}
      <AnimatePresence>
        {showBulkUpload && (
          <BulkUploadModal
            onClose={() => setShowBulkUpload(false)}
            onSuccess={() => {
              setShowBulkUpload(false)
              fetchProducts()
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function ModernStatCard({ label, value, icon: Icon, color, delay, alert }) {
  const colors = {
    blue: 'text-blue-600 bg-blue-50',
    emerald: 'text-emerald-600 bg-emerald-50',
    rose: 'text-rose-600 bg-rose-50',
    amber: 'text-amber-600 bg-amber-50',
    orange: 'text-orange-600 bg-orange-50',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`bg-white p-6 rounded-[2.2rem] shadow-sm border ${alert ? 'border-orange-100' : 'border-gray-100/50'} relative overflow-hidden group`}
    >
      {alert && <div className="absolute top-0 right-0 w-8 h-8 bg-orange-500/10 rounded-bl-[2rem] flex items-center justify-center"><div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-ping" /></div>}
      <div className="flex items-center gap-4">
        <div className={`p-4 rounded-2xl ${colors[color]} group-hover:scale-110 transition-transform duration-500`}>
          <Icon size={22} />
        </div>
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{label}</p>
          <p className="text-2xl font-black text-gray-900 tracking-tight transition-transform duration-500 group-hover:translate-x-1">{value || 0}</p>
        </div>
      </div>
    </motion.div>
  )
}

function ModernStatusBadge({ status }) {
  const statusConfig = {
    active: { bg: 'bg-emerald-50', text: 'text-emerald-600', label: 'Live Storefront' },
    inactive: { bg: 'bg-gray-100', text: 'text-gray-400', label: 'Hidden/Paused' },
  }

  const config = statusConfig[status] || statusConfig.inactive

  return (
    <span className={`px-3 py-1 ${config.bg} ${config.text} rounded-full text-[10px] font-black uppercase tracking-tight`}>
      {config.label}
    </span>
  )
}
