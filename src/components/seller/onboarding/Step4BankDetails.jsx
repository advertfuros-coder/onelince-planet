'use client'
import { FiDollarSign, FiUpload } from 'react-icons/fi'
import { useState } from 'react'

export default function Step4BankDetails({ formData, updateFormData, errors }) {
    const [chequePreview, setChequePreview] = useState(null)

    const updateBankDetails = (field, value) => {
        updateFormData({
            bankDetails: {
                ...formData.bankDetails,
                [field]: value
            }
        })
    }

    const handleFileUpload = (e) => {
        const file = e.target.files[0]
        if (file) {
            updateFormData({ cancelledCheque: file })

            const reader = new FileReader()
            reader.onloadend = () => {
                setChequePreview(reader.result)
            }
            reader.readAsDataURL(file)
        }
    }

    return (
        <div className="space-y-8">
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
                <p className="text-sm text-yellow-900">
                    <strong>Important:</strong> Payments will be deposited to this account. Please ensure all details are accurate.
                </p>
            </div>

            {/* Account Holder Name */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Account Holder Name <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={formData.bankDetails.accountHolderName}
                    onChange={(e) => updateBankDetails('accountHolderName', e.target.value)}
                    placeholder="Name as per bank records"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.accountHolderName ? 'border-red-300' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                        }`}
                />
                {errors.accountHolderName && <p className="mt-2 text-sm text-red-600">{errors.accountHolderName}</p>}
            </div>

            {/* Bank Name */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Bank Name <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={formData.bankDetails.bankName}
                    onChange={(e) => updateBankDetails('bankName', e.target.value)}
                    placeholder="e.g., Emirates NBD, HDFC Bank"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.bankName ? 'border-red-300' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                        }`}
                />
                {errors.bankName && <p className="mt-2 text-sm text-red-600">{errors.bankName}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Account Number */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Account Number <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={formData.bankDetails.accountNumber}
                        onChange={(e) => updateBankDetails('accountNumber', e.target.value)}
                        placeholder="Account number"
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.accountNumber ? 'border-red-300' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                            }`}
                    />
                    {errors.accountNumber && <p className="mt-2 text-sm text-red-600">{errors.accountNumber}</p>}
                </div>

                {/* IFSC/IBAN Code */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        IFSC Code / IBAN <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={formData.bankDetails.ifscCode}
                        onChange={(e) => updateBankDetails('ifscCode', e.target.value.toUpperCase())}
                        placeholder="IFSC Code or IBAN"
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all uppercase ${errors.ifscCode ? 'border-red-300' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                            }`}
                    />
                    {errors.ifscCode && <p className="mt-2 text-sm text-red-600">{errors.ifscCode}</p>}
                </div>
            </div>

            {/* Account Type */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Account Type
                </label>
                <div className="grid grid-cols-2 gap-4">
                    {['savings', 'current'].map((type) => (
                        <button
                            key={type}
                            type="button"
                            onClick={() => updateBankDetails('accountType', type)}
                            className={`p-4 border-2 rounded-xl font-semibold capitalize transition-all ${formData.bankDetails.accountType === type
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            {type} Account
                        </button>
                    ))}
                </div>
            </div>

            {/* Branch */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Branch Name
                </label>
                <input
                    type="text"
                    value={formData.bankDetails.branch}
                    onChange={(e) => updateBankDetails('branch', e.target.value)}
                    placeholder="Branch name (optional)"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
            </div>

            {/* UPI ID (Optional) */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    UPI ID <span className="text-gray-500 text-xs">(Optional)</span>
                </label>
                <input
                    type="text"
                    value={formData.bankDetails.upiId}
                    onChange={(e) => updateBankDetails('upiId', e.target.value)}
                    placeholder="yourname@upi"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
            </div>

            {/* Cancelled Cheque Upload */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Cancelled Cheque / Bank Statement
                </label>
                <div className="relative">
                    <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="cancelledCheque"
                    />
                    <label
                        htmlFor="cancelledCheque"
                        className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 transition-all cursor-pointer bg-gray-50 hover:bg-blue-50"
                    >
                        {chequePreview ? (
                            <img src={chequePreview} alt="Cheque Preview" className="max-h-32 rounded-lg" />
                        ) : (
                            <>
                                <FiUpload className="w-10 h-10 text-gray-400 mb-2" />
                                <span className="text-sm font-medium text-gray-600">Click to upload cancelled cheque</span>
                                <span className="text-xs text-gray-500 mt-1">PNG, JPG or PDF up to 5MB</span>
                            </>
                        )}
                    </label>
                </div>
                {formData.cancelledCheque && (
                    <p className="mt-2 text-sm text-green-600 flex items-center gap-2">
                        <FiUpload className="w-4 h-4" />
                        {formData.cancelledCheque.name}
                    </p>
                )}
            </div>
        </div>
    )
}
