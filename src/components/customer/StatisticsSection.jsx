'use client'
import { useState, useEffect, useRef } from 'react'
import { FiArrowRight, FiCheckCircle, FiShield } from 'react-icons/fi'
import { useRegion } from '@/context/RegionContext'

function AnimatedCounter({ value, duration = 2000 }) {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) observer.observe(ref.current)
    return () => { if (ref.current) observer.unobserve(ref.current) }
  }, [])

  useEffect(() => {
    if (!isVisible) return
    let startTime
    let animationFrame
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      setCount(Math.floor(easeOutQuart * value))
      if (progress < 1) animationFrame = requestAnimationFrame(animate)
    }
    animationFrame = requestAnimationFrame(animate)
    return () => { if (animationFrame) cancelAnimationFrame(animationFrame) }
  }, [isVisible, value, duration])

  return <span ref={ref}>{count.toLocaleString()}</span>
}

export default function StatisticsSection() {
  const { region } = useRegion()
  const [mobileNumber, setMobileNumber] = useState('')

  const stats = region.code === 'IN' ? {
    showrooms: 160,
    showroomsLabel: 'Discover 160+ Showrooms at Prime Locations Near You.',
    customers: 10,
    customersSuffix: 'M+',
    delivery: 1000,
    deliveryLabel: 'Delivering to 1000+ cities across India.'
  } : {
    showrooms: 15,
    showroomsLabel: 'Visit our Experience Centers across the Emirates.',
    customers: 1,
    customersSuffix: 'M+',
    delivery: 7,
    deliveryLabel: 'Fast delivery across all 7 Emirates in the UAE.'
  }

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">

        {/* Top Interactive Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-20">

          {/* Left Card - Thematic Black */}
          <div className="md:col-span-6 relative bg-black rounded-[40px] p-10 md:p-14 overflow-hidden group min-h-[450px] flex flex-col justify-between">
            {/* Background Mesh Pattern */}
            <div className="absolute inset-0 opacity-40 pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0 100 C 20 0 50 0 100 100" stroke="white" strokeWidth="0.1" fill="none" className="animate-pulse" />
                <path d="M0 80 C 30 10 70 10 100 80" stroke="white" strokeWidth="0.1" fill="none" />
                <path d="M0 60 C 40 20 80 20 100 60" stroke="white" strokeWidth="0.1" fill="none" />
              </svg>
            </div>

            <div className="relative z-10">
              <div className="w-20 h-20 mb-10 border border-white/30 rounded-full flex items-center justify-center backdrop-blur-sm">
                <div className="text-center group-hover:scale-110 transition-transform duration-500">
                  <div className="text-[10px] text-white/60 font-black uppercase tracking-widest">Trusted</div>
                  <div className="text-2xl text-white font-black italic tracking-tighter">OP</div>
                  <div className="text-[10px] text-white/60 font-black uppercase tracking-widest">Advisors</div>
                </div>
              </div>

              <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-6 leading-[0.9]">
                Your Reliable Partners
              </h2>
              <p className="text-lg md:text-xl text-white/70 max-w-md font-medium leading-tight">
                Directing your choices with expertise every step of the way.
              </p>
            </div>

            <div className="relative z-10">
              <button className="px-8 py-3.5 bg-white text-black font-black uppercase tracking-widest text-[11px] rounded-full hover:bg-gray-200 transition-all transform hover:scale-105 active:scale-95">
                Explore Our story
              </button>
            </div>
          </div>

          {/* Middle Card - Loyalty Red */}
          <div className="md:col-span-3 bg-[#e40000] rounded-[40px] p-10 flex flex-col justify-between relative overflow-hidden group">
            <div className="relative z-10">
              {/* Rotating Badge */}
              <div className="w-20 h-20 relative mb-8">
                <div className="absolute inset-0 animate-spin-slow">
                  <svg viewBox="0 0 100 100" className="w-full h-full fill-white/20">
                    <path id="circlePath" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" fill="none" />
                    <text fontSize="12" fontWeight="900" className="uppercase tracking-[0.2em] fill-white">
                      <textPath xlinkHref="#circlePath">Shop. Earn. Redeem. • </textPath>
                    </text>
                  </svg>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <FiCheckCircle className="text-2xl text-white" />
                </div>
              </div>

              <h3 className="text-2xl md:text-3xl font-black text-white tracking-tighter leading-[1.1] mb-8">
                Unlock perks—your gateway to exclusive loyalty points
              </h3>

              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="tel"
                    placeholder="Mobile Number"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="w-full h-14 bg-white/10 border border-white/20 rounded-2xl px-6 text-white placeholder:text-white/50 focus:outline-none focus:bg-white/20 transition-all font-bold"
                  />
                </div>
                <button className="w-full h-14 bg-black text-white font-black uppercase tracking-widest text-[11px] rounded-full hover:bg-gray-900 transition-all transform active:scale-95 leading-none">
                  Verify Number
                </button>
              </div>
            </div>
          </div>

          {/* Right Card - Warranty White */}
          <div className="md:col-span-3 bg-white border border-gray-100 rounded-[40px] p-10 flex flex-col justify-center relative group overflow-hidden shadow-sm">
            <div className="absolute top-10 left-10 flex items-center gap-1.5">
              <span className="text-2xl font-black text-[#e40000] tracking-tighter italic">OP</span>
              <span className="text-2xl font-black text-blue-500 italic">+</span>
            </div>

            <div className="mt-12">
              <h3 className="text-2xl font-black text-gray-900 tracking-tighter leading-[1.1] mb-6">
                Do not forget to include the OP+ Extended Warranty with your purchase
              </h3>
              <p className="text-gray-500 font-bold text-sm leading-tight mb-8">
                Protect your electronics and appliances beyond the standard coverage
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Statistics Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-12 md:gap-8 px-4">

          <div className="flex-1 flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="text-7xl md:text-8xl font-black text-gray-900 tracking-tighter flex items-start">
              <AnimatedCounter value={stats.showrooms} />
              <span className="text-gray-800">+</span>
            </div>
            <div className="max-w-[200px] text-center md:text-left">
              <p className="text-sm font-bold text-gray-500 leading-tight">
                {stats.showroomsLabel}
              </p>
            </div>
          </div>

          <div className="flex-1 flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="text-7xl md:text-8xl font-black text-gray-900 tracking-tighter flex items-start">
              <AnimatedCounter value={stats.customers} />
              <span className="text-gray-800">{stats.customersSuffix}</span>
            </div>
            <div className="max-w-[200px] text-center md:text-left">
              <p className="text-sm font-bold text-gray-500 leading-tight">
                Happy Customers
              </p>
            </div>
          </div>

          <div className="flex-1 flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="text-7xl md:text-8xl font-black text-gray-900 tracking-tighter flex items-start">
              <AnimatedCounter value={stats.delivery} />
              <span className="text-gray-800">+</span>
            </div>
            <div className="max-w-[200px] text-center md:text-left">
              <p className="text-sm font-bold text-gray-500 leading-tight">
                {stats.deliveryLabel}
              </p>
            </div>
          </div>

        </div>
      </div>

      <style jsx>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 12s linear infinite;
                }
            `}</style>
    </section>
  )
}
