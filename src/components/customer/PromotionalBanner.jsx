'use client'
import Link from 'next/link'
import { FiArrowRight, FiShield, FiTruck } from 'react-icons/fi'

const promotions = [
  {
    id: 1,
    title: 'Complimentary Shipping',
    subtitle: 'Global Standards',
    description: 'Elite delivery experiences on all orders exceeding AED 500.',
    image: 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaad55?w=800&h=600',
    ctaText: 'Discover More',
    ctaLink: '/products',
    icon: <FiTruck className="w-5 h-5" />,
    theme: 'bg-blue-600'
  },
  {
    id: 2,
    title: 'The Seller Collective',
    subtitle: 'Partnership Program',
    description: 'Empowering visionaries to reach a global marketplace.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600',
    ctaText: 'Join the Vanguard',
    ctaLink: '/register?role=seller',
    icon: <FiShield className="w-5 h-5" />,
    theme: 'bg-gray-900'
  }
]

export default function PromotionalBanner() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {promotions.map((promo) => (
            <div
              key={promo.id}
              className="group relative h-[450px] rounded-[48px] overflow-hidden bg-gray-100 flex flex-col justify-end"
            >
              {/* Immersive Background */}
              <div className="absolute inset-0">
                <img
                  src={promo.image}
                  alt={promo.title}
                  className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
              </div>

              {/* Content Overlays */}
              <div className="relative p-10 md:p-14 z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
                    {promo.icon}
                  </div>
                  <span className="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em]">{promo.subtitle}</span>
                </div>

                <h3 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tighter leading-none">
                  {promo.title}
                </h3>
                <p className="text-white/60 text-sm max-w-sm mb-8 leading-relaxed">
                  {promo.description}
                </p>

                <Link
                  href={promo.ctaLink}
                  className="inline-flex items-center gap-3 bg-white text-gray-900 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all duration-500 transform group-hover:translate-x-2"
                >
                  <span>{promo.ctaText}</span>
                  <FiArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Decorative Border Overlay */}
              <div className="absolute inset-6 border border-white/10 rounded-[40px] pointer-events-none z-0"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
