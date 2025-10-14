// app/(admin)/categories/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import axios from 'axios'
import {
  FiSearch,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiFolder,
  FiCheckCircle,
  FiXCircle,
  FiGrid,
  FiX,
  FiPercent,
  FiLayers,
  FiAlertCircle,
} from 'react-icons/fi'
import { toast } from 'react-hot-toast'

export default function AdminCategoriesPage() {
  const { token } = useAuth()
  const [categories, setCategories] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    parentCategory: '',
    commissionRate: 5,
    isActive: true,
    sortOrder: 0,
  })

  useEffect(() => {
    if (token) fetchCategories()
  }, [token, search])

  async function fetchCategories() {
    try {
      setLoading(true)
      const params = new URLSearchParams({ ...(search && { search }) })

      const res = await axios.get(`/api/admin/categories?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.data.success) {
        setCategories(res.data.categories)
        setStats(res.data.stats)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  function openCreateModal() {
    setEditingCategory(null)
    setFormData({
      name: '',
      description: '',
      image: '',
      parentCategory: '',
      commissionRate: 5,
      isActive: true,
      sortOrder: 0,
    })
    setShowModal(true)
  }

  function openEditModal(category) {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || '',
      image: category.image || '',
      parentCategory: category.parentCategory?._id || '',
      commissionRate: category.commissionRate || 5,
      isActive: category.isActive,
      sortOrder: category.sortOrder || 0,
    })
    setShowModal(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()

    try {
      if (editingCategory) {
        // Update
        const res = await axios.put(
          `/api/admin/categories/${editingCategory._id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        )

        if (res.data.success) {
          toast.success('Category updated successfully')
          setShowModal(false)
          fetchCategories()
        }
      } else {
        // Create
        const res = await axios.post('/api/admin/categories', formData, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (res.data.success) {
          toast.success('Category created successfully')
          setShowModal(false)
          fetchCategories()
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save category')
    }
  }

  async function handleDelete(categoryId) {
    if (!confirm('Are you sure you want to delete this category?')) return

    try {
      const res = await axios.delete(`/api/admin/categories/${categoryId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.data.success) {
        toast.success('Category deleted successfully')
        fetchCategories()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete category')
    }
  }

  const parentCategories = categories.filter((c) => !c.parentCategory)

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Category Management</h1>
            <p className="text-gray-600 mt-1">Organize products with categories and subcategories</p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <FiPlus />
            <span>Add Category</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <StatCard
            label="Total Categories"
            value={stats.totalCategories || 0}
            icon={<FiFolder />}
            color="text-blue-600"
            bgColor="bg-blue-50"
          />
          <StatCard
  label="Return Requests"
  value={stats.returnedOrders || 0}
  icon={<FiAlertCircle />}
  color="text-red-600"
  bgColor="bg-red-50"
  small
/>
          <StatCard
            label="Active"
            value={stats.activeCategories || 0}
            icon={<FiCheckCircle />}
            color="text-green-600"
            bgColor="bg-green-50"
          />
          <StatCard
            label="Inactive"
            value={stats.inactiveCategories || 0}
            icon={<FiXCircle />}
            color="text-red-600"
            bgColor="bg-red-50"
          />
          <StatCard
            label="Parent Categories"
            value={stats.parentCategories || 0}
            icon={<FiLayers />}
            color="text-purple-600"
            bgColor="bg-purple-50"
          />
          <StatCard
            label="Total Products"
            value={stats.totalProducts || 0}
            icon={<FiGrid />}
            color="text-orange-600"
            bgColor="bg-orange-50"
          />
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="relative max-w-md">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Categories Grid */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-20">
              <FiFolder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">No categories found</p>
              <button
                onClick={openCreateModal}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create First Category
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {categories.map((category) => (
                <div
                  key={category._id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FiFolder className="w-6 h-6 text-blue-600" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-gray-900">{category.name}</h3>
                        <p className="text-sm text-gray-600">{category.slug}</p>
                        {category.parentCategory && (
                          <p className="text-xs text-blue-600 mt-1">
                            ↳ {category.parentCategory.name}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEditModal(category)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => handleDelete(category._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>

                  {category.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{category.description}</p>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <FiGrid className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">{category.productCount} products</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FiPercent className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">{category.commissionRate}% comm.</span>
                      </div>
                    </div>

                    {category.subCategories && category.subCategories.length > 0 && (
                      <div className="flex items-center space-x-2 text-sm">
                        <FiLayers className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">{category.subCategories.length} subcategories</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t mt-3">
                    <span className="text-xs text-gray-500">Order: {category.sortOrder}</span>
                    {category.isActive ? (
                      <span className="inline-flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                        <FiCheckCircle className="w-3 h-3" />
                        <span>Active</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                        <FiXCircle className="w-3 h-3" />
                        <span>Inactive</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingCategory ? 'Edit Category' : 'Create New Category'}
                </h3>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <FiX />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                  {formData.image && (
                    <img src={formData.image} alt="Preview" className="mt-2 w-20 h-20 object-cover rounded-lg" />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Parent Category</label>
                  <select
                    value={formData.parentCategory}
                    onChange={(e) => setFormData({ ...formData, parentCategory: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">None (Top Level)</option>
                    {parentCategories
                      .filter((c) => c._id !== editingCategory?._id)
                      .map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Commission Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={formData.commissionRate}
                      onChange={(e) => setFormData({ ...formData, commissionRate: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sort Order
                    </label>
                    <input
                      type="number"
                      value={formData.sortOrder}
                      onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                    Active Category
                  </label>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingCategory ? 'Update' : 'Create'} Category
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function StatCard({ label, value, icon, color, bgColor }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3">
        <div className={`p-3 rounded-lg ${bgColor}`}>
          <div className={`${color} text-xl`}>{icon}</div>
        </div>
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  )
}
