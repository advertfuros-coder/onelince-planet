// app/seller/(seller)/profile/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import axios from 'axios'
import {
    FiUser,
    FiMail,
    FiPhone,
    FiMapPin,
    FiSave,
    FiCamera,
    FiShield,
} from 'react-icons/fi'
import { toast } from 'react-hot-toast'

export default function ProfilePage() {
    const { token, user } = useAuth()
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        phone: '',
        businessName: '',
        address: {
            street: '',
            city: '',
            state: '',
            country: '',
            zipCode: ''
        },
        taxInfo: {
            gstNumber: '',
            panNumber: ''
        }
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (token) fetchProfile()
    }, [token])

    async function fetchProfile() {
        try {
            setLoading(true)
            const res = await axios.get('/api/seller/profile', {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (res.data.success && res.data.profile) {
                setProfile(prevProfile => ({
                    name: res.data.profile.name || prevProfile.name,
                    email: res.data.profile.email || prevProfile.email,
                    phone: res.data.profile.phone || prevProfile.phone,
                    businessName: res.data.profile.businessName || prevProfile.businessName,
                    address: {
                        street: res.data.profile.address?.street || prevProfile.address.street,
                        city: res.data.profile.address?.city || prevProfile.address.city,
                        state: res.data.profile.address?.state || prevProfile.address.state,
                        country: res.data.profile.address?.country || prevProfile.address.country,
                        zipCode: res.data.profile.address?.zipCode || prevProfile.address.zipCode
                    },
                    taxInfo: {
                        gstNumber: res.data.profile.taxInfo?.gstNumber || prevProfile.taxInfo.gstNumber,
                        panNumber: res.data.profile.taxInfo?.panNumber || prevProfile.taxInfo.panNumber
                    }
                }))
            }
        } catch (error) {
            console.error('Error fetching profile:', error)
            // Don't show error if profile doesn't exist yet (404)
            if (error.response?.status !== 404) {
                toast.error('Failed to load profile')
            }
        } finally {
            setLoading(false)
        }
    }

    async function handleSubmit(e) {
        e.preventDefault()
        try {
            setSaving(true)
            const res = await axios.put('/api/seller/profile', profile, {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (res.data.success) {
                toast.success('Profile updated successfully')
            }
        } catch (error) {
            toast.error('Failed to update profile')
        } finally {
            setSaving(false)
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
                <h1 className="text-3xl font-bold">👤 Seller Profile</h1>
                <p className="mt-2 text-blue-100">Manage your account information</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Basic Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FiUser className="inline w-4 h-4 mr-1" />
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={profile.name}
                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FiMail className="inline w-4 h-4 mr-1" />
                                Email
                            </label>
                            <input
                                type="email"
                                value={profile.email}
                                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FiPhone className="inline w-4 h-4 mr-1" />
                                Phone
                            </label>
                            <input
                                type="tel"
                                value={profile.phone}
                                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Business Name
                            </label>
                            <input
                                type="text"
                                value={profile.businessName}
                                onChange={(e) => setProfile({ ...profile, businessName: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Address */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                        <FiMapPin className="inline w-5 h-5 mr-2" />
                        Address
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <input
                                type="text"
                                placeholder="Street Address"
                                value={profile.address?.street || ''}
                                onChange={(e) => setProfile({ ...profile, address: { ...profile.address, street: e.target.value } })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <input
                            type="text"
                            placeholder="City"
                            value={profile.address?.city || ''}
                            onChange={(e) => setProfile({ ...profile, address: { ...profile.address, city: e.target.value } })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            type="text"
                            placeholder="State"
                            value={profile.address?.state || ''}
                            onChange={(e) => setProfile({ ...profile, address: { ...profile.address, state: e.target.value } })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            type="text"
                            placeholder="Country"
                            value={profile.address?.country || ''}
                            onChange={(e) => setProfile({ ...profile, address: { ...profile.address, country: e.target.value } })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            type="text"
                            placeholder="Zip Code"
                            value={profile.address?.zipCode || ''}
                            onChange={(e) => setProfile({ ...profile, address: { ...profile.address, zipCode: e.target.value } })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Tax Info */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                        <FiShield className="inline w-5 h-5 mr-2" />
                        Tax Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                GST Number
                            </label>
                            <input
                                type="text"
                                placeholder="GST Number"
                                value={profile.taxInfo?.gstNumber || ''}
                                onChange={(e) => setProfile({ ...profile, taxInfo: { ...profile.taxInfo, gstNumber: e.target.value } })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                PAN Number
                            </label>
                            <input
                                type="text"
                                placeholder="PAN Number"
                                value={profile.taxInfo?.panNumber || ''}
                                onChange={(e) => setProfile({ ...profile, taxInfo: { ...profile.taxInfo, panNumber: e.target.value } })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center space-x-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50"
                    >
                        <FiSave className="w-5 h-5" />
                        <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                </div>
            </form>
        </div>
    )
}
