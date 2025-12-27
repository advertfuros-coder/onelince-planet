'use client'
import Link from 'next/link'
import {
    FiShoppingBag,
    FiTrendingUp,
    FiUsers,
    FiDollarSign,
    FiCheckCircle,
    FiArrowRight,
    FiPackage,
    FiClock,
    FiGlobe,
    FiAward,
    FiHelpCircle
} from 'react-icons/fi'
import { useState } from 'react'

export default function BecomeASellerPage() {
    const [activeFaq, setActiveFaq] = useState(null)

    const benefits = [
        {
            icon: FiUsers,
            title: 'Millions of Customers',
            description: 'Access to millions of buyers across UAE and India looking for quality products'
        },
        {
            icon: FiTrendingUp,
            title: 'Grow Your Business',
            description: 'Scale your business with our powerful seller tools and analytics dashboard'
        },
        {
            icon: FiDollarSign,
            title: 'Low Commission',
            description: 'Competitive commission rates starting from just 5% with transparent pricing'
        },
        {
            icon: FiPackage,
            title: 'Easy Logistics',
            description: 'Seamless fulfillment options with our integrated shipping partners'
        },
        {
            icon: FiGlobe,
            title: 'Global Reach',
            description: 'Sell across borders with support for multiple currencies and languages'
        },
        {
            icon: FiAward,
            title: 'Seller Support',
            description: '24/7 dedicated seller support team to help you succeed'
        }
    ]

    const steps = [
        {
            number: '01',
            title: 'Register Your Business',
            description: 'Complete a simple registration form with your business and bank details',
            time: '15 minutes'
        },
        {
            number: '02',
            title: 'Verification Process',
            description: 'Our team reviews your documents and verifies your business credentials',
            time: '24-48 hours'
        },
        {
            number: '03',
            title: 'Start Selling',
            description: 'List your products, manage orders, and start earning from day one',
            time: 'Instant'
        }
    ]

    const faqs = [
        {
            question: 'What documents do I need to register?',
            answer: 'You need GST/TRN registration, PAN card, business registration certificate, bank account details, and ID proof. For UAE sellers, Emirates ID and trade license are required.'
        },
        {
            question: 'How much does it cost to sell on Online Planet?',
            answer: 'Registration is completely free! We charge a small commission (starting from 5%) only when you make a sale. No hidden fees or monthly charges.'
        },
        {
            question: 'How long does verification take?',
            answer: 'Typically, verification is completed within 24-48 hours. Once approved, you can start listing products immediately.'
        },
        {
            question: 'Can I sell both in India and UAE?',
            answer: 'Yes! You can operate in both markets. Just ensure you have the required documentation for each region.'
        },
        {
            question: 'What kind of products can I sell?',
            answer: 'You can sell a wide range of products including electronics, fashion, home goods, beauty products, and more. Check our prohibited items list for restrictions.'
        },
        {
            question: 'How do I receive payments?',
            answer: 'Payments are directly deposited to your registered bank account on a weekly basis after order delivery confirmation.'
        }
    ]

    const stats = [
        { number: '10,000+', label: 'Active Sellers' },
        { number: '5M+', label: 'Products Listed' },
        { number: '₹500Cr+', label: 'Monthly GMV' },
        { number: '4.8★', label: 'Seller Rating' }
    ]

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white">
                <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:32px_32px]" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 relative">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left Content */}
                        <div className="space-y-8">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                                <FiShoppingBag className="w-4 h-4" />
                                <span className="text-sm font-semibold">Trusted by 10,000+ Sellers</span>
                            </div>

                            <h1 className="text-5xl lg:text-6xl font-black leading-tight">
                                Start Selling on
                                <span className="block bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                                    Online Planet
                                </span>
                            </h1>

                            <p className="text-xl text-blue-100 leading-relaxed max-w-xl">
                                Join thousands of successful sellers and reach millions of customers across UAE and India.
                                Start your journey to business growth today!
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link
                                    href="/seller/onboarding"
                                    className="group flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all shadow-2xl hover:shadow-xl hover:scale-105"
                                >
                                    <span>Start Selling Now</span>
                                    <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>

                                <button className="flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-xl font-bold text-lg hover:bg-white/20 transition-all">
                                    <span>Watch Demo</span>
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                    </svg>
                                </button>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-4 gap-4 pt-8">
                                {stats.map((stat, index) => (
                                    <div key={index} className="text-center">
                                        <div className="text-2xl font-black text-white">{stat.number}</div>
                                        <div className="text-xs text-blue-200 mt-1">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Image/Illustration */}
                        <div className="hidden lg:block">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-3xl blur-3xl opacity-30" />
                                <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 p-4 bg-white/20 rounded-2xl">
                                            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                                                <FiCheckCircle className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <div className="font-bold">Quick Registration</div>
                                                <div className="text-sm text-blue-100">In just 15 minutes</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 p-4 bg-white/20 rounded-2xl">
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center">
                                                <FiClock className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <div className="font-bold">Fast Approval</div>
                                                <div className="text-sm text-blue-100">Within 24-48 hours</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 p-4 bg-white/20 rounded-2xl">
                                            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
                                                <FiDollarSign className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <div className="font-bold">Zero Upfront Cost</div>
                                                <div className="text-sm text-blue-100">Start selling for free</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-black text-gray-900 mb-4">
                            Why Sell on Online Planet?
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            We provide everything you need to succeed in the e-commerce world
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {benefits.map((benefit, index) => (
                            <div
                                key={index}
                                className="group p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200"
                            >
                                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <benefit.icon className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{benefit.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-black text-gray-900 mb-4">
                            Start Selling in 3 Simple Steps
                        </h2>
                        <p className="text-xl text-gray-600">
                            Getting started is quick and easy
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {steps.map((step, index) => (
                            <div key={index} className="relative">
                                {/* Connector Line */}
                                {index < steps.length - 1 && (
                                    <div className="hidden lg:block absolute top-20 left-[60%] w-full h-0.5 bg-gradient-to-r from-blue-300 to-indigo-300" />
                                )}

                                <div className="relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all">
                                    <div className="absolute -top-6 left-8">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg">
                                            {step.number}
                                        </div>
                                    </div>

                                    <div className="mt-8">
                                        <h3 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
                                        <p className="text-gray-600 leading-relaxed mb-4">{step.description}</p>

                                        <div className="flex items-center gap-2 text-blue-600">
                                            <FiClock className="w-4 h-4" />
                                            <span className="text-sm font-semibold">{step.time}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <Link
                            href="/seller/onboarding"
                            className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
                        >
                            <span>Begin Your Journey</span>
                            <FiArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full mb-4">
                            <FiHelpCircle className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-semibold text-blue-600">FAQ</span>
                        </div>
                        <h2 className="text-4xl font-black text-gray-900 mb-4">
                            Frequently Asked Questions
                        </h2>
                        <p className="text-xl text-gray-600">
                            Everything you need to know about selling on our platform
                        </p>
                    </div>

                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-200 hover:border-blue-300 transition-all"
                            >
                                <button
                                    onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                                    className="w-full flex items-center justify-between p-6 text-left"
                                >
                                    <span className="text-lg font-bold text-gray-900">{faq.question}</span>
                                    <div className={`transform transition-transform ${activeFaq === index ? 'rotate-180' : ''}`}>
                                        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </button>

                                {activeFaq === index && (
                                    <div className="px-6 pb-6">
                                        <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:32px_32px]" />

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
                    <h2 className="text-4xl lg:text-5xl font-black mb-6">
                        Ready to Grow Your Business?
                    </h2>
                    <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                        Join thousands of successful sellers and start your e-commerce journey today.
                        It's free to get started!
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/seller/onboarding"
                            className="group inline-flex items-center justify-center gap-2 px-10 py-5 bg-white text-blue-600 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all shadow-2xl hover:shadow-xl hover:scale-105"
                        >
                            <span>Register Now</span>
                            <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>

                        <a
                            href="mailto:seller-support@onlineplanet.com"
                            className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-xl font-bold text-lg hover:bg-white/20 transition-all"
                        >
                            <span>Contact Sales</span>
                        </a>
                    </div>

                    <p className="mt-8 text-blue-200 text-sm">
                        Have questions? Email us at <a href="mailto:seller-support@onlineplanet.com" className="underline font-semibold">seller-support@onlineplanet.com</a>
                    </p>
                </div>
            </section>
        </div>
    )
}
