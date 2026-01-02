'use client'
import Link from 'next/link'
import { CheckCircle, Mail, Clock, ArrowRight } from 'lucide-react'

export default function OnboardingSuccessPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center py-12 px-4 selection:bg-emerald-100">
            <div className="max-w-2xl w-full">
                {/* Success Animation */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-emerald-500 to-green-600 rounded-[2rem] mb-6 shadow-2xl animate-bounce">
                        <CheckCircle className="w-12 h-12 text-white" />
                    </div>

                    <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tighter">
                        Application Submitted!
                    </h1>

                    <p className="text-xl text-gray-600 font-normal">
                        Thank you for choosing Online Planet to grow your business.
                    </p>
                </div>

                {/* Success Card */}
                <div className="bg-white rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] p-8 lg:p-14 space-y-10 border border-white">
                    {/* What's Next */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                            <Clock className="w-6 h-6 text-emerald-600" />
                            What Happens Next?
                        </h2>

                        <div className="space-y-6">
                            {[
                                {
                                    step: '1',
                                    title: 'Verification',
                                    description: 'Our team will review your business information within 24-48 hours.',
                                    time: '24-48 hours'
                                },
                                {
                                    step: '2',
                                    title: 'Approval',
                                    description: 'Receive an email with your credentials and dashboard access.',
                                    time: '1-2 business days'
                                },
                                {
                                    step: '3',
                                    title: 'Start Selling',
                                    description: 'List your products and reach millions of customers globally.',
                                    time: 'Instant'
                                }
                            ].map((item) => (
                                <div key={item.step} className="flex gap-4 p-5 bg-gray-50/50 rounded-2xl border border-gray-100 hover:bg-emerald-50 hover:border-emerald-100 transition-all group">
                                    <div className="flex-shrink-0 w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-900 font-black group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-all">
                                        {item.step}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                                        <p className="text-sm text-gray-500 mb-2">{item.description}</p>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">⏱ {item.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Notification Box */}
                    <div className="bg-blue-600 rounded-3xl p-8 text-white relative overflow-hidden group shadow-xl shadow-blue-100">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
                        <div className="flex items-start gap-5 relative z-10">
                            <div className="flex-shrink-0 w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/20">
                                <Mail className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-xl mb-2">Check Your Email</h3>
                                <p className="text-sm text-blue-50/80 leading-relaxed font-normal">
                                    We've sent a confirmation email with your reference ID. Please check your inbox and whitelist <b>noreply@onlineplanet.com</b>.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ID Badge */}
                    <div className="text-center pt-2">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Application Reference</p>
                        <div className="inline-block px-8 py-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <code className="text-2xl font-mono font-bold text-gray-900 tracking-tighter">
                                ONP-{(Date.now()).toString(36).toUpperCase()}
                            </code>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <Link
                            href="/"
                            className="flex-1 flex items-center justify-center gap-2 px-8 py-5 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-xl shadow-gray-200"
                        >
                            <span>Back to Home</span>
                            <ArrowRight size={18} />
                        </Link>

                        <a
                            href="mailto:support@onlineplanet.com"
                            className="flex-1 flex items-center justify-center gap-2 px-8 py-5 bg-white border border-gray-200 text-gray-700 rounded-2xl font-bold hover:bg-gray-50 transition-all"
                        >
                            <Mail size={18} />
                            <span>Contact Support</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}
