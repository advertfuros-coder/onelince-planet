'use client'
import { FiBriefcase, FiHash, FiGrid } from 'react-icons/fi'

export default function Step3BusinessInfo({ formData, updateFormData, errors }) {
    const categories = [
        'Electronics', 'Fashion', 'Home & Kitchen', 'Beauty & Personal Care',
        'Sports & Outdoors', 'Books & Media', 'Health & Wellness', 'Toys & Games',
        'Automotive', 'Industrial', 'Services', 'Others'
    ]

    return (
        <div className="space-y-8">
            {/* Business Name */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Business Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <FiBriefcase className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        value={formData.businessName}
                        onChange={(e) => updateFormData({ businessName: e.target.value })}
                        placeholder="Your registered business name"
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.businessName ? 'border-red-300' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'}`}
                    />
                </div>
                {errors.businessName && <p className="mt-2 text-sm text-red-600">{errors.businessName}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* GSTIN/TRN */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        GSTIN / TRN <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <FiHash className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={formData.gstin}
                            onChange={(e) => updateFormData({ gstin: e.target.value.toUpperCase() })}
                            placeholder="GST number or TRN"
                            className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all uppercase ${errors.gstin ? 'border-red-300' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'}`}
                        />
                    </div>
                    {errors.gstin && <p className="mt-2 text-sm text-red-600">{errors.gstin}</p>}
                </div>

                {/* PAN */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        PAN Card Number
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <FiHash className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={formData.pan}
                            onChange={(e) => updateFormData({ pan: e.target.value.toUpperCase() })}
                            placeholder="ABCDE1234F"
                            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all uppercase"
                        />
                    </div>
                </div>
            </div>

            {/* Business Category */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Primary Business Category <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <FiGrid className="w-5 h-5 text-gray-400" />
                    </div>
                    <select
                        value={formData.businessCategory}
                        onChange={(e) => updateFormData({ businessCategory: e.target.value })}
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.businessCategory ? 'border-red-300' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'}`}
                    >
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat.toLowerCase().replace(/\s+/g, '_')}>{cat}</option>
                        ))}
                    </select>
                </div>
                {errors.businessCategory && <p className="mt-2 text-sm text-red-600">{errors.businessCategory}</p>}
            </div>

            {/* Established Year */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Established Year
                </label>
                <input
                    type="number"
                    value={formData.establishedYear}
                    onChange={(e) => updateFormData({ establishedYear: e.target.value })}
                    placeholder="e.g., 2020"
                    min="1900"
                    max={new Date().getFullYear()}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
            </div>
        </div>
    )
}
