'use client'
import { FiUpload, FiCheckCircle } from 'react-icons/fi'
import { useState } from 'react'

export default function Step6Documents({ formData, updateFormData, errors }) {
    const [previews, setPreviews] = useState({})

    const documents = [
        { key: 'panCard', label: 'PAN Card', required: true },
        { key: 'gstCertificate', label: 'GST Certificate / TRN', required: true },
        { key: 'idProof', label: 'ID Proof (Aadhaar/Passport/Emirates ID)', required: false },
        { key: 'addressProof', label: 'Address Proof', required: false },
        { key: 'bankStatement', label: 'Bank Statement', required: false }
    ]

    const handleFileUpload = (e, docKey) => {
        const file = e.target.files[0]
        if (file) {
            updateFormData({
                documents: {
                    ...formData.documents,
                    [docKey]: file
                }
            })

            // Create preview
            const reader = new FileReader()
            reader.onloadend = () => {
                setPreviews(prev => ({
                    ...prev,
                    [docKey]: reader.result
                }))
            }
            reader.readAsDataURL(file)
        }
    }

    return (
        <div className="space-y-8">
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                <p className="text-sm text-blue-900">
                    <strong>Document Requirements:</strong> Upload clear, legible copies of your documents.
                    All documents must be valid and not expired. Supported formats: JPG, PNG, PDF (max 5MB each).
                </p>
            </div>

            {/* Document Uploads */}
            <div className="space-y-6">
                {documents.map((doc) => (
                    <div key={doc.key} className="border border-gray-200 rounded-2xl p-6 hover:border-blue-300 transition-all">
                        <label className="block text-sm font-bold text-gray-900 mb-3">
                            {doc.label} {doc.required && <span className="text-red-500">*</span>}
                        </label>

                        <div className="flex items-center gap-4">
                            {/* Preview */}
                            {previews[doc.key] && (
                                <div className="flex-shrink-0">
                                    <img
                                        src={previews[doc.key]}
                                        alt={doc.label}
                                        className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200"
                                    />
                                </div>
                            )}

                            {/* Upload Button */}
                            <div className="flex-1">
                                <input
                                    type="file"
                                    accept="image/*,.pdf"
                                    onChange={(e) => handleFileUpload(e, doc.key)}
                                    className="hidden"
                                    id={doc.key}
                                />
                                <label
                                    htmlFor={doc.key}
                                    className={`flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed rounded-xl cursor-pointer transition-all ${formData.documents[doc.key]
                                            ? 'border-green-300 bg-green-50 hover:bg-green-100'
                                            : 'border-gray-300 bg-gray-50 hover:border-blue-500 hover:bg-blue-50'
                                        }`}
                                >
                                    {formData.documents[doc.key] ? (
                                        <>
                                            <FiCheckCircle className="w-5 h-5 text-green-600" />
                                            <span className="text-sm font-medium text-green-700">
                                                {formData.documents[doc.key].name}
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <FiUpload className="w-5 h-5 text-gray-400" />
                                            <span className="text-sm font-medium text-gray-600">Click to upload {doc.label}</span>
                                        </>
                                    )}
                                </label>
                            </div>
                        </div>

                        {errors[doc.key] && (
                            <p className="mt-2 text-sm text-red-600">{errors[doc.key]}</p>
                        )}
                    </div>
                ))}
            </div>

            {/* Terms and Conditions */}
            <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-200">
                <div className="flex items-start gap-3">
                    <input
                        type="checkbox"
                        id="agreement"
                        checked={formData.agreementAccepted}
                        onChange={(e) => updateFormData({ agreementAccepted: e.target.checked })}
                        className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="agreement" className="flex-1">
                        <p className="text-sm text-gray-900">
                            I agree to the{' '}
                            <a href="/terms" target="_blank" className="text-blue-600 font-semibold hover:underline">
                                Terms and Conditions
                            </a>
                            {' '}and{' '}
                            <a href="/seller-agreement" target="_blank" className="text-blue-600 font-semibold hover:underline">
                                Seller Agreement
                            </a>
                            . I confirm that all information provided is accurate and that I have the authority to enter into this agreement on behalf of the business.
                        </p>
                    </label>
                </div>
                {errors.agreementAccepted && (
                    <p className="mt-2 ml-8 text-sm text-red-600">{errors.agreementAccepted}</p>
                )}
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
                <p className="text-sm text-yellow-900">
                    <strong>Important:</strong> Once submitted, your application will be reviewed within 24-48 hours.
                    You'll receive an email notification about your approval status.
                </p>
            </div>
        </div>
    )
}
