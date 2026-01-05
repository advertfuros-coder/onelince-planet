'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import { useCurrency } from '@/lib/context/CurrencyContext'
import { useRouter } from 'next/navigation'
import {
  FiUser, FiPackage, FiMapPin, FiHeart, FiLock, FiLogOut, FiChevronRight,
  FiCheckCircle, FiActivity, FiArrowLeft, FiPlus, FiHelpCircle, FiSettings,
  FiTag, FiShield, FiCreditCard, FiSmartphone, FiGlobe, FiZap
} from 'react-icons/fi'
import { BiCrown, BiWallet } from 'react-icons/bi'
import axios from 'axios'
import { toast } from 'react-hot-toast'

export default function ProfileDashboard() {
  const { token, isAuthenticated, user } = useAuth()
  const { currencyConfig, country } = useCurrency()
  const router = useRouter()
  const [profileData, setProfileData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isAuthenticated) fetchDashboardData()
  }, [isAuthenticated])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const res = await axios.get('/api/customer/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data.success) {
        setProfileData(res.data)
      }
    } catch (error) {
      console.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const logoutAction = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] lg:bg-white pb-20 ">
      {/* Mobile Top Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between sticky top-0 z-20 lg:hidden border-b border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/')} className="p-1">
            <FiArrowLeft className="w-5 h-5 text-[#003399]" />
          </button>
          <h1 className="text-sm font-semibold text-gray-900 tracking-tight">Your Account</h1>
        </div>
        {/* <div className="flex items-center bg-[#003399]/5 border border-[#003399]/10 rounded-full px-3 py-1.5 gap-2 shadow-sm">
           <span className="text-sm font-semibold text-[#003399]">{currencyConfig.symbol}0</span>
           <div className="w-5 h-5 bg-[#003399] rounded-full flex items-center justify-center">
              <span className="text-[10px] text-white font-semibold">{currencyConfig.symbol.charAt(0)}</span>
           </div>
        </div> */}
      </div>

      <div className="max-w-xl mx-auto lg:max-w-5xl lg:py-10">

        {/* Planet Prime Banner */}
        <div className="px-4 mt-4 lg:px-0 lg:mt-0">
          <div className="bg-gradient-to-br from-[#003399] to-[#002266] rounded-3xl p-6 relative overflow-hidden group shadow-xl shadow-blue-100">
            {/* Decorative Elements */}
            <div className="absolute top-[-20px] right-[-20px] w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
            <div className="absolute bottom-[-40px] left-[-20px] w-32 h-32 bg-yellow-400/10 rounded-full blur-2xl"></div>

            <div className="relative z-10 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FiGlobe className="w-5 h-5 text-yellow-400 animate-spin-slow" />
                  <span className="text-yellow-400 text-[10px] uppercase font-semibold tracking-[3px]">Planet Prime</span>
                </div>
                <h2 className="text-2xl lg:text-3xl font-semibold text-white leading-tight">
                  Elevate Your <br /> Shopping Journey
                </h2>
                <p className="text-blue-100 text-xs mt-3 font-medium opacity-80 max-w-[220px]">
                  Enjoy <span className="text-white font-semibold">Free Shipping</span>, better rewards and exclusive planet perks.
                </p>
                <button className="mt-6 bg-[#FFD23F] text-[#003399] px-8 py-3 rounded-2xl text-sm font-semibold shadow-lg shadow-black/20 hover:scale-105 active:scale-95 transition-all">
                  Join Prime Now
                </button>
              </div>
              <div className="hidden sm:block">
                <div className="w-32 h-32 bg-white/5 rounded-[40px] flex items-center justify-center rotate-12 border border-white/10 backdrop-blur-md">
                  <BiCrown className="w-20 h-20 text-yellow-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profiles Section */}
        <div className="mt-10 px-4 lg:px-0">
          <div className="flex items-end justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Welcome, {user?.name?.split(' ')[0] || 'User'}</h3>

          </div>
        </div>



        {/* Core Actions Grid */}
        <div className="px-4 lg:px-0 grid grid-cols-2 gap-2">
          {[
            { label: 'My Orders', icon: FiPackage, href: '/profile/orders', color: 'bg-blue-50 text-[#003399]' },
            { label: 'Planet Rewards', icon: FiTag, href: '#', color: 'bg-yellow-50 text-yellow-600' },
            { label: 'Support Center', icon: FiHelpCircle, href: '#', color: 'bg-purple-50 text-purple-600' },
            { label: 'Prime Perks', icon: BiCrown, href: '#', color: 'bg-emerald-50 text-emerald-600' }
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => item.href !== '#' && router.push(item.href)}
              className="bg-white border border-gray-100 rounded-3xl p-2 flex items-center justify-between shadow-sm active:bg-gray-50 transition-all hover:border-blue-100 hover:shadow-md"
            >
              <div className="flex items-center gap-2">
                <div className={`w-10 h-10 ${item.color} rounded-2xl flex items-center justify-center font-semibold`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <span className="text-[12px] font-semibold text-gray-900 tracking-tighter">{item.label}</span>
              </div>
              <FiChevronRight className="w-4 h-4 text-gray-300" />
            </button>
          ))}
        </div>

        {/* Settings Categories */}
        <div className="mt-8 bg-white lg:rounded-[40px] lg:border lg:border-gray-100 lg:shadow-xl overflow-hidden">

          {[
            { label: 'Personal Information', icon: FiUser, sub: 'Manage your name, email & privacy', href: '/profile/personal', new: false },
            { label: 'Saved Addresses', icon: FiMapPin, sub: 'Faster checkout experience', href: '/profile/addresses', new: false },
            { label: 'Planet Wishlist', icon: FiHeart, sub: 'Everything you current love', href: '/profile/wishlist', new: true },
            { label: 'Secure Payments', icon: BiWallet, sub: 'Cards, Wallet & UPI integration', href: '#', new: true },
            { label: 'Account Security', icon: FiLock, sub: 'Manage access and active sessions', href: '/profile/security', new: false },
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => item.href && item.href !== '#' && router.push(item.href)}
              className="w-full flex items-center justify-between px-6 py-4 border-b border-gray-50 hover:bg-gray-50 transition-colors last:border-b-0 group"
            >
              <div className="flex items-center gap-5 text-left">
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-[#003399]/5 group-hover:text-[#003399] transition-all">
                  <item.icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-[14px] font-semibold text-gray-800 tracking-tight">{item.label}</span>
                    {item.new && <span className="text-[9px] bg-[#003399] text-white px-2.5 py-1 rounded-full font-semibold uppercase tracking-[1px] shadow-sm">Updated</span>}
                  </div>
                  <p className="text-[11px] text-gray-400 font-semibold mt-1 leading-tight">{item.sub}</p>
                </div>
              </div>
              <FiChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#003399] transition-colors" />
            </button>
          ))}
        </div>





        {/* Impact Banner */}
        <div className="mt-8 px-4 lg:px-0">
          <div className="bg-[#FFD23F]/10 border-2 border-[#FFD23F]/30 rounded-3xl p-5 flex items-center gap-4 relative overflow-hidden hover:bg-[#FFD23F]/20 transition-colors cursor-pointer group">
            <div className="w-14 h-14 bg-[#FFD23F] rounded-[20px] flex items-center justify-center flex-shrink-0 shadow-lg shadow-yellow-200/50 group-hover:rotate-6 transition-transform">
              <FiZap className="w-7 h-7 text-[#003399]" />
            </div>
            <div className="flex-1">
              <h4 className="text-[15px] font-semibold text-gray-900 tracking-tight">Green Planet Mission</h4>
              <p className="text-xs text-gray-600 font-semibold opacity-80 mt-1">Track your tree plantations</p>
            </div>
            <FiChevronRight className="w-6 h-6 text-gray-400" />
            <div className="absolute right-[-15px] bottom-[-15px] w-24 h-24 bg-[#FFD23F]/10 rounded-full blur-2xl"></div>
          </div>
        </div>



        {/* Global Security Notification */}
        <div className="mt-8 px-4 lg:px-0">
          <div className="bg-[#003399] rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-yellow-400/10 transition-all duration-1000"></div>
            <div className="flex items-center justify-between relative z-10">
              <div className="flex-1">
                <div className="bg-white/10 w-fit px-4 py-1 rounded-full mb-4 mb-4">
                  <p className="text-yellow-400 text-[9px] font-semibold uppercase tracking-[3px]">Planet Shield Active</p>
                </div>
                <h3 className="text-2xl font-semibold tracking-tight leading-tight">Your Data is Safe & <br /> Encrypted</h3>
                <p className="text-blue-100/60 text-[10px] mt-4 font-semibold uppercase tracking-widest">Protocol Version v.26.01</p>
              </div>
              <div className="w-20 h-20 bg-white/10 rounded-[30px] flex items-center justify-center border-2 border-white/20 backdrop-blur-md shadow-2xl group-hover:rotate-12 transition-transform">
                <FiShield className="w-10 h-10 text-emerald-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Logout Section */}
        <div className="mt-12 px-4 pb-20 lg:px-0">
          <button
            onClick={logoutAction}
            className="w-full py-6 bg-white border-2 border-red-50 text-red-600 font-semibold text-sm uppercase tracking-[3px] rounded-[30px] shadow-sm hover:bg-red-50 active:scale-95 transition-all flex items-center justify-center gap-4"
          >
            <FiLogOut className="w-6 h-6" />
            Sign Out Securely
          </button>
          <div className="flex flex-col items-center mt-10 space-y-2">
            <img src="/logo.png" alt="Online Planet" className="h-6 opacity-20 grayscale" />
            <p className="text-center text-[10px] font-semibold text-gray-300 tracking-[5px] uppercase">
              v2.0.4 • 2026 EDITION
            </p>
          </div>
        </div>

      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  )
}
