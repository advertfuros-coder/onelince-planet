'use client'
import Link from 'next/link'
import { FiCheckCircle, FiMail, FiClock, FiArrowRight } from 'react-icons/fi'

export default function OnboardingSuccessPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center py-12 px-4">
            <div className="max-w-2xl w-full">
                {/* Success Animation */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-6 shadow-2xl animate-bounce">
                        <FiCheckCircle className="w-12 h-12 text-white" />
                    </div>

                    <h1 className="text-4xl font-black text-gray-900 mb-4">
                        Application Submitted Successfully!
                    </h1>

                    <p className="text-xl text-gray-600">
                        Thank you for choosing Online Planet to grow your business
                    </p>
                </div>

                {/* Success Card */}
                <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12 space-y-8">
                    {/* What's Next */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <FiClock className="w-6 h-6 text-blue-600" />
                            What Happens Next?
                        </h2>

                        <div className="space-y-6">
                            {[
                                {
                                    step: '1',
                                    title: 'Document Verification',
                                    description: 'Our team will review your submitted documents and business information within 24-48 hours.',
                                    time: '24-48 hours'
                                },
                                {
                                    step: '2',
                                    title: 'Account Approval',
                                    description: 'Once verified, you\'ll receive an email with your login credentials and next steps.',
                                    time: '1-2 business days'
                                },
                                {
                                    step: '3',
                                    title: 'Start Selling',
                                    description: 'Log in to your seller dashboard, list your products, and start selling to millions of customers!',
                                    time: 'Instant'
                                }
                            ].map((item) => (
                                <div key={item.step} className="flex gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-blue-50 transition-all">
                                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-black">
                                        {item.step}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                                        <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                                        <span className="text-xs font-semibold text-blue-600">⏱ {item.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Email Notification */}
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                                <FiMail className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-blue-900 mb-2">Check Your Email</h3>
                                <p className="text-sm text-blue-800">
                                    We've sent a confirmation email with your application details and application ID.
                                    Please check your inbox and spam folder.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Application ID */}
                    <div className="border-t border-gray-200 pt-6">
                        <div className="text-center">
                            <p className="text-sm text-gray-500 mb-2">Your Application Reference ID</p>
                            <div className="inline-block px-6 py-3 bg-gray-100 rounded-xl">
                                <code className="text-lg font-mono font-bold text-gray-900">
                                    ONP-{Math.random().toString(36).substr(2, 9).toUpperCase()}
                                </code>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Please save this for your records</p>
                        </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6">
                        <Link
                            href="/"
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
                        >
                            <span>Back to Home</span>
                            <FiArrowRight className="w-5 h-5" />
                        </Link>

                        <a
                            href="mailto:seller-support@onlineplanet.com"
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                        >
                            <FiMail className="w-5 h-5" />
                            <span>Contact Support</span>
                        </a>
                    </div>
                </div>

                {/* Help Section */}
                <div className="mt-8 text-center">
                    <p className="text-gray-600 text-sm">
                        Need help or have questions?{' '}
                        <a href="mailto:seller-support@onlineplanet.com" className="text-blue-600 font-semibold hover:underline">
                            seller-support@onlineplanet.com
                        </a>
                    </p>
                </div>
            </div>
        </div>
    )
}
