'use client'
import { useState, useEffect } from 'react'
import { FiUpload, FiTrash2, FiPlus, FiSave, FiEye, FiTag } from 'react-icons/fi'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/lib/context/AuthContext'

export default function FeaturedBrandsManagement() {
    const { token } = useAuth()
    const [brands, setBrands] = useState([])
    const [editingBrand, setEditingBrand] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)

    useEffect(() => {
        if (token) {
            fetchBrands()
        }
    }, [token])

    const fetchBrands = async () => {
        if (!token) return

        try {
            const res = await fetch('/api/admin/homepage/featured-brands', {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.success) {
                setBrands(data.brands)
                if (editingBrand?._id) {
                    const updatedEditing = data.brands.find(b => b._id === editingBrand._id)
                    if (updatedEditing) setEditingBrand(updatedEditing)
                } else if (data.brands.length > 0 && !editingBrand) {
                    setEditingBrand(data.brands[0])
                }
            } else if (data.message) {
                toast.error(data.message)
            }
        } catch (error) {
            console.error('Error fetching brands:', error)
            toast.error('Failed to fetch brands')
        } finally {
            setLoading(false)
        }
    }

    const createEmptyBrand = () => ({
        title: 'New Brand',
        image: '',
        redirectUrl: '/category/brand-name',
        order: brands.length,
        active: true
    })

    const handleSave = async () => {
        if (!token) {
            toast.error('Not authenticated. Please login again.')
            return
        }

        if (!editingBrand) {
            toast.error('No brand selected to save')
            return
        }

        if (!editingBrand.image) {
            toast.error('Please upload a brand image')
            return
        }

        setSaving(true)
        try {
            const brandToSave = { ...editingBrand }
            if (!brandToSave._id || brandToSave._id === '') {
                delete brandToSave._id
            }

            const res = await fetch('/api/admin/homepage/featured-brands', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(brandToSave)
            })

            const data = await res.json()

            if (data.success) {
                toast.success('Brand saved successfully!')
                fetchBrands()
            } else {
                const errorMsg = data.message || 'Failed to save brand'
                toast.error(errorMsg)
            }
        } catch (error) {
            console.error('Error saving brand:', error)
            toast.error('Failed to save brand: ' + error.message)
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id) => {
        if (!token) return
        if (!confirm('Are you sure you want to delete this brand?')) return

        try {
            await fetch(`/api/admin/homepage/featured-brands?id=${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            })
            toast.success('Brand deleted')
            setEditingBrand(null)
            fetchBrands()
        } catch (error) {
            console.error('Error deleting brand:', error)
            toast.error('Failed to delete brand')
        }
    }

    const handleImageUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        if (!token) return

        setUploading(true)
        const formData = new FormData()
        formData.append('file', file)

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            })
            const data = await res.json()
            if (data.success) {
                setEditingBrand({ ...editingBrand, image: data.url })
                toast.success('Image uploaded!')
            } else if (data.message) {
                toast.error(data.message)
            }
        } catch (error) {
            console.error('Error uploading image:', error)
            toast.error('Upload failed')
        } finally {
            setUploading(false)
        }
    }

    if (loading) return <div className="p-8 text-center">Loading...</div>

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                        Featured Brands Management
                    </h1>
                    <p className="text-gray-500">Manage brands displayed on the homepage</p>
                </div>
                <button
                    onClick={() => setEditingBrand(createEmptyBrand())}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200"
                >
                    <FiPlus /> Add New Brand
                </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Editor Form */}
                <div className="xl:col-span-4 space-y-6">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-6 overflow-y-auto max-h-[85vh] no-scrollbar">

                        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                            <h2 className="font-bold text-gray-800 flex items-center gap-2">
                                <FiTag className="text-blue-500" />
                                {editingBrand?._id ? 'Edit Brand' : 'New Brand'}
                            </h2>
                            <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${editingBrand?.active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                                {editingBrand?.active ? 'Active' : 'Inactive'}
                            </div>
                        </div>

                        {/* Brand Details */}
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Brand Name</label>
                                <input
                                    type="text"
                                    value={editingBrand?.title || ''}
                                    onChange={(e) => setEditingBrand({ ...editingBrand, title: e.target.value })}
                                    placeholder="e.g., Nike, Apple, Samsung"
                                    className="w-full px-4 py-3 mt-2 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Redirect URL</label>
                                <input
                                    type="text"
                                    value={editingBrand?.redirectUrl || ''}
                                    onChange={(e) => setEditingBrand({ ...editingBrand, redirectUrl: e.target.value })}
                                    placeholder="/category/brand-name or external URL"
                                    className="w-full px-4 py-3 mt-2 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                                <p className="text-[10px] text-gray-400 mt-1 italic">Where users will be redirected when clicking this brand</p>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Display Order</label>
                                <input
                                    type="number"
                                    value={editingBrand?.order || 0}
                                    onChange={(e) => setEditingBrand({ ...editingBrand, order: parseInt(e.target.value) })}
                                    className="w-full px-4 py-3 mt-2 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                                <p className="text-[10px] text-gray-400 mt-1 italic">Lower numbers appear first</p>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Status</label>
                                <div className="flex gap-2 mt-2">
                                    <button
                                        onClick={() => setEditingBrand({ ...editingBrand, active: true })}
                                        className={`flex-1 py-2 rounded-lg font-semibold transition-all ${editingBrand?.active ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500'}`}
                                    >
                                        Active
                                    </button>
                                    <button
                                        onClick={() => setEditingBrand({ ...editingBrand, active: false })}
                                        className={`flex-1 py-2 rounded-lg font-semibold transition-all ${!editingBrand?.active ? 'bg-gray-500 text-white' : 'bg-gray-100 text-gray-500'}`}
                                    >
                                        Inactive
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Image Upload */}
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Brand Image</label>
                            <div className="relative group">
                                {editingBrand?.image ? (
                                    <div className="relative h-48 rounded-2xl overflow-hidden border border-gray-100">
                                        <img src={editingBrand.image} className="w-full h-full object-contain bg-gray-50" alt={editingBrand.title} />
                                        <button
                                            onClick={() => setEditingBrand({ ...editingBrand, image: '' })}
                                            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-200 rounded-2xl hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer">
                                        <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                                        <FiUpload className="text-gray-400 text-2xl mb-2" />
                                        <span className="text-sm text-gray-500">{uploading ? 'Uploading...' : 'Upload Brand Image'}</span>
                                        <span className="text-xs text-gray-400 mt-1">Recommended: Square image (1:1 ratio)</span>
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* Save Button */}
                        <button
                            onClick={handleSave}
                            disabled={saving || !editingBrand?.image}
                            className={`w-full py-4 text-white rounded-2xl font-bold transition-all shadow-xl flex items-center justify-center gap-2 ${!editingBrand?.image
                                    ? 'bg-gray-300 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                        >
                            <FiSave /> {saving ? 'Saving...' : 'Save Brand'}
                        </button>
                    </div>
                </div>

                {/* Preview & List */}
                <div className="xl:col-span-8 space-y-6">
                    <div className="bg-gray-50 rounded-[2.5rem] p-4 lg:p-8 border border-gray-100 shadow-inner">
                        <div className="flex items-center gap-3 mb-6 px-4">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                            </div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-4 flex items-center gap-2">
                                <FiEye className="text-blue-500" /> Live Preview
                            </span>
                        </div>

                        {/* Preview Section */}
                        {editingBrand && (
                            <div className="bg-white rounded-3xl p-8 mb-8 shadow-lg">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Current Brand Preview</h3>
                                <div className="relative block w-64 h-64 mx-auto overflow-hidden rounded-[32px] group transition-transform duration-500 hover:scale-[1.02] shadow-lg">
                                    {editingBrand.image ? (
                                        <>
                                            <img
                                                src={editingBrand.image}
                                                alt={editingBrand.title}
                                                className="absolute inset-0 w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/[0.04] group-hover:bg-black/[0.08] transition-colors duration-300"></div>
                                            <div className="absolute bottom-6 left-6">
                                                <span className="px-6 py-2.5 rounded-full text-xs font-semibold shadow-lg transition-all duration-300 group-hover:px-8 bg-white text-black">
                                                    Shop now
                                                </span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
                                            No Image
                                        </div>
                                    )}
                                </div>
                                <p className="text-center mt-4 text-sm text-gray-600">
                                    <strong>{editingBrand.title}</strong> → {editingBrand.redirectUrl}
                                </p>
                            </div>
                        )}

                        {/* All Brands Grid */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-2">All Featured Brands ({brands.length})</h3>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {brands.map((brand, idx) => (
                                    <div
                                        key={brand._id || idx}
                                        onClick={() => setEditingBrand(brand)}
                                        className={`relative group cursor-pointer p-0.5 rounded-2xl transition-all ${editingBrand?._id === brand._id ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
                                    >
                                        <div className={`p-3 rounded-2xl border ${editingBrand?._id === brand._id ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-100 hover:border-blue-100'}`}>
                                            <div className="aspect-square rounded-lg overflow-hidden mb-2 bg-gray-100 flex items-center justify-center">
                                                {brand.image ? (
                                                    <img src={brand.image} className="w-full h-full object-cover" alt={brand.title} />
                                                ) : (
                                                    <span className="text-[10px] text-gray-400 italic">No Image</span>
                                                )}
                                            </div>
                                            <div className="text-sm font-bold text-gray-700 truncate">{brand.title}</div>
                                            <div className="text-[10px] text-gray-400 truncate mt-1">{brand.redirectUrl}</div>
                                            {!brand.active && (
                                                <div className="mt-1 text-[10px] font-bold text-red-500">Inactive</div>
                                            )}
                                            {editingBrand?._id === brand._id && (
                                                <div className="mt-1 text-[10px] font-bold text-blue-500 flex items-center gap-1 animate-pulse">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Editing
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDelete(brand._id); }}
                                            className="absolute -top-1 -right-1 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
                                        >
                                            <FiTrash2 size={10} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    )
}
