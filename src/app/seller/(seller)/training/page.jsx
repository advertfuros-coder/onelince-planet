// app/seller/(seller)/training/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import axios from 'axios'
import {
    Book,
    Award,
    CheckCircle,
    Clock,
    Play,
    Trophy,
    Star,
    Zap,
    Sparkles,
    Shield,
    Target,
    Activity,
    ChevronRight,
    PlayCircle,
    BookOpen
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'

export default function TrainingPage() {
    const { token } = useAuth()
    const [courses, setCourses] = useState([])
    const [certifications, setCertifications] = useState([])
    const [progress, setProgress] = useState({})
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (token) fetchTraining()
    }, [token])

    async function fetchTraining() {
        try {
            setLoading(true)
            const res = await axios.get('/api/seller/training', {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (res.data.success) {
                const training = res.data.training
                const formattedCourses = training.courses.map(c => ({
                    ...c,
                    _id: c._id || c.courseId,
                    duration: c.lessons.reduce((sum, l) => sum + (l.duration || 0), 0),
                    lessons: c.lessons.length,
                    level: c.category === 'basics' ? 'Beginner' : 'Expert'
                }))

                setCourses(formattedCourses)
                setCertifications(training.certifications || [])
                setProgress({
                    completedCourses: training.stats?.totalCoursesCompleted || 0,
                    totalPoints: training.stats?.totalPoints || 0,
                    courses: training.courses.map(c => ({
                        courseId: c.courseId,
                        progress: c.progress || 0,
                        completed: c.status === 'completed'
                    }))
                })
            }
        } catch (error) {
            console.error('Error fetching training:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400 font-black uppercase tracking-widest text-[9px]">Downloading Curriculum...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-8">
            <div className="max-w-[1400px] mx-auto space-y-10">

                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                                <Book size={18} />
                            </div>
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">Seller Academy</span>
                        </div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Academic Terminal</h1>
                        <p className="text-gray-500 font-medium mt-1">Master the e-commerce architecture through certified performance modules</p>
                    </div>

                    <div className="flex items-center gap-4 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                        <div className="text-right">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Global Rank</p>
                            <p className="text-lg font-black text-gray-900 leading-none">#420</p>
                        </div>
                        <div className="w-[1px] h-8 bg-gray-100" />
                        <div className="flex -space-x-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-10 h-10 rounded-xl border-2 border-white bg-indigo-500 flex items-center justify-center text-white text-[10px] font-black">
                                    <Award size={14} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Stats Matrix */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <ModernStat label="Module Feed" value={courses.length} icon={BookOpen} color="blue" />
                    <ModernStat label="Mastery Index" value={`${progress.completedCourses || 0} Complete`} icon={CheckCircle} color="emerald" />
                    <ModernStat label="Neural Seals" value={certifications.length} icon={Shield} color="purple" />
                    <ModernStat label="XP Protocol" value={progress.totalPoints || 0} icon={Zap} color="orange" />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Left: Certifications & Progress */}
                    <div className="xl:col-span-1 space-y-8">
                        <div className="bg-white rounded-[2.8rem] p-8 shadow-sm border border-gray-100/50">
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-8 flex items-center justify-between">
                                <span>Active Certifications</span>
                                <Sparkles size={16} className="text-amber-500" />
                            </h3>
                            {certifications.length === 0 ? (
                                <div className="p-10 text-center bg-gray-50/50 rounded-[2.5rem] border border-gray-50">
                                    <Award className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No Seals Authenticated</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {certifications.map((cert) => (
                                        <motion.div
                                            whileHover={{ x: 5 }}
                                            key={cert._id}
                                            className="flex items-center gap-4 p-5 bg-gradient-to-br from-amber-50 to-orange-50 rounded-[2rem] border border-amber-100/50"
                                        >
                                            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-amber-600">
                                                <Award size={24} />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-gray-900 uppercase">{cert.name}</h4>
                                                <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mt-1">{cert.level} Level</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="bg-gray-900 rounded-[2.8rem] p-8 text-white relative overflow-hidden group">
                            <Activity className="absolute bottom-[-20%] right-[-10%] w-40 h-40 text-blue-500/20 group-hover:scale-110 transition-transform duration-700" />
                            <div className="relative z-10 space-y-6">
                                <div className="flex items-center gap-2">
                                    <Trophy className="text-amber-400" size={20} />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Weekly Sprint</span>
                                </div>
                                <h4 className="text-2xl font-black tracking-tight leading-none">Earn 500 XP to Unlock 'Global Logistics' Masterclass</h4>
                                <div className="space-y-2">
                                    <div className="flex items-end justify-between text-[10px] font-black uppercase tracking-widest">
                                        <span>Current XP: {progress.totalPoints || 0}</span>
                                        <span>70%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 w-[70%] rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Modules Feed */}
                    <div className="xl:col-span-2 space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-lg font-black text-gray-900 tracking-tight">Deployment Modules</h3>
                            <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2 hover:translate-x-1 transition-transform">
                                View Archive <ChevronRight size={14} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {courses.map((course, idx) => (
                                <ModernCourseCard key={course._id} course={course} idx={idx} progress={progress} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function ModernCourseCard({ course, idx, progress }) {
    const courseProgress = progress.courses?.find(c => c.courseId === course._id)
    const completed = courseProgress?.completed || false
    const progressPercent = courseProgress?.progress || 0

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="group bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100/50 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all"
        >
            <div className="flex items-start justify-between mb-8">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${completed ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                    {completed ? <CheckCircle size={28} /> : <PlayCircle size={28} />}
                </div>
                {completed && (
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100">Synchronized</span>
                )}
            </div>

            <h3 className="text-xl font-black text-gray-900 tracking-tight leading-none group-hover:text-blue-600 transition-colors uppercase">{course.title}</h3>
            <p className="text-[11px] font-medium text-gray-500 mt-4 leading-relaxed line-clamp-2">{course.description}</p>

            <div className="grid grid-cols-3 gap-4 my-8 py-6 border-y border-gray-50">
                <div className="text-center">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Duration</p>
                    <div className="flex items-center justify-center gap-1">
                        <Clock size={12} className="text-gray-300" />
                        <span className="text-xs font-black text-gray-900">{course.duration}M</span>
                    </div>
                </div>
                <div className="text-center">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Lessons</p>
                    <span className="text-xs font-black text-gray-900">{course.lessons} Units</span>
                </div>
                <div className="text-center">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Tier</p>
                    <span className="text-xs font-black text-blue-600 uppercase">{course.level}</span>
                </div>
            </div>

            <div className="space-y-3 mb-8">
                <div className="flex justify-between items-end">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Neural Link Progress</span>
                    <span className="text-[10px] font-black text-indigo-600">{progressPercent}%</span>
                </div>
                <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        className="h-full bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.3)]"
                    />
                </div>
            </div>

            <button className="w-full py-4 bg-gray-900 hover:bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-gray-900/10 flex items-center justify-center gap-2 group-hover:scale-[1.02]">
                {completed ? 'Re-Audit Module' : 'Initiate Transmission'}
                <ChevronRight size={14} />
            </button>
        </motion.div>
    )
}

function ModernStat({ label, value, icon: Icon, color }) {
    const colors = {
        blue: 'text-blue-600 bg-blue-50 border-blue-100',
        emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
        purple: 'text-purple-600 bg-purple-50 border-purple-100',
        orange: 'text-orange-600 bg-orange-50 border-orange-100',
    }
    return (
        <div className="bg-white p-6 rounded-[2.2rem] shadow-sm border border-gray-100/50 flex items-center gap-4 group overflow-hidden relative">
            <div className={`p-4 rounded-xl ${colors[color]} border group-hover:scale-110 transition-transform duration-500`}><Icon size={20} /></div>
            <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-2">{label}</p>
                <p className="text-2xl font-black text-gray-900 tracking-tighter leading-none">{value}</p>
            </div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50/50 -mr-12 -mt-12 rounded-full pointer-events-none group-hover:scale-125 transition-transform duration-700" />
        </div>
    )
}
