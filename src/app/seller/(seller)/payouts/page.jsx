// app/(seller)/payouts/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import {
  FiDollarSign,
  FiCreditCard,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiPlus,
  FiEdit,
  FiRefreshCw,
  FiDownload,
  FiAlertCircle,
} from 'react-icons/fi'

export default function SellerPayoutsPage() {
  const { token } = useAuth()
  const [payouts, setPayouts] = useState([])
  const [stats, setStats] = useState({})
  const [bankDetails, setBankDetails] = useState({})
  const [loading, setLoading] = useState(true)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [showBankModal, setShowBankModal] = useState(false)
  const [requestAmount, setRequestAmount] = useState('')
  const [bankForm, setBankForm] = useState({
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
  })

  useEffect(() => {
    if (token) {
      fetchPayouts()
      fetchBankDetails()
    }
  }, [token])

  async function fetchPayouts() {
    try {
      setLoading(true)
      const res = await axios.get('/api/seller/payouts', {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.data.success) {
        setPayouts(res.data.payouts)
        setStats(res.data.stats)
        setBankDetails(res.data.bankDetails || {})
      }
    } catch (error) {
      toast.error('Failed to load payouts')
    } finally {
      setLoading(false)
    }
  }

  async function fetchBankDetails() {
    try {
      const res = await axios.get('/api/seller/bank-details', {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.data.success) {
        setBankForm(res.data.bankDetails || {
          accountHolderName: '',
          accountNumber: '',
          ifscCode: '',
          bankName: '',
        })
      }
    } catch (error) {
      console.error('Failed to load bank details')
    }
  }

  async function handleRequestPayout() {
    if (!requestAmount || parseFloat(requestAmount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    if (parseFloat(requestAmount) > stats.availableBalance) {
      toast.error('Amount exceeds available balance')
      return
    }

    try {
      const res = await axios.post(
        '/api/seller/payouts',
        { amount: parseFloat(requestAmount) },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (res.data.success) {
        toast.success('Payout request submitted successfully!')
        setShowRequestModal(false)
        setRequestAmount('')
        fetchPayouts()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to request payout')
    }
  }

  async function handleUpdateBankDetails() {
    if (!bankForm.accountNumber || !bankForm.ifscCode) {
      toast.error('Please fill all required fields')
      return
    }

    try {
      const res = await axios.put('/api/seller/bank-details', bankForm, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.data.success) {
        toast.success('Bank details updated successfully')
        setShowBankModal(false)
        setBankDetails(res.data.bankDetails)
      }
    } catch (error) {
      toast.error('Failed to update bank details')
    }
  }

  const formatCurrency = (value) => `₹${(value || 0).toLocaleString('en-IN')}`
  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">💰 Payouts</h1>
              <p className="mt-2 text-green-100">Manage your earnings and withdrawals</p>
            </div>
            <button
              onClick={fetchPayouts}
              className="flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30"
            >
              <FiRefreshCw />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Bank Details Warning */}
        {(!bankDetails?.accountNumber || !bankDetails?.ifscCode) && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
            <div className="flex items-start space-x-3">
              <FiAlertCircle className="text-yellow-600 text-xl mt-0.5" />
              <div className="flex-1">
                <h3 className="text-yellow-800 font-semibold">Bank Details Required</h3>
                <p className="text-yellow-700 text-sm mt-1">
                  Please add your bank details to request payouts
                </p>
                <button
                  onClick={() => setShowBankModal(true)}
                  className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm font-semibold"
                >
                  Add Bank Details
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <BalanceCard
            label="Available Balance"
            value={formatCurrency(stats.availableBalance)}
            icon={<FiDollarSign />}
            color="text-green-600"
            bgColor="bg-green-50"
            gradient="from-green-400 to-green-600"
          />
          <BalanceCard
            label="Pending Payouts"
            value={formatCurrency(stats.pendingPayouts)}
            icon={<FiClock />}
            color="text-yellow-600"
            bgColor="bg-yellow-50"
            gradient="from-yellow-400 to-orange-500"
          />
          <BalanceCard
            label="Total Paid Out"
            value={formatCurrency(stats.totalPaidOut)}
            icon={<FiCheckCircle />}
            color="text-blue-600"
            bgColor="bg-blue-50"
            gradient="from-blue-400 to-indigo-500"
          />
          <BalanceCard
            label="Total Earnings"
            value={formatCurrency(stats.totalEarnings)}
            icon={<FiDollarSign />}
            color="text-purple-600"
            bgColor="bg-purple-50"
            gradient="from-purple-400 to-pink-500"
          />
        </div>

        {/* Request Payout Button */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Request Withdrawal</h3>
              <p className="text-sm text-gray-600 mt-1">
                Available balance: <strong>{formatCurrency(stats.availableBalance)}</strong>
              </p>
            </div>
            <button
              onClick={() => setShowRequestModal(true)}
              disabled={stats.availableBalance <= 0 || !bankDetails?.accountNumber}
              className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg"
            >
              <FiPlus />
              <span>Request Payout</span>
            </button>
          </div>
        </div>

        {/* Bank Details Card */}
        {bankDetails?.accountNumber && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                <FiCreditCard className="text-blue-600" />
                <span>Bank Account Details</span>
              </h3>
              <button
                onClick={() => setShowBankModal(true)}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
              >
                <FiEdit />
                <span>Edit</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Account Holder Name</p>
                <p className="font-semibold text-gray-900">{bankDetails.accountHolderName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Account Number</p>
                <p className="font-semibold text-gray-900">
                  ****{bankDetails.accountNumber?.slice(-4)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">IFSC Code</p>
                <p className="font-semibold text-gray-900">{bankDetails.ifscCode}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Bank Name</p>
                <p className="font-semibold text-gray-900">{bankDetails.bankName}</p>
              </div>
            </div>
          </div>
        )}

        {/* Payout History */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">Payout History</h3>
          </div>

          {payouts.length === 0 ? (
            <div className="text-center py-20">
              <FiDollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">No payout requests yet</p>
              <p className="text-sm text-gray-500 mt-2">Request your first payout when available</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Request ID
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Requested On
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Processed On
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Transaction ID
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {payouts.map((payout) => (
                    <tr key={payout._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-mono font-medium text-gray-900">
                        #{payout._id.slice(-8)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-lg font-bold text-gray-900">
                          {formatCurrency(payout.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <PayoutStatusBadge status={payout.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(payout.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {payout.completedAt ? formatDate(payout.completedAt) : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-gray-600">
                        {payout.transactionId || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Request Payout Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Request Payout</h3>

            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Available Balance:</strong> {formatCurrency(stats.availableBalance)}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Withdrawal Amount (₹) *
              </label>
              <input
                type="number"
                value={requestAmount}
                onChange={(e) => setRequestAmount(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                placeholder="Enter amount"
                min="0"
                max={stats.availableBalance}
              />
              <button
                onClick={() => setRequestAmount(stats.availableBalance.toString())}
                className="mt-2 text-sm text-green-600 hover:text-green-700 font-medium"
              >
                Request Full Amount
              </button>
            </div>

            {bankDetails?.accountNumber && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Payment will be sent to:</p>
                <p className="font-semibold text-gray-900">
                  {bankDetails.accountHolderName}
                </p>
                <p className="text-sm text-gray-700">
                  ****{bankDetails.accountNumber?.slice(-4)} • {bankDetails.bankName}
                </p>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowRequestModal(false)
                  setRequestAmount('')
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestPayout}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bank Details Modal */}
      {showBankModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Bank Account Details</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Holder Name *
                </label>
                <input
                  type="text"
                  value={bankForm.accountHolderName}
                  onChange={(e) =>
                    setBankForm({ ...bankForm, accountHolderName: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Full name as per bank"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Number *
                </label>
                <input
                  type="text"
                  value={bankForm.accountNumber}
                  onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter account number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  IFSC Code *
                </label>
                <input
                  type="text"
                  value={bankForm.ifscCode}
                  onChange={(e) =>
                    setBankForm({ ...bankForm, ifscCode: e.target.value.toUpperCase() })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., SBIN0001234"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={bankForm.bankName}
                  onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., State Bank of India"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowBankModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateBankDetails}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
              >
                Save Details
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function BalanceCard({ label, value, icon, color, bgColor, gradient }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-md`}>
          <div className="text-white text-2xl">{icon}</div>
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  )
}

function PayoutStatusBadge({ status }) {
  const statusConfig = {
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending', icon: <FiClock /> },
    processing: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Processing', icon: <FiRefreshCw /> },
    completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed', icon: <FiCheckCircle /> },
    failed: { bg: 'bg-red-100', text: 'text-red-700', label: 'Failed', icon: <FiXCircle /> },
  }

  const config = statusConfig[status] || statusConfig.pending

  return (
    <span className={`inline-flex items-center space-x-1 px-3 py-1 ${config.bg} ${config.text} rounded-full text-xs font-semibold`}>
      {config.icon}
      <span>{config.label}</span>
    </span>
  )
}
