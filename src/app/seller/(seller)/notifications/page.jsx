// app/seller/(seller)/notifications/page.jsx
'use client'

import { useState, useEffect } from 'react'
import {
  Bell,
  Check,
  X,
  Settings,
  Filter,
  CheckCircle2,
  AlertCircle,
  Package,
  CreditCard,
  Star,
  Zap,
  Clock,
  ChevronRight,
  MoreVertical,
  Activity,
  Trash2,
  RefreshCcw,
  Box
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/context/AuthContext'
import { toast } from 'react-hot-toast'

export default function SellerNotifications() {
  const { token } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (token) loadNotifications()
  }, [token])

  const loadNotifications = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/seller/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        setNotifications(data.notifications || [])
      }
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      const res = await fetch(`/api/seller/notifications/${notificationId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        setNotifications(prev => prev.map(n => n._id === notificationId ? { ...n, read: true } : n))
      }
    } catch (error) { toast.error('Handshake failed') }
  }

  const markAllAsRead = async () => {
    try {
      await fetch('/api/seller/notifications', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      })
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      toast.success('Omni-Read Protocol executed')
    } catch (error) { toast.error('Sync failure') }
  }

  const deleteNotification = async (notificationId) => {
    try {
      const res = await fetch(`/api/seller/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        setNotifications(prev => prev.filter(n => n._id !== notificationId))
        toast.info('Record purged')
      }
    } catch (error) { toast.error('Purge failure') }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order': return { icon: Package, color: 'text-blue-500', bg: 'bg-blue-50' }
      case 'payment': return { icon: CreditCard, color: 'text-emerald-500', bg: 'bg-emerald-50' }
      case 'product': return { icon: Box, color: 'text-purple-500', bg: 'bg-purple-50' }
      case 'review': return { icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' }
      default: return { icon: Zap, color: 'text-indigo-500', bg: 'bg-indigo-50' }
    }
  }

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read
    if (filter === 'read') return n.read
    return true
  })

  const unreadCount = notifications.filter(n => !n.read).length

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 font-semibold uppercase tracking-widest text-[9px]">Ingesting Feed Data...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-8">
      <div className="max-w-[1200px] mx-auto space-y-10">

        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
                <Bell size={20} />
              </div>
              <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full uppercase tracking-widest">Feed Terminal</span>
            </div>
            <div>
              <h1 className="text-5xl font-semibold text-gray-900 tracking-tighter leading-none">Intelligence Stream</h1>
              <p className="text-gray-500 font-semibold uppercase tracking-widest text-[11px] mt-3 flex items-center gap-2">
                {unreadCount > 0 ? (
                  <span className="flex items-center gap-2 text-rose-500">
                    <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    {unreadCount} Critical Unread Inbound
                  </span>
                ) : 'System In Sync — Zero Backlog'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-6 py-3.5 bg-white border border-gray-100 text-gray-900 rounded-2xl text-[10px] font-semibold uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2"
              >
                <CheckCircle2 size={16} className="text-emerald-500" /> Omni-Read
              </button>
            )}
            <button className="p-3.5 bg-white border border-gray-100 text-gray-400 hover:text-indigo-600 rounded-2xl shadow-sm transition-all">
              <Settings size={20} />
            </button>
          </div>
        </div>

        {/* Global Filter Matrix */}
        <div className="bg-white rounded-[2.5rem] p-4 shadow-sm border border-gray-100/50 flex flex-col md:flex-row items-center gap-2">
          <div className="flex-1 flex gap-2">
            {['all', 'unread', 'read'].map((opt) => (
              <button
                key={opt}
                onClick={() => setFilter(opt)}
                className={`
                      px-8 py-3 rounded-2xl text-[10px] font-semibold uppercase tracking-widest transition-all
                      ${filter === opt ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20' : 'text-gray-400 hover:bg-gray-50'}
                   `}
              >
                {opt}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 px-6 py-2 border-l border-gray-50">
            <Activity size={16} className="text-indigo-400" />
            <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest">Link Active: 480ms</span>
            <button
              onClick={loadNotifications}
              className="ml-4 p-2.5 bg-gray-50 hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 rounded-xl transition-all"
            >
              <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Feed List */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredNotifications.map((notif, idx) => {
              const meta = getNotificationIcon(notif.type)
              const Icon = meta.icon
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, x: 20 }}
                  key={notif._id}
                  className={`
                          group relative p-8 rounded-[2.8rem] border transition-all flex items-start gap-8
                          ${notif.read ? 'bg-white/60 border-gray-100 opacity-60' : 'bg-white border-transparent shadow-xl shadow-indigo-500/5 ring-1 ring-indigo-50'}
                       `}
                >
                  {!notif.read && (
                    <div className="absolute top-8 left-4 w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  )}

                  <div className={`shrink-0 w-16 h-16 rounded-[1.8rem] ${meta.bg} flex items-center justify-center ${meta.color} group-hover:scale-110 transition-transform duration-500`}>
                    <Icon size={28} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="text-xl font-semibold text-gray-900 tracking-tight leading-none uppercase">{notif.title}</h3>
                        <p className="text-sm font-medium text-gray-500 leading-relaxed mt-2">{notif.message}</p>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!notif.read && (
                          <button
                            onClick={() => markAsRead(notif._id)}
                            className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100 hover:bg-indigo-100 transition-all font-semibold text-[9px] uppercase tracking-widest"
                          >
                            Mark Resolved
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notif._id)}
                          className="p-3 bg-gray-50 text-gray-400 hover:text-rose-500 rounded-2xl transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 mt-6 pt-6 border-t border-gray-50">
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-gray-300" />
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Zap size={14} className="text-gray-300" />
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{notif.type} PROTOCOL</span>
                      </div>
                      {notif.actionUrl && (
                        <a href={notif.actionUrl} className="ml-auto text-[10px] font-semibold text-indigo-600 flex items-center gap-1 uppercase tracking-widest hover:translate-x-1 transition-transform">
                          Inspect Origin <ChevronRight size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {filteredNotifications.length === 0 && (
            <div className="bg-white rounded-[3.5rem] p-24 text-center shadow-sm border border-gray-100/50 flex flex-col items-center justify-center space-y-6">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500/10 blur-[80px] rounded-full" />
                <div className="relative w-24 h-24 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center text-indigo-300">
                  <RefreshCcw size={40} />
                </div>
              </div>
              <h3 className="text-3xl font-semibold text-gray-900 tracking-tighter uppercase">Feed Vacuum</h3>
              <p className="text-gray-400 max-w-sm font-semibold uppercase text-[10px] tracking-[0.2em] leading-relaxed">System backlog purged. No active intelligence signals detected in the selected domain.</p>
            </div>
          )}
        </div>

        {/* Floating Stat Bar */}
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-8 py-5 rounded-[2.5rem] shadow-2xl flex items-center gap-10 border border-gray-800 backdrop-blur-md bg-gray-900/90 z-40">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[9px] font-semibold uppercase tracking-widest text-emerald-500">Node Sync: 100%</span>
          </div>
          <div className="h-4 w-[1px] bg-gray-800" />
          <div className="flex items-center gap-6">
            <p className="text-[9px] font-semibold uppercase tracking-widest text-gray-500">Recent Signals</p>
            <div className="flex -space-x-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-8 h-8 rounded-xl border-2 border-gray-900 bg-gray-800 text-[10px] font-semibold flex items-center justify-center text-gray-400">
                  {i}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
