'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  Bell,
  Mail,
  Search,
  ChevronDown,
  Command,
  Package,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Info,
  CreditCard,
  User,
  ExternalLink,
  Check
} from 'lucide-react'
import { useAuth } from '../../lib/context/AuthContext'
import axios from 'axios'

export default function SellerHeader() {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const notificationRef = useRef(null)

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      const res = await axios.get('/api/seller/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data.success) {
        setNotifications(res.data.notifications)
        setUnreadCount(res.data.unreadCount)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const markRead = async (id = null, markAll = false) => {
    try {
      const token = localStorage.getItem('token')
      await axios.put('/api/seller/notifications',
        { id, markAll },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      fetchNotifications()
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  useEffect(() => {
    fetchNotifications()
    // Real-time Poll: Every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)

    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      clearInterval(interval)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const getIcon = (type, category) => {
    switch (category) {
      case 'sales': return <Package className="text-blue-500" size={16} />
      case 'inventory': return <TrendingUp className="text-amber-500" size={16} />
      case 'financial': return <CreditCard className="text-emerald-500" size={16} />
      case 'marketing': return <TrendingUp className="text-indigo-500" size={16} />
      case 'system': return <Info className="text-slate-500" size={16} />
      default: return <Bell className="text-gray-400" size={16} />
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-rose-50 border-rose-100'
      case 'high': return 'bg-amber-50 border-amber-100'
      default: return 'bg-white border-transparent'
    }
  }

  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 px-8 py-3 sticky top-0 z-40">
      <div className="max-w-[1500px] mx-auto flex items-center justify-between">

        {/* Modern Search Hub */}
        <div className="flex items-center flex-1 max-w-xl">
          <div className={`
            relative flex items-center bg-slate-50 border rounded-2xl w-full px-5 py-2.5 transition-all duration-500
            ${searchFocused ? 'ring-4 ring-blue-500/10 border-blue-500 bg-white shadow-2xl scale-[1.02]' : 'border-slate-100 shadow-sm'}
          `}>
            <Search className={`w-4 h-4 transition-colors ${searchFocused ? 'text-blue-500' : 'text-slate-400'}`} />
            <input
              type="text"
              placeholder="Search logistics, orders, or analytics..."
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="ml-3 w-full bg-transparent border-none outline-none text-[13px] font-semibold text-slate-700 placeholder-slate-400"
            />
            <div className="flex items-center gap-1.5 ml-3 bg-white border border-slate-200 px-2 py-1 rounded-lg text-[10px] text-slate-400 font-semibold tracking-widest uppercase">
              <Command size={10} />
              <span>/</span>
            </div>
          </div>
        </div>

        {/* Intelligence Actions */}
        <div className="flex items-center gap-3">

          <Link
            href="/seller/messages"
            className="p-3 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all relative group"
          >
            <Mail size={20} className="group-hover:rotate-12 transition-transform" />
            <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-blue-500 rounded-full border-[2.5px] border-white group-hover:scale-125 transition-transform" />
          </Link>

          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-3 rounded-2xl transition-all relative group ${showNotifications ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <Bell size={20} className={showNotifications ? 'scale-110' : 'group-hover:scale-110 transition-transform'} />
              {unreadCount > 0 && (
                <span className={`absolute top-3 right-3 w-2.5 h-2.5 rounded-full border-[2.5px] ${showNotifications ? 'bg-white border-blue-600' : 'bg-rose-500 border-white'} animate-pulse`} />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-4 w-[380px] bg-white rounded-[2.5rem] shadow-[0_30px_100px_-20px_rgba(0,0,0,0.15)] border border-slate-100 py-6 z-50 overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-top-4 duration-500">
                <div className="px-7 pb-5 border-b border-slate-50 flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm uppercase tracking-widest">Global Signals</h3>
                    <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{unreadCount} unread system dispatches</p>
                  </div>
                  <button onClick={() => markRead(null, true)} className="p-2 hover:bg-slate-50 rounded-xl text-blue-600 transition-colors group">
                    <CheckCircle2 size={18} className="group-hover:scale-110 transition-transform" />
                  </button>
                </div>

                <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="px-7 py-16 text-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                        <Bell className="text-slate-300" size={32} />
                      </div>
                      <p className="text-sm font-semibold text-slate-400">System quiet. No signals found.</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        className={`px-7 py-5 hover:bg-slate-50 cursor-pointer border-l-4 transition-all relative group ${n.read ? 'border-transparent opacity-60' : `border-blue-600 ${getPriorityColor(n.priority)}`}`}
                        onClick={() => markRead(n._id)}
                      >
                        <div className="flex gap-4">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${n.read ? 'bg-slate-100' : 'bg-white'}`}>
                            {getIcon(n.type, n.category)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                              <h4 className={`text-xs truncate pr-4 ${n.read ? 'font-semibold text-slate-600' : 'font-semibold text-slate-900'}`}>
                                {n.title}
                              </h4>
                              <span className="text-[9px] font-semibold text-slate-300 whitespace-nowrap">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-[11px] font-medium text-slate-400 leading-relaxed mb-3">
                              {n.message}
                            </p>
                            {n.actionUrl && (
                              <Link
                                href={n.actionUrl}
                                className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-widest text-blue-600 hover:text-blue-700 hover:underline"
                              >
                                {n.actionText || 'Process Action'}
                                <ExternalLink size={10} />
                              </Link>
                            )}
                          </div>
                        </div>
                        {!n.read && (
                          <div className="absolute right-7 bottom-5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-1 hover:bg-blue-100 text-blue-600 rounded-md">
                              <Check size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                <div className="px-7 pt-4 bg-slate-50/50">
                  <Link
                    href="/seller/notifications"
                    className="flex items-center justify-center gap-2 w-full py-4 bg-white border border-slate-200 rounded-[1.5rem] text-[10px] font-semibold uppercase tracking-widest text-slate-600 hover:shadow-lg hover:border-blue-100 hover:text-blue-600 transition-all active:scale-95"
                  >
                    Enter Control Center
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Profile Nexus */}
          <div className="flex items-center gap-4 ml-4 pl-4 border-l border-slate-100">
            <div className="text-right hidden sm:block">
              <p className="text-[11px] font-semibold text-slate-900 leading-none mb-1.5 uppercase tracking-wide">{user?.name || 'Administrator'}</p>
              <div className="flex items-center gap-1.5 justify-end">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-tighter">Signal Online</p>
              </div>
            </div>
            <div className="w-11 h-11 rounded-[1.25rem] bg-gradient-to-tr from-slate-900 to-slate-800 p-[2px] shadow-2xl shadow-slate-900/10 active:scale-95 transition-all cursor-pointer">
              <div className="w-full h-full rounded-[1.15rem] bg-white flex items-center justify-center border border-slate-700/5">
                <span className="text-slate-900 font-semibold text-xs">
                  {user?.name?.charAt(0).toUpperCase() || 'A'}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </header>
  )
}
