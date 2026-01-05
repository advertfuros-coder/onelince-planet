'use client'
import { useState, useEffect } from 'react'
import { ChevronRight, Check, Search, Loader2, Info, Sparkles, Zap, X } from 'lucide-react'
import axios from 'axios'

/**
 * CategorySelector Component
 * 
 * A smart cascading category selector for sellers.
 * Hierarchical selection: Level 1 (Main) → Level 2 (Department) → Level 3 (Product Type)
 *
 * @param {Object} props
 * @param {string} props.selectedPath - Currently selected category path (e.g., "fashion/men/t-shirts")
 * @param {Function} props.onChange - Callback when selection changes (categoryId, path, level)
 * @param {boolean} props.required - Whether category selection is required
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.productDetails - Product details for AI suggestion (name, description, brand, keywords)
 */
export default function CategorySelector({
  selectedPath = '',
  onChange,
  required = true,
  className = '',
  productDetails = null // { name, description, brand, keywords }
}) {
    const [categories, setCategories] = useState({
        level1: [],
        level2: [],
        level3: []
    })
    const [selected, setSelected] = useState({
        level1: null,
        level2: null,
        level3: null
    })
    const [loading, setLoading] = useState({
        level1: false,
        level2: false,
        level3: false
    })
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState({
        level1: '',
        level2: '',
        level3: ''
    })

    // AI Suggestion State
    const [aiLoading, setAiLoading] = useState(false)
    const [aiSuggestions, setAiSuggestions] = useState(null)
    const [showAiSuggestions, setShowAiSuggestions] = useState(false)

    // Load Level 1 categories on mount
    useEffect(() => {
        loadCategories(1, null)
    }, [])

    // Load existing selection from path
    useEffect(() => {
        if (selectedPath && categories.level1.length > 0) {
            restoreSelectionFromPath(selectedPath)
        }
    }, [selectedPath, categories.level1])

    /**
     * Fetch categories from API
     */
    const loadCategories = async (level, parentId = null) => {
        const key = `level${level}`
        setLoading(prev => ({ ...prev, [key]: true }))
        setError(null)

        try {
            const params = new URLSearchParams()
            if (level === 1) {
                params.append('level', '1')
            } else if (parentId) {
                params.append('parentId', parentId)
            }

            const response = await axios.get(`/api/categories?${params.toString()}`)

            if (response.data.success) {
                setCategories(prev => ({
                    ...prev,
                    [key]: response.data.data
                }))
            }
        } catch (err) {
            console.error(`Error loading level ${level} categories:`, err)
            setError(`Failed to load categories: ${err.message}`)
        } finally {
            setLoading(prev => ({ ...prev, [key]: false }))
        }
    }

    /**
     * Handle selection at any level
     */
    const handleSelect = async (level, category) => {
        const newSelected = { ...selected }

        if (level === 1) {
            newSelected.level1 = category
            newSelected.level2 = null
            newSelected.level3 = null
            setSelected(newSelected)

            // Load level 2 categories
            if (category) {
                await loadCategories(2, category._id)
                setCategories(prev => ({ ...prev, level3: [] }))
            } else {
                setCategories(prev => ({ ...prev, level2: [], level3: [] }))
            }
        } else if (level === 2) {
            newSelected.level2 = category
            newSelected.level3 = null
            setSelected(newSelected)

            // Load level 3 categories
            if (category) {
                await loadCategories(3, category._id)
            } else {
                setCategories(prev => ({ ...prev, level3: [] }))
            }
        } else if (level === 3) {
            newSelected.level3 = category
            setSelected(newSelected)
        }

        // Notify parent component
        notifyChange(newSelected)
    }

    /**
     * Notify parent of selection change
     */
    const notifyChange = (selection) => {
        // Find the deepest selected category
        const finalCategory = selection.level3 || selection.level2 || selection.level1

        if (onChange && finalCategory) {
            onChange({
                categoryId: finalCategory._id,
                path: finalCategory.path,
                level: finalCategory.level,
                name: finalCategory.name,
                requiresApproval: finalCategory.requiresApproval || false,
                // Include full hierarchy for display
                hierarchy: {
                    level1: selection.level1?.name || null,
                    level2: selection.level2?.name || null,
                    level3: selection.level3?.name || null
                }
            })
        } else if (onChange && !finalCategory) {
            // Selection cleared
            onChange(null)
        }
    }

    /**
     * Restore selection from a path string
     */
    const restoreSelectionFromPath = async (path) => {
        // This is a simplified version - in production, you'd want to fetch
        // the category by path and then load its ancestors
        // For now, this is a placeholder
    }

    /**
     * Fetch AI-powered category suggestions
     */
    const fetchAiSuggestions = async () => {
        if (!productDetails || !productDetails.name) {
            setError('Product name is required for AI suggestions')
            return
        }

        setAiLoading(true)
        setError(null)

        try {
            const response = await axios.post('/api/seller/ai-category-suggest', {
                productName: productDetails.name,
                description: productDetails.description || '',
                brand: productDetails.brand || '',
                keywords: productDetails.keywords || []
            })

            if (response.data.success) {
                setAiSuggestions(response.data.data.suggestions)
                setShowAiSuggestions(true)
            }
        } catch (err) {
            console.error('AI suggestion error:', err)
            setError('Failed to get AI suggestions. Please try again.')
        } finally {
            setAiLoading(false)
        }
    }

    /**
     * Apply an AI suggestion
     */
    const applySuggestion = async (suggestion) => {
        // Parse the path to get each level
        const pathParts = suggestion.path.split('/')
        
        // Find and select level 1
        const level1Cat = categories.level1.find(cat => cat.slug === pathParts[0])
        if (!level1Cat) return

        await handleSelect(1, level1Cat)

        // Wait a bit for level 2 to load
        setTimeout(async () => {
            if (pathParts.length > 1) {
                // Find level 2
                const level2Cat = categories.level2.find(cat => cat.slug === pathParts[1])
                if (level2Cat) {
                    await handleSelect(2, level2Cat)

                    // Wait for level 3 to load
                    setTimeout(async () => {
                        if (pathParts.length > 2) {
                            const level3Cat = categories.level3.find(cat => cat.slug === pathParts[2])
                            if (level3Cat) {
                                await handleSelect(3, level3Cat)
                            }
                        }
                        setShowAiSuggestions(false)
                    }, 300)
                }
            }
        }, 300)
    }

    /**
     * Filter categories based on search term
     */
    const getFilteredCategories = (level) => {
        const levelKey = `level${level}`
        const term = searchTerm[levelKey].toLowerCase()

        if (!term) return categories[levelKey]

        return categories[levelKey].filter(cat =>
            cat.name.toLowerCase().includes(term)
        )
    }

    /**
     * Render a single dropdown level
     */
    const renderDropdown = (level, title, placeholder) => {
        const levelKey = `level${level}`
        const isDisabled = level > 1 && !selected[`level${level - 1}`]
        const filteredCategories = getFilteredCategories(level)
        const currentSelection = selected[levelKey]
        const isLoading = loading[levelKey]

        return (
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                        {title}
                        {required && level === 1 && <span className="text-rose-500 ml-1">*</span>}
                    </label>
                    {currentSelection && (
                        <button
                            type="button"
                            onClick={() => handleSelect(level, null)}
                            className="text-[9px] font-semibold text-blue-600 hover:text-blue-700 uppercase tracking-wider"
                        >
                            Clear
                        </button>
                    )}
                </div>

                <div className="relative">
                    {/* Search Input (appears as dropdown trigger) */}
                    <div className={`relative ${isDisabled ? 'opacity-50 pointer-events-none' : ''}`}>
                        <input
                            type="text"
                            value={currentSelection ? currentSelection.name : searchTerm[levelKey]}
                            onChange={(e) => {
                                if (!currentSelection) {
                                    setSearchTerm(prev => ({ ...prev, [levelKey]: e.target.value }))
                                }
                            }}
                            onFocus={(e) => {
                                if (!currentSelection) {
                                    e.target.select()
                                }
                            }}
                            placeholder={isDisabled ? 'Select previous level first' : placeholder}
                            disabled={isDisabled}
                            className={`w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-5 py-3.5 pr-12 text-sm font-semibold text-slate-700 placeholder-slate-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all ${currentSelection ? 'bg-blue-50 border-blue-200' : ''
                                }`}
                            readOnly={!!currentSelection}
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                            {isLoading && <Loader2 size={16} className="animate-spin text-blue-600" />}
                            {currentSelection && <Check size={16} className="text-blue-600" />}
                            {!currentSelection && !isLoading && <Search size={16} className="text-slate-400" />}
                        </div>
                    </div>

                    {/* Dropdown List (only show when typing and not selected) */}
                    {!currentSelection && searchTerm[levelKey] && filteredCategories.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 max-h-64 overflow-y-auto">
                            {filteredCategories.map((category, idx) => (
                                <button
                                    key={category._id}
                                    type="button"
                                    onClick={() => {
                                        handleSelect(level, category)
                                        setSearchTerm(prev => ({ ...prev, [levelKey]: '' }))
                                    }}
                                    className={`w-full text-left px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-blue-50 transition-colors ${idx === 0 ? 'rounded-t-2xl' : ''
                                        } ${idx === filteredCategories.length - 1 ? 'rounded-b-2xl' : ''} border-b last:border-b-0 border-slate-100`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span>{category.name}</span>
                                        {category.requiresApproval && (
                                            <span className="text-[8px] font-semibold uppercase tracking-widest px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                                                Approval Needed
                                            </span>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Show "No results" when searching */}
                    {!currentSelection && searchTerm[levelKey] && filteredCategories.length === 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 px-5 py-4">
                            <p className="text-sm text-slate-400 text-center">No categories found</p>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className={`space-y-6 ${className}`}>
            {error && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3">
                    <Info size={20} className="text-rose-600 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-widest text-rose-900 mb-1">Error Loading Categories</p>
                        <p className="text-xs text-rose-700">{error}</p>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-xl shadow-slate-200/20 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <ChevronRight size={20} className="text-white" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-widest">Product Category</h3>
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">
                                Select the most specific category for better discoverability
                            </p>
                        </div>
                    </div>
                    
                    {/* AI Suggest Button */}
                    {productDetails && productDetails.name && (
                        <button
                            type="button"
                            onClick={fetchAiSuggestions}
                            disabled={aiLoading}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl text-[10px] font-semibold uppercase tracking-widest hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {aiLoading ? (
                                <>
                                    <Loader2 size={14} className="animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Sparkles size={14} />
                                    AI Suggest
                                </>
                            )}
                        </button>
                    )}
                </div>

                {renderDropdown(1, 'Main Category', 'Search main category (e.g., Fashion, Electronics)...')}
                {renderDropdown(2, 'Department', 'Search department (e.g., Men, Women, Smartphones)...')}
                {renderDropdown(3, 'Product Type', 'Search product type (e.g., T-Shirts, TWS, Laptops)...')}

                {/* Selected Path Preview */}
                {(selected.level1 || selected.level2 || selected.level3) && (
                    <div className="pt-6 border-t border-slate-100">
                        <p className="text-[9px] font-semibold uppercase tracking-widest text-slate-400 mb-2">Selected Path:</p>
                        <div className="flex items-center gap-2 flex-wrap">
                            {selected.level1 && (
                                <>
                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold">
                                        {selected.level1.name}
                                    </span>
                                    {selected.level2 && <ChevronRight size={14} className="text-slate-300" />}
                                </>
                            )}
                            {selected.level2 && (
                                <>
                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold">
                                        {selected.level2.name}
                                    </span>
                                    {selected.level3 && <ChevronRight size={14} className="text-slate-300" />}
                                </>
                            )}
                            {selected.level3 && (
                                <span className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold shadow-sm">
                                    {selected.level3.name} ✓
                                </span>
                            )}
                        </div>
                        {(selected.level3 || selected.level2 || selected.level1)?.requiresApproval && (
                            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
                                <p className="text-[10px] font-semibold text-amber-900 uppercase tracking-wider">
                                    ⚠️ This category requires admin approval before your product goes live.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* AI Suggestions Modal */}
            {showAiSuggestions && aiSuggestions && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="p-10 space-y-6">
                            {/* Header */}
                            <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                                        <Sparkles size={24} className="text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-900 uppercase tracking-widest">AI Category Suggestions</h3>
                                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">
                                            Powered by Gemini 2.0 Flash
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowAiSuggestions(false)}
                                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                                >
                                    <X size={18} className="text-slate-600" />
                                </button>
                            </div>

                            {/* Product Being Analyzed */}
                            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-900 mb-2">Analyzing Product:</p>
                                <p className="text-sm font-semibold text-blue-800">{productDetails?.name}</p>
                                {productDetails?.description && (
                                    <p className="text-xs text-blue-600 mt-1">{productDetails.description.substring(0, 100)}...</p>
                                )}
                            </div>

                            {/* Suggestions */}
                            <div className="space-y-4">
                                {aiSuggestions.map((suggestion, idx) => (
                                    <div
                                        key={idx}
                                        className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-2xl p-6 hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer group"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-semibold text-white ${
                                                    idx === 0 ? 'bg-gradient-to-br from-green-500 to-emerald-600' :
                                                    idx === 1 ? 'bg-gradient-to-br from-blue-500 to-indigo-600' :
                                                    'bg-gradient-to-br from-purple-500 to-pink-600'
                                                }`}>
                                                    #{idx + 1}
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-semibold uppercase tracking-widest text-slate-400">Confidence Score</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                                                            <div 
                                                                className={`h-full ${
                                                                    suggestion.confidence >= 80 ? 'bg-green-500' :
                                                                    suggestion.confidence >= 60 ? 'bg-blue-500' :
                                                                    'bg-purple-500'
                                                                }`}
                                                                style={{ width: `${suggestion.confidence}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs font-semibold text-slate-700">{suggestion.confidence}%</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => applySuggestion(suggestion)}
                                                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-[10px] font-semibold uppercase tracking-widest hover:from-blue-700 hover:to-purple-700 transition-all shadow-md group-hover:scale-105"
                                            >
                                                <Check size={12} className="inline mr-1" />
                                                Apply
                                            </button>
                                        </div>

                                        {/* Category Path */}
                                        <div className="mb-3">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {suggestion.hierarchy.level1 && (
                                                    <>
                                                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold">
                                                            {suggestion.hierarchy.level1}
                                                        </span>
                                                        {suggestion.hierarchy.level2 && <ChevronRight size={14} className="text-slate-300" />}
                                                    </>
                                                )}
                                                {suggestion.hierarchy.level2 && (
                                                    <>
                                                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold">
                                                            {suggestion.hierarchy.level2}
                                                        </span>
                                                        {suggestion.hierarchy.level3 && <ChevronRight size={14} className="text-slate-300" />}
                                                    </>
                                                )}
                                                {suggestion.hierarchy.level3 && (
                                                    <span className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold">
                                                        {suggestion.hierarchy.level3}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Reasoning */}
                                        <div className="bg-white/50 rounded-xl p-3 border border-slate-100">
                                            <p className="text-[9px] font-semibold uppercase tracking-widest text-slate-400 mb-1">AI Reasoning:</p>
                                            <p className="text-xs text-slate-600 leading-relaxed">{suggestion.reason}</p>
                                        </div>

                                        {/* Approval Warning */}
                                        {suggestion.requiresApproval && (
                                            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-2 flex items-center gap-2">
                                                <Info size={14} className="text-amber-600 shrink-0" />
                                                <p className="text-[9px] font-semibold text-amber-900 uppercase tracking-wider">
                                                    Requires admin approval
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Footer */}
                            <div className="pt-6 border-t border-slate-100 text-center">
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                                    💡 Tip: More specific categories lead to better product discoverability
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
