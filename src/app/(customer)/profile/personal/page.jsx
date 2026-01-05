'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/AuthContext'
import { FiArrowLeft, FiUser, FiMail, FiPhone, FiCheck, FiEdit2 } from 'react-icons/fi'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import Button from '@/components/ui/Button'

export default function PersonalInfoPage() {
    const router = useRouter()
    const { token, isAuthenticated, user: authUser } = useAuth()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [editing, setEditing] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        gender: ''
    })

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        fetchProfile()
    }, [isAuthenticated])

    const fetchProfile = async () => {
        try {
            setLoading(true)
            const res = await axios.get('/api/customer/profile', {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.data.success) {
                setFormData({
                    name: res.data.user.name || '',
                    email: res.data.user.email || '',
                    phone: res.data.user.phone || '',
                    gender: res.data.user.gender || ''
                })
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error)
            toast.error('Failed to load profile data')
        } finally {
            setLoading(false)
        }
    }

    const handleUpdate = async (e) => {
        e.preventDefault()
        try {
            setSaving(true)
            const res = await axios.put('/api/customer/profile', formData, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.data.success) {
                toast.success('Profile updated successfully')
                setEditing(false)
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Mobile Header */}
            <div className="sticky top-0 z-10 bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100 shadow-sm lg:hidden">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.push('/profile')} className="p-1">
                        <FiArrowLeft className="w-5 h-5 text-gray-800" />
                    </button>
                    <h1 className="text-sm font-semibold text-gray-800">Personal Info</h1>
                </div>
                {!editing && (
                    <button onClick={() => setEditing(true)} className="text-blue-600 font-semibold text-sm">
                        EDIT
                    </button>
                )}
            </div>

            <div className="max-w-xl mx-auto lg:py-10 lg:px-4 px-4 py-6">
                <div className="flex items-center justify-between mb-8 hidden lg:flex">
                    <h1 className="text-2xl font-semibold">Personal Information</h1>
                    {!editing && (
                        <Button variant="outline" onClick={() => setEditing(true)}>
                            <FiEdit2 className="mr-2" /> Edit Profile
                        </Button>
                    )}
                </div>

                <form onSubmit={handleUpdate} className="space-y-6">
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6">
                        <div className="flex justify-center mb-6">
                            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-3xl font-semibold border-4 border-white shadow-md relative">
                                {formData.name?.charAt(0) || <FiUser />}
                                <div className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center">
                                    <FiCheck className="text-white w-4 h-4" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                            <div className="relative mt-1">
                                <FiUser className="absolute left-4 top-4 text-gray-400" />
                                <input
                                    disabled={!editing}
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-70 transition-all"
                                    placeholder="Enter your name"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                            <div className="relative mt-1">
                                <FiMail className="absolute left-4 top-4 text-gray-400" />
                                <input
                                    disabled // Email usually fixed
                                    value={formData.email}
                                    className="w-full pl-12 pr-4 py-4 bg-gray-100/50 border border-gray-100 rounded-2xl text-sm opacity-70 cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                            <div className="relative mt-1">
                                <FiPhone className="absolute left-4 top-4 text-gray-400" />
                                <input
                                    disabled={!editing}
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-70 transition-all"
                                    placeholder="Enter phone number"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest ml-1 text-center">Gender</label>
                            <div className="grid grid-cols-2 gap-4 mt-2">
                                {['male', 'female'].map((g) => (
                                    <button
                                        key={g}
                                        type="button"
                                        disabled={!editing}
                                        onClick={() => setFormData({ ...formData, gender: g })}
                                        className={`py-3 rounded-2xl border-2 text-sm font-semibold capitalize transition-all ${formData.gender === g
                                                ? 'border-blue-600 bg-blue-50 text-blue-600'
                                                : 'border-gray-50 bg-gray-50 text-gray-500'
                                            } disabled:opacity-50`}
                                    >
                                        {g}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {editing && (
                        <div className="flex gap-4">
                            <Button type="submit" loading={saving} className="flex-1 rounded-2xl py-4 shadow-lg shadow-blue-200">
                                Save Changes
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditing(false)}
                                className="flex-1 rounded-2xl py-4 border-2"
                            >
                                Cancel
                            </Button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    )
}
