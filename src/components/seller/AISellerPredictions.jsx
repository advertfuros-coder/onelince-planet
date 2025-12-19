// components/seller/AISellerPredictions.jsx
'use client'
import { useState } from 'react'
import {
    FiZap,
    FiDollarSign,
    FiTrendingUp,
    FiPackage,
    FiAlertCircle,
    FiTarget,
    FiUsers,
    FiShoppingBag,
    FiRefreshCw
} from 'react-icons/fi'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/lib/context/AuthContext'

export default function AISellerPredictions() {
    const { token } = useAuth()
    const [predictions, setPredictions] = useState(null)
    const [loading, setLoading] = useState(false)

    const generatePredictions = async () => {
    if (!token) {
      toast.error('Please login to use AI features')
      return
    }

    setLoading(true)
    try {
      // Call seller analytics API with predict=true (same pattern as admin)
      const response = await axios.get('/api/seller/analytics?range=30days&predict=true', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.data.success && response.data.predictions) {
        setPredictions(response.data.predictions)
        toast.success('✨ AI predictions generated!')
      } else {
        toast.error('Failed to generate predictions')
      }
    } catch (error) {
      console.error('Prediction Error:', error)
      if (error.message?.includes('not configured') || error.message?.includes('API key')) {
        toast.error('AI service not configured. Please add Gemini API key.')
      } else {
        toast.error(error.response?.data?.message || 'Failed to generate AI predictions')
      }
    } finally {
      setLoading(false)
    }
  }

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur">
                            <FiZap className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">AI Business Predictions</h2>
                            <p className="text-sm text-white/80">Powered by Gemini 1.5 Flash</p>
                        </div>
                    </div>

                    <button
                        onClick={generatePredictions}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 backdrop-blur"
                    >
                        {loading ? (
                            <>
                                <FiRefreshCw className="w-4 h-4 animate-spin" />
                                <span>Analyzing...</span>
                            </>
                        ) : (
                            <>
                                <FiZap className="w-4 h-4" />
                                <span>Generate Insights</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {!predictions && !loading && (
                    <div className="text-center py-12">
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FiZap className="w-10 h-10 text-purple-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Discover AI-Powered Insights
                        </h3>
                        <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
                            Get personalized predictions and recommendations to grow your business faster
                        </p>
                        <button
                            onClick={generatePredictions}
                            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
                        >
                            Generate AI Predictions
                        </button>
                    </div>
                )}

                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <FiRefreshCw className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
                            <p className="text-gray-600">AI is analyzing your business data...</p>
                            <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
                        </div>
                    </div>
                )}

                {predictions && !loading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Revenue Forecast */}
                        <PredictionCard
                            title="30-Day Revenue Forecast"
                            icon={<FiDollarSign />}
                            color="text-green-600"
                            bgColor="bg-green-50"
                            content={predictions.revenueForecast}
                        />

                        {/* Growth Opportunities */}
                        {predictions.growthOpportunities.length > 0 && (
                            <PredictionCard
                                title="Growth Opportunities"
                                icon={<FiTrendingUp />}
                                color="text-blue-600"
                                bgColor="bg-blue-50"
                                content={predictions.growthOpportunities}
                                isList
                            />
                        )}

                        {/* Product Strategy */}
                        {predictions.productStrategy.length > 0 && (
                            <PredictionCard
                                title="Product Strategy"
                                icon={<FiPackage />}
                                color="text-purple-600"
                                bgColor="bg-purple-50"
                                content={predictions.productStrategy}
                                isList
                            />
                        )}

                        {/* Pricing Strategy */}
                        {predictions.pricingStrategy.length > 0 && (
                            <PredictionCard
                                title="Pricing Optimization"
                                icon={<FiTarget />}
                                color="text-orange-600"
                                bgColor="bg-orange-50"
                                content={predictions.pricingStrategy}
                                isList
                            />
                        )}

                        {/* Marketing Advice */}
                        {predictions.marketingAdvice.length > 0 && (
                            <PredictionCard
                                title="Marketing Strategies"
                                icon={<FiShoppingBag />}
                                color="text-pink-600"
                                bgColor="bg-pink-50"
                                content={predictions.marketingAdvice}
                                isList
                            />
                        )}

                        {/* Risk Assessment */}
                        {predictions.risks.length > 0 && (
                            <PredictionCard
                                title="Risk Assessment"
                                icon={<FiAlertCircle />}
                                color="text-red-600"
                                bgColor="bg-red-50"
                                content={predictions.risks}
                                isList
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

// Reusable Prediction Card Component
function PredictionCard({ title, icon, color, bgColor, content, isList }) {
    return (
        <div className="bg-white rounded-xl shadow-md border-2 border-gray-100 p-5 hover:shadow-lg transition-all hover:border-purple-200">
            <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-xl ${bgColor}`}>
                    <div className={`${color} text-lg`}>{icon}</div>
                </div>
                <h3 className="font-bold text-gray-900">{title}</h3>
            </div>

            {isList && Array.isArray(content) ? (
                <ul className="space-y-2">
                    {content.map((item, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex items-start gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <span className="text-purple-600 font-bold mt-0.5">•</span>
                            <span className="flex-1">{item}</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                    {content}
                </p>
            )}
        </div>
    )
}
