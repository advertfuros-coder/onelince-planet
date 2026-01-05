'use client'
import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Poppins } from 'next/font/google'
import {
    Check,
    Play,
    ArrowRight,
    Users,
    TrendingUp,
    ShieldCheck,
    Layout,
    Globe,
    MessageSquare,
    Zap,
    BarChart3,
    Layers,
    ChevronDown,
    Plus,
    Minus,
    Mail,
    Slack,
    CreditCard,
    Cloud,
    Clock,
    Clock1,
    ShoppingBag,
    ChevronRight
} from 'lucide-react'

import Header from '@/components/customer/Header'
import Footer from '@/components/customer/Footer'

const poppins = Poppins({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700', '800', '900'],
    variable: '--font-poppins',
})

export default function BecomeASellerPage() {
    const [isYearly, setIsYearly] = useState(false)
    const [activeFaq, setActiveFaq] = useState(null)
    const [activeWorkflowStep, setActiveWorkflowStep] = useState(0)

    const workflowSteps = [
        {
            title: 'Hyper-Fast Onboarding',
            desc: 'Go live in minutes, not days. Connect your existing inventory seamlessly.',
            step: '01',
            visual: (
                <div className="relative w-full h-full flex items-center justify-center p-8 bg-white/50 backdrop-blur-xl">
                    <div className="w-full max-w-sm space-y-6">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xl font-semibold">Onboarding Checklist</h4>
                            <span className="text-xs font-semibold text-blue-600">80% COMPLETE</span>
                        </div>
                        <div className="space-y-4">
                            {[
                                { t: 'Store Setup', d: 'Done', c: true },
                                { t: 'Inventory Sync', d: 'Done', c: true },
                                { t: 'Payment Gateway', d: 'In Progress', c: false }
                            ].map((item, i) => (
                                <div key={i} className={`p-4 rounded-2xl border transition-all ${item.c ? 'bg-blue-50/50 border-blue-100' : 'bg-white border-gray-100 shadow-sm'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${item.c ? 'bg-blue-600 border-blue-600' : 'border-gray-200'}`}>
                                            {item.c && <Check size={12} className="text-white" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">{item.t}</p>
                                            <p className="text-[10px] text-gray-400 font-medium">{item.d}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: 'AI-Driven Sales Insights',
            desc: 'Our algorithms identify trends before they happen, giving you the edge.',
            step: '02',
            visual: (
                <div className="relative w-full h-full flex items-center justify-center bg-gray-900 p-8">
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-transparent animate-pulse" />
                    <div className="relative z-10 w-full space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.5)]">
                                <Zap className="text-white w-6 h-6" />
                            </div>
                            <h4 className="text-white text-xl font-semibold tracking-tight">AI Predictive Engine</h4>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-3xl">
                                <p className="text-[10px] text-indigo-300 font-semibold uppercase mb-2">Demand Forecast</p>
                                <p className="text-2xl font-semibold text-white">+12.4%</p>
                                <div className="w-full h-1 bg-white/10 rounded-full mt-4 overflow-hidden">
                                    <div className="w-3/4 h-full bg-indigo-500" />
                                </div>
                            </div>
                            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-3xl">
                                <p className="text-[10px] text-indigo-300 font-semibold uppercase mb-2">Inventory Alert</p>
                                <p className="text-sm font-semibold text-white">Stock up on "Electronics"</p>
                                <div className="mt-4 flex gap-2">
                                    <span className="px-2 py-1 bg-red-500/20 text-red-500 text-[8px] font-semibold rounded uppercase">Urgent</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-indigo-500/10 border border-indigo-500/20 rounded-[2rem]">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-semibold text-white/50">Next 30 Days Forecast</span>
                                <TrendingUp className="text-indigo-400 w-4 h-4" />
                            </div>
                            <div className="flex items-end gap-2 h-20">
                                {[40, 60, 45, 90, 65, 80, 100].map((h, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ height: 0 }}
                                        animate={{ height: `${h}%` }}
                                        className={`flex-1 rounded-t-lg ${i === 6 ? 'bg-indigo-400 shadow-[0_0_15px_rgba(129,140,248,0.5)]' : 'bg-white/10'}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: 'Global Multi-Channel Sync',
            desc: 'Sync orders and stock across all your sales channels automatically.',
            step: '03',
            visual: (
                <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700 p-8">
                    <div className="relative w-48 h-48">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0"
                        >
                            {[0, 90, 180, 270].map((deg) => (
                                <div
                                    key={deg}
                                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-1 bg-white/10"
                                    style={{ transform: `translate(-50%, -50%) rotate(${deg}deg)` }}
                                >
                                    <div className="absolute right-0 w-8 h-8 -mt-3.5 bg-white rounded-xl shadow-lg flex items-center justify-center">
                                        <ShoppingBag size={14} className="text-blue-600" />
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-24 h-24 bg-white rounded-[2rem] shadow-2xl flex items-center justify-center relative">
                                <Globe className="text-blue-600 w-10 h-10 animate-pulse" />
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white" />
                            </div>
                        </div>
                    </div>

                    <div className="absolute bottom-8 left-8 right-8 grid grid-cols-2 gap-4">
                        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                            <p className="text-[8px] font-semibold text-white/60 uppercase">System Status</p>
                            <p className="text-xs font-semibold text-white mt-1">Synced Everywhere</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                            <p className="text-[8px] font-semibold text-white/60 uppercase">Last Sync</p>
                            <p className="text-xs font-semibold text-white mt-1">2s ago</p>
                        </div>
                    </div>
                </div>
            )
        }
    ]

    return (
        <div className={`min-h-screen bg-white text-gray-900 selection:bg-blue-100 selection:text-blue-900 ${poppins.className} font-sans`}>


            {/* Hero Section */}
            <header className="pt-40 lg:pt-48 pb-20 px-4 overflow-hidden">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="space-y-10"
                    >
                        <div className="inline-flex items-center gap-3 px-4 py-2 bg-white border border-gray-100 shadow-sm rounded-full">
                            <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center text-white text-[10px] font-semibold">OP</div>
                            <span className="text-sm font-semibold text-gray-600">The Ultimate Multivendor Marketplace</span>
                        </div>

                        <h1 className="text-6xl lg:text-8xl font-medium text-gray-900 leading-[1.05] tracking-tighter">
                            Sell Locally, <br />
                            Grow Globally
                        </h1>

                        <p className="text-xl text-gray-500 leading-relaxed max-w-xl font-normal">
                            Join Online Planet's thriving ecosystem. Manage your storefront, track orders, and reach millions of customers with our all-in-one seller dashboard.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-5 pt-4">
                            <Link
                                href="/seller/onboarding"
                                className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-semibold text-lg hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 flex items-center justify-center"
                            >
                                Become a Seller
                            </Link>
                            <button className="px-10 py-5 bg-white border border-gray-100 rounded-2xl font-semibold text-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-3 text-gray-700 shadow-sm">
                                <div className="w-6 h-6 bg-blue-50 rounded-full flex items-center justify-center">
                                    <Play className="w-3 h-3 text-blue-600 fill-current" />
                                </div>
                                How it Works
                            </button>
                        </div>
                    </motion.div>

                    {/* Right Illustration (Complex UI Recreation) */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="relative lg:h-[600px] flex items-center justify-center"
                    >
                        {/* Main Dashboard Card */}
                        <div className="relative z-10 w-[450px] bg-white rounded-[32px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.12)] border border-gray-100 p-8 overflow-hidden">
                            <div className="flex items-end justify-between gap-3 h-64 mb-6">
                                {[
                                    { h: 'h-32', opacity: '0.4' },
                                    { h: 'h-48', opacity: '0.6' },
                                    { h: 'h-24', opacity: '0.4' },
                                    { h: 'h-56', active: true, opacity: '1' },
                                    { h: 'h-40', opacity: '0.7' },
                                    { h: 'h-52', opacity: '0.5' }
                                ].map((bar, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                                        <div className="w-full bg-gray-50 rounded-xl relative overflow-hidden h-full">
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: bar.active ? '100%' : '70%' }}
                                                transition={{ duration: 1.5, delay: 0.5 + i * 0.1 }}
                                                className={`absolute bottom-0 left-0 right-0 ${bar.active ? 'bg-blue-600' : 'bg-blue-400/60'} rounded-t-xl group-hover:bg-blue-600 transition-colors`}
                                                style={{ opacity: bar.opacity }}
                                            />
                                        </div>
                                        <span className="text-[10px] font-semibold text-gray-400 uppercase">M{i + 1}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Dashboard Overlay Stats */}
                            <div className="absolute top-8 right-8 flex flex-col gap-1 items-end">
                                <div className="text-3xl font-semibold text-gray-900">$48.2k</div>
                                <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Revenue Growth</div>
                            </div>
                        </div>

                        {/* Floating Elements */}
                        {/* India Card */}
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -top-10 left-0 z-20 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 flex items-center gap-4"
                        >
                            <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-gray-50">
                                <div className="h-full w-full flex flex-col">
                                    <div className="h-1/3 w-full bg-[#FF9933]" />
                                    <div className="h-1/3 w-full bg-white flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 rounded-full border border-blue-900" />
                                    </div>
                                    <div className="h-1/3 w-full bg-[#138808]" />
                                </div>
                            </div>
                            <div>
                                <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">India</div>
                                <div className="font-semibold text-gray-900">8.4k <span className="text-[10px] text-gray-400 font-medium">items</span></div>
                            </div>
                        </motion.div>

                        {/* Spain Card */}
                        <motion.div
                            animate={{ y: [0, 10, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute top-20 right-0 z-20 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 flex items-center gap-4"
                        >
                            <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                                <div className="h-full w-full flex flex-col">
                                    <div className="h-1/3 w-full bg-red-600" />
                                    <div className="h-1/3 w-full bg-yellow-500" />
                                    <div className="h-1/3 w-full bg-red-600" />
                                </div>
                            </div>
                            <div>
                                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Spain</div>
                                <div className="font-medium text-gray-900">1.2k <span className="text-[10px] text-gray-400 font-medium">products</span></div>
                            </div>
                        </motion.div>

                        {/* Multiple Store Badge */}
                        <div className="absolute top-48 right-12 z-20 bg-white rounded-2xl shadow-lg border border-gray-50 p-3 flex items-center gap-3">
                            <div className="w-6 h-6 bg-orange-100 rounded flex items-center justify-center">
                                <Layout className="w-3 h-3 text-orange-600" />
                            </div>
                            <span className="text-[10px] font-medium text-gray-600 uppercase tracking-widest">Handle multiple store</span>
                        </div>

                        {/* Store Manager Profile */}
                        <div className="absolute bottom-20 left-12 z-30 flex items-center -space-x-4">
                            <div className="relative">
                                <div className="w-16 h-16 rounded-full border-4 border-white shadow-xl overflow-hidden bg-blue-100">
                                    <img src="https://i.pravatar.cc/150?u=bizwave" alt="Manager" />
                                </div>
                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center">
                                    <Layout className="w-3 h-3 text-white" />
                                </div>
                            </div>
                        </div>

                        {/* Store Manager Label */}
                        <div className="absolute bottom-40 right-2 w-28 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
                            <div className="bg-red-500 text-white text-[8px] font-medium uppercase text-center py-1 tracking-widest">Store Manager</div>
                            <div className="p-2 flex justify-center">
                                <div className="w-10 h-10 rounded-full bg-orange-100 overflow-hidden">
                                    <img src="https://i.pravatar.cc/150?u=manager2" alt="Manager" />
                                </div>
                            </div>
                        </div>

                        {/* Background blobs */}
                        <div className="absolute -z-10 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-[100px]" />
                        <div className="absolute -z-10 w-[300px] h-[300px] bg-orange-50/50 rounded-full blur-[80px] -top-20 -right-20" />
                    </motion.div>
                </div>
            </header>



            {/* "Why Sell on Online Planet?" Section - Awwwards Inspiration */}
            <section className="py-40 bg-white relative overflow-hidden">
                {/* Decorative Side Text */}
                <div className="absolute left-[-5%] top-1/2 -translate-y-1/2 rotate-[-90deg] hidden xl:block">
                    <span className="text-[12rem] font-semibold text-gray-50 leading-none select-none">PLANET</span>
                </div>

                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    <div className="flex flex-col lg:flex-row items-end justify-between mb-24 gap-8">
                        <div className="max-w-2xl">
                            <motion.span
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                className="text-blue-600 font-semibold uppercase tracking-[0.3em] text-sm mb-6 block"
                            >
                                Seller Ecosystem
                            </motion.span>
                            <h2 className="text-5xl lg:text-7xl font-medium text-gray-900 leading-[0.9] tracking-tighter">
                                Why sell on <br />
                                <span className="italic font-serif text-blue-600">Online Planet?</span>
                            </h2>
                        </div>
                        <p className="text-xl text-gray-500 max-w-xl font-normal mb-2 leading-relaxed">
                            We've engineered every detail to help you build a fast, secure, and profitable business.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            {
                                title: 'Global Exposure',
                                desc: 'Reach millions of active shoppers across 50+ countries with one localized store.',
                                icon: <Globe className="w-7 h-7" />,
                                color: 'blue',
                                stagger: 'lg:mt-0'
                            },
                            {
                                title: 'Vendor Analytics',
                                desc: 'Real-time data visualization that reveals hidden opportunities in your niche.',
                                icon: <TrendingUp className="w-7 h-7" />,
                                color: 'emerald',
                                stagger: 'lg:mt-20'
                            },
                            {
                                title: 'Pro Logistics',
                                desc: 'Unlock our hyper-local delivery network to ship items in under 24 hours.',
                                icon: <Zap className="w-7 h-7" />,
                                color: 'orange',
                                stagger: 'lg:mt-0'
                            },
                            {
                                title: 'Seller Shield',
                                desc: 'Our proprietary fraud detection and seller insurance keep your revenue safe.',
                                icon: <ShieldCheck className="w-7 h-7" />,
                                color: 'purple',
                                stagger: 'lg:mt-20'
                            }
                        ].map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                viewport={{ once: true }}
                                className={`p-10 bg-white rounded-[3rem] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] hover:shadow-2xl hover:border-blue-100 transition-all duration-500 group relative overflow-hidden ${feature.stagger}`}
                            >
                                {/* Circle Accent */}
                                <div className={`absolute -top-10 -right-10 w-32 h-32 bg-${feature.color}-50 rounded-full group-hover:scale-150 transition-transform duration-700 opacity-50`} />

                                <div className="relative z-10">
                                    <div className={`w-16 h-16 bg-${feature.color}-600 rounded-2xl flex items-center justify-center mb-10 shadow-lg shadow-${feature.color}-100 group-hover:rotate-[10deg] transition-transform`}>
                                        <div className="text-white">{feature.icon}</div>
                                    </div>
                                    <h3 className="text-2xl font-semibold mb-6 text-gray-900">{feature.title}</h3>
                                    <p className="text-gray-500 leading-relaxed font-normal">{feature.desc}</p>
                                </div>

                                <div className="mt-12 pt-8 border-t border-gray-50 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="flex items-center gap-2 text-sm font-semibold text-blue-600">
                                        Learn More <ArrowRight size={14} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* "Simplify Your Workflow" Section - Premium Process Flow */}
            <section className="py-32 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex flex-col lg:flex-row gap-16 lg:gap-32 items-center">
                        {/* Left side: Interactive Steps */}
                        <div className="w-full lg:w-2/5 space-y-12">
                            <div className="space-y-6">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                >
                                    <h2 className="text-5xl lg:text-7xl font-medium text-gray-900 leading-tight tracking-tighter">
                                        Manage your <span className="text-blue-600 italic font-serif">full lifecycle</span> from one hub
                                    </h2>
                                    <p className="mt-6 text-xl text-gray-500 leading-relaxed max-w-2xl font-normal">
                                        Everything you need to run a high-volume marketplace store, sans the complexity.
                                    </p>
                                </motion.div>
                            </div>

                            <div className="relative">
                                {/* Vertical Progress Line */}
                                <div className="absolute left-[27px] top-0 bottom-0 w-[2px] bg-gray-100 -z-10" />

                                <div className="space-y-8">
                                    {workflowSteps.map((item, idx) => (
                                        <motion.div
                                            key={idx}
                                            onClick={() => setActiveWorkflowStep(idx)}
                                            whileHover={{ x: 10 }}
                                            className={`relative pl-20 transition-all duration-500 cursor-pointer group`}
                                        >
                                            <div className={`absolute left-0 top-0 w-14 h-14 rounded-full border-2 flex items-center justify-center font-semibold text-sm transition-all duration-500 ${activeWorkflowStep === idx
                                                ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-200'
                                                : 'bg-white border-gray-100 text-gray-400 group-hover:border-blue-200 group-hover:text-blue-600'
                                                }`}>
                                                {item.step}
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className={`text-2xl font-semibold transition-colors ${activeWorkflowStep === idx ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-600'}`}>
                                                    {item.title}
                                                </h3>
                                                {activeWorkflowStep === idx && (
                                                    <motion.p
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        className="text-gray-500 text-lg leading-relaxed max-w-sm"
                                                    >
                                                        {item.desc}
                                                    </motion.p>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right side: Dynamic Visuals */}
                        <div className="w-full lg:w-3/5 relative">
                            <motion.div
                                key={activeWorkflowStep}
                                initial={{ opacity: 0, scale: 0.9, x: 20 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                                className="relative z-10 w-full aspect-[4/3] bg-white rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden group"
                            >
                                {workflowSteps[activeWorkflowStep].visual}

                                {/* Floating Micro-UI Elements for Added Polish */}
                                <motion.div
                                    animate={{ y: [0, -15, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute -top-6 -right-6 bg-white rounded-2xl p-4 shadow-2xl border border-gray-100 hidden md:block z-20"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                            <TrendingUp className="text-green-600 w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-semibold text-gray-400 uppercase">System</p>
                                            <p className="text-sm font-semibold text-gray-900">Optimal</p>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>

                            {/* Background Glow */}
                            <div className="absolute -inset-10 bg-blue-600/5 rounded-full blur-[100px] -z-10" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Grow Faster Section - Bento Grid Design */}
            <section className="py-32 bg-[#FDFDFF] relative overflow-hidden">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-40">
                    <div className="absolute top-[10%] left-[5%] w-[500px] h-[500px] bg-blue-100 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[10%] right-[5%] w-[400px] h-[400px] bg-indigo-100 rounded-full blur-[100px]" />
                </div>

                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    <div className="max-w-3xl mb-20">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="space-y-6"
                        >
                            <h2 className="text-5xl lg:text-7xl font-medium text-gray-900 leading-[1.1] tracking-tighter">
                                Tools to <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Scale your Vision</span>
                            </h2>
                            <p className="text-xl text-gray-500 font-normal max-w-2xl leading-relaxed">
                                We've built a world-class suite of tools designed to take your brand from a local storefront to a global powerhouse. No limits, just growth.
                            </p>
                        </motion.div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6 auto-rows-[300px]">
                        {/* 1. Fulfillment - Main Spotlight */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            whileHover={{ y: -8 }}
                            viewport={{ once: true }}
                            className="md:col-span-6 lg:col-span-8 row-span-2 bg-white rounded-[2.5rem] p-10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col justify-between group overflow-hidden relative"
                        >
                            <div className="absolute top-[-20%] right-[-10%] w-[300px] h-[300px] bg-blue-50/50 rounded-full group-hover:scale-110 transition-transform duration-700" />
                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-10 shadow-lg shadow-blue-200">
                                    <Cloud className="text-white w-8 h-8" />
                                </div>
                                <h3 className="text-4xl font-semibold text-gray-900 mb-6">Fulfillment by Online Planet</h3>
                                <p className="text-xl text-gray-500 max-w-md leading-relaxed">
                                    Offload your logistics to us. We store, pack, and ship your products in record time, so you can focus on building your brand.
                                </p>
                            </div>
                            <div className="relative z-10 flex items-center gap-4">
                                <button className="px-8 py-4 bg-gray-900 text-white rounded-xl font-semibold hover:bg-black transition-all">Explore Logistics</button>
                                <div className="flex -space-x-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-100 overflow-hidden">
                                            <img src={`https://i.pravatar.cc/100?u=${i + 10}`} alt="" />
                                        </div>
                                    ))}
                                    <div className="w-10 h-10 rounded-full border-2 border-white bg-blue-50 flex items-center justify-center text-[10px] font-semibold text-blue-600">
                                        +2k
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* 2. Marketing Tools */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            whileHover={{ y: -8 }}
                            viewport={{ once: true }}
                            className="md:col-span-3 lg:col-span-4 bg-indigo-600 rounded-[2.5rem] p-10 text-white flex flex-col justify-between relative overflow-hidden group"
                        >
                            <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-10 translate-y-10 group-hover:scale-150 transition-transform duration-700" />
                            <div>
                                <TrendingUp className="w-10 h-10 mb-6 opacity-80" />
                                <h3 className="text-2xl font-semibold mb-4">Precision Marketing</h3>
                                <p className="text-indigo-100 text-sm leading-relaxed">
                                    Target the right audience with machine-learning driven ad placements.
                                </p>
                            </div>
                            <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                        </motion.div>

                        {/* 3. Global Events */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            whileHover={{ y: -8 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="md:col-span-3 lg:col-span-4 bg-[#FFEDE0] rounded-[2.5rem] p-10 flex flex-col justify-between group"
                        >
                            <div>
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-6 shadow-sm">
                                    <ShoppingBag className="text-orange-600 w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Market Festivals</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    Early access to high-traffic shopping events globally.
                                </p>
                            </div>
                            <span className="text-orange-600 text-xs font-semibold uppercase tracking-widest">Get Invited</span>
                        </motion.div>

                        {/* 4. Academy */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            whileHover={{ y: -8 }}
                            viewport={{ once: true }}
                            className="md:col-span-6 lg:col-span-6 bg-white border border-gray-100 rounded-[2.5rem] p-10 flex gap-8 items-center shadow-sm"
                        >
                            <div className="flex-1 space-y-4">
                                <h3 className="text-2xl font-semibold text-gray-900">Seller Academy</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">
                                    Master the art of online selling with our pro courses and live webinars.
                                </p>
                                <div className="flex items-center gap-2 text-blue-600 text-sm font-semibold">
                                    <span>Start Learning</span>
                                    <ArrowRight size={14} />
                                </div>
                            </div>
                            <div className="w-32 h-32 bg-gray-50 rounded-3xl flex items-center justify-center flex-shrink-0">
                                <Layers className="text-gray-300 w-12 h-12" />
                            </div>
                        </motion.div>

                        {/* 5. Support */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            whileHover={{ y: -8 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="md:col-span-6 lg:col-span-6 bg-white border border-gray-100 rounded-[2.5rem] p-10 flex gap-8 items-center shadow-sm"
                        >
                            <div className="flex-1 space-y-4">
                                <h3 className="text-2xl font-semibold text-gray-900">White-Glove Support</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">
                                    Dedicated account managers help you navigate strategy and growth.
                                </p>
                                <div className="flex items-center gap-2 text-blue-600 text-sm font-semibold">
                                    <span>Meet your Manager</span>
                                    <ArrowRight size={14} />
                                </div>
                            </div>
                            <div className="w-32 h-32 bg-blue-50 rounded-3xl flex items-center justify-center flex-shrink-0">
                                <Users className="text-blue-500/30 w-12 h-12" />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* "Streamline Your Operations" Section - Premium Overhaul */}
            <section className="py-40 bg-[#FAFAFB] relative overflow-hidden">
                {/* Background Noise/Texture Simulation */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/silver-lined.png')]" />
                
                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    <div className="flex flex-col md:flex-row items-baseline justify-between mb-24 gap-6 border-b border-gray-100 pb-12">
                        <h2 className="text-5xl lg:text-7xl font-medium text-gray-900 tracking-tighter">
                            Streamline <br />
                            <span className="text-blue-600 font-serif italic">Your Operations</span>
                        </h2>
                        <p className="text-xl text-gray-400 max-w-xl font-normal leading-relaxed">
                            Simplifying the complex. We've built the world's most intuitive engine for modern commerce.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                        {/* 1. Sell Faster - Large Feature Card */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="lg:col-span-7 group relative bg-white rounded-[3.5rem] overflow-hidden border border-gray-100 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] transition-all duration-700"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            <div className="p-12 pb-0 relative z-10">
                                <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 text-[10px] font-semibold uppercase tracking-[0.2em] rounded-full mb-6">Efficiency</span>
                                <h3 className="text-4xl font-semibold text-gray-900 mb-6 tracking-tight">Sell Faster</h3>
                                <p className="text-gray-500 text-lg max-w-md mb-12">
                                    Put your items on the market in seconds. Our automated engine handles everything from localized pricing to global shipping rules.
                                </p>
                            </div>
                            <div className="relative h-80 w-full overflow-hidden mt-auto">
                                <img 
                                    src="/onboaring/become-a-seller.png" 
                                    className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-[2s] ease-out"
                                    alt="Sell Faster"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
                            </div>
                        </motion.div>

                        {/* 2. Track Better - Vertical Card */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            viewport={{ once: true }}
                            className="lg:col-span-5 flex flex-col gap-8"
                        >
                            <div className="flex-1 bg-gray-900 rounded-[3.5rem] p-12 text-white relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/20 transition-colors duration-700" />
                                <div className="relative z-10 flex flex-col h-full justify-between">
                                    <div>
                                        <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-10 border border-white/10 group-hover:scale-110 transition-transform">
                                            <Clock className="text-blue-400 w-7 h-7" />
                                        </div>
                                        <h3 className="text-3xl font-semibold mb-6">Track Better</h3>
                                        <p className="text-gray-400 text-lg leading-relaxed">
                                            See exactly where your orders are globally. Real-time updates for you and your customers, no manual entry required.
                                        </p>
                                    </div>
                                    <div className="mt-12 rounded-2xl overflow-hidden border border-white/5">
                                        <img 
                                            src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800" 
                                            className="w-full h-40 object-cover opacity-50 group-hover:opacity-80 transition-opacity duration-700"
                                            alt="Track Better"
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* 3. Grow Bigger - Wide Bottom Card */}
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="lg:col-span-12 group bg-white rounded-[3.5rem] border border-gray-100 p-12 flex flex-col md:flex-row items-center gap-12 shadow-[0_20px_50px_rgba(0,0,0,0.03)] hover:shadow-2xl transition-all duration-700 overflow-hidden"
                        >
                            <div className="md:w-1/2 relative">
                                <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mb-10 shadow-xl shadow-blue-100">
                                    <TrendingUp className="text-white w-10 h-10" />
                                </div>
                                <h3 className="text-4xl font-semibold text-gray-900 mb-6 tracking-tight">Grow Bigger</h3>
                                <p className="text-gray-500 text-xl max-w-md leading-relaxed">
                                    Use our simple "Growth Multiplier" reports to see how much revenue you are generating across every region in real-time.
                                </p>
                                <button className="mt-10 px-8 py-4 bg-gray-900 text-white rounded-2xl font-semibold flex items-center gap-3 hover:bg-black transition-all">
                                    View Sample Report <ArrowRight size={18} />
                                </button>
                            </div>
                            <div className="md:w-1/2 relative rounded-[2rem] overflow-hidden border border-gray-100">
                                <img 
                                    src="/onboaring/second.png" 
                                    className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-[3s]" 
                                    alt="Grow Bigger"
                                />
                                <div className="absolute inset-0 bg-gradient-to-l from-white/10 to-transparent" />
                            </div>
                        </motion.div>
                    </div>

                    <div className="mt-24 text-center">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="inline-block"
                        >
                            <button className="px-12 py-6 bg-blue-600 text-white rounded-3xl font-semibold text-xl hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200">
                                Request a Private Demo
                            </button>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Integrations Section */}
            <section className="py-24 bg-[#F8FAFC]">
                <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row items-center gap-16">
                    {/* Left Content */}
                    <div className="flex-1 space-y-8 max-w-xl">
                        <h2 className="text-5xl font-medium text-gray-900 leading-tight tracking-tight">
                            Expand Your Reach with Integrations
                        </h2>
                        <p className="text-lg text-gray-500 leading-relaxed font-normal">
                            Discover tools and platforms that integrate seamlessly with our dashboard. Simplify workflows and boost efficiency.
                        </p>
                        <button className="px-7 py-4 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
                            Full Integrations List
                        </button>
                    </div>

                    {/* Right Content - Staggered Badges */}
                    <div className="flex-1 w-full lg:w-auto">
                        <div className="space-y-4">
                            {/* Row 1 */}
                            <div className="flex flex-wrap justify-center lg:justify-start gap-4 ml-0 lg:ml-12">
                                {[
                                    { name: 'Shopify', icon: 'https://cdn.worldvectorlogo.com/logos/shopify.svg' },
                                    { name: 'Slack', icon: 'https://cdn.worldvectorlogo.com/logos/slack-new-logo.svg' },
                                    { name: 'Mailchimp', icon: 'https://cdn.worldvectorlogo.com/logos/mailchimp-freddie-icon.svg' }
                                ].map((app) => (
                                    <div key={app.name} className="flex items-center gap-3 bg-white px-5 py-3 rounded-xl shadow-sm border border-gray-50 hover:shadow-md transition-shadow">
                                        <img src={app.icon} alt={app.name} className="w-5 h-5 object-contain" />
                                        <span className="text-sm font-semibold text-gray-800">{app.name}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Row 2 */}
                            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                                {[
                                    { name: 'Google Analytics', icon: 'https://cdn.worldvectorlogo.com/logos/google-analytics-4.svg' },
                                    { name: 'Zapier', icon: 'https://cdn.worldvectorlogo.com/logos/zapier-2.svg' },
                                    { name: 'Salesforce', icon: 'https://cdn.worldvectorlogo.com/logos/salesforce-2.svg' }
                                ].map((app) => (
                                    <div key={app.name} className="flex items-center gap-3 bg-white px-5 py-3 rounded-xl shadow-sm border border-gray-50 hover:shadow-md transition-shadow">
                                        <img src={app.icon} alt={app.name} className="w-5 h-5 object-contain" />
                                        <span className="text-sm font-semibold text-gray-800">{app.name}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Row 3 */}
                            <div className="flex flex-wrap justify-center lg:justify-start gap-4 ml-0 lg:ml-8">
                                {[
                                    { name: 'Zendesk', icon: 'https://cdn.worldvectorlogo.com/logos/zendesk-1.svg' },
                                    { name: 'PayPal', icon: 'https://cdn.worldvectorlogo.com/logos/paypal-3.svg' },
                                    { name: 'Notion', icon: 'https://cdn.worldvectorlogo.com/logos/notion-2.svg' }
                                ].map((app) => (
                                    <div key={app.name} className="flex items-center gap-3 bg-white px-5 py-3 rounded-xl shadow-sm border border-gray-50 hover:shadow-md transition-shadow">
                                        <img src={app.icon} alt={app.name} className="w-5 h-5 object-contain" />
                                        <span className="text-sm font-semibold text-gray-800">{app.name}</span>
                                    </div>
                                ))}
                                <div className="flex items-center bg-gray-900 px-6 py-3 rounded-xl shadow-md">
                                    <span className="text-sm font-semibold text-white tracking-wide">+14 more</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="py-32 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-4xl mx-auto mb-20 space-y-6">
                        <h2 className="text-5xl lg:text-7xl font-medium text-gray-900 tracking-tighter">Flexible Plans for Every Need</h2>
                        <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
                            Choose the plan that's right for your business, whether you're just starting out or scaling to new heights.
                        </p>

                        <div className="flex items-center justify-center gap-4">
                            <span className={`text-sm font-semibold ${!isYearly ? 'text-gray-900' : 'text-gray-400'}`}>Monthly</span>
                            <button
                                onClick={() => setIsYearly(!isYearly)}
                                className="w-16 h-8 bg-blue-600 rounded-full relative p-1 transition-colors"
                            >
                                <motion.div
                                    animate={{ x: isYearly ? 32 : 0 }}
                                    className="w-6 h-6 bg-white rounded-full shadow-md"
                                />
                            </button>
                            <div className="flex items-center gap-2">
                                <span className={`text-sm font-semibold ${isYearly ? 'text-gray-900' : 'text-gray-400'}`}>Yearly</span>
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full uppercase">Save 20%</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                name: 'Free',
                                price: '0',
                                desc: 'Perfect for small teams just getting started.',
                                btn: 'Get Started',
                                features: ['Basic Custom View', 'Standard Support', '5 Projects', '1GB Storage']
                            },
                            {
                                name: 'Pro',
                                price: isYearly ? '439' : '549',
                                desc: 'Ideal for growing businesses needing more power.',
                                btn: 'Start Free Trial',
                                featured: true,
                                features: ['Advanced Analytics', 'Priority Support', 'Unlimited Projects', '10GB Storage', 'Custom Integrations']
                            },
                            {
                                name: 'Enterprise',
                                price: 'Custom',
                                desc: 'Scalable solutions for large organizations.',
                                btn: 'Contact Sales',
                                features: ['Everything in Pro', 'Dedicated Manager', 'Custom SLAs', 'Unlimited Storage', 'API Access']
                            }
                        ].map((plan, idx) => (
                            <div
                                key={idx}
                                className={`p-10 rounded-[2.5rem] border transition-all relative ${plan.featured
                                    ? 'border-blue-200 shadow-2xl shadow-blue-100 ring-4 ring-blue-50'
                                    : 'border-gray-100 hover:border-gray-200'
                                    }`}
                            >
                                {plan.featured && (
                                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 text-white text-xs font-medium rounded-full uppercase tracking-widest">
                                        Most Popular
                                    </span>
                                )}
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-xl font-semibold">{plan.name}</h3>
                                        <p className="text-gray-400 mt-2">{plan.desc}</p>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-medium">${plan.price}</span>
                                        {plan.price !== 'Custom' && <span className="text-gray-400 font-medium">/per month</span>}
                                    </div>
                                    <button className={`w-full py-4 rounded-xl font-semibold transition-all ${plan.featured
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                        }`}>
                                        {plan.btn}
                                    </button>
                                    <ul className="space-y-4 pt-6">
                                        {plan.features.map((f, i) => (
                                            <li key={i} className="flex items-center gap-3">
                                                <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center">
                                                    <Check className="w-3 h-3 text-orange-600" />
                                                </div>
                                                <span className="text-sm font-medium text-gray-600">{f}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section - Refined Design */}
            <section className="py-40 bg-white relative overflow-hidden">
                {/* Decorative background accent */}
                <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-50/30 -z-0 blur-[100px] rounded-full translate-x-1/2" />
                
                <div className="max-w-4xl mx-auto px-4 relative z-10">
                    <div className="text-center mb-24 space-y-6">
                        <motion.span 
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="text-blue-600 font-semibold uppercase tracking-[0.3em] text-sm block"
                        >
                            Assistance
                        </motion.span>
                        <h2 className="text-5xl lg:text-7xl font-medium text-gray-900 leading-tight tracking-tighter">
                            Got Questions? <br />
                            <span className="italic font-serif text-blue-600">We Have Answers</span>
                        </h2>
                        <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed font-normal">
                            Everything you need to know about scaling your brand on Online Planet.
                        </p>
                    </div>

                    <div className="space-y-6">
                        {[
                            { q: 'What can I sell on Online Planet?', a: 'Online Planet is a multivendor marketplace where you can sell everything from electronics and fashion to home decor and beauty products across dozens of categories.' },
                            { q: 'How do I get paid?', a: 'Funds from your sales are directly deposited into your bank account on a bi-weekly basis, after deducting a small marketplace commission.' },
                            { q: 'What are the seller fees?', a: 'We have various plans to fit your scale. Most plans include a small per-order commission plus a monthly subscription fee for premium tools.' },
                            { q: 'Can I sell internationally?', a: 'Absolutely! Our logistics network supports international shipping, allowing you to reach customers globally from Day 1.' }
                        ].map((faq, idx) => (
                            <div
                                key={idx}
                                className={`group bg-white rounded-[2rem] border transition-all duration-500 ${activeFaq === idx ? 'border-blue-200 shadow-2xl shadow-blue-50' : 'border-gray-100 hover:border-blue-100 shadow-sm hover:shadow-xl'}`}
                            >
                                <button
                                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                                    className="w-full p-10 flex items-center justify-between text-left transition-all"
                                >
                                    <span className={`text-2xl font-semibold transition-colors ${activeFaq === idx ? 'text-gray-900' : 'text-gray-900 group-hover:text-blue-600'}`}>{faq.q}</span>
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${activeFaq === idx ? 'bg-blue-600 rotate-180' : 'bg-gray-50 group-hover:bg-blue-50'}`}>
                                        {activeFaq === idx ? <Minus className="w-6 h-6 text-white" /> : <Plus className={`w-6 h-6 transition-colors ${activeFaq === idx ? 'text-white' : 'text-gray-400 group-hover:text-blue-600'}`} />}
                                    </div>
                                </button>
                                <AnimatePresence>
                                    {activeFaq === idx && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="p-10 pt-0 text-gray-500 leading-relaxed text-lg font-normal">
                                                <div className="pt-6 border-t border-gray-50">
                                                    {faq.a}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA Section */}
            <section className="">
                <div className=" mx-auto relative overflow-hidden bg-gradient-to-br from-blue-700 to-indigo-900   p-12 lg:p-24 text-white">
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />

                    <div className="grid max-w-7xl mx-auto lg:grid-cols-2 gap-16 items-center relative z-10">
                        <div className="space-y-10">
                            <h2 className="text-5xl  font-medium leading-[1.1] tracking-tight">
                                Take Control of Your <br />
                                E-Commerce Today!
                            </h2>
                            <p className="text-lg text-purple-100 max-w-md font-normal leading-relaxed">
                                Streamline your operations, track sales, and manage your team efficiently with our powerful dashboard.
                            </p>

                            <div className="flex flex-wrap gap-12 pt-4">
                                <div>
                                    <div className="text-4xl font-medium">75%</div>
                                    <div className="text-purple-200 font-medium text-xs mt-2">Increase in Efficiency</div>
                                </div>
                                <div>
                                    <div className="text-4xl font-medium">500+</div>
                                    <div className="text-purple-200 font-medium text-xs mt-2">Teams Empowered</div>
                                </div>
                                <div>
                                    <div className="text-4xl font-medium">99.9%</div>
                                    <div className="text-purple-200 font-medium text-xs mt-2">Uptime Guarantee</div>
                                </div>
                            </div>

                            <div className="pt-6">
                                <button className="px-10 py-5 bg-white text-gray-900 rounded-2xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all">
                                    Request a Demo
                                </button>
                            </div>
                        </div>

                        {/* ShopWave Dashboard Illustration (Pure CSS Recreation) */}
                        <motion.div
                            initial={{ opacity: 0, x: 50, rotate: 10 }}
                            animate={{ opacity: 1, x: 0, rotate: -5 }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                            className="relative hidden lg:block scale-110 translate-x-12 translate-y-8"
                        >
                            <div className="w-[650px] bg-white rounded-[2rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] overflow-hidden flex text-gray-900 h-[450px]">
                                {/* Dashboard Sidebar */}
                                <div className="w-56 bg-white border-r border-gray-50 flex flex-col p-6 space-y-8">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                            <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent" />
                                        </div>
                                        <span className="font-semibold text-lg text-blue-900">Online Planet</span>
                                    </div>

                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </div>
                                        <div className="w-full bg-gray-50 rounded-lg py-2 pl-8 text-[10px] text-gray-400 font-semibold">Search</div>
                                    </div>

                                    <div className="space-y-4">
                                        <p className="text-[9px] font-semibold text-gray-300 uppercase tracking-widest">Menu</p>
                                        <div className="space-y-1">
                                            {[
                                                { name: 'Dashboard', icon: Layout, active: true },
                                                { name: 'Analytics', icon: BarChart3 },
                                                { name: 'Chat', icon: MessageSquare },
                                                { name: 'Calendar', icon: Clock1 }
                                            ].map((item, i) => (
                                                <div key={i} className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${item.active ? 'bg-gray-50 text-blue-600' : 'text-gray-400 hover:bg-gray-50'}`}>
                                                    <item.icon size={14} />
                                                    <span className="text-[10px] font-semibold">{item.name}</span>
                                                    {item.active && <div className="ml-auto w-1 h-1 bg-red-500 rounded-full" />}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4">
                                        <p className="text-[9px] font-semibold text-gray-300 uppercase tracking-widest">Stores</p>
                                        <div className="flex items-center gap-3 p-2 rounded-xl text-gray-600">
                                            <div className="w-5 h-5 bg-cyan-100 rounded flex items-center justify-center">
                                                <ShoppingBag size={10} className="text-cyan-600" />
                                            </div>
                                            <span className="text-[10px] font-semibold">Fashion Hive</span>
                                        </div>
                                        <div className="flex items-center gap-3 p-2 bg-red-50 rounded-xl text-red-600">
                                            <div className="w-5 h-5 bg-red-100 rounded flex items-center justify-center">
                                                <Layout size={10} className="text-red-500" />
                                            </div>
                                            <span className="text-[10px] font-semibold">HealthMart</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Dashboard Main Content */}
                                <div className="flex-1 bg-white p-6 overflow-hidden">
                                    <div className="flex items-center gap-2 text-[8px] font-semibold text-gray-400 mb-6 uppercase tracking-widest">
                                        <span>Home</span>
                                        <ChevronRight size={8} />
                                        <span>Store</span>
                                        <ChevronRight size={8} />
                                        <span className="text-gray-800">HealthMart</span>
                                        <Minus className="rotate-90 w-2" />
                                        <span className="flex items-center gap-1">
                                            <ShieldCheck size={8} />
                                            Private
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-14 h-14 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center">
                                            <div className="w-8 h-8 rounded-lg bg-red-500 text-white flex items-center justify-center uppercase font-semibold">H</div>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-semibold text-gray-900">HealthMart</h3>
                                            <p className="text-[10px] text-gray-400 font-semibold">24 members</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-8">
                                        <div className="p-5 bg-gray-50 rounded-[1.5rem] border border-gray-100">
                                            <p className="text-[9px] font-semibold text-gray-400 uppercase mb-4">Orders Provided</p>
                                            <div className="flex items-baseline gap-6">
                                                <div>
                                                    <p className="text-2xl font-semibold">210</p>
                                                    <p className="text-[8px] font-semibold text-gray-400 mt-1 uppercase">Processing</p>
                                                </div>
                                                <div>
                                                    <p className="text-2xl font-semibold text-gray-300">109</p>
                                                    <p className="text-[8px] font-semibold text-gray-400 mt-1 uppercase">Processed</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-5 bg-gray-50 rounded-[1.5rem] border border-gray-100">
                                            <div className="flex justify-between items-start mb-4">
                                                <p className="text-[9px] font-semibold text-gray-400 uppercase">Store Product</p>
                                                <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
                                                    <ShoppingBag size={10} className="text-white" />
                                                </div>
                                            </div>
                                            <div className="flex items-baseline gap-6">
                                                <div>
                                                    <p className="text-2xl font-semibold">3.4k</p>
                                                    <p className="text-[8px] font-semibold text-gray-400 mt-1 uppercase">Total</p>
                                                </div>
                                                <div>
                                                    <p className="text-2xl font-semibold text-gray-300">352</p>
                                                    <p className="text-[8px] font-semibold text-gray-400 mt-1 uppercase">Sold out</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sales by Country Small View */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-400">Sales by Country</h4>
                                            <span className="text-[8px] font-semibold text-blue-600 underline cursor-pointer uppercase">View All</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-3">
                                            {[
                                                { c: 'Germany', v: '4.4k', flag: 'DE' },
                                                { c: 'France', v: '3.6k', flag: 'FR' },
                                                { c: 'Italy', v: '3.1k', flag: 'IT' }
                                            ].map((country, idx) => (
                                                <div key={idx} className="p-3 bg-white border border-gray-100 rounded-xl flex items-center gap-3">
                                                    <div className="w-6 h-4 rounded-sm bg-gray-100 overflow-hidden text-[6px] font-semibold flex items-center justify-center">
                                                        {country.flag}
                                                    </div>
                                                    <div>
                                                        <p className="text-[8px] font-semibold text-gray-900">{country.c}</p>
                                                        <p className="text-[7px] text-gray-400 font-semibold">{country.v} <span className="font-normal">products</span></p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 px-4 border-t border-gray-100">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-12 lg:gap-24">
                        <div className="col-span-2 space-y-8">
                            <Link href="/" className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent" />
                                </div>
                                <span className="text-xl font-medium">Online Planet</span>
                            </Link>
                            <p className="text-gray-400 max-w-xs font-medium">
                                The world's most trusted multivendor marketplace. Build, scale, and thrive with Online Planet.
                            </p>
                            <div className="flex items-center gap-4">
                                {['twitter', 'facebook', 'instagram', 'linkedin'].map((social) => (
                                    <div key={social} className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 cursor-pointer transition-all">
                                        {/* Social icons placeholder */}
                                        <div className="w-5 h-5 border-2 border-current rounded-sm" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {['Marketplace', 'Resources', 'Support', 'Company'].map((title) => (
                            <div key={title} className="space-y-6">
                                <h4 className="font-medium text-gray-900 uppercase tracking-widest text-sm">{title}</h4>
                                <ul className="space-y-4">
                                    {['Sell Online', 'Seller Hub', 'Fulfilment', 'Help Center'].map((link) => (
                                        <li key={link}>
                                            <Link href="#" className="text-gray-400 font-medium hover:text-blue-600 transition-colors">
                                                {link}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <div className="mt-20 pt-8 border-t border-gray-100 flex flex-col md:row-reverse md:flex-row justify-between items-center gap-4 text-sm font-semibold text-gray-400">
                        <div className="flex gap-8">
                            <Link href="#" className="hover:text-gray-600">Privacy Policy</Link>
                            <Link href="#" className="hover:text-gray-600">Terms of Service</Link>
                        </div>
                        <p>© 2025 Online Planet. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
