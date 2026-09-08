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
        <section className="py-8 bg-white border-y border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                    {features.map((feature, index) => {
                        const Icon = feature.icon
                        return (
                            <div
                                key={index}
                                className="flex flex-col items-center text-center group"
                            >
                                <div className="w-11 h-11 mb-2.5 flex items-center justify-center rounded-full bg-gray-50 group-hover:bg-blue-50 transition-colors">
                                    <Icon className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
                                </div>
                                <h3 className="text-xs md:text-sm font-semibold text-gray-900 mb-0.5">
                                    {feature.title}
                                </h3>
                                <p className="text-[11px] md:text-xs text-gray-500 leading-relaxed">
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
