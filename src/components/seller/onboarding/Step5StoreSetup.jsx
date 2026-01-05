'use client'
import { FiImage, FiUpload, FiX } from 'react-icons/fi'
import { useState } from 'react'

export default function Step5StoreSetup({ formData, updateFormData, errors }) {
    const [logoPreview, setLogoPreview] = useState(null)
    const [bannerPreview, setBannerPreview] = useState(null)

    const productCategories = [
        'Electronics', 'Fashion', 'Women\'s Fashion', 'Kids\' Fashion',
        'Health & Beauty', 'Pharmacy', 'Groceries', 'Luxury Items',
        'Home & Living', 'Sports & Outdoors', 'Books & Media',
        'Automotive', 'Baby Products', 'Jewelry'
    ]

    const updateStoreInfo = (field, value) => {
        updateFormData({
            storeInfo: {
                ...formData.storeInfo,
                [field]: value
            }
        })
    }

    const updateSocialMedia = (platform, value) => {
        updateFormData({
            storeInfo: {
                ...formData.storeInfo,
                socialMedia: {
                    ...formData.storeInfo.socialMedia,
                    [platform]: value
                }
            }
        })
    }

    const toggleCategory = (category) => {
        const categories = formData.storeInfo.storeCategories || []
        const categoryValue = category.toLowerCase().replace(/[^a-z0-9]/g, '_')

        if (categories.includes(categoryValue)) {
            updateStoreInfo('storeCategories', categories.filter(c => c !== categoryValue))
        } else {
            updateStoreInfo('storeCategories', [...categories, categoryValue])
        }
    }

    const handleFileUpload = (e, type) => {
        const file = e.target.files[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                if (type === 'logo') {
                    setLogoPreview(reader.result)
                    updateStoreInfo('storeLogo', file)
                } else {
                    setBannerPreview(reader.result)
                    updateStoreInfo('storeBanner', file)
                }
            }
            reader.readAsDataURL(file)
        }
    }

    return (
        <div className="space-y-8">
            {/* Store Name */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Store Name <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={formData.storeInfo.storeName}
                    onChange={(e) => updateStoreInfo('storeName', e.target.value)}
                    placeholder="Your store/brand name"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.storeName ? 'border-red-300' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                        }`}
                />
                {errors.storeName && <p className="mt-2 text-sm text-red-600">{errors.storeName}</p>}
            </div>

            {/* Store Description */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Store Description <span className="text-red-500">*</span>
                </label>
                <textarea
                    value={formData.storeInfo.storeDescription}
                    onChange={(e) => updateStoreInfo('storeDescription', e.target.value)}
                    placeholder="Tell customers about your store, products, and what makes you unique..."
                    rows={4}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all resize-none ${errors.storeDescription ? 'border-red-300' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                        }`}
                />
                <p className="mt-1 text-xs text-gray-500">
                    {formData.storeInfo.storeDescription?.length || 0} / 500 characters
                </p>
                {errors.storeDescription && <p className="mt-2 text-sm text-red-600">{errors.storeDescription}</p>}
            </div>

            {/* Store Logo */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Store Logo
                </label>
                <div className="flex items-start gap-4">
                    {logoPreview && (
                        <div className="relative">
                            <img src={logoPreview} alt="Logo" className="w-24 h-24 object-cover rounded-xl border-2 border-gray-200" />
                            <button
                                onClick={() => {
                                    setLogoPreview(null)
                                    updateStoreInfo('storeLogo', null)
                                }}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                            >
                                <FiX className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    <div className="flex-1">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, 'logo')}
                            className="hidden"
                            id="storeLogo"
                        />
                        <label
                            htmlFor="storeLogo"
                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 transition-all cursor-pointer bg-gray-50 hover:bg-blue-50"
                        >
                            <FiImage className="w-8 h-8 text-gray-400 mb-2" />
                            <span className="text-sm font-medium text-gray-600">Upload Store Logo</span>
                            <span className="text-xs text-gray-500 mt-1">Square image, 500x500px recommended</span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Store Banner */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Store Banner
                </label>
                {bannerPreview && (
                    <div className="relative mb-4">
                        <img src={bannerPreview} alt="Banner" className="w-full h-40 object-cover rounded-xl border-2 border-gray-200" />
                        <button
                            onClick={() => {
                                setBannerPreview(null)
                                updateStoreInfo('storeBanner', null)
                            }}
                            className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                        >
                            <FiX className="w-4 h-4" />
                        </button>
                    </div>
                )}

                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'banner')}
                    className="hidden"
                    id="storeBanner"
                />
                <label
                    htmlFor="storeBanner"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 transition-all cursor-pointer bg-gray-50 hover:bg-blue-50"
                >
                    <FiImage className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm font-medium text-gray-600">Upload Store Banner</span>
                    <span className="text-xs text-gray-500 mt-1">1920x400px recommended</span>
                </label>
            </div>

            {/* Product Categories */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Product Categories <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {productCategories.map((category) => {
                        const categoryValue = category.toLowerCase().replace(/[^a-z0-9]/g, '_')
                        const isSelected = formData.storeInfo.storeCategories?.includes(categoryValue)

                        return (
                            <button
                                key={category}
                                type="button"
                                onClick={() => toggleCategory(category)}
                                className={`p-3 border-2 rounded-xl text-sm font-medium transition-all ${isSelected
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                {category}
                            </button>
                        )
                    })}
                </div>
                {errors.storeCategories && <p className="mt-2 text-sm text-red-600">{errors.storeCategories}</p>}
            </div>

            {/* Website */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Website <span className="text-gray-500 text-xs">(Optional)</span>
                </label>
                <input
                    type="url"
                    value={formData.storeInfo.website}
                    onChange={(e) => updateStoreInfo('website', e.target.value)}
                    placeholder="https://www.yourwebsite.com"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
            </div>

            {/* Customer Support */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Support Email
                    </label>
                    <input
                        type="email"
                        value={formData.storeInfo.customerSupportEmail}
                        onChange={(e) => updateStoreInfo('customerSupportEmail', e.target.value)}
                        placeholder="support@yourstore.com"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Support Phone
                    </label>
                    <input
                        type="tel"
                        value={formData.storeInfo.customerSupportPhone}
                        onChange={(e) => updateStoreInfo('customerSupportPhone', e.target.value)}
                        placeholder="+971 XX XXX XXXX"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    />
                </div>
            </div>

            {/* Social Media */}
            <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Social Media Links</h3>

                {['facebook', 'instagram', 'twitter', 'linkedin'].map((platform) => (
                    <div key={platform}>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 capitalize">
                            {platform}
                        </label>
                        <input
                            type="url"
                            value={formData.storeInfo.socialMedia[platform]}
                            onChange={(e) => updateSocialMedia(platform, e.target.value)}
                            placeholder={`https://${platform}.com/yourpage`}
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}
