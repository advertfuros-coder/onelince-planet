'use client'
import { FiSmartphone, FiDownload, FiStar } from 'react-icons/fi'

export default function AppDownloadBanner() {
    return (
        <section className="py-16 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

            {/* Floating Icons */}
            <div className="absolute top-10 left-10 animate-bounce">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <FiSmartphone className="w-8 h-8 text-white" />
                </div>
            </div>
            <div className="absolute bottom-10 right-10 animate-bounce animation-delay-200">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <FiStar className="w-8 h-8 text-white" />
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    {/* Content */}
                    <div className="text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white mb-6">
                            <FiDownload className="w-4 h-4" />
                            <span className="text-sm font-bold">Download Our App</span>
                        </div>

                        <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                            Shop Anytime, Anywhere
                        </h2>
                        <p className="text-xl text-white/90 mb-8">
                            Get exclusive app-only deals and a seamless shopping experience on your mobile device
                        </p>

                        {/* Features */}
                        <div className="space-y-3 mb-8">
                            {[
                                'Extra 10% off on first app order',
                                'Early access to sales & new arrivals',
                                'Easy order tracking & notifications'
                            ].map((feature, index) => (
                                <div key={index} className="flex items-center gap-3 text-white">
                                    <div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <span className="font-semibold">{feature}</span>
                                </div>
                            ))}
                        </div>

                        {/* Download Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                            <a
                                href="#"
                                className="inline-flex items-center gap-3 px-6 py-4 bg-black hover:bg-gray-900 text-white rounded-xl transition-all hover:scale-105"
                            >
                                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 3-2.53 4.09l-.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                                </svg>
                                <div className="text-left">
                                    <div className="text-xs">Download on the</div>
                                    <div className="text-lg font-bold">App Store</div>
                                </div>
                            </a>

                            <a
                                href="#"
                                className="inline-flex items-center gap-3 px-6 py-4 bg-black hover:bg-gray-900 text-white rounded-xl transition-all hover:scale-105"
                            >
                                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626c.547.317.547 1.112 0 1.429l-2.808 1.626-2.564-2.564 2.565-2.117zM3.875 2.56L14.813 8.893 12.51 11.196 3.875 2.561z" />
                                </svg>
                                <div className="text-left">
                                    <div className="text-xs">GET IT ON</div>
                                    <div className="text-lg font-bold">Google Play</div>
                                </div>
                            </a>
                        </div>

                        {/* Rating */}
                        <div className="mt-8 flex items-center gap-4 justify-center md:justify-start">
                            <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <FiStar key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>
                            <span className="text-white/90 font-semibold">
                                4.8 Rating from 50K+ reviews
                            </span>
                        </div>
                    </div>

                    {/* Phone Mockup */}
                    <div className="relative hidden md:block">
                        <div className="relative z-10 mx-auto w-64 h-[500px] bg-white rounded-[3rem] shadow-2xl p-3 border-8 border-gray-900">
                            <div className="w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 rounded-[2.5rem] overflow-hidden">
                                {/* Placeholder for app screenshot */}
                                <div className="h-full flex items-center justify-center text-gray-400">
                                    <FiSmartphone className="w-32 h-32" />
                                </div>
                            </div>
                        </div>
                        {/* Phone Shadow */}
                        <div className="absolute inset-0 bg-black/30 blur-3xl translate-y-8"></div>
                    </div>
                </div>
            </div>

            <style jsx>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animation-delay-200 {
          animation-delay: 200ms;
        }
      `}</style>
        </section>
    )
}
