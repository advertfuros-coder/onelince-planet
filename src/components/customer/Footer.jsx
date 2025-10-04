// components/customer/Footer.jsx
import Link from 'next/link'
import Image from 'next/image'
import { FiMapPin, FiPhone, FiMail, FiClock } from 'react-icons/fi'
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
  return (
    <footer className="bg-gray-900 text-white">
    

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">OP</span>
              </div>
              <div>
                <span className="text-2xl font-bold text-white">OnlinePlanet</span>
                <p className="text-xs text-gray-400 -mt-1">Empowering Indian Sellers</p>
              </div>
            </Link>
            
            <p className="text-gray-300 mb-6 text-sm leading-relaxed">
              India's most trusted multi-vendor e-commerce platform connecting millions of customers 
              with local sellers across the country. Discover quality products at unbeatable prices.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <FiMapPin className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <span className="text-sm text-gray-300">
                  123 Business Park, Tech City, Mumbai, Maharashtra 400001
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <FiPhone className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <span className="text-sm text-gray-300">+91-9876543210</span>
              </div>
              <div className="flex items-center space-x-3">
                <FiMail className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <span className="text-sm text-gray-300">support@onlineplanet.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <FiClock className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <span className="text-sm text-gray-300">24/7 Customer Support</span>
              </div>
            </div>

            {/* Social Media */}
            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                <Link href="https://facebook.com/onlineplanet" className="text-gray-400 hover:text-blue-400 transition-colors">
                  <FacebookIcon className="w-6 h-6" />
                </Link>
                <Link href="https://twitter.com/onlineplanet" className="text-gray-400 hover:text-blue-400 transition-colors">
                  <TwitterIcon className="w-6 h-6" />
                </Link>
                <Link href="https://instagram.com/onlineplanet" className="text-gray-400 hover:text-pink-400 transition-colors">
                  <InstagramIcon className="w-6 h-6" />
                </Link>
                <Link href="https://youtube.com/onlineplanet" className="text-gray-400 hover:text-red-400 transition-colors">
                  <YoutubeIcon className="w-6 h-6" />
                </Link>
                <Link href="https://linkedin.com/company/onlineplanet" className="text-gray-400 hover:text-blue-400 transition-colors">
                  <LinkedinIcon className="w-6 h-6" />
                </Link>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {Object.entries(footerSections).map(([key, section]) => (
            <div key={key}>
              <h4 className="text-lg font-semibold mb-4 text-white">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-300 hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* App Download Section */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="mb-6 lg:mb-0">
              <h4 className="text-lg font-semibold mb-2">Download OnlinePlanet App</h4>
              <p className="text-gray-300 text-sm">Shop on the go with our mobile app</p>
            </div>
            <div className="flex space-x-4">
              <Link href="/app/android" className="block">
                <Image
                  src="/images/google-play.png"
                  alt="Download on Google Play"
                  width={140}
                  height={42}
                  className="h-12 w-auto"
                />
              </Link>
              <Link href="/app/ios" className="block">
                <Image
                  src="/images/app-store.png"
                  alt="Download on App Store"
                  width={140}
                  height={42}
                  className="h-12 w-auto"
                />
              </Link>
            </div>
          </div>
        </div>

        {/* Payment Methods & Certifications */}
        <div className="mt-8 pt-8 border-t border-gray-700">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Payment Methods */}
            <div>
              <h4 className="text-lg font-semibold mb-4">We Accept</h4>
              <div className="flex flex-wrap gap-3">
                {paymentMethods.map((method) => (
                  <div
                    key={method.name}
                    className="bg-white p-2 rounded-lg flex items-center justify-center"
                    title={method.name}
                  >
                    <Image
                      src={method.logo}
                      alt={method.name}
                      width={40}
                      height={24}
                      className="h-6 w-auto"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Trust & Security</h4>
              <div className="flex flex-wrap gap-3">
                {certifications.map((cert) => (
                  <div
                    key={cert.name}
                    className="bg-white p-2 rounded-lg flex items-center justify-center"
                    title={cert.name}
                  >
                    <Image
                      src={cert.logo}
                      alt={cert.name}
                      width={60}
                      height={40}
                      className="h-8 w-auto"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-gray-800 border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="text-sm text-gray-400 mb-4 lg:mb-0">
              © 2025 OnlinePlanet. All rights reserved. | Made with ❤️ in India
            </div>
            <div className="flex flex-wrap items-center space-x-6 text-sm">
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-gray-400 hover:text-white transition-colors">
                Cookie Policy
              </Link>
              <Link href="/accessibility" className="text-gray-400 hover:text-white transition-colors">
                Accessibility
              </Link>
              <Link href="/sitemap" className="text-gray-400 hover:text-white transition-colors">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
