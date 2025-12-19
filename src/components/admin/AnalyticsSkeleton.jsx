// components/admin/AnalyticsSkeleton.jsx
'use client'

/**
 * Skeleton loader specifically for Analytics page
 * Matches the structure of the actual analytics page
 */
export default function AnalyticsSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="h-8 bg-gray-200 rounded w-48"></div>
                <div className="h-10 bg-gray-200 rounded w-32"></div>
            </div>

            {/* Main Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-lg shadow p-6">
                        <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
                        <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-20"></div>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-lg shadow p-6">
                        <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
                        <div className="h-64 bg-gray-100 rounded"></div>
                    </div>
                ))}
            </div>

            {/* Predictions Section */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6">
                <div className="h-6 bg-gray-200 rounded w-64 mb-4"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white rounded-lg p-4">
                            <div className="h-5 bg-gray-200 rounded w-40 mb-3"></div>
                            <div className="space-y-2">
                                <div className="h-4 bg-gray-100 rounded"></div>
                                <div className="h-4 bg-gray-100 rounded w-5/6"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
