// app/seller/(seller)/documents/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import axios from 'axios'
import {
    FiFileText,
    FiUpload,
    FiCheck,
    FiX,
    FiClock,
    FiAlertTriangle,
    FiDownload,
    FiTrash2,
    FiEye,
    FiShield,
} from 'react-icons/fi'
import { toast } from 'react-hot-toast'

const DOCUMENT_TYPES = {
    // Identity Documents
    government_id: { label: 'Government ID', category: 'Identity', required: true, icon: '🆔' },
    passport: { label: 'Passport', category: 'Identity', required: false, icon: '🛂' },
    drivers_license: { label: "Driver's License", category: 'Identity', required: false, icon: '🚗' },
    national_id: { label: 'National ID', category: 'Identity', required: false, icon: '🪪' },

    // Business Documents
    business_registration: { label: 'Business Registration', category: 'Business', required: true, icon: '🏢' },
    trade_license: { label: 'Trade License', category: 'Business', required: true, icon: '📜' },
    certificate_of_incorporation: { label: 'Certificate of Incorporation', category: 'Business', required: false, icon: '📋' },
    partnership_deed: { label: 'Partnership Deed', category: 'Business', required: false, icon: '🤝' },
    gst_certificate: { label: 'GST Certificate', category: 'Tax', required: true, icon: '💼' },
    vat_registration: { label: 'VAT Registration', category: 'Tax', required: false, icon: '📊' },

    // Address Proof
    utility_bill: { label: 'Utility Bill', category: 'Address Proof', required: true, icon: '💡' },
    bank_statement: { label: 'Bank Statement', category: 'Address Proof', required: false, icon: '🏦' },
    rental_agreement: { label: 'Rental Agreement', category: 'Address Proof', required: false, icon: '🏠' },

    // Tax Documents
    pan_card: { label: 'PAN Card', category: 'Tax', required: true, icon: '💳' },
    tax_id: { label: 'Tax ID', category: 'Tax', required: false, icon: '🔢' },
    w8_ben_form: { label: 'W-8BEN Form', category: 'Tax', required: false, icon: '📄' },
    state_tax_id: { label: 'State Tax ID', category: 'Tax', required: false, icon: '🏛️' },

    // Bank Documents
    cancelled_cheque: { label: 'Cancelled Cheque', category: 'Banking', required: true, icon: '✅' },
    bank_account_proof: { label: 'Bank Account Proof', category: 'Banking', required: false, icon: '🏦' },

    // Additional
    certificate_of_good_standing: { label: 'Certificate of Good Standing', category: 'Additional', required: false, icon: '⭐' },
    trademark_certificate: { label: 'Trademark Certificate', category: 'Additional', required: false, icon: '™️' },
    product_certification: { label: 'Product Certification', category: 'Additional', required: false, icon: '✓' },
    other: { label: 'Other Document', category: 'Additional', required: false, icon: '📎' },
}

