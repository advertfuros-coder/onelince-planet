'use client'
import { FiMail, FiPhone, FiBriefcase } from 'react-icons/fi'

export default function Step1GetStarted({ formData, updateFormData, errors }) {
    const businessTypes = [
        { value: 'individual', label: 'Individual', description: 'Selling as an individual' },
        { value: 'proprietorship', label: 'Sole Proprietorship', description: 'Single owner business' },
        { value: 'partnership', label: 'Partnership', description: 'Multiple partners' },
        { value: 'pvt_ltd', label: 'Private Limited', description: 'Pvt Ltd company' },
        { value: 'public_ltd', label: 'Public Limited', description: 'Public company' },
        { value: 'llp', label: 'LLP', description: 'Limited Liability Partnership' }
    ]

    return (
        <div className="space-y-8">
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                <p className="text-blue-900 font-medium">
                    Welcome! Let's start with some basic information. This will only take about 30 seconds.
                </p>
            </div>

            {/* Email */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <FiMail className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateFormData({ email: e.target.value })}
                        placeholder="your.email@example.com"
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.email
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                                : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                            }`}
                    />
                </div>
                {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <FiPhone className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => updateFormData({ phone: e.target.value })}
                        placeholder="+971 50 123 4567"
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.phone
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                                : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                            }`}
                    />
                </div>
                {errors.phone && <p className="mt-2 text-sm text-red-600">{errors.phone}</p>}
            </div>

            {/* Business Type */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Business Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {businessTypes.map((type) => (
                        <button
                            key={type.value}
                            type="button"
                            onClick={() => updateFormData({ businessType: type.value })}
                            className={`p-4 border-2 rounded-xl text-left transition-all ${formData.businessType === type.value
                                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.businessType === type.value
                                        ? 'border-blue-500 bg-blue-500'
                                        : 'border-gray-300'
                                    }`}>
                                    {formData.businessType === type.value && (
                                        <div className="w-2 h-2 bg-white rounded-full" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="font-semibold text-gray-900">{type.label}</div>
                                    <div className="text-xs text-gray-500">{type.description}</div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
                {errors.businessType && <p className="mt-2 text-sm text-red-600">{errors.businessType}</p>}
            </div>
        </div>
    )
}
