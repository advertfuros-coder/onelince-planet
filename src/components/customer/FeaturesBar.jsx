'use client'
import { FiShield, FiTruck, FiZap, FiCreditCard } from 'react-icons/fi'

export default function FeaturesBar() {
    const features = [
        {
            icon: FiShield,
            title: 'Extended Warranty',
            description: 'Got a question? Look no further. Browse our FAQs'
        },
        {
            icon: FiTruck,
            title: 'Free Delivery',
            description: 'Available on all our products'
        },
        {
            icon: FiZap,
            title: 'Trusted Tech Delivered Fast',
            description: 'now in 50 Minutes'
        },
        {
            icon: FiCreditCard,
            title: 'Easy Installment',
            description: 'Pay for your purchase in easy EMIs'
        }
    ]

    return (
        <section className="py-8 bg-white border-t border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                    {features.map((feature, index) => {
                        const Icon = feature.icon
                        return (
                            <div
                                key={index}
                                className="flex flex-col items-center text-center group hover:scale-105 transition-transform duration-300"
                            >
                                {/* Icon */}
                                <div className="w-14 h-14 mb-3 flex items-center justify-center rounded-full bg-gray-50 group-hover:bg-blue-50 transition-colors">
                                    <Icon className="w-7 h-7 text-gray-700 group-hover:text-blue-600 transition-colors" />
                                </div>

                                {/* Title */}
                                <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-1">
                                    {feature.title}
                                </h3>

                                {/* Description */}
                                <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
