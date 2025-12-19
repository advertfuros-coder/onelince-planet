// components/customer/ShareWishlistModal.jsx
'use client'

import { useState } from 'react'
import { FiX, FiShare2, FiCopy, FiCheck } from 'react-icons/fi'
import { FaWhatsapp, FaFacebook, FaTwitter, FaTelegram } from 'react-icons/fa'
import axios from 'axios'
import { useAuth } from '@/lib/hooks/useAuth'
import { toast } from 'react-hot-toast'

export default function ShareWishlistModal({ onClose }) {
    const { token } = useAuth()
    const [shareUrl, setShareUrl] = useState('')
    const [loading, setLoading] = useState(false)
    const [copied, setCopied] = useState(false)

    const generateShareLink = async () => {
        try {
            setLoading(true)
            const res = await axios.post(
                '/api/wishlist/share',
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            )

            if (res.data.success) {
                setShareUrl(res.data.shareUrl)
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to generate share link')
        } finally {
            setLoading(false)
        }
    }

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl)
            setCopied(true)
            toast.success('Link copied to clipboard!')
            setTimeout(() => setCopied(false), 2000)
        } catch (error) {
            toast.error('Failed to copy link')
        }
    }

    const shareOnPlatform = (platform) => {
        const text = 'Check out my wishlist on OnlinePlanet!'
        const encodedUrl = encodeURIComponent(shareUrl)
        const encodedText = encodeURIComponent(text)

        const urls = {
            whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
            telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`
        }

        window.open(urls[platform], '_blank', 'width=600,height=400')
    }

    // Generate link on mount
    useState(() => {
        generateShareLink()
    }, [])

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <FiX className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <FiShare2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Share Wishlist</h2>
                        <p className="text-sm text-gray-500">Share your wishlist with friends</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                    </div>
                ) : shareUrl ? (
                    <>
                        {/* Share Link */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Share Link
                            </label>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    value={shareUrl}
                                    readOnly
                                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-50 text-sm"
                                />
                                <button
                                    onClick={copyToClipboard}
                                    className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    {copied ? <FiCheck className="w-5 h-5" /> : <FiCopy className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Social Share Buttons */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Share via
                            </label>
                            <div className="grid grid-cols-4 gap-3">
                                <button
                                    onClick={() => shareOnPlatform('whatsapp')}
                                    className="flex flex-col items-center space-y-2 p-4 rounded-lg border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all group"
                                >
                                    <FaWhatsapp className="w-8 h-8 text-green-600" />
                                    <span className="text-xs font-medium text-gray-600 group-hover:text-green-600">WhatsApp</span>
                                </button>

                                <button
                                    onClick={() => shareOnPlatform('facebook')}
                                    className="flex flex-col items-center space-y-2 p-4 rounded-lg border-2 border-gray-200 hover:border-blue-600 hover:bg-blue-50 transition-all group"
                                >
                                    <FaFacebook className="w-8 h-8 text-blue-600" />
                                    <span className="text-xs font-medium text-gray-600 group-hover:text-blue-600">Facebook</span>
                                </button>

                                <button
                                    onClick={() => shareOnPlatform('twitter')}
                                    className="flex flex-col items-center space-y-2 p-4 rounded-lg border-2 border-gray-200 hover:border-sky-500 hover:bg-sky-50 transition-all group"
                                >
                                    <FaTwitter className="w-8 h-8 text-sky-500" />
                                    <span className="text-xs font-medium text-gray-600 group-hover:text-sky-500">Twitter</span>
                                </button>

                                <button
                                    onClick={() => shareOnPlatform('telegram')}
                                    className="flex flex-col items-center space-y-2 p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                                >
                                    <FaTelegram className="w-8 h-8 text-blue-500" />
                                    <span className="text-xs font-medium text-gray-600 group-hover:text-blue-500">Telegram</span>
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-500">Failed to generate share link</p>
                        <button
                            onClick={generateShareLink}
                            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
