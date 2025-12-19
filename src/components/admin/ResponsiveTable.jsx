// components/admin/ResponsiveTable.jsx
'use client'

import clsx from 'clsx'

/**
 * Responsive table wrapper with horizontal scroll on mobile
 * Sticky header and optimized for touch interactions
 */
export default function ResponsiveTable({
    children,
    className = '',
    stickyHeader = true
}) {
    return (
        <div className={clsx(
            'w-full overflow-x-auto',
            '-mx-4 md:mx-0', // Negative margin on mobile to use full width
            'scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100'
        )}>
            <div className="inline-block min-w-full align-middle px-4 md:px-0">
                <div className={className}>
                    {children}
                </div>
            </div>

            {/* Scroll indicator for mobile */}
            <div className="md:hidden mt-2 text-center">
                <p className="text-xs text-gray-400">← Swipe to see more →</p>
            </div>
        </div>
    )
}

/**
 * Table component optimized for mobile
 */
export function MobileOptimizedTable({ headers, data, renderRow }) {
    return (
        <ResponsiveTable>
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                    <tr>
                        {headers.map((header, idx) => (
                            <th
                                key={idx}
                                className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap"
                            >
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data && data.length > 0 ? (
                        data.map((item, idx) => renderRow(item, idx))
                    ) : (
                        <tr>
                            <td
                                colSpan={headers.length}
                                className="px-6 py-8 text-center text-gray-400"
                            >
                                No data available
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </ResponsiveTable>
    )
}