export default function DocumentsPage() {
    const { token } = useAuth()
    const [documents, setDocuments] = useState([])
    const [stats, setStats] = useState({})
    const [verificationStatus, setVerificationStatus] = useState({})
    const [expiringDocs, setExpiringDocs] = useState([])
    const [loading, setLoading] = useState(true)
    const [showUploadModal, setShowUploadModal] = useState(false)
    const [filter, setFilter] = useState('all')

    useEffect(() => {
        if (token) fetchDocuments()
    }, [token, filter])

    async function fetchDocuments() {
        try {
            setLoading(true)
            const params = new URLSearchParams()
            if (filter !== 'all') params.append('status', filter)

            const res = await axios.get(`/api/seller/documents?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
            })

            if (res.data.success) {
                setDocuments(res.data.documents)
                setStats(res.data.stats)
                setVerificationStatus(res.data.verificationStatus)
                setExpiringDocs(res.data.expiringDocuments || [])
            }
        } catch (error) {
            console.error('Error fetching documents:', error)
            toast.error('Failed to load documents')
        } finally {
            setLoading(false)
        }
    }

    async function deleteDocument(id) {
        if (!confirm('Are you sure you want to delete this document?')) return

        try {
            const res = await axios.delete(`/api/seller/documents/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (res.data.success) {
                toast.success('Document deleted')
                fetchDocuments()
            }
        } catch (error) {
            toast.error('Failed to delete document')
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">📄 Document Verification</h1>
                        <p className="mt-2 text-blue-100">Upload and manage your verification documents</p>
                    </div>
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="flex items-center space-x-2 px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-semibold shadow-lg transition-all"
                    >
                        <FiUpload />
                        <span>Upload Document</span>
                    </button>
                </div>
            </div>

            {/* Verification Status Banner */}
            <VerificationStatusBanner status={verificationStatus} />

            {/* Expiring Documents Alert */}
            {expiringDocs.length > 0 && (
                <div className="bg-yellow-50 border-l-4 border-yellow-600 p-4 rounded-lg">
                    <div className="flex items-start space-x-3">
                        <FiAlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div>
                            <h3 className="font-bold text-yellow-900">Documents Expiring Soon</h3>
                            <p className="text-sm text-yellow-700">
                                {expiringDocs.length} document(s) will expire within 30 days. Please renew them.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                <StatCard icon={<FiFileText />} label="Total" value={stats.total || 0} color="blue" />
                <StatCard icon={<FiClock />} label="Pending" value={stats.pending || 0} color="yellow" />
                <StatCard icon={<FiEye />} label="Under Review" value={stats.under_review || 0} color="purple" />
                <StatCard icon={<FiCheck />} label="Approved" value={stats.approved || 0} color="green" />
                <StatCard icon={<FiX />} label="Rejected" value={stats.rejected || 0} color="red" />
                <StatCard icon={<FiUpload />} label="Resubmit" value={stats.resubmission_required || 0} color="orange" />
                <StatCard icon={<FiAlertTriangle />} label="Expiring" value={stats.expiring_soon || 0} color="yellow" />
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center space-x-4 overflow-x-auto">
                    <span className="text-sm font-semibold text-gray-700">Filter:</span>
                    {['all', 'pending', 'under_review', 'approved', 'rejected', 'resubmission_required'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${filter === f
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {f.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Documents List */}
            {documents.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                    <FiFileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Documents Yet</h3>
                    <p className="text-gray-600 mb-6">Upload your verification documents to get started</p>
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                    >
                        Upload First Document
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {documents.map((doc) => (
                        <DocumentCard
                            key={doc._id}
                            document={doc}
                            onDelete={() => deleteDocument(doc._id)}
                            onResubmit={() => {
                                setShowUploadModal(true)
                                // Pass original doc ID for resubmission
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Upload Modal */}
            {showUploadModal && (
                <UploadDocumentModal
                    onClose={() => setShowUploadModal(false)}
                    onSuccess={() => {
                        setShowUploadModal(false)
                        fetchDocuments()
                    }}
                    token={token}
                />
            )}
        </div>
    )
}

function VerificationStatusBanner({ status }) {
    const statusConfig = {
        verified: {
            bg: 'bg-green-50 border-green-600',
            icon: <FiShield className="w-6 h-6 text-green-600" />,
            title: 'Verification Complete',
            message: 'Your account is fully verified!',
            color: 'text-green-900'
        },
        pending_review: {
            bg: 'bg-blue-50 border-blue-600',
            icon: <FiClock className="w-6 h-6 text-blue-600" />,
            title: 'Verification Pending',
            message: 'Your documents are under review.',
            color: 'text-blue-900'
        },
        action_required: {
            bg: 'bg-red-50 border-red-600',
            icon: <FiAlertTriangle className="w-6 h-6 text-red-600" />,
            title: 'Action Required',
            message: 'Some documents need resubmission.',
            color: 'text-red-900'
        },
        incomplete: {
            bg: 'bg-yellow-50 border-yellow-600',
            icon: <FiFileText className="w-6 h-6 text-yellow-600" />,
            title: 'Incomplete Verification',
            message: 'Please upload all required documents.',
            color: 'text-yellow-900'
        }
    }

    const config = statusConfig[status.status] || statusConfig.incomplete

    return (
        <div className={`${config.bg} border-l-4 p-6 rounded-lg`}>
            <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                    {config.icon}
                    <div>
                        <h3 className={`font-bold ${config.color} text-lg`}>{config.title}</h3>
                        <p className={`text-sm ${config.color} opacity-80 mt-1`}>{config.message}</p>
                        <div className="mt-3 flex items-center space-x-4 text-sm">
                            <span className={config.color}>
                                <strong>{status.approved || 0}</strong> of <strong>{status.required || 0}</strong> required documents approved
                            </span>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900">{status.completionPercentage || 0}%</div>
                    <div className="text-xs text-gray-600">Complete</div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${status.completionPercentage || 0}%` }}
                    ></div>
                </div>
            </div>
        </div>
    )
}

function DocumentCard({ document, onDelete, onResubmit }) {
    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
        under_review: 'bg-purple-100 text-purple-700 border-purple-300',
        approved: 'bg-green-100 text-green-700 border-green-300',
        rejected: 'bg-red-100 text-red-700 border-red-300',
        resubmission_required: 'bg-orange-100 text-orange-700 border-orange-300',
        expired: 'bg-gray-100 text-gray-700 border-gray-300',
    }

    const statusIcons = {
        pending: <FiClock />,
        under_review: <FiEye />,
        approved: <FiCheck />,
        rejected: <FiX />,
        resubmission_required: <FiUpload />,
        expired: <FiAlertTriangle />,
    }

    const docInfo = DOCUMENT_TYPES[document.documentType] || DOCUMENT_TYPES.other

    return (
        <div className={`bg-white rounded-lg shadow-md border-2 p-6 ${statusColors[document.status]}`}>
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3">
                    <div className="text-3xl">{docInfo.icon}</div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">{document.documentName}</h3>
                        <p className="text-sm text-gray-600">{docInfo.label}</p>
                        <span className="text-xs text-gray-500">{docInfo.category}</span>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <span className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold ${statusColors[document.status]}`}>
                        {statusIcons[document.status]}
                        <span>{document.status.replace('_', ' ').toUpperCase()}</span>
                    </span>
                </div>
            </div>

            {/* Document Info */}
            <div className="space-y-2 mb-4 text-sm text-gray-600">
                {document.documentNumber && (
                    <p><strong>Document #:</strong> {document.documentNumber}</p>
                )}
                {document.issueDate && (
                    <p><strong>Issued:</strong> {new Date(document.issueDate).toLocaleDateString()}</p>
                )}
                {document.expiryDate && (
                    <p><strong>Expires:</strong> {new Date(document.expiryDate).toLocaleDateString()}</p>
                )}
                <p><strong>Uploaded:</strong> {new Date(document.createdAt).toLocaleDateString()}</p>
            </div>

            {/* Review Info */}
            {document.status === 'rejected' && document.rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <p className="text-sm font-semibold text-red-900">Rejection Reason:</p>
                    <p className="text-sm text-red-700">{document.rejectionReason}</p>
                </div>
            )}

            {document.status === 'resubmission_required' && document.rejectionReason && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                    <p className="text-sm font-semibold text-orange-900">Resubmission Required:</p>
                    <p className="text-sm text-orange-700">{document.rejectionReason}</p>
                </div>
            )}

            {document.status === 'approved' && document.reviewNotes && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-green-700">{document.reviewNotes}</p>
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center space-x-2">
                <a
                    href={document.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 text-sm font-semibold"
                >
                    <FiDownload className="w-4 h-4" />
                    <span>View</span>
                </a>

                {(document.status === 'rejected' || document.status === 'resubmission_required') && (
                    <button
                        onClick={onResubmit}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm font-semibold"
                    >
                        <FiUpload className="w-4 h-4" />
                        <span>Resubmit</span>
                    </button>
                )}

                {document.status === 'pending' && (
                    <button
                        onClick={onDelete}
                        className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                    >
                        <FiTrash2 className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    )
}

function UploadDocumentModal({ onClose, onSuccess, token, originalDocId = null }) {
    const [formData, setFormData] = useState({
        documentType: 'government_id',
        documentName: '',
        documentNumber: '',
        issueDate: '',
        expiryDate: '',
        fileUrl: '',
        notes: ''
    })
    const [uploading, setUploading] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        try {
            setUploading(true)

            const payload = {
                ...formData,
                originalDocumentId: originalDocId
            }

            const res = await axios.post('/api/seller/documents', payload, {
                headers: { Authorization: `Bearer ${token}` },
            })

            if (res.data.success) {
                toast.success('Document uploaded successfully')
                onSuccess()
            }
        } catch (error) {
            toast.error('Failed to upload document')
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full my-8">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-xl">
                    <h2 className="text-2xl font-bold">Upload Document</h2>
                    <p className="text-blue-100 text-sm mt-1">Please provide accurate information</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Document Type *
                        </label>
                        <select
                            value={formData.documentType}
                            onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            {Object.entries(DOCUMENT_TYPES).map(([key, value]) => (
                                <option key={key} value={key}>
                                    {value.icon} {value.label} {value.required ? '(Required)' : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Document Name *
                        </label>
                        <input
                            type="text"
                            placeholder="e.g., Passport - John Doe"
                            value={formData.documentName}
                            onChange={(e) => setFormData({ ...formData, documentName: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Document Number
                            </label>
                            <input
                                type="text"
                                placeholder="Document ID/Number"
                                value={formData.documentNumber}
                                onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Issue Date
                            </label>
                            <input
                                type="date"
                                value={formData.issueDate}
                                onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Expiry Date (if applicable)
                        </label>
                        <input
                            type="date"
                            value={formData.expiryDate}
                            onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            File URL * (Upload to cloud storage first)
                        </label>
                        <input
                            type="url"
                            placeholder="https://example.com/document.pdf"
                            value={formData.fileUrl}
                            onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">Upload your file to cloud storage and paste the URL here</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Notes (Optional)
                        </label>
                        <textarea
                            placeholder="Any additional information..."
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            rows="3"
                        ></textarea>
                    </div>

                    <div className="flex items-center justify-end space-x-4 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={uploading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50"
                        >
                            {uploading ? 'Uploading...' : 'Upload Document'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

function StatCard({ icon, label, value, color }) {
    const colors = {
        blue: 'bg-blue-100 text-blue-600',
        yellow: 'bg-yellow-100 text-yellow-600',
        purple: 'bg-purple-100 text-purple-600',
        green: 'bg-green-100 text-green-600',
        red: 'bg-red-100 text-red-600',
        orange: 'bg-orange-100 text-orange-600',
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex flex-col items-center text-center">
                <div className={`p-2 rounded-lg ${colors[color]} mb-2`}>
                    <div className="text-xl">{icon}</div>
                </div>
                <p className="text-xs text-gray-600 mb-1">{label}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    )
}
