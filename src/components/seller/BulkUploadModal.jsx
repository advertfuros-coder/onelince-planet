// components/seller/BulkUploadModal.jsx
'use client'

import { useState } from 'react'
import { FiX, FiUpload, FiDownload, FiCheckCircle, FiAlertCircle } from 'react-icons/fi'
import axios from 'axios'
import { useAuth } from '@/lib/hooks/useAuth'
import { toast } from 'react-hot-toast'

export default function BulkUploadModal({ onClose, onSuccess }) {
    const { token } = useAuth()
    const [file, setFile] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [results, setResults] = useState(null)

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0]
        if (selectedFile && (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv'))) {
            setFile(selectedFile)
            setResults(null)
        } else {
            toast.error('Please select a valid CSV file')
        }
    }

    const parseCSV = (text) => {
        const lines = text.split('\n').filter(line => line.trim())
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))

        const products = []
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
            const product = {}

            headers.forEach((header, index) => {
                let value = values[index] || ''

                // Parse special fields
                if (header === 'tags' && value) {
                    product[header] = value.split('|').map(t => t.trim())
                } else if (header === 'specifications' && value) {
                    product[header] = value.split('|').map(spec => {
                        const [key, val] = spec.split(':')
                        return { key: key?.trim(), value: val?.trim() }
                    })
                } else if (header === 'images' && value) {
                    product[header] = value.split('|').map((img, idx) => ({
                        url: img.trim(),
                        alt: `${product.name || 'Product'} image ${idx + 1}`,
                        isPrimary: idx === 0
                    }))
                } else if (['basePrice', 'salePrice', 'costPrice'].includes(header)) {
                    product[header] = parseFloat(value) || 0
                } else if (['stock', 'lowStockThreshold'].includes(header)) {
                    product[header] = parseInt(value) || 0
                } else if (header === 'isActive') {
                    product[header] = value.toLowerCase() === 'true'
                } else {
                    product[header] = value
                }
            })

            products.push(product)
        }

        return products
    }

    const handleUpload = async () => {
        if (!file) {
            toast.error('Please select a file first')
            return
        }

        try {
            setUploading(true)

            // Read and parse CSV
            const text = await file.text()
            const products = parseCSV(text)

            // Upload to API
            const res = await axios.post(
                '/api/seller/products/bulk-upload',
                { products },
                { headers: { Authorization: `Bearer ${token}` } }
            )

            if (res.data.success) {
                setResults(res.data.results)
                toast.success(res.data.message)
                if (onSuccess) onSuccess()
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Upload failed')
        } finally {
            setUploading(false)
        }
    }

    const downloadTemplate = async () => {
        try {
            const res = await axios.get('/api/seller/products/bulk-upload', {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            })

            const url = window.URL.createObjectURL(new Blob([res.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', 'product_upload_template.csv')
            document.body.appendChild(link)
            link.click()
            link.remove()

            toast.success('Template downloaded')
        } catch (error) {
            toast.error('Failed to download template')
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <FiUpload className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Bulk Product Upload</h2>
                            <p className="text-sm text-gray-500">Upload multiple products via CSV</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <FiX className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Instructions */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-semibold text-blue-900 mb-2">📋 Instructions</h3>
                        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                            <li>Download the CSV template below</li>
                            <li>Fill in your product details (one product per row)</li>
                            <li>Save the file and upload it here</li>
                            <li>Review the results and fix any errors</li>
                        </ol>
                    </div>

                    {/* Download Template */}
                    <button
                        onClick={downloadTemplate}
                        className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all"
                    >
                        <FiDownload />
                        <span>Download CSV Template</span>
                    </button>

                    {/* File Upload */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            className="hidden"
                            id="csv-upload"
                        />
                        <label htmlFor="csv-upload" className="cursor-pointer">
                            <FiUpload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-lg font-medium text-gray-900 mb-2">
                                {file ? file.name : 'Click to upload CSV file'}
                            </p>
                            <p className="text-sm text-gray-500">
                                or drag and drop your CSV file here
                            </p>
                        </label>
                    </div>

                    {/* Upload Button */}
                    {file && (
                        <button
                            onClick={handleUpload}
                            disabled={uploading}
                            className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                        >
                            <FiUpload />
                            <span>{uploading ? 'Uploading...' : 'Upload Products'}</span>
                        </button>
                    )}

                    {/* Results */}
                    {results && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-gray-50 rounded-lg p-4 text-center">
                                    <p className="text-3xl font-bold text-gray-900">{results.total}</p>
                                    <p className="text-sm text-gray-600">Total</p>
                                </div>
                                <div className="bg-green-50 rounded-lg p-4 text-center">
                                    <p className="text-3xl font-bold text-green-600">{results.success.length}</p>
                                    <p className="text-sm text-gray-600">Success</p>
                                </div>
                                <div className="bg-red-50 rounded-lg p-4 text-center">
                                    <p className="text-3xl font-bold text-red-600">{results.failed.length}</p>
                                    <p className="text-sm text-gray-600">Failed</p>
                                </div>
                            </div>

                            {/* Success List */}
                            {results.success.length > 0 && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                                    <h4 className="font-semibold text-green-900 mb-2 flex items-center space-x-2">
                                        <FiCheckCircle />
                                        <span>Successfully Uploaded ({results.success.length})</span>
                                    </h4>
                                    <div className="space-y-1">
                                        {results.success.map((item, index) => (
                                            <p key={index} className="text-sm text-green-800">
                                                Row {item.row}: {item.name}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Failed List */}
                            {results.failed.length > 0 && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                                    <h4 className="font-semibold text-red-900 mb-2 flex items-center space-x-2">
                                        <FiAlertCircle />
                                        <span>Failed ({results.failed.length})</span>
                                    </h4>
                                    <div className="space-y-2">
                                        {results.failed.map((item, index) => (
                                            <div key={index} className="text-sm">
                                                <p className="font-medium text-red-800">Row {item.row}:</p>
                                                <p className="text-red-600">{item.error}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}
