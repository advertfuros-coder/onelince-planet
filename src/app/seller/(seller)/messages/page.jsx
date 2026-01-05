// app/seller/(seller)/messages/page.jsx
'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Search,
  Send,
  Paperclip,
  MoreVertical,
  MessageCircle,
  MoreHorizontal,
  Phone,
  Video,
  Info,
  ChevronLeft,
  Circle,
  Zap,
  Activity,
  CheckCheck,
  Layout,
  User,
  Clock,
  ArrowLeft
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/context/AuthContext'

export default function SellerMessages() {
  const { token, user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const scrollRef = useRef(null)

  useEffect(() => {
    if (token) fetchConversations()
  }, [token])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [selectedConversation])

  const fetchConversations = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/seller/messages', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        setConversations(data.conversations || [])
      }
    } catch (error) {
      console.error('Error loading conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    const tempMessage = {
      id: `temp-${Date.now()}`,
      content: newMessage,
      timestamp: new Date().toISOString(),
      sender: 'seller'
    }

    setSelectedConversation(prev => ({
      ...prev,
      messages: [...prev.messages, tempMessage]
    }))
    setNewMessage('')

    try {
      await fetch('/api/seller/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          recipientId: selectedConversation.customer.id,
          content: tempMessage.content
        })
      })
      // No full refresh here to avoid Jump, just let it be
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 font-semibold uppercase tracking-widest text-[9px]">Initializing Communication Grid...</p>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-140px)] bg-[#F8FAFC] p-4 lg:p-8">
      <div className="max-w-[1500px] mx-auto h-full flex gap-6">

        {/* Left: Chat List Panel */}
        <div className={`
          flex-col w-full lg:w-[400px] bg-white rounded-[2.5rem] shadow-sm border border-gray-100/50 overflow-hidden
          ${selectedConversation ? 'hidden lg:flex' : 'flex'}
        `}>
          <div className="p-8 pb-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 tracking-tighter">Neural Comms</h2>
                <p className="text-[10px] font-semibold text-indigo-500 uppercase tracking-widest mt-1">Global Interaction Hub</p>
              </div>
              <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                <Zap size={20} />
              </div>
            </div>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-500 transition-colors" size={16} />
              <input
                type="text"
                placeholder="Identify conversation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl text-[11px] font-semibold uppercase tracking-widest focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center text-gray-300 mb-4">
                  <MessageCircle size={40} />
                </div>
                <h4 className="text-lg font-semibold text-gray-900">Zero Inbound</h4>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mt-2 leading-relaxed">System standby. Awaiting customer transmission initiation.</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <motion.div
                  key={conv.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedConversation(conv)}
                  className={`
                       p-6 rounded-[2rem] cursor-pointer transition-all border flex items-center justify-between
                       ${selectedConversation?.id === conv.id
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-600/20'
                      : 'bg-white border-transparent hover:bg-gray-50 text-gray-900'}
                     `}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-semibold shrink-0 ${selectedConversation?.id === conv.id ? 'bg-white/20' : 'bg-gray-100'}`}>
                      {conv.customer.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h4 className={`text-sm font-semibold truncate ${selectedConversation?.id === conv.id ? 'text-white' : 'text-gray-900'}`}>{conv.customer.name}</h4>
                      <p className={`text-[10px] font-semibold truncate mt-1 ${selectedConversation?.id === conv.id ? 'text-white/60' : 'text-gray-400 font-semibold uppercase tracking-tighter'}`}>
                        {conv.lastMessage.content}
                      </p>
                    </div>
                  </div>
                  {conv.unreadCount > 0 && selectedConversation?.id !== conv.id && (
                    <div className="w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center text-[10px] font-semibold shadow-lg shadow-rose-500/30 shrink-0">
                      {conv.unreadCount}
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Right: Messages Thread */}
        <div className={`
          flex-1 bg-white rounded-[2.5rem] shadow-sm border border-gray-100/50 flex flex-col overflow-hidden
          ${!selectedConversation ? 'hidden lg:flex' : 'flex'}
        `}>
          {selectedConversation ? (
            <>
              {/* Thread Header */}
              <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/20">
                <div className="flex items-center gap-4">
                  <button onClick={() => setSelectedConversation(null)} className="lg:hidden p-2 text-gray-400 hover:text-gray-900">
                    <ArrowLeft size={20} />
                  </button>
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-lg font-semibold shadow-lg shadow-indigo-500/20">
                    {selectedConversation.customer.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 tracking-tight leading-none">{selectedConversation.customer.name}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Active Link</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-indigo-600 shadow-sm transition-all"><Phone size={18} /></button>
                  <button className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-indigo-600 shadow-sm transition-all"><Video size={18} /></button>
                  <button className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-indigo-600 shadow-sm transition-all text-gray-900"><MoreHorizontal size={18} /></button>
                </div>
              </div>

              {/* Messages History */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-6 bg-white">
                <div className="text-center py-4">
                  <span className="px-4 py-1.5 bg-gray-50 rounded-full text-[9px] font-semibold text-gray-400 uppercase tracking-widest border border-gray-100">Synchronized on {new Date().toLocaleDateString()}</span>
                </div>
                {selectedConversation.messages.map((msg, idx) => (
                  <motion.div
                    initial={{ opacity: 0, x: msg.sender === 'seller' ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={msg.id}
                    className={`flex ${msg.sender === 'seller' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] group relative`}>
                      <div className={`
                          p-6 rounded-[2rem] text-sm font-medium shadow-sm
                          ${msg.sender === 'seller'
                          ? 'bg-indigo-600 text-white rounded-tr-none shadow-indigo-200'
                          : 'bg-gray-50 text-gray-900 rounded-tl-none border border-gray-100'}
                        `}>
                        {msg.content}
                      </div>
                      <div className={`flex items-center gap-2 mt-2 px-2 ${msg.sender === 'seller' ? 'justify-end' : 'justify-start'}`}>
                        <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {msg.sender === 'seller' && <CheckCheck size={12} className="text-indigo-400" />}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Message Input Interface */}
              <div className="p-8 border-t border-gray-50 bg-white">
                <div className="flex items-center gap-3 bg-gray-50/50 p-3 rounded-[2.5rem] border border-gray-100">
                  <button className="p-4 bg-white border border-gray-100 rounded-[2rem] text-gray-400 hover:text-indigo-600 shadow-sm transition-all"><Paperclip size={20} /></button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Transmit instruction..."
                    className="flex-1 bg-transparent border-none outline-none text-[13px] font-semibold px-4"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="p-4 bg-indigo-600 text-white rounded-[2rem] shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 disabled:shadow-none"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-20 text-center space-y-8 bg-gray-50/10">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500/10 blur-[80px] rounded-full" />
                <div className="relative w-32 h-32 bg-white rounded-[4rem] shadow-2xl flex items-center justify-center border border-gray-100">
                  <MessageCircle size={60} className="text-indigo-600 animate-pulse" />
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-3xl font-semibold text-gray-900 tracking-tighter">Communication Void</h3>
                <p className="text-gray-400 max-w-sm font-semibold uppercase text-[11px] tracking-widest leading-relaxed">System is operational. Select a neural link from the left portal to establish a secure data stream.</p>
              </div>
              <div className="flex gap-3">
                <div className="px-4 py-2 bg-white rounded-2xl border border-gray-100 text-[9px] font-semibold uppercase tracking-widest text-indigo-600 shadow-sm">Fast Response Active</div>
                <div className="px-4 py-2 bg-white rounded-2xl border border-gray-100 text-[9px] font-semibold uppercase tracking-widest text-emerald-600 shadow-sm">End-to-End Encryption</div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
