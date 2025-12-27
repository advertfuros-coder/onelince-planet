// components/admin/AdminHeader.jsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/AuthContext'
import {
  User,
  LogOut,
  Settings,
  ChevronDown,
  ChevronRight,
  Search,
  Bell,
  Command,
  Plus
} from 'lucide-react'
import MobileMenu from './MobileMenu'
import clsx from 'clsx'
import NotificationCenter from './NotificationCenter'

export default function AdminHeader() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [showDropdown, setShowDropdown] = useState(false)

  const handleLogout = () => {
    logout()
    router.push('/admin/login')
  }

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-30 transition-all duration-300">
      <div className="flex items-center justify-between px-6 py-4">

        {/* Left: Branding & Search Hook */}
        <div className="flex items-center space-x-8">
          <div className="lg:hidden">
            <MobileMenu />
          </div>

          <div className="hidden md:flex items-center w-[400px]">
            <button
              onClick={() => {
                const event = new KeyboardEvent('keydown', {
                  key: 'k',
                  metaKey: true,
                  bubbles: true,
                })
                document.dispatchEvent(event)
              }}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-100/50 hover:bg-gray-100 border border-gray-200 rounded-2xl group transition-all duration-200"
            >
              <div className="flex items-center gap-3 text-gray-400 group-hover:text-blue-600 transition-colors">
                <Search size={18} />
                <span className="text-xs font-bold uppercase tracking-widest leading-none">Global Terminal Seek</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 bg-white border border-gray-200 rounded-lg shadow-sm">
                <Command size={10} className="text-gray-400" />
                <span className="text-[10px] font-black text-gray-500 uppercase">K</span>
              </div>
            </button>
          </div>
        </div>

        {/* Right Side: Quick Actions & Profile */}
        <div className="flex items-center space-x-6">

          {/* Quick Create Button */}
          <button className="hidden lg:flex items-center gap-2 px-4 py-2 bg-[#0F172A] text-white rounded-xl hover:bg-black transition-all shadow-lg shadow-gray-200 active:scale-95 group">
            <Plus size={16} className="group-hover:rotate-90 transition-transform duration-300" />
            <span className="text-[10px] font-black uppercase tracking-widest">Quick Create</span>
          </button>

          {/* Notifications Hub */}
          <div className="relative">
            <NotificationCenter />
          </div>

          <div className="w-[1px] h-6 bg-gray-200" />

          {/* Profile Sector */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 p-1.5 rounded-2xl hover:bg-gray-50 transition-all duration-300 border border-transparent hover:border-gray-100"
            >
              <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
                <span className="font-black text-xs uppercase tracking-tighter">
                  {user?.name?.[0] || 'A'}
                </span>
              </div>

              <div className="hidden md:block text-left pr-2">
                <p className="text-[11px] font-black text-gray-900 uppercase tracking-tight leading-none">
                  {user?.name || 'Administrator'}
                </p>
                <div className="flex items-center gap-1 mt-1 text-emerald-500">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-[0.1em]">Root Access</span>
                </div>
              </div>

              <ChevronDown size={14} className={clsx('text-gray-400 transition-transform duration-300', showDropdown && 'rotate-180')} />
            </button>

            {/* Premium Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-3 w-64 bg-white rounded-3xl shadow-2xl shadow-blue-900/10 border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="px-6 py-6 bg-gray-50/50 border-b border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Authenticated Account</p>
                  <p className="text-sm font-black text-gray-900">{user?.email || 'admin@onlineplanet.com'}</p>
                </div>

                <div className="p-2">
                  <MenuButton icon={User} label="Profile Overview" onClick={() => router.push('/admin/profile')} />
                  <MenuButton icon={Settings} label="System Settings" onClick={() => router.push('/admin/settings')} />
                </div>

                <div className="p-2 border-t border-gray-50">
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-between w-full px-4 py-3 text-rose-600 hover:bg-rose-50 rounded-2xl transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <LogOut size={16} />
                      <span className="text-[11px] font-black uppercase tracking-widest">Terminate Session</span>
                    </div>
                    <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

function MenuButton({ icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between w-full px-4 py-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all duration-200 group text-left"
    >
      <div className="flex items-center gap-3">
        <Icon size={16} />
        <span className="text-[11px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all translate-x-[-4px] group-hover:translate-x-0 transition-transform" />
    </button>
  )
}
