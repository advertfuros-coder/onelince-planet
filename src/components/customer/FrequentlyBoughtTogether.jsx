'use client'
import { useState, useEffect } from 'react'
import { FiPlus, FiCheck, FiShoppingCart } from 'react-icons/fi'
import { useCart } from '@/lib/context/CartContext'

export function FrequentlyBoughtTogether({ mainProduct, relatedProducts }) {
    const { addToCart } = useCart()
    const [selectedProducts, setSelectedProducts] = useState([])
    const [bundleProducts, setBundleProducts] = useState([])

    useEffect(() => {
        if (mainProduct) {
            // Use provided related products
            let complementary = []

            if (relatedProducts && relatedProducts.length > 0) {
                complementary = relatedProducts.slice(0, 2)
            }

            setBundleProducts(complementary)
            // Select all by default
            if (complementary.length > 0) {
                setSelectedProducts([mainProduct._id, ...complementary.map(p => p._id)])
            }
        }
    }, [mainProduct, relatedProducts])

    if (!mainProduct || bundleProducts.length === 0) return null

    const allBundleItems = [mainProduct, ...bundleProducts]

    // Calculate totals based on selection
    const selectedItems = allBundleItems.filter(p => selectedProducts.includes(p._id))

    const totalPrice = selectedItems.reduce((sum, p) => sum + (p.price || p.pricing?.salePrice || 0), 0)
    const originalPrice = selectedItems.reduce((sum, p) => sum + (p.originalPrice || p.pricing?.basePrice || 0), 0)
    const savings = originalPrice - totalPrice

    const handleToggleProduct = (productId) => {
        // Don't allow deselecting main product for now (optional UX choice)
        if (productId === mainProduct._id) return

        setSelectedProducts(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        )
    }

    const handleAddBundle = () => {
        selectedItems.forEach(product => {
            addToCart(product, 1)
        })
    }

    return (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mt-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Frequently Bought Together</h3>

            <div className="flex flex-col lg:flex-row gap-8 items-center">
                {/* Product Images Chain */}
                <div className="flex items-center gap-2 overflow-x-auto pb-4 lg:pb-0 w-full lg:w-auto">
                    {allBundleItems.map((product, index) => (
                        <div key={product._id} className="flex items-center gap-2 flex-shrink-0">
                            {index > 0 && <FiPlus className="w-5 h-5 text-gray-400" />}
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-xl border border-gray-200 overflow-hidden bg-white p-2 relative">
                                    <img
                                        src={product.images?.[0]?.url || product.image || product.images?.[0]}
                                        alt={product.name}
                                        className="w-full h-full object-contain"
                                    />
                                    {/* Selection Checkbox overlay */}
                                    <div
                                        className={`absolute inset-0 bg-black/5 transition-opacity cursor-pointer flex items-center justify-center ${selectedProducts.includes(product._id) ? 'opacity-0 hover:opacity-100' : 'opacity-40'
                                            }`}
                                        onClick={() => handleToggleProduct(product._id)}
                                    >
                                        {selectedProducts.includes(product._id) ? (
                                            <FiCheck className="w-8 h-8 text-green-600 bg-white rounded-full p-1 shadow-sm" />
                                        ) : (
                                            <div className="w-6 h-6 rounded-full border-2 border-gray-400 bg-white"></div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bundle Summary */}
                <div className="flex-1 w-full lg:w-auto">
                    <div className="space-y-3 mb-6">
                        {allBundleItems.map((product) => (
                            <div key={`list-${product._id}`} className="flex items-start gap-3">
                                <div
                                    className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 cursor-pointer transition-colors ${selectedProducts.includes(product._id)
                                        ? 'bg-blue-600 border-blue-600'
                                        : 'border-gray-300 bg-white'
                                        }`}
                                    onClick={() => handleToggleProduct(product._id)}
                                >
                                    {selectedProducts.includes(product._id) && <FiCheck className="w-3.5 h-3.5 text-white" />}
                                </div>
                                <div className={`${!selectedProducts.includes(product._id) ? 'opacity-50' : ''}`}>
                                    <p className="text-sm font-medium text-gray-900 line-clamp-1">{product.name}</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="font-semibold text-gray-900">₹{(product.price || product.pricing?.salePrice || 0).toLocaleString()}</span>
                                        {(product.originalPrice || product.pricing?.basePrice) > (product.price || product.pricing?.salePrice) && (
                                            <span className="text-xs text-gray-400 line-through">₹{(product.originalPrice || product.pricing?.basePrice).toLocaleString()}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Action Card */}
                <div className="w-full lg:w-64 bg-gray-50 rounded-xl p-4 border border-gray-100 flex-shrink-0">
                    <div className="mb-4">
                        <p className="text-sm text-gray-600">Total Price for {selectedProducts.length} items:</p>
                        <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-2xl font-bold text-gray-900">₹{totalPrice.toLocaleString()}</span>
                            {savings > 0 && (
                                <span className="text-sm text-gray-500 line-through">₹{originalPrice.toLocaleString()}</span>
                            )}
                        </div>
                        {savings > 0 && (
                            <p className="text-green-600 text-sm font-semibold mt-1">
                                You save ₹{savings.toLocaleString()}
                            </p>
                        )}
                    </div>

                    <button
                        onClick={handleAddBundle}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                    >
                        <FiShoppingCart className="w-4 h-4" />
                        Add Bundle to Cart
                    </button>
                </div>
            </div>
        </div>
    )
}
