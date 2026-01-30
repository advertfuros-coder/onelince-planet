// components/customer/Footer.jsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FiMapPin, FiPhone, FiMail, FiClock, FiArrowUp, FiSend, FiCheckCircle } from 'react-icons/fi'
import {
  FacebookIcon,
  TwitterIcon,
  InstagramIcon,
  YoutubeIcon,
  LinkedinIcon
} from '../ui/SocialIcons'

const footerSections = {
  company: {
    title: 'Company',
    links: [
      { name: 'About OnlinePlanet', href: '/about' },
      { name: 'Careers', href: '/careers' },
      { name: 'Press & Media', href: '/press' },
      { name: 'Investor Relations', href: '/investors' },
      { name: 'Corporate Social Responsibility', href: '/csr' }
    ]
  },
  support: {
    title: 'Customer Support',
    links: [
      { name: 'Help Center', href: '/help' },
      { name: 'Contact Us', href: '/contact' },
      { name: 'Order Tracking', href: '/track-order' },
      { name: 'Returns & Refunds', href: '/returns' },
      { name: 'Shipping Info', href: '/shipping' },
      { name: 'Size Guide', href: '/size-guide' }
    ]
  },
  seller: {
    title: 'For Sellers',
    links: [
      { name: 'Sell on OnlinePlanet', href: '/seller/register' },
      { name: 'Seller Resources', href: '/seller/resources' },
      { name: 'Seller Policies', href: '/seller/policies' },
      { name: 'Seller Support', href: '/seller/support' },
      { name: 'Advertising', href: '/seller/advertising' }
    ]
  },
  shopping: {
    title: 'Shop with Us',
    links: [
      { name: 'Gift Cards', href: '/gift-cards' },
      { name: 'Mobile App', href: '/mobile-app' },
      { name: 'Bulk Orders', href: '/bulk-orders' },
      { name: 'OnlinePlanet Plus', href: '/plus' },
      { name: 'Coupons & Offers', href: '/offers' }
    ]
  },
  categories: {
    title: 'Popular Categories',
    links: [
      { name: 'Fashion', href: '/products?category=fashion' },
      { name: 'Electronics', href: '/products?category=electronics' },
      { name: 'Home & Kitchen', href: '/products?category=home' },
      { name: 'Beauty & Personal Care', href: '/products?category=beauty' },
      { name: 'Books & Media', href: '/products?category=books' },
      { name: 'Sports & Fitness', href: '/products?category=sports' }
    ]
  }
}

const paymentMethods = [
  { name: 'Visa', logo: '/images/payments/visa.png' },
  { name: 'Mastercard', logo: '/images/payments/mastercard.png' },
  { name: 'RuPay', logo: '/images/payments/rupay.png' },
  { name: 'UPI', logo: '/images/payments/upi.png' },
  { name: 'Paytm', logo: '/images/payments/paytm.png' },
  { name: 'Google Pay', logo: '/images/payments/gpay.png' }
]

const certifications = [
  { name: 'SSL Secured', logo: '/images/ssl.png' },
  { name: 'ISO Certified', logo: '/images/iso.png' },
  { name: 'Made in India', logo: '/images/made-in-india.png' }
]

export default function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (email) {
      // Simulate API call
      setSubscribed(true)
      setTimeout(() => {
        setSubscribed(false)
        setEmail('')
      }, 3000)
    }
  }

  return (
    <footer className="bg-gray-900 text-white font-  border-t border-gray-800">
      {/* Back to Top */}
      <button
        onClick={scrollToTop}
        className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-sm font-semibold text-gray-300 transition-colors flex items-center justify-center gap-2 border-b border-gray-700"
      >
        Back to top
        <FiArrowUp className="w-4 h-4" />
      </button>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">

        {/* Newsletter & Intro Section - Top Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16 border-b border-gray-800 pb-12">
          <div className="lg:col-span-5 space-y-6">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-blue-900/20 transition-all">
                <span className="text-white font-bold text-xl">OP</span>
              </div>
              <div>
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Online Planet</span>
                <p className="text-xs text-gray-400 font-medium tracking-wide uppercase">Dubai's Premier Marketplace</p>
              </div>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-md">
              Your one-stop destination for premium products. We connect millions of customers with trusted sellers, offering quality, reliability, and speed.
            </p>
            <div className="flex gap-4 pt-2">
              <Link href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition-all">
                <FacebookIcon className="w-5 h-5" />
              </Link>
              <Link href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-blue-400 hover:text-white transition-all">
                <TwitterIcon className="w-5 h-5" />
              </Link>
              <Link href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-pink-600 hover:text-white transition-all">
                <InstagramIcon className="w-5 h-5" />
              </Link>
              <Link href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-red-600 hover:text-white transition-all">
                <YoutubeIcon className="w-5 h-5" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700/50 backdrop-blur-sm">
              <h3 className="text-xl font-bold text-white mb-2">Subscribe to our Newsletter</h3>
              <p className="text-gray-400 text-sm mb-6">Get the latest updates on new products and upcoming sales.</p>

              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-900 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-200 placeholder-gray-500 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={subscribed}
                  className={`px-8 py-3.5 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${subscribed
                      ? 'bg-green-600 text-white cursor-default'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20'
                    }`}
                >
                  {subscribed ? (
                    <>
                      <FiCheckCircle className="w-5 h-5" />
                      Subscribed!
                    </>
                  ) : (
                    <>
                      Subscribe
                      <FiSend className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12 mb-16">
          {Object.entries(footerSections).map(([key, section]) => (
            <div key={key}>
              <h4 className="font-bold text-white mb-6 text-sm uppercase tracking-wider">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm hover:translate-x-1 inline-block"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

      

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 mt-4 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <FiMapPin className="text-gray-600" />
            <span>123 Business Park, Tech City, Dubai, UAE</span>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            <Link href="/privacy" className="hover:text-blue-400 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-blue-400 transition-colors">Terms of Service</Link>
            <Link href="/cookies" className="hover:text-blue-400 transition-colors">Cookie Policy</Link>
          </div>

          <p>© 2026 OnlinePlanet. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
