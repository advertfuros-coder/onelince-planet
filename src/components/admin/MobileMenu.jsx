'use client'

import { useState } from 'react'
import { FiMenu, FiX } from 'react-icons/fi'
import AdminSidebar from './AdminSidebar'

export default function MobileMenu() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Toggle menu"
                aria-expanded={isOpen}
            >
                {isOpen ? (
                    <FiX size={24} className="text-gray-700" />
                ) : (
                    <FiMenu size={24} className="text-gray-700" />
                )}
            </button>

            {/* Mobile Menu Overlay */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                        onClick={() => setIsOpen(false)}
                        aria-hidden="true"
                    />

                    {/* Sidebar */}
                    <div className="fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:hidden">
                        <AdminSidebar onNavigate={() => setIsOpen(false)} isMobile={true} />
                    </div>
                </>
            )}
        </>
    )
}
