'use client'

import { useState, useRef } from 'react'
import { Upload, X, Loader2, Image as ImageIcon, ChevronLeft, ChevronRight, Star } from 'lucide-react'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

export default function ImageUpload({ images = [], onChange, token, maxFiles = 8 }) {
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef(null)

    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files)
        if (files.length === 0) return

        if (images.length + files.length > maxFiles) {
            toast.error(`Maximum ${maxFiles} images allowed`)
            return
        }

        setUploading(true)
        const newImages = [...images]

        try {
            // Upload multiple files in parallel
            const uploadPromises = files.map(async (file) => {
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
                        return {
                            url: res.data.url,
                            alt: file.name.split('.')[0],
                            isPrimary: false
                        }
                    }
                } catch (err) {
                    console.error(err)
                    toast.error(`Failed to upload ${file.name}`)
                    return null
                }
            })

            const uploadedResults = await Promise.all(uploadPromises)
            const validResults = uploadedResults.filter(img => img !== null)

            const updatedImages = [...newImages, ...validResults]

            // If no primary exists, make the first one primary
            if (updatedImages.length > 0 && !updatedImages.some(img => img.isPrimary)) {
                updatedImages[0].isPrimary = true
            }

            onChange(updatedImages)
            toast.success('Images synchronized')

        } catch (error) {
            console.error(error)
            toast.error('Upload sequence failed')
        } finally {
            setUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    const removeImage = (index) => {
        const removedWasPrimary = images[index].isPrimary
        const newImages = images.filter((_, i) => i !== index)

        // If primary was removed, make the first one primary
        if (removedWasPrimary && newImages.length > 0) {
            newImages[0].isPrimary = true
        }
        onChange(newImages)
    }

    const setPrimary = (index) => {
        const newImages = images.map((img, i) => ({
            ...img,
            isPrimary: i === index
        }))
        onChange(newImages)
    }

    const moveImage = (index, direction) => {
        if (direction === 'left' && index > 0) {
            const newImages = [...images]
            const temp = newImages[index]
            newImages[index] = newImages[index - 1]
            newImages[index - 1] = temp
            onChange(newImages)
        } else if (direction === 'right' && index < images.length - 1) {
            const newImages = [...images]
            const temp = newImages[index]
            newImages[index] = newImages[index + 1]
            newImages[index + 1] = temp
            onChange(newImages)
        }
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                <AnimatePresence mode="popLayout">
                    {images.map((img, index) => (
                        <motion.div
                            layout
                            key={img.url}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            className={`relative aspect-square group rounded-[1.5rem] overflow-hidden border-2 ${img.isPrimary ? 'border-blue-600 shadow-xl shadow-blue-500/10' : 'border-slate-100'}`}
                        >
                            <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />

                            {/* Overlay Controls */}
                            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 p-4 backdrop-blur-sm">
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => moveImage(index, 'left')}
                                        disabled={index === 0}
                                        className="p-1.5 bg-white/20 text-white rounded-lg hover:bg-white hover:text-slate-900 disabled:opacity-30 transition-all"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPrimary(index)}
                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all ${img.isPrimary ? 'bg-blue-600 text-white' : 'bg-white hover:bg-blue-600 hover:text-white text-slate-900'}`}
                                    >
                                        <Star size={10} fill={img.isPrimary ? "currentColor" : "none"} />
                                        {img.isPrimary ? 'Master' : 'Main'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => moveImage(index, 'right')}
                                        disabled={index === images.length - 1}
                                        className="p-1.5 bg-white/20 text-white rounded-lg hover:bg-white hover:text-slate-900 disabled:opacity-30 transition-all"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-rose-500/30 transition-all flex items-center gap-2"
                                >
                                    <X size={14} /> Remove
                                </button>
                            </div>

                            {/* Indicators */}
                            <div className="absolute top-3 left-3 flex gap-2">
                                {img.isPrimary && (
                                    <div className="px-2 py-1 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest rounded-lg shadow-lg">
                                        Primary
                                    </div>
                                )}
                                <div className="px-2 py-1 bg-white/90 backdrop-blur-sm text-slate-900 text-[9px] font-black uppercase tracking-widest rounded-lg shadow-sm border border-slate-200">
                                    #{index + 1}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {images.length < maxFiles && (
                    <motion.button
                        layout
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="aspect-square rounded-[1.5rem] border-2 border-dashed border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all flex flex-col items-center justify-center gap-3 text-slate-400 hover:text-blue-500 group relative"
                    >
                        {uploading ? (
                            <>
                                <Loader2 size={24} className="animate-spin text-blue-600" />
                                <span className="text-[10px] font-black uppercase tracking-widest animate-pulse">Syncing...</span>
                            </>
                        ) : (
                            <>
                                <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-blue-100 group-hover:scale-110 transition-all">
                                    <Upload size={24} />
                                </div>
                                <div className="text-center">
                                    <span className="text-[10px] font-black uppercase tracking-widest block">Add Matrix Asset</span>
                                    <span className="text-[9px] font-bold opacity-60">Limit: {maxFiles} Files</span>
                                </div>
                            </>
                        )}
                    </motion.button>
                )}
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                multiple
                accept="image/*"
            />

            <div className="flex items-center gap-3 px-2">
                <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    <ImageIcon size={14} className="text-blue-500/50" />
                    Optimal: 1:1 Aspect Ratio (WEBP/PNG)
                </div>
                <div className="h-px flex-1 bg-slate-100" />
            </div>
        </div>
    )
}
