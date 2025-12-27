'use client'
import { FiUser, FiCalendar, FiMapPin, FiUpload } from 'react-icons/fi'
import { useState } from 'react'

export default function Step2PersonalDetails({ formData, updateFormData, errors }) {
    const [governmentIdPreview, setGovernmentIdPreview] = useState(null)

    const handleFileUpload = (e, fieldName) => {
        const file = e.target.files[0]
        if (file) {
            updateFormData({ [fieldName]: file })

            // Create preview for government ID
            if (fieldName === 'governmentId') {
                const reader = new FileReader()
                reader.onloadend = () => {
                    setGovernmentIdPreview(reader.result)
                }
                reader.readAsDataURL(file)
            }
        }
    }

    const updateAddress = (field, value) => {
        updateFormData({
            residentialAddress: {
                ...formData.residentialAddress,
                [field]: value
            }
        })
    }

    return (
        <div className="space-y-8">
            {/* Full Name */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                    Full Name (as per ID) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <FiUser className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => updateFormData({ fullName: e.target.value })}
                        placeholder="Enter your full legal name"
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.fullName ? 'border-red-300' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                            }`}
                    />
                </div>
                {errors.fullName && <p className="mt-2 text-sm text-red-600">{errors.fullName}</p>}
            </div>

            {/* Date of Birth */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                    Date of Birth <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <FiCalendar className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => updateFormData({ dateOfBirth: e.target.value })}
                        max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.dateOfBirth ? 'border-red-300' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                            }`}
                    />
                </div>
                {errors.dateOfBirth && <p className="mt-2 text-sm text-red-600">{errors.dateOfBirth}</p>}
            </div>

            {/* Residential Address */}
            <div className="bg-gray-50 rounded-2xl p-6 space-y-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <FiMapPin className="w-5 h-5" />
                    Residential Address
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Address Line 1 <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.residentialAddress.addressLine1}
                            onChange={(e) => updateAddress('addressLine1', e.target.value)}
                            placeholder="Street address"
                            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.addressLine1 ? 'border-red-300' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                                }`}
                        />
                        {errors.addressLine1 && <p className="mt-2 text-sm text-red-600">{errors.addressLine1}</p>}
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Address Line 2</label>
                        <input
                            type="text"
                            value={formData.residentialAddress.addressLine2}
                            onChange={(e) => updateAddress('addressLine2', e.target.value)}
                            placeholder="Apartment, suite, etc. (optional)"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            City <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.residentialAddress.city}
                            onChange={(e) => updateAddress('city', e.target.value)}
                            placeholder="City"
                            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.city ? 'border-red-300' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                                }`}
                        />
                        {errors.city && <p className="mt-2 text-sm text-red-600">{errors.city}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">State/Emirate</label>
                        <input
                            type="text"
                            value={formData.residentialAddress.state}
                            onChange={(e) => updateAddress('state', e.target.value)}
                            placeholder="State/Emirate"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Pincode <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.residentialAddress.pincode}
                            onChange={(e) => updateAddress('pincode', e.target.value)}
                            placeholder="Postal code"
                            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.pincode ? 'border-red-300' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                                }`}
                        />
                        {errors.pincode && <p className="mt-2 text-sm text-red-600">{errors.pincode}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Country</label>
                        <select
                            value={formData.residentialAddress.country}
                            onChange={(e) => updateAddress('country', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        >
                            <option value="AE">United Arab Emirates</option>
                            <option value="IN">India</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Government ID */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                    Government ID Type
                </label>
                <select
                    value={formData.governmentIdType}
                    onChange={(e) => updateFormData({ governmentIdType: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                >
                    <option value="">Select ID type</option>
                    <option value="emirates_id">Emirates ID</option>
                    <option value="aadhaar">Aadhaar Card</option>
                    <option value="passport">Passport</option>
                    <option value="driving_license">Driving License</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                    Upload Government ID
                </label>
                <div className="relative">
                    <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileUpload(e, 'governmentId')}
                        className="hidden"
                        id="governmentId"
                    />
                    <label
                        htmlFor="governmentId"
                        className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 transition-all cursor-pointer bg-gray-50 hover:bg-blue-50"
                    >
                        {governmentIdPreview ? (
                            <img src={governmentIdPreview} alt="ID Preview" className="max-h-32 rounded-lg" />
                        ) : (
                            <>
                                <FiUpload className="w-10 h-10 text-gray-400 mb-2" />
                                <span className="text-sm font-medium text-gray-600">Click to upload ID</span>
                                <span className="text-xs text-gray-500 mt-1">PNG, JPG or PDF up to 5MB</span>
                            </>
                        )}
                    </label>
                </div>
                {formData.governmentId && (
                    <p className="mt-2 text-sm text-green-600 flex items-center gap-2">
                        <FiUpload className="w-4 h-4" />
                        {formData.governmentId.name}
                    </p>
                )}
            </div>
        </div>
    )
}
