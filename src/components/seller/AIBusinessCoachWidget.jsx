// components/seller/AIBusinessCoachWidget.jsx
'use client'
import { useState, useEffect } from 'react'
import {
    FiZap,
    FiTrendingUp,
    FiStar,
    FiTarget,
    FiAlertCircle,
    FiChevronRight,
    FiRefreshCw,
    FiCpu
} from 'react-icons/fi'
import { useAuth } from '@/lib/context/AuthContext'
import axios from 'axios'
import { toast } from 'react-hot-toast'

export default function AIBusinessCoachWidget() {
    const { token } = useAuth()
    const [insights, setInsights] = useState(null)
    const [loading, setLoading] = useState(false)
    const [expanded, setExpanded] = useState(false)

    useEffect(() => {
        loadInsights()
    }, [])

    const loadInsights = async () => {
        if (!token) return

        setLoading(true)
        try {
            const response = await axios.post('/api/ai/business-coach', {
                action: 'analyze_performance'
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            })

            if (response.data.success) {
                setInsights(response.data.analysis)
            } else if (response.data.needsSetup) {
                // Show setup instructions
                setInsights({ needsSetup: true, ...response.data })
            } else {
                toast.error(response.data.message || 'Failed to load AI insights')
            }
        } catch (error) {
            console.error('AI Coach Error:', error)
            // Check if it's a setup issue
            if (error.response?.data?.needsSetup) {
                setInsights({ needsSetup: true, ...error.response.data })
            }
        } finally {
            setLoading(false)
        }
    }

    if (loading && !insights) {
        return (
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-100">
                <div className="flex items-center justify-center py-8">
                    <FiRefreshCw className="w-8 h-8 animate-spin text-purple-600" />
                    <span className="ml-3 text-purple-600 font-medium">AI analyzing your business...</span>
                </div>
            </div>
        )
    }

    if (!insights) {
        return (
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-100">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                            <FiCpu className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">AI Business Coach</h3>
                            <p className="text-sm text-gray-600">Get personalized insights</p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={loadInsights}
                    className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
                >
                    <FiZap className="w-5 h-5" />
                    <span>Analyze My Business</span>
                </button>
            </div>
        )
    }

    // Show setup instructions if API key is missing
    if (insights.needsSetup) {
        return (
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                        <FiAlertCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">AI Setup Required</h3>
                        <p className="text-sm text-gray-600">Configure your API key to enable AI features</p>
                    </div>
                </div>

                <div className="bg-white rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">📋 Quick Setup:</h4>
                    <ol className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                            <span className="font-semibold text-purple-600">1.</span>
                            <span>Get a <strong>free API key</strong> from <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google AI Studio</a></span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="font-semibold text-purple-600">2.</span>
                            <span>Add to <code className="bg-gray-100 px-1 rounded">.env.local</code> file:</span>
                        </li>
                    </ol>
                    <div className="mt-2 bg-gray-900 text-green-400 p-3 rounded font-mono text-xs">
                        GOOGLE_GEMINI_API_KEY=your_api_key_here
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        <li className="flex items-start gap-2">
                            <span className="font-semibold text-purple-600">3.</span>
                            <span>Restart your dev server</span>
                        </li>
                    </p>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>💡 Free tier: 60 requests/minute</span>
                    <a
                        href="https://ai.google.dev/pricing"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 font-semibold hover:text-purple-700"
                    >
                        View Pricing →
                    </a>
                </div>
            </div>
        )
    }
    return (
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-100">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                        <FiCpu className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">AI Business Coach</h3>
                        <p className="text-sm text-gray-600">Your personal AI advisor</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="px-3 py-1 bg-white rounded-full">
                        <span className="text-sm font-semibold text-purple-600">
                            Score: {insights.overallScore}/100
                        </span>
                    </div>
                    <button
                        onClick={loadInsights}
                        className="p-2 hover:bg-white rounded-lg transition-colors"
                        disabled={loading}
                    >
                        <FiZap className={`w-5 h-5 text-purple-600 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Quick Insights */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                {/* Strengths */}
                <div className="bg-white rounded-lg p-4 border border-green-100">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <FiTrendingUp className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">Strengths</span>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2">
                        {insights.strengths[0]}
                    </p>
                    {insights.strengths.length > 1 && (
                        <span className="text-xs text-green-600 font-medium">
                            +{insights.strengths.length - 1} more
                        </span>
                    )}
                </div>

                {/* Opportunities */}
                <div className="bg-white rounded-lg p-4 border border-blue-100">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FiStar className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">Opportunities</span>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2">
                        {insights.opportunities[0]}
                    </p>
                    {insights.opportunities.length > 1 && (
                        <span className="text-xs text-blue-600 font-medium">
                            +{insights.opportunities.length - 1} more
                        </span>
                    )}
                </div>
            </div>

            {/* Priority Actions */}
            {insights.priorityActions && insights.priorityActions.length > 0 && (
                <div className="bg-white rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 mb-3">
                        <FiTarget className="w-5 h-5 text-purple-600" />
                        <span className="font-semibold text-gray-900">Top Priority Action</span>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-start gap-3">
                            <div className={`px-2 py-1 rounded text-xs font-semibold ${insights.priorityActions[0].impact === 'high'
                                ? 'bg-red-100 text-red-700'
                                : insights.priorityActions[0].impact === 'medium'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-gray-100 text-gray-700'
                                }`}>
                                {insights.priorityActions[0].impact.toUpperCase()}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                    {insights.priorityActions[0].action}
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                    {insights.priorityActions[0].expectedOutcome}
                                </p>
                                <p className="text-xs text-purple-600 font-medium mt-1">
                                    Timeline: {insights.priorityActions[0].timeline}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Growth Projection */}
            {insights.growthProjection && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 mb-4 border border-green-100">
                    <div className="flex items-center gap-2 mb-2">
                        <FiTrendingUp className="w-5 h-5 text-green-600" />
                        <span className="font-semibold text-gray-900">30-Day Projection</span>
                    </div>
                    <p className="text-sm text-gray-700">{insights.growthProjection['30days']}</p>
                </div>
            )}

            {/* Expand Button */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border border-purple-200 text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
            >
                <span>{expanded ? 'Show Less' : 'View Full Analysis'}</span>
                <FiChevronRight className={`w-4 h-4 transition-transform ${expanded ? 'rotate-90' : ''}`} />
            </button>

            {/* Expanded View */}
            {expanded && (
                <div className="mt-4 space-y-4 pt-4 border-t border-purple-100">
                    {/* All Strengths */}
                    <div>
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <FiTrendingUp className="w-4 h-4 text-green-600" />
                            All Strengths
                        </h4>
                        <ul className="space-y-1">
                            {insights.strengths.map((strength, index) => (
                                <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                                    <span className="text-green-600">✓</span>
                                    <span>{strength}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Weaknesses */}
                    <div>
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <FiAlertCircle className="w-4 h-4 text-orange-600" />
                            Areas for Improvement
                        </h4>
                        <ul className="space-y-1">
                            {insights.weaknesses.map((weakness, index) => (
                                <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                                    <span className="text-orange-600">!</span>
                                    <span>{weakness}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Key Recommendations */}
                    <div className="bg-purple-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">💡 AI Recommendations</h4>
                        <div className="space-y-3 text-sm text-gray-700">
                            <div>
                                <strong>Pricing:</strong> {insights.pricingRecommendation}
                            </div>
                            <div>
                                <strong>Marketing:</strong> {insights.marketingAdvice}
                            </div>
                            <div>
                                <strong>Inventory:</strong> {insights.inventoryAdvice}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
