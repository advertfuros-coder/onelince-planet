'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/AuthContext'
import { FiArrowLeft, FiPlus, FiMapPin, FiEdit2, FiTrash2, FiMoreVertical } from 'react-icons/fi'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import Button from '@/components/ui/Button'

export default function AddressesPage() {
    const router = useRouter()
    const { token, isAuthenticated } = useAuth()
    const [addresses, setAddresses] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        fetchAddresses()
    }, [isAuthenticated])

    const fetchAddresses = async () => {
        try {
            setLoading(true)
            const res = await axios.get('/api/customer/profile', {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.data.success) {
                setAddresses(res.data.user.addresses || [])
            }
        } catch (error) {
            console.error('Failed to fetch addresses:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100 shadow-sm lg:hidden">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.push('/profile')} className="p-1">
                        <FiArrowLeft className="w-5 h-5 text-gray-800" />
                    </button>
                    <h1 className="text-sm font-semibold text-gray-800">My Addresses</h1>
                </div>
                <button className="p-1">
                    <FiPlus className="w-5 h-5 text-blue-600" />
                </button>
            </div>

            <div className="max-w-4xl mx-auto lg:py-10 lg:px-4 px-4 py-6">
                <div className="flex items-center justify-between mb-8 hidden lg:flex">
                    <h1 className="text-2xl font-semibold">My Addresses</h1>
                    <Button onClick={() => { }}>
                        <FiPlus className="mr-2" /> Add New Address
                    </Button>
                </div>

                {loading ? (
                    <div className="py-20 flex justify-center">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : addresses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {addresses.map((address, idx) => (
                            <div key={idx} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm relative group overflow-hidden">
                                <div className="flex items-start justify-between">
                                    <div className="bg-blue-50 text-blue-600 p-2 rounded-xl mb-4">
                                        <FiMapPin className="w-5 h-5" />
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                                            <FiEdit2 className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                                            <FiTrash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="font-semibold text-gray-900 text-lg">{address.name}</h3>
                                <p className="text-[13px] text-gray-500 mt-2 leading-relaxed">
                                    {address.addressLine1}, {address.addressLine2 && `${address.addressLine2}, `}
                                    {address.city}, {address.state} - {address.pincode}
                                </p>
                                <p className="text-xs font-semibold text-gray-400 mt-4 uppercase tracking-wider">
                                    Phone: <span className="text-gray-900">{address.phone}</span>
                                </p>

                                {address.isDefault && (
                                    <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-semibold px-4 py-1.5 rounded-bl-2xl uppercase tracking-widest shadow-lg">
                                        Default
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-gray-200">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FiMapPin className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="text-gray-500 font-semibold text-lg">No addresses saved yet</p>
                        <p className="text-gray-400 text-sm mt-1">Add your address for faster checkout</p>
                        <button className="mt-6 px-8 py-3 bg-blue-600 text-white rounded-2xl font-semibold shadow-lg shadow-blue-200">
                            Add Your First Address
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
