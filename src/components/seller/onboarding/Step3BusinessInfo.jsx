'use client'
import { FiBriefcase, FiFileText, FiUpload, FiCalendar, FiZap } from 'react-icons/fi'
import { useState } from 'react'
import { smartParseDocument } from '@/lib/utils/ocrService'

export default function Step3BusinessInfo({ formData, updateFormData, errors }) {
    const [tradeLicensePreview, setTradeLicensePreview] = useState(null)

    const businessCategories = [
        'Electronics', 'Fashion', 'Women\'s Fashion', 'Kids\' Fashion',
        'Health & Beauty', 'Pharmacy', 'Groceries', 'Luxury Items',
        'Home & Living', 'Sports & Outdoors', 'Books & Media',
        'Automotive', 'Baby Products', 'Jewelry', 'Others'
    ]

    const handleFileUpload = (e) => {
        const file = e.target.files[0]
        if (file) {
            updateFormData({ tradeLicense: file })

            const reader = new FileReader()
            reader.onloadend = () => {
                setTradeLicensePreview(reader.result)
            }
            reader.readAsDataURL(file)
        }
    }

    // Generate years for dropdown (from 1900 to current year)
    const years = Array.from(
        { length: new Date().getFullYear() - 1899 },
        (_, i) => new Date().getFullYear() - i
    )

    return (
        <div className="space-y-8">
            {/* Business Name */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                    Business/Company Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <FiBriefcase className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        value={formData.businessName}
                        onChange={(e) => updateFormData({ businessName: e.target.value })}
                        placeholder="Your business legal name"
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.businessName ? 'border-red-300' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                            }`}
                    />
                </div>
                {errors.businessName && <p className="mt-2 text-sm text-red-600">{errors.businessName}</p>}
            </div>

            {/* GSTIN/TRN */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                    GST Number / TRN <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <FiFileText className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        value={formData.gstin}
                        onChange={(e) => updateFormData({ gstin: e.target.value.toUpperCase() })}
                        placeholder="GST/TRN Number"
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all uppercase ${errors.gstin ? 'border-red-300' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                            }`}
                    />
                </div>
                <p className="mt-1 text-xs text-gray-500">15-digit GST number for India or TRN for UAE</p>
                {errors.gstin && <p className="mt-2 text-sm text-red-600">{errors.gstin}</p>}
            </div>

            {/* PAN */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                    PAN Card Number {formData.residentialAddress?.country === 'IN' && <span className="text-red-500">*</span>}
                </label>
                <input
                    type="text"
                    value={formData.pan}
                    onChange={(e) => updateFormData({ pan: e.target.value.toUpperCase() })}
                    placeholder="ABCDE1234F"
                    maxLength={10}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all uppercase"
                />
                <p className="mt-1 text-xs text-gray-500">Required for Indian sellers</p>

                {/* Smart OCR Upload for PAN */}
                <div className="mt-3 flex items-center gap-2">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                            const file = e.target.files[0]
                            if (file) {
                                try {
                                    const result = await smartParseDocument(file, 'pan')
                                    if (result.success && result.data.pan) {
                                        updateFormData({
                                            pan: result.data.pan,
                                            fullName: result.data.fullName || formData.fullName
                                        })
                                        alert('✅ PAN extracted: ' + result.data.pan)
                                    }
                                } catch (error) {
                                    console.error('OCR error:', error)
                                }
                            }
                        }}
                        className="hidden"
                        id="panUpload"
                    />
                    <label
                        htmlFor="panUpload"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-sm font-semibold cursor-pointer hover:from-purple-700 hover:to-indigo-700 transition-all"
                    >
                        <FiZap className="w-4 h-4" />
                        <span>Smart Upload PAN (Auto-Fill)</span>
                    </label>
                </div>
            </div>

            {/* Smart OCR Upload for GST */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                        <FiZap className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">🚀 Smart Document Upload</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Upload your GST certificate and we'll automatically extract your GSTIN and business name using AI-powered OCR!
                        </p>
                        <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={async (e) => {
                                const file = e.target.files[0]
                                if (file) {
                                    const btn = e.target.nextElementSibling
                                    btn.disabled = true
                                    btn.innerHTML = '<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Processing...'

                                    try {
                                        const result = await smartParseDocument(file, 'gst')
                                        if (result.success) {
                                            updateFormData({
                                                gstin: result.data.gstin || formData.gstin,
                                                businessName: result.data.businessName || formData.businessName
                                            })
                                            alert('✅ Data extracted!\nGSTIN: ' + (result.data.gstin || 'Not found') + '\nBusiness: ' + (result.data.businessName || 'Not found'))
                                        }
                                    } catch (error) {
                                        console.error('OCR error:', error)
                                        alert('❌ Could not extract data. Please enter manually.')
                                    } finally {
                                        btn.disabled = false
                                        btn.innerHTML = '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M13 7L11 3l-2 4H5l3.5 3L7 14l4-2.5L15 14l-1.5-4L17 7h-4z"/></svg> Upload GST Certificate'
                                    }
                                }
                            }}
                            className="hidden"
                            id="gstUpload"
                        />
                        <label
                            htmlFor="gstUpload"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-sm font-bold cursor-pointer hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M13 7L11 3l-2 4H5l3.5 3L7 14l4-2.5L15 14l-1.5-4L17 7h-4z" />
                            </svg>
                            <span>Upload GST Certificate</span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Business Category */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                    Primary Business Category <span className="text-red-500">*</span>
                </label>
                <select
                    value={formData.businessCategory}
                    onChange={(e) => updateFormData({ businessCategory: e.target.value })}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.businessCategory ? 'border-red-300' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                        }`}
                >
                    <option value="">Select a category</option>
                    {businessCategories.map((category) => (
                        <option key={category} value={category.toLowerCase().replace(/[^a-z0-9]/g, '_')}>
                            {category}
                        </option>
                    ))}
                </select>
                {errors.businessCategory && <p className="mt-2 text-sm text-red-600">{errors.businessCategory}</p>}
            </div>

            {/* Established Year */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                    Year Established
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <FiCalendar className="w-5 h-5 text-gray-400" />
                    </div>
                    <select
                        value={formData.establishedYear}
                        onChange={(e) => updateFormData({ establishedYear: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    >
                        <option value="">Select year</option>
                        {years.map((year) => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Trade License Upload (Optional for some business types) */}
            {['pvt_ltd', 'public_ltd', 'llp', 'partnership'].includes(formData.businessType) && (
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                        Trade License / Registration Certificate
                    </label>
                    <div className="relative">
                        <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleFileUpload}
                            className="hidden"
                            id="tradeLicense"
                        />
                        <label
                            htmlFor="tradeLicense"
                            className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 transition-all cursor-pointer bg-gray-50 hover:bg-blue-50"
                        >
                            {tradeLicensePreview ? (
                                <img src={tradeLicensePreview} alt="License Preview" className="max-h-32 rounded-lg" />
                            ) : (
                                <>
                                    <FiUpload className="w-10 h-10 text-gray-400 mb-2" />
                                    <span className="text-sm font-medium text-gray-600">Click to upload Trade License</span>
                                    <span className="text-xs text-gray-500 mt-1">PNG, JPG or PDF up to 5MB</span>
                                </>
                            )}
                        </label>
                    </div>
                    {formData.tradeLicense && (
                        <p className="mt-2 text-sm text-green-600 flex items-center gap-2">
                            <FiUpload className="w-4 h-4" />
                            {formData.tradeLicense.name}
                        </p>
                    )}
                </div>
            )}

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                <p className="text-sm text-blue-900">
                    <strong>Note:</strong> Make sure all information matches your official business documents.
                    Any mismatch may delay the verification process.
                </p>
            </div>
        </div>
    )
}
