// app/seller/(seller)/training/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import axios from 'axios'
import {
    FiBook,
    FiAward,
    FiCheckCircle,
    FiClock,
    FiPlay,
    FiTrophy,
    FiStar,
} from 'react-icons/fi'
import { toast } from 'react-hot-toast'
import { FaTrophy } from 'react-icons/fa'

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
                setCourses(res.data.courses || [])
                setCertifications(res.data.certifications || [])
                setProgress(res.data.progress || {})
            }
        } catch (error) {
            console.error('Error fetching training:', error)
            toast.error('Failed to load training')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
                <h1 className="text-3xl font-bold">🎓 Seller Training & Certification</h1>
                <p className="mt-2 text-blue-100">Learn, grow, and earn certifications</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                    icon={<FiBook />}
                    label="Courses Available"
                    value={courses.length}
                    color="blue"
                />
                <StatCard
                    icon={<FiCheckCircle />}
                    label="Completed"
                    value={progress.completedCourses || 0}
                    color="green"
                />
                <StatCard
                    icon={<FiAward />}
                    label="Certifications"
                    value={certifications.length}
                    color="purple"
                />
                <StatCard
                    icon={<FaTrophy />}
                    label="Points Earned"
                    value={progress.totalPoints || 0}
                    color="yellow"
                />
            </div>

            {/* Certifications */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">🏆 Your Certifications</h2>
                {certifications.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                        <FiAward className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-600">Complete courses to earn certifications</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {certifications.map((cert) => (
                            <CertificationCard key={cert._id} certification={cert} />
                        ))}
                    </div>
                )}
            </div>

            {/* Courses */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">📚 Available Courses</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {courses.map((course) => (
                        <CourseCard key={course._id} course={course} progress={progress} />
                    ))}
                </div>
            </div>
        </div>
    )
}

function CertificationCard({ certification }) {
    return (
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg shadow-md border-2 border-yellow-300 p-6 text-center">
            <FiAward className="w-16 h-16 text-yellow-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-900 mb-1">{certification.name}</h3>
            <p className="text-sm text-gray-600 mb-2">{certification.level}</p>
            <p className="text-xs text-gray-500">
                Earned: {new Date(certification.earnedAt).toLocaleDateString()}
            </p>
        </div>
    )
}

function CourseCard({ course, progress }) {
    const courseProgress = progress.courses?.find(c => c.courseId === course._id)
    const completed = courseProgress?.completed || false
    const progressPercent = courseProgress?.progress || 0

    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-all">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{course.title}</h3>
                    <p className="text-sm text-gray-600">{course.description}</p>
                </div>
                {completed && (
                    <FiCheckCircle className="w-6 h-6 text-green-600" />
                )}
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center space-x-1">
                    <FiClock className="w-4 h-4" />
                    <span>{course.duration} min</span>
                </div>
                <div className="flex items-center space-x-1">
                    <FiBook className="w-4 h-4" />
                    <span>{course.lessons} lessons</span>
                </div>
                <div className="flex items-center space-x-1">
                    <FiStar className="w-4 h-4" />
                    <span>{course.level}</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{progressPercent}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${progressPercent}%` }}
                    ></div>
                </div>
            </div>

            <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">
                <FiPlay className="w-4 h-4" />
                <span>{completed ? 'Review' : 'Start'} Course</span>
            </button>
        </div>
    )
}

function StatCard({ icon, label, value, color }) {
    const colors = {
        blue: 'bg-blue-100 text-blue-600',
        green: 'bg-green-100 text-green-600',
        purple: 'bg-purple-100 text-purple-600',
        yellow: 'bg-yellow-100 text-yellow-600',
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${colors[color]}`}>
                    <div className="text-2xl">{icon}</div>
                </div>
                <div>
                    <p className="text-sm text-gray-600">{label}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                </div>
            </div>
        </div>
    )
}
