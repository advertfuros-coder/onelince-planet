// components/customer/FeaturesSection.jsx
import { FiTruck, FiShield, FiMessageSquare, FiClock, FiStar } from 'react-icons/fi'
import { FaRupeeSign } from 'react-icons/fa'

const features = [
  {
    id: 1,
    icon: FiTruck,
    title: 'Fast Delivery',
    description: 'Quick and reliable delivery across India',
    color: 'text-blue-600'
  },
  {
    id: 2,
    icon: FiShield,
    title: 'Secure Payments',
    description: 'Your payments are safe and secure',
    color: 'text-green-600'
  },
  {
    id: 3,
    icon: FaRupeeSign,
    title: 'Best Prices',
    description: 'Competitive prices from verified sellers',
    color: 'text-purple-600'
  },
  {
    id: 4,
    icon: FiMessageSquare,
    title: '24/7 Support',
    description: 'Round the clock customer support',
    color: 'text-orange-600'
  },
  {
    id: 5,
    icon: FiClock,
    title: 'Easy Returns',
    description: '7-day hassle-free returns',
    color: 'text-red-600'
  },
  {
    id: 6,
    icon: FiStar,
    title: 'Quality Products',
    description: 'Verified products from trusted sellers',
    color: 'text-yellow-600'
  }
]

export default function FeaturesSection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose OnlinePlanet?</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience the best of online shopping with our premium features and services
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.id}
                className="text-center p-6 rounded-xl hover:shadow-lg transition-shadow border border-gray-100"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4`}>
                  <Icon className={`w-8 h-8 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
