'use client'
import { useState } from 'react'
import { X, CheckSquare, Square, Loader2, ChevronRight, AlertCircle } from 'lucide-react'
import CategorySelector from './CategorySelector'
import axios from 'axios'

/**
 * BulkRecategorizeModal
 * 
 * Modal for bulk recategorizing products
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Callback to close modal
 * @param {Array} props.selectedProducts - Array of selected product objects
 * @param {string} props.token - Auth token
 * @param {Function} props.onSuccess - Callback after successful recategorization
 */
export default function BulkRecategorizeModal({
    isOpen,
    onClose,
    selectedProducts = [],
    token,
    onSuccess
}) {
    const [selectedCategory, setSelectedCategory] = useState(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const [progress, setProgress] = useState(null)
    const [error, setError] = useState(null)

    if (!isOpen) return null

    const handleRecategorize = async () => {
        if (!selectedCategory) {
            setError('Please select a category')
            return
        }

        setIsProcessing(true)
        setError(null)
        setProgress({
            total: selectedProducts.length,
            processed: 0,
            updated: 0,
            failed: 0
        })

        try {
            const productIds = selectedProducts.map(p => p._id)

            const response = await axios.post(
                '/api/seller/products/bulk-recategorize',
                {
                    productIds,
                    categoryId: selectedCategory.categoryId,
                    categoryPath: selectedCategory.path
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            )

            if (response.data.success) {
                setProgress({
                    total: response.data.data.total,
                    processed: response.data.data.total,
                    updated: response.data.data.updated,
                    failed: response.data.data.failed,
                    errors: response.data.data.errors
                })

                // Call success callback after a brief delay to show success state
                setTimeout(() => {
                    onSuccess?.(response.data.data)
                    handleClose()
                }, 2000)
            } else {
                setError(response.data.message || 'Failed to recategorize products')
                setIsProcessing(false)
            }
        } catch (err) {
            console.error('Bulk recategorize error:', err)
            setError(err.response?.data?.message || 'Failed to recategorize products')
            setIsProcessing(false)
        }
    }

    const handleClose = () => {
        if (isProcessing) return // Prevent closing during processing
        setSelectedCategory(null)
        setProgress(null)
        setError(null)
        onClose()
    }

    // Get current categories (for display)
    const currentCategories = [...new Set(selectedProducts.map(p => p.category || 'Uncategorized'))]

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="p-10 space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                                <CheckSquare size={24} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 uppercase tracking-widest">
                                    Bulk Recategorize
                                </h3>
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">
                                    {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            disabled={isProcessing}
                            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <X size={18} className="text-slate-600" />
                        </button>
                    </div>

                    {/* Current Categories */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">
                            Current Categories:
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                            {currentCategories.map((cat, idx) => (
                                <span
                                    key={idx}
                                    className="px-3 py-1 bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                                >
                                    {cat}
                                </span>
                            ))}
                            {currentCategories.length > 3 && (
                                <span className="text-xs text-slate-400 font-semibold">
                                    + {currentCategories.length - 3} more
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Arrow Indicator */}
                    <div className="flex justify-center">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <ChevronRight size={20} className="text-blue-600 transform rotate-90" />
                        </div>
                    </div>

                    {/* New Category Selection */}
                    <div className="space-y-4">
                        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-700">
                            Select New Category:
                        </p>
                        <CategorySelector
                            selectedPath={selectedCategory?.path || ''}
                            onChange={setSelectedCategory}
                            required={false}
                        />
                    </div>

                    {/* Preview */}
                    {selectedCategory && (
                        <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-green-900 mb-2">
                                ✓ Preview: All {selectedProducts.length} products will be moved to:
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                                {selectedCategory.hierarchy.level1 && (
                                    <>
                                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-semibold">
                                            {selectedCategory.hierarchy.level1}
                                        </span>
                                        {selectedCategory.hierarchy.level2 && <ChevronRight size={14} className="text-green-400" />}
                                    </>
                                )}
                                {selectedCategory.hierarchy.level2 && (
                                    <>
                                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-semibold">
                                            {selectedCategory.hierarchy.level2}
                                        </span>
                                        {selectedCategory.hierarchy.level3 && <ChevronRight size={14} className="text-green-400" />}
                                    </>
                                )}
                                {selectedCategory.hierarchy.level3 && (
                                    <span className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs font-semibold">
                                        {selectedCategory.hierarchy.level3}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Error Display */}
                    {error && (
                        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3">
                            <AlertCircle size={20} className="text-rose-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-widest text-rose-900 mb-1">Error</p>
                                <p className="text-xs text-rose-700">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Progress Display */}
                    {progress && (
                        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-[11px] font-semibold uppercase tracking-widest text-blue-900">
                                    {progress.processed < progress.total ? 'Processing...' : 'Complete!'}
                                </p>
                                <p className="text-xs font-semibold text-blue-700">
                                    {progress.processed} / {progress.total}
                                </p>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full h-3 bg-blue-200 rounded-full overflow-hidden mb-3">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300"
                                    style={{ width: `${(progress.processed / progress.total) * 100}%` }}
                                />
                            </div>

                            {/* Results */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white rounded-xl p-3 border border-blue-100">
                                    <p className="text-[9px] font-semibold uppercase tracking-widest text-blue-400 mb-1">
                                        Updated
                                    </p>
                                    <p className="text-xl font-semibold text-green-600">{progress.updated}</p>
                                </div>
                                <div className="bg-white rounded-xl p-3 border border-blue-100">
                                    <p className="text-[9px] font-semibold uppercase tracking-widest text-blue-400 mb-1">
                                        Failed
                                    </p>
                                    <p className="text-xl font-semibold text-rose-600">{progress.failed}</p>
                                </div>
                            </div>

                            {/* Error List (if any) */}
                            {progress.errors && progress.errors.length > 0 && (
                                <div className="mt-3 p-3 bg-rose-50 rounded-xl border border-rose-100">
                                    <p className="text-[9px] font-semibold uppercase tracking-widest text-rose-900 mb-2">
                                        Errors ({progress.errors.length}):
                                    </p>
                                    <div className="space-y-1 max-h-32 overflow-y-auto">
                                        {progress.errors.map((err, idx) => (
                                            <p key={idx} className="text-[10px] text-rose-700">
                                                • Product {err.productId}: {err.reason}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-4 pt-6 border-t border-slate-100">
                        <button
                            onClick={handleClose}
                            disabled={isProcessing}
                            className="flex-1 px-6 py-4 bg-slate-100 text-slate-700 rounded-2xl text-[11px] font-semibold uppercase tracking-widest hover:bg-slate-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isProcessing ? 'Processing...' : 'Cancel'}
                        </button>
                        <button
                            onClick={handleRecategorize}
                            disabled={!selectedCategory || isProcessing || progress?.processed === progress?.total}
                            className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl text-[11px] font-semibold uppercase tracking-widest hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Processing...
                                </>
                            ) : progress?.processed === progress?.total ? (
                                '✓ Done'
                            ) : (
                                `Recategorize ${selectedProducts.length} Products`
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
