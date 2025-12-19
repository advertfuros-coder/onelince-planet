// app/seller/(seller)/bank-details/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import axios from 'axios'
import {
    FiDollarSign,
    FiCreditCard,
    FiSave,
    FiShield,
    FiCheckCircle,
} from 'react-icons/fi'
import { toast } from 'react-hot-toast'

export default function BankDetailsPage() {
    const { token } = useAuth()
    const [bankDetails, setBankDetails] = useState({
        accountHolderName: '',
        accountNumber: '',
        bankName: '',
        ifscCode: '',
        branchName: '',
        accountType: 'savings',
        upiId: ''
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [verified, setVerified] = useState(false)

    useEffect(() => {
        if (token) fetchBankDetails()
    }, [token])

    async function fetchBankDetails() {
        try {
            setLoading(true)
            const res = await axios.get('/api/seller/bank-details', {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (res.data.success) {
                setBankDetails(res.data.bankDetails || {})
                setVerified(res.data.bankDetails?.verified || false)
            }
        } catch (error) {
            console.error('Error fetching bank details:', error)
            toast.error('Failed to load bank details')
        } finally {
            setLoading(false)
        }
    }

    async function handleSubmit(e) {
        e.preventDefault()
        try {
            setSaving(true)
            const res = await axios.post('/api/seller/bank-details', bankDetails, {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (res.data.success) {
                toast.success('Bank details saved successfully')
                setVerified(res.data.bankDetails?.verified || false)
            }
        } catch (error) {
            toast.error('Failed to save bank details')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">💳 Bank Details</h1>
                        <p className="mt-2 text-green-100">Manage your payout information</p>
                    </div>
                    {verified && (
                        <div className="flex items-center space-x-2 px-4 py-2 bg-white bg-opacity-20 rounded-lg">
                            <FiCheckCircle className="w-5 h-5" />
                            <span className="font-semibold">Verified</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Security Notice */}
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-lg">
                <div className="flex items-start space-x-3">
                    <FiShield className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                        <h3 className="font-bold text-blue-900">Secure & Encrypted</h3>
                        <p className="text-sm text-blue-700">Your bank details are encrypted and stored securely. We never share this information with third parties.</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Bank Account Details */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                        <FiCreditCard className="inline w-5 h-5 mr-2" />
                        Bank Account Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Account Holder Name *
                            </label>
                            <input
                                type="text"
                                value={bankDetails.accountHolderName}
                                onChange={(e) => setBankDetails({ ...bankDetails, accountHolderName: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Account Number *
                            </label>
                            <input
                                type="text"
                                value={bankDetails.accountNumber}
                                onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Account Type *
                            </label>
                            <select
                                value={bankDetails.accountType}
                                onChange={(e) => setBankDetails({ ...bankDetails, accountType: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            >
                                <option value="savings">Savings</option>
                                <option value="current">Current</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Bank Name *
                            </label>
                            <input
                                type="text"
                                value={bankDetails.bankName}
                                onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                IFSC Code *
                            </label>
                            <input
                                type="text"
                                value={bankDetails.ifscCode}
                                onChange={(e) => setBankDetails({ ...bankDetails, ifscCode: e.target.value.toUpperCase() })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                required
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Branch Name
                            </label>
                            <input
                                type="text"
                                value={bankDetails.branchName}
                                onChange={(e) => setBankDetails({ ...bankDetails, branchName: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                    </div>
                </div>

                {/* UPI Details */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                        <FiDollarSign className="inline w-5 h-5 mr-2" />
                        UPI Details (Optional)
                    </h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            UPI ID
                        </label>
                        <input
                            type="text"
                            placeholder="yourname@upi"
                            value={bankDetails.upiId}
                            onChange={(e) => setBankDetails({ ...bankDetails, upiId: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">For faster payouts (optional)</p>
                    </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center space-x-2 px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:opacity-50"
                    >
                        <FiSave className="w-5 h-5" />
                        <span>{saving ? 'Saving...' : 'Save Bank Details'}</span>
                    </button>
                </div>
            </form>
        </div>
    )
}
