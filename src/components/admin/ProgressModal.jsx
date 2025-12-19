'use client'

import { FiCheckCircle, FiAlertCircle, FiX } from 'react-icons/fi'
import clsx from 'clsx'

/**
 * Progress Modal for Bulk Operations
 * Shows progress, success, and error states
 */
export default function ProgressModal({ isOpen, onClose, operation }) {
    if (!isOpen || !operation) return null

    const {
        title = 'Processing...',
        current = 0,
        total = 0,
        status = 'processing', // 'processing' | 'success' | 'error'
        message = '',
        successCount = 0,
        errorCount = 0,
        errors = [],
    } = operation

    const progress = total > 0 ? (current / total) * 100 : 0

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />

            {/* Modal */}
            <div className="relative min-h-screen flex items-center justify-center p-4">
                <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                        {status !== 'processing' && (
                            <button
                                onClick={onClose}
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                            >
                                <FiX size={20} className="text-gray-400" />
                            </button>
                        )}
                    </div>

                    {/* Content */}
                    <div className="px-6 py-6">
                        {/* Processing State */}
                        {status === 'processing' && (
                            <div className="space-y-4">
                                {/* Progress Bar */}
                                <div className="relative">
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-600 transition-all duration-300 ease-out"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <p className="mt-2 text-sm text-gray-600 text-center">
                                        {current} of {total} {message}
                                    </p>
                                </div>

                                {/* Spinner */}
                                <div className="flex justify-center">
                                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                </div>

                                <p className="text-center text-sm text-gray-500">
                                    Please don't close this window...
                                </p>
                            </div>
                        )}

                        {/* Success State */}
                        {status === 'success' && (
                            <div className="text-center space-y-4">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                                    <FiCheckCircle className="text-green-600" size={32} />
                                </div>
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-900">
                                        {title || 'Operation Complete!'}
                                    </h4>
                                    <p className="mt-2 text-sm text-gray-600">
                                        Successfully processed {successCount} {successCount === 1 ? 'item' : 'items'}
                                        {errorCount > 0 && ` (${errorCount} failed)`}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Error State */}
                        {status === 'error' && (
                            <div className="text-center space-y-4">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
                                    <FiAlertCircle className="text-red-600" size={32} />
                                </div>
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-900">Operation Failed</h4>
                                    <p className="mt-2 text-sm text-gray-600">{message || 'Something went wrong'}</p>
                                </div>

                                {/* Error List */}
                                {errors.length > 0 && (
                                    <div className="mt-4 max-h-40 overflow-y-auto">
                                        <div className="text-left bg-red-50 rounded-lg p-4">
                                            <p className="text-xs font-semibold text-red-900 mb-2">Errors:</p>
                                            <ul className="space-y-1 text-xs text-red-700">
                                                {errors.map((error, idx) => (
                                                    <li key={idx}>• {error}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {status !== 'processing' && (
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                            <button
                                onClick={onClose}
                                className={clsx(
                                    'px-4 py-2 rounded-lg font-medium transition-colors',
                                    status === 'success'
                                        ? 'bg-green-600 hover:bg-green-700 text-white'
                                        : 'bg-gray-600 hover:bg-gray-700 text-white'
                                )}
                            >
                                Close
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
