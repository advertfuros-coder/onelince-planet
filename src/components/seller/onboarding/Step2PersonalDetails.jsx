'use client'
import { FiUser, FiCalendar, FiMapPin } from 'react-icons/fi'

export default function Step2PersonalDetails({ formData, updateFormData, errors }) {
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                        Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <FiUser className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={formData.fullName}
                            onChange={(e) => updateFormData({ fullName: e.target.value })}
                            placeholder="Your legal name"
                            className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.fullName ? 'border-red-300' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'}`}
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
                            className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.dateOfBirth ? 'border-red-300' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'}`}
                        />
                    </div>
                    {errors.dateOfBirth && <p className="mt-2 text-sm text-red-600">{errors.dateOfBirth}</p>}
                </div>
            </div>

            {/* Address */}
            <div className="space-y-4">
                <label className="block text-sm font-bold text-gray-700">
                    Residential Address <span className="text-red-500">*</span>
                </label>

                <div>
                    <input
                        type="text"
                        value={formData.residentialAddress.addressLine1}
                        onChange={(e) => updateAddress('addressLine1', e.target.value)}
                        placeholder="Address Line 1"
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.addressLine1 ? 'border-red-300' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'}`}
                    />
                    {errors.addressLine1 && <p className="mt-2 text-sm text-red-600">{errors.addressLine1}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                        type="text"
                        value={formData.residentialAddress.city}
                        onChange={(e) => updateAddress('city', e.target.value)}
                        placeholder="City"
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.city ? 'border-red-300' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'}`}
                    />
                    <input
                        type="text"
                        value={formData.residentialAddress.state}
                        onChange={(e) => updateAddress('state', e.target.value)}
                        placeholder="State/Province"
                        className={`w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all`}
                    />
                    <input
                        type="text"
                        value={formData.residentialAddress.pincode}
                        onChange={(e) => updateAddress('pincode', e.target.value)}
                        placeholder="Pincode/Zip"
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.pincode ? 'border-red-300' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'}`}
                    />
                </div>
            </div>

            {/* Government ID Type */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                    Government ID Type <span className="text-red-500">*</span>
                </label>
                <select
                    value={formData.governmentIdType}
                    onChange={(e) => updateFormData({ governmentIdType: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                >
                    <option value="">Select ID Type</option>
                    <option value="emirates_id">Emirates ID</option>
                    <option value="passport">Passport</option>
                    <option value="aadhaar">Aadhaar Card</option>
                    <option value="driving_license">Driving License</option>
                </select>
            </div>
        </div>
    )
}
