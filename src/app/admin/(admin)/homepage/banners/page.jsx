'use client'
import { useState, useEffect } from 'react'
import HeroBanner from '@/components/customer/HeroBanner'
import { FiUpload, FiTrash2, FiPlus, FiSave, FiEye, FiLayout, FiMaximize2 } from 'react-icons/fi'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/lib/context/AuthContext'

export default function BannerManagement() {
    const { token } = useAuth()
    const [banners, setBanners] = useState([])
    const [editingBanner, setEditingBanner] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)

    useEffect(() => {
        if (token) {
            fetchBanners()
        }
    }, [token])

    const fetchBanners = async () => {
        if (!token) return
        
        try {
            const res = await fetch('/api/admin/homepage/banners', {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.success) {
                setBanners(data.banners)
                if (editingBanner?._id) {
                    const updatedEditing = data.banners.find(b => b._id === editingBanner._id)
                    if (updatedEditing) selectBanner(updatedEditing)
                } else if (data.banners.length > 0 && !editingBanner) {
                    selectBanner(data.banners[0])
                }
            } else if (data.message) {
                toast.error(data.message)
            }
        } catch (error) {
            console.error('Error fetching banners:', error)
            toast.error('Failed to fetch banners')
        } finally {
            setLoading(false)
        }
    }

    const createEmptyBanner = () => ({
        type: 'main',
        title: 'New Banner',
        subtitle: 'New Subtitle',
        description: 'Description goes here...',
        productImage: '',
        buttonText: 'Shop Now',
        buttonLink: '#',
        bgColor: 'from-blue-600 to-indigo-700',
        textColor: 'text-white',
        textAlign: { vertical: 'center', horizontal: 'left' },
        imagePosition: { horizontal: 'right', vertical: 'center' },
        buttonStyle: { bgColor: '#111827', textColor: '#FFFFFF', align: 'left' },
        containerBg: '#FFFFFF',
        customTextColor: '#FFFFFF',
        showTitle: true,
        showSubtitle: true,
        showDescription: true,
        showButton: true,
        active: true
    })

    const selectBanner = (banner) => {
        // Deep merge with defaults to ensure all fields exist for the editor
        const defaults = createEmptyBanner()
        setEditingBanner({
            ...defaults,
            ...banner,
            textAlign: { ...defaults.textAlign, ...banner.textAlign },
            imagePosition: { ...defaults.imagePosition, ...banner.imagePosition },
            buttonStyle: { ...defaults.buttonStyle, ...banner.buttonStyle }
        })
        // Scroll to top of editor on mobile/small screens
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleSave = async () => {
        if (!token) {
            toast.error('Not authenticated. Please login again.')
            return
        }
        
        if (!editingBanner) {
            toast.error('No banner selected to save')
            return
        }
        
        setSaving(true)
        try {
            // Create a clean copy and remove _id if it's undefined or empty
            const bannerToSave = { ...editingBanner }
            if (!bannerToSave._id || bannerToSave._id === '') {
                delete bannerToSave._id
            }
            
            console.log('Saving banner:', bannerToSave)
            
            const res = await fetch('/api/admin/homepage/banners', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(bannerToSave)
            })
            
            const data = await res.json()
            console.log('Save response:', data)
            
            if (data.success) {
                toast.success('Banner saved successfully!')
                fetchBanners()
            } else {
                const errorMsg = data.message || 'Failed to save banner'
                toast.error(errorMsg)
                console.error('Server error:', data)
            }
        } catch (error) {
            console.error('Error saving banner:', error)
            toast.error('Failed to save banner: ' + error.message)
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id) => {
        if (!token) return
        if (!confirm('Are you sure you want to delete this banner?')) return
        
        try {
            await fetch(`/api/admin/homepage/banners?id=${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            })
            toast.success('Banner deleted')
            fetchBanners()
        } catch (error) {
            console.error('Error deleting banner:', error)
            toast.error('Failed to delete banner')
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
                setEditingBanner({ ...editingBanner, productImage: data.url })
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
                        Banner Management
                    </h1>
                    <p className="text-gray-500">Customize your homepage banners and side cards</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => selectBanner(createEmptyBanner())}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200"
                    >
                        <FiPlus /> New Long Banner
                    </button>
                    <button
                        onClick={() => selectBanner({ ...createEmptyBanner(), type: 'sale' })}
                        className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all shadow-lg hover:shadow-purple-200"
                    >
                        <FiPlus /> New Small Card
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Editor Form */}
                <div className="xl:col-span-4 space-y-6">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-6 overflow-y-auto max-h-[85vh] no-scrollbar">

                        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                            <h2 className="font-bold text-gray-800 flex items-center gap-2">
                                <FiLayout className="text-blue-500" />
                                Editor: {editingBanner?.type === 'main' ? 'Long Banner' : 'Small Card'}
                            </h2>
                            <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${editingBanner?.type === 'main' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                                {editingBanner?.type}
                            </div>
                        </div>

                        {/* Content Section */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">General Content</label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setEditingBanner({ ...editingBanner, showTitle: !editingBanner?.showTitle })}
                                        className={`px-2 py-1 rounded text-[10px] font-bold ${editingBanner?.showTitle ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}
                                    >
                                        Title: {editingBanner?.showTitle ? 'ON' : 'OFF'}
                                    </button>
                                    <button
                                        onClick={() => setEditingBanner({ ...editingBanner, showSubtitle: !editingBanner?.showSubtitle })}
                                        className={`px-2 py-1 rounded text-[10px] font-bold ${editingBanner?.showSubtitle ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}
                                    >
                                        Sub: {editingBanner?.showSubtitle ? 'ON' : 'OFF'}
                                    </button>
                                    <button
                                        onClick={() => setEditingBanner({ ...editingBanner, showDescription: !editingBanner?.showDescription })}
                                        className={`px-2 py-1 rounded text-[10px] font-bold ${editingBanner?.showDescription ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}
                                    >
                                        Desc: {editingBanner?.showDescription ? 'ON' : 'OFF'}
                                    </button>
                                    <button
                                        onClick={() => setEditingBanner({ ...editingBanner, showButton: !editingBanner?.showButton })}
                                        className={`px-2 py-1 rounded text-[10px] font-bold ${editingBanner?.showButton !== false ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}
                                    >
                                        Btn: {editingBanner?.showButton !== false ? 'ON' : 'OFF'}
                                    </button>
                                </div>
                            </div>
                            <input
                                type="text"
                                value={editingBanner?.title || ''}
                                onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                                placeholder="Title"
                                className={`w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all ${!editingBanner?.showTitle && 'opacity-50 grayscale'}`}
                            />
                            <input
                                type="text"
                                value={editingBanner?.subtitle || ''}
                                onChange={(e) => setEditingBanner({ ...editingBanner, subtitle: e.target.value })}
                                placeholder="Subtitle / Offer Text"
                                className={`w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all ${!editingBanner?.showSubtitle && 'opacity-50 grayscale'}`}
                            />
                            <textarea
                                value={editingBanner?.description || ''}
                                onChange={(e) => setEditingBanner({ ...editingBanner, description: e.target.value })}
                                placeholder="Description"
                                rows={3}
                                className={`w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all ${!editingBanner?.showDescription && 'opacity-50 grayscale'}`}
                            />
                            <input
                                type="text"
                                value={editingBanner?.buttonLink || ''}
                                onChange={(e) => setEditingBanner({ ...editingBanner, buttonLink: e.target.value })}
                                placeholder="Banner / Button Link (URL)"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                            {editingBanner?.type === 'sale' && (
                                <input
                                    type="text"
                                    value={editingBanner?.discount || ''}
                                    onChange={(e) => setEditingBanner({ ...editingBanner, discount: e.target.value })}
                                    placeholder="Discount (e.g. 50%)"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                />
                            )}
                        </div>

                        {/* Image Section */}
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Media Assets</label>
                            <div className="relative group">
                                {editingBanner?.productImage ? (
                                    <div className="relative h-40 rounded-2xl overflow-hidden border border-gray-100">
                                        <img src={editingBanner.productImage} className="w-full h-full object-contain bg-gray-50" />
                                        <button
                                            onClick={() => setEditingBanner({ ...editingBanner, productImage: '' })}
                                            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-200 rounded-2xl hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer">
                                        <input type="file" className="hidden" onChange={handleImageUpload} />
                                        <FiUpload className="text-gray-400 text-2xl mb-2" />
                                        <span className="text-sm text-gray-500">{uploading ? 'Uploading...' : 'Upload Image'}</span>
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* Styling & Alignment */}
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Text Align (H)</label>
                                    <div className="flex p-1 bg-gray-100 rounded-lg">
                                        {['left', 'center', 'right'].map(h => (
                                            <button
                                                key={h}
                                                onClick={() => setEditingBanner({ ...editingBanner, textAlign: { ...editingBanner?.textAlign, horizontal: h } })}
                                                className={`flex-1 py-1 text-xs rounded ${editingBanner?.textAlign?.horizontal === h ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
                                            >
                                                {h}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Text Align (V)</label>
                                    <div className="flex p-1 bg-gray-100 rounded-lg">
                                        {['top', 'center', 'bottom'].map(v => (
                                            <button
                                                key={v}
                                                onClick={() => setEditingBanner({ ...editingBanner, textAlign: { ...editingBanner?.textAlign, vertical: v } })}
                                                className={`flex-1 py-1 text-xs rounded ${editingBanner?.textAlign?.vertical === v ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
                                            >
                                                {v}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Image Pos (H)</label>
                                    <div className="flex p-1 bg-gray-100 rounded-lg">
                                        {['left', 'center', 'right'].map(h => (
                                            <button
                                                key={h}
                                                onClick={() => setEditingBanner({ ...editingBanner, imagePosition: { ...editingBanner?.imagePosition, horizontal: h } })}
                                                className={`flex-1 py-1 text-xs rounded ${editingBanner?.imagePosition?.horizontal === h ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
                                            >
                                                {h}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Image Pos (V)</label>
                                    <div className="flex p-1 bg-gray-100 rounded-lg">
                                        {['top', 'center', 'bottom'].map(v => (
                                            <button
                                                key={v}
                                                onClick={() => setEditingBanner({ ...editingBanner, imagePosition: { ...editingBanner?.imagePosition, vertical: v } })}
                                                className={`flex-1 py-1 text-xs rounded ${editingBanner?.imagePosition?.vertical === v ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
                                            >
                                                {v}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Button Bg</label>
                                    <input
                                        type="color"
                                        value={editingBanner?.buttonStyle?.bgColor || '#FFFFFF'}
                                        onChange={(e) => setEditingBanner({ ...editingBanner, buttonStyle: { ...editingBanner?.buttonStyle, bgColor: e.target.value } })}
                                        className="w-full h-10 rounded-lg cursor-pointer bg-white border border-gray-200 p-1"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Button Text</label>
                                    <input
                                        type="color"
                                        value={editingBanner?.buttonStyle?.textColor || '#111827'}
                                        onChange={(e) => setEditingBanner({ ...editingBanner, buttonStyle: { ...editingBanner?.buttonStyle, textColor: e.target.value } })}
                                        className="w-full h-10 rounded-lg cursor-pointer bg-white border border-gray-200 p-1"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase">Button Alignment</label>
                                <div className="flex p-1 bg-gray-100 rounded-lg">
                                    {['left', 'center', 'right'].map(h => (
                                        <button
                                            key={h}
                                            onClick={() => setEditingBanner({ ...editingBanner, buttonStyle: { ...editingBanner?.buttonStyle, align: h } })}
                                            className={`flex-1 py-1 text-xs rounded ${editingBanner?.buttonStyle?.align === h ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
                                        >
                                            {h}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Banner Bg</label>
                                    <input
                                        type="color"
                                        value={editingBanner?.containerBg || '#FFFFFF'}
                                        onChange={(e) => setEditingBanner({ ...editingBanner, containerBg: e.target.value })}
                                        className="w-full h-10 rounded-lg cursor-pointer bg-white border border-gray-200 p-1"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Text Color</label>
                                    <input
                                        type="color"
                                        value={editingBanner?.customTextColor || '#FFFFFF'}
                                        onChange={(e) => setEditingBanner({ ...editingBanner, customTextColor: e.target.value, textColor: '' })}
                                        className="w-full h-10 rounded-lg cursor-pointer bg-white border border-gray-200 p-1"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Bg Gradient / Tailwind Class</label>
                                <input
                                    type="text"
                                    value={editingBanner?.bgColor || ''}
                                    onChange={(e) => setEditingBanner({ ...editingBanner, bgColor: e.target.value })}
                                    placeholder="e.g. from-blue-600 to-indigo-700"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                <p className="text-[10px] text-gray-400 italic">Overrides container color if set. Use Tailwind gradient classes.</p>
                            </div>
                        </div>

                        {/* Save Button */}
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className={`w-full py-4 text-white rounded-2xl font-bold transition-all shadow-xl flex items-center justify-center gap-2 ${editingBanner?.type === 'main' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'}`}
                        >
                            <FiSave /> {saving ? 'Saving...' : 'Save Configuration'}
                        </button>
                    </div>
                </div>

                {/* Live Preview Container */}
                <div className="xl:col-span-8 space-y-6">
                    <div className="bg-gray-50 rounded-[2.5rem] p-4 lg:p-8 border border-gray-100 shadow-inner min-h-[500px] flex flex-col">
                        <div className="flex items-center gap-3 mb-6 px-4">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                            </div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-4 flex items-center gap-2">
                                <FiEye className="text-blue-500" /> Live Site Preview
                            </span>
                        </div>

                        {/* The Actual Preview Component */}
                        <div className="flex-1 rounded-3xl overflow-hidden shadow-2xl bg-white border border-gray-100 mb-8">
                            <HeroBanner banners={banners} previewBanner={editingBanner} />
                        </div>

                        {/* Existing Banners Section */}
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-2 mb-4">Main Carousel Banners</h3>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    {banners.filter(b => b.type === 'main').map((b, idx) => (
                                        <div
                                            key={b._id || idx}
                                            onClick={() => selectBanner(b)}
                                            className={`relative group cursor-pointer p-0.5 rounded-2xl transition-all ${editingBanner?._id === b._id ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
                                        >
                                            <div className={`p-3 rounded-2xl border ${editingBanner?._id === b._id ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-100 hover:border-blue-100'}`}>
                                                <div className="aspect-video rounded-lg overflow-hidden mb-2 bg-gray-100 italic flex items-center justify-center text-[10px] text-gray-400">
                                                    {b.productImage ? <img src={b.productImage} className="w-full h-full object-cover" /> : 'No Image'}
                                                </div>
                                                <div className="text-sm font-bold text-gray-700 truncate">{b.title}</div>
                                                {editingBanner?._id === b._id && (
                                                    <div className="mt-1 text-[10px] font-bold text-blue-500 flex items-center gap-1 animate-pulse">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Currently Editing
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDelete(b._id); }}
                                                className="absolute -top-1 -right-1 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
                                            >
                                                <FiTrash2 size={10} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-2 mb-4">Promotional Side Cards</h3>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    {banners.filter(b => b.type === 'sale').map((b, idx) => (
                                        <div
                                            key={b._id || idx}
                                            onClick={() => selectBanner(b)}
                                            className={`relative group cursor-pointer p-0.5 rounded-2xl transition-all ${editingBanner?._id === b._id ? 'ring-2 ring-purple-500 ring-offset-2' : ''}`}
                                        >
                                            <div className={`p-3 rounded-2xl border ${editingBanner?._id === b._id ? 'bg-purple-50 border-purple-200' : 'bg-white border-gray-100 hover:border-purple-100'}`}>
                                                <div className="aspect-video rounded-lg overflow-hidden mb-2 bg-gray-100 italic flex items-center justify-center text-[10px] text-gray-400">
                                                    {b.productImage ? <img src={b.productImage} className="w-full h-full object-cover" /> : 'No Image'}
                                                </div>
                                                <div className="text-sm font-bold text-gray-700 truncate">{b.title}</div>
                                                {editingBanner?._id === b._id && (
                                                    <div className="mt-1 text-[10px] font-bold text-blue-500 flex items-center gap-1 animate-pulse">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Currently Editing
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDelete(b._id); }}
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
            </div>

            <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
        </div>
    )
}
