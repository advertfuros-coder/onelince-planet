// app/seller/(seller)/reviews/page.jsx
'use client'

import { useState, useEffect } from 'react'
import {
  Star,
  Search,
  Filter,
  MessageCircle,
  ThumbsUp,
  CheckCircle2,
  MoreVertical,
  ChevronRight,
  TrendingUp,
  BarChart3,
  User,
  Package,
  Calendar,
  RefreshCw,
  Download
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/context/AuthContext'
import axios from 'axios'
import { toast } from 'react-hot-toast'

export default function SellerReviews() {
  const { token } = useAuth()
  const [reviews, setReviews] = useState([])
  const [stats, setStats] = useState({ total: 0, averageRating: '0.0', ratingBreakdown: {} })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [ratingFilter, setRatingFilter] = useState('all')

  useEffect(() => {
    if (token) {
      loadReviews()
    }
  }, [token, ratingFilter, searchTerm])

  const loadReviews = async () => {
    if (!token) return

    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (ratingFilter !== 'all') params.append('rating', ratingFilter)
      if (searchTerm) params.append('search', searchTerm)

      const response = await axios.get(`/api/seller/reviews?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.data.success) {
        setReviews(response.data.reviews)
        setStats(response.data.stats)
      } else {
        toast.error('Failed to load reviews')
      }
    } catch (error) {
      console.error('Error loading reviews:', error)
      if (error.response?.status !== 404) {
        toast.error('Failed to load review data')
      }
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (rating, size = 16) => {
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            size={size}
            className={`${i < rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-8">
      <div className="max-w-[1500px] mx-auto space-y-8">

        {/* Modern Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                <MessageCircle size={18} />
              </div>
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">Sentiment Audit</span>
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Feedback Ecosystem</h1>
            <p className="text-gray-500 font-medium mt-1">Real-time analysis of customer satisfaction and product quality</p>
          </div>

          <div className="flex items-center gap-6 bg-white p-6 rounded-[2.2rem] shadow-sm border border-gray-100/50">
            <div className="text-center pr-6 border-r border-gray-100">
              <p className="text-4xl font-black text-gray-900 tracking-tighter">{stats.averageRating}</p>
              <div className="mt-1">{renderStars(Math.round(parseFloat(stats.averageRating)), 14)}</div>
            </div>
            <div>
              <p className="text-sm font-black text-gray-900 leading-tight">{stats.total} Total Dossiers</p>
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-0.5">92% Positive Intent</p>
            </div>
          </div>
        </div>

        {/* Rating Breakdown & Highlights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100/50">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                <BarChart3 size={18} className="text-blue-600" />
                Rating Distribution
              </h3>
              <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Full Report</button>
            </div>
            <div className="space-y-4">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = stats.ratingBreakdown?.[star] || 0;
                const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-4">
                    <span className="text-xs font-black text-gray-400 w-4">{star}</span>
                    <div className="flex-1 h-2.5 bg-gray-50 rounded-full overflow-hidden shadow-inner">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        className={`h-full rounded-full ${star >= 4 ? 'bg-blue-600' : star >= 3 ? 'bg-amber-400' : 'bg-rose-500'}`}
                      />
                    </div>
                    <span className="text-xs font-black text-gray-900 w-12 text-right">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-[#0A1128] rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden text-white">
            <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-blue-600/20 rounded-full blur-3xl" />
            <div className="relative z-10">
              <h3 className="text-sm font-black text-white/50 uppercase tracking-widest mb-6 flex items-center gap-2">
                <TrendingUp size={18} className="text-blue-400" />
                Growth Impact
              </h3>
              <div className="space-y-6">
                <div>
                  <p className="text-3xl font-black tracking-tight">88.4%</p>
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-1">Organic Trust Score</p>
                </div>
                <div className="p-5 bg-white/5 border border-white/10 rounded-3xl">
                  <p className="text-xs font-bold leading-relaxed text-white/80">Reviews directly influence <span className="text-blue-400">12% more conversions</span> this fiscal period compared to previous.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-[2rem] p-4 lg:p-6 shadow-sm border border-gray-100/50 flex flex-col lg:flex-row gap-6 items-center">
          <div className="relative group w-full lg:w-[32rem]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Find feedback by product name or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto invisible-scrollbar w-full lg:w-auto">
            {['all', '5', '4', '3', '2', '1'].map((r) => (
              <button
                key={r}
                onClick={() => setRatingFilter(r)}
                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-tight transition-all shrink-0 ${ratingFilter === r
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                  }`}
              >
                {r === 'all' ? 'All Tiers' : `${r} Stars`}
              </button>
            ))}
          </div>
        </div>

        {/* Reviews Feed */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Processing Customer Logs...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="bg-white rounded-[2.5rem] p-32 text-center border border-gray-100/50">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-10 h-10 text-blue-300" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tighter">No feedback records</h3>
              <p className="text-gray-500 font-medium mt-2 max-w-sm mx-auto">Verified purchases will generate feedback logs here automatically.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {reviews.map((review, idx) => (
                <ModernReviewCard key={review.id} review={review} delay={idx * 0.05} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ModernReviewCard({ review, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="bg-white p-8 rounded-[2.5rem] border border-gray-100/50 shadow-sm hover:shadow-lg transition-all flex flex-col lg:flex-row gap-8 group"
    >
      <div className="lg:w-72 shrink-0 border-b lg:border-b-0 lg:border-r border-gray-100 pb-6 lg:pb-0">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-[1.2rem] bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-500/10">
            {review.customer.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h4 className="text-sm font-black text-gray-900 tracking-tight">{review.customer.name}</h4>
            {review.verified && (
              <div className="flex items-center gap-1 text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                <CheckCircle2 size={10} />
                Verified
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><Calendar size={10} /> Recorded</p>
            <p className="text-xs font-black text-gray-700">{new Date(review.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
          </div>
          <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Package size={10} /> Product Info</p>
            <p className="text-[11px] font-black text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">{review.product.name}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  size={18}
                  className={`${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`}
                />
              ))}
            </div>
            <button className="p-2 text-gray-300 hover:text-blue-600 transition-colors"><MoreVertical size={20} /></button>
          </div>
          <p className="text-base font-medium text-gray-700 leading-relaxed italic">"{review.comment}"</p>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-50 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="px-3 py-1 bg-gray-50 rounded-lg flex items-center gap-2">
              <ThumbsUp size={12} className="text-gray-400" />
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{review.helpful} Helpful</span>
            </div>
          </div>

          <div className="flex gap-2">
            {!review.replied ? (
              <button className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/10 active:scale-95 flex items-center gap-2">
                <MessageCircle size={14} />
                Publish Response
              </button>
            ) : (
              <div className="bg-emerald-50 text-emerald-600 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-emerald-100">
                <CheckCircle2 size={14} />
                Response Active
              </div>
            )}
            <button className="px-6 py-2.5 bg-gray-50 text-gray-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all">
              View Thread
            </button>
          </div>
        </div>

        {review.replied && review.reply && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-blue-50/30 border border-blue-100/50 rounded-[1.5rem] p-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white"><MessageCircle size={12} /></div>
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Your Response</span>
            </div>
            <p className="text-sm font-medium text-blue-900/80 leading-relaxed">{review.reply}</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
