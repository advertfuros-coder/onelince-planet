'use client'
import { FiUser, FiBriefcase, FiDollarSign, FiShoppingBag, FiFileText, FiEdit2 } from 'react-icons/fi'

export default function Step7Review({ formData }) {
    const sections = [
        {
            title: 'Personal Information',
            icon: FiUser,
            items: [
                { label: 'Full Name', value: formData.fullName },
                { label: 'Email', value: formData.email },
                { label: 'Phone', value: formData.phone },
                { label: 'Date of Birth', value: formData.dateOfBirth },
                {
                    label: 'Address',
                    value: `${formData.residentialAddress.addressLine1}, ${formData.residentialAddress.city}, ${formData.residentialAddress.pincode}`
                }
            ]
        },
        {
            title: 'Business Information',
            icon: FiBriefcase,
            items: [
                { label: 'Business Name', value: formData.businessName },
                { label: 'Business Type', value: formData.businessType?.replace('_', ' ').toUpperCase() },
                { label: 'GST/TRN', value: formData.gstin },
                { label: 'PAN', value: formData.pan || 'N/A' },
                { label: 'Category', value: formData.businessCategory },
                { label: 'Established Year', value: formData.establishedYear || 'N/A' }
            ]
        },
        {
            title: 'Bank Details',
            icon: FiDollarSign,
            items: [
                { label: 'Account Holder', value: formData.bankDetails.accountHolderName },
                { label: 'Bank Name', value: formData.bankDetails.bankName },
                { label: 'Account Number', value: `****${formData.bankDetails.accountNumber.slice(-4)}` },
                { label: 'IFSC/IBAN', value: formData.bankDetails.ifscCode },
                { label: 'Account Type', value: formData.bankDetails.accountType?.toUpperCase() }
            ]
        },
        {
            title: 'Store Information',
            icon: FiShoppingBag,
            items: [
                { label: 'Store Name', value: formData.storeInfo.storeName },
                { label: 'Description', value: formData.storeInfo.storeDescription?.substring(0, 100) + '...' },
                { label: 'Categories', value: formData.storeInfo.storeCategories?.length + ' categories selected' },
                { label: 'Website', value: formData.storeInfo.website || 'N/A' },
                { label: 'Support Email', value: formData.storeInfo.customerSupportEmail || 'N/A' }
            ]
        }
    ]

    const documentCount = Object.values(formData.documents).filter(doc => doc !== null).length

    return (
        <div className="space-y-8">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-blue-900 mb-2">Review Your Application</h3>
                <p className="text-sm text-blue-700">
                    Please review all the information below carefully before submitting. You can go back to any step to make changes.
                </p>
            </div>

            {/* Information Sections */}
            {sections.map((section, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                                <section.icon className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">{section.title}</h3>
                        </div>
                        <button className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-1">
                            <FiEdit2 className="w-4 h-4" />
                            Edit
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {section.items.map((item, idx) => (
                            <div key={idx} className="bg-gray-50 rounded-xl p-4">
                                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                    {item.label}
                                </div>
                                <div className="text-sm font-medium text-gray-900">
                                    {item.value || 'Not provided'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {/* Documents Summary */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                            <FiFileText className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Documents</h3>
                    </div>
                    <span className="text-sm font-semibold text-green-600">
                        {documentCount} documents uploaded
                    </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(formData.documents).map(([key, file]) => (
                        <div
                            key={key}
                            className={`p-3 rounded-xl border-2 ${file ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                                }`}
                        >
                            <div className="text-xs font-semibold text-gray-700 capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                {file ? '✓ Uploaded' : '- Not uploaded'}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Final Check */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-green-900 mb-2">Ready to Submit?</h3>
                <ul className="space-y-2 text-sm text-green-800">
                    <li className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <span>All required information has been provided</span>
                    </li>
                    <li className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <span>Documents have been uploaded</span>
                    </li>
                    <li className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <span>Terms and conditions have been accepted</span>
                    </li>
                </ul>

                <p className="mt-4 text-sm text-green-800">
                    Click "Submit Application" below to send your registration for review. You'll receive an email within 24-48 hours.
                </p>
            </div>
        </div>
    )
}
