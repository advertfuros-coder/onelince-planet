'use client'

import { FiX, FiTrash2, FiEdit, FiDownload, FiCheckCircle } from 'react-icons/fi'
import clsx from 'clsx'

/**
 * Bulk Action Bar
 * Shows when items are selected with action buttons
 * Inspired by Gmail, Notion, and Airtable bulk actions
 */
export default function BulkActionBar({
    selectedCount,
    onClear,
    onDelete,
    onExport,
    onUpdate,
    actions = [],
    className = '',
}) {
    if (selectedCount === 0) return null

    return (
        <div
            className={clsx(
                'fixed bottom-6 left-1/2 -translate-x-1/2 z-50',
                'bg-gray-900 text-white rounded-xl shadow-2xl',
                'px-6 py-4 flex items-center space-x-4',
                'animate-slide-up',
                className
            )}
        >
            {/* Selected Count */}
            <div className="flex items-center space-x-2">
                <FiCheckCircle className="text-blue-400" size={20} />
                <span className="font-semibold">
                    {selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
                </span>
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-gray-700" />

            {/* Actions */}
            <div className="flex items-center space-x-2">
                {/* Export */}
                {onExport && (
                    <button
                        onClick={onExport}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                        title="Export to CSV"
                    >
                        <FiDownload size={18} />
                        <span className="hidden sm:inline">Export</span>
                    </button>
                )}

                {/* Update */}
                {onUpdate && (
                    <button
                        onClick={onUpdate}
                        className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                        title="Update selected"
                    >
                        <FiEdit size={18} />
                        <span className="hidden sm:inline">Update</span>
                    </button>
                )}

                {/* Delete */}
                {onDelete && (
                    <button
                        onClick={onDelete}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                        title="Delete selected"
                    >
                        <FiTrash2 size={18} />
                        <span className="hidden sm:inline">Delete</span>
                    </button>
                )}

                {/* Custom Actions */}
                {actions.map((action, idx) => (
                    <button
                        key={idx}
                        onClick={action.onClick}
                        className={clsx(
                            'flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors',
                            action.className || 'bg-gray-700 hover:bg-gray-600'
                        )}
                        title={action.title}
                    >
                        {action.icon && <span>{action.icon}</span>}
                        <span className="hidden sm:inline">{action.label}</span>
                    </button>
                ))}
            </div>

            {/* Clear Selection */}
            <button
                onClick={onClear}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                title="Clear selection"
            >
                <FiX size={20} />
            </button>
        </div>
    )
}

// Add animation to globals.css
const AnimationCSS = `
@keyframes slide-up {
  from {
    transform: translate(-50%, 20px);
    opacity: 0;
  }
  to {
    transform: translate(-50%, 0);
    opacity: 1;
  }
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}
`
