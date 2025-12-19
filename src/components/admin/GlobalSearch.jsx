'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { FiSearch, FiX, FiClock, FiTrendingUp } from 'react-icons/fi'
import { useRouter } from 'next/navigation'
import clsx from 'clsx'

/**
 * Global Search Component (Cmd+K)
 * Inspired by Shopify, Linear, and Notion command palettes
 */
export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [recentSearches, setRecentSearches] = useState([])
  const inputRef = useRef(null)
  const router = useRouter()

  // Keyboard shortcut: Cmd+K (Mac) or Ctrl+K (Windows)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
    if (!isOpen) {
      setQuery('')
      setResults([])
      setSelectedIndex(0)
    }
  }, [isOpen])

  // Load recent searches from localStorage
  useEffect(() => {
    const recent = JSON.parse(localStorage.getItem('adminRecentSearches') || '[]')
    setRecentSearches(recent.slice(0, 5))
  }, [isOpen])

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    const timeoutId = setTimeout(async () => {
      try {
        // Search across multiple entities
        const response = await fetch(`/api/admin/search?q=${encodeURIComponent(query)}`)
        const data = await response.json()
        setResults(data.results || [])
      } catch (error) {
        console.error('Search error:', error)
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300) // 300ms debounce

    return () => clearTimeout(timeoutId)
  }, [query])

  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (!results.length) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % results.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex])
      }
    }
  }, [results, selectedIndex])

  const handleSelect = (result) => {
    // Save to recent searches
    const recent = JSON.parse(localStorage.getItem('adminRecentSearches') || '[]')
    const newRecent = [
      { query, result },
      ...recent.filter(r => r.query !== query)
    ].slice(0, 10)
    localStorage.setItem('adminRecentSearches', JSON.stringify(newRecent))

    // Navigate to result
    router.push(result.url)
    setIsOpen(false)
  }

  const clearRecentSearches = () => {
    localStorage.removeItem('adminRecentSearches')
    setRecentSearches([])
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      {/* Search Modal */}
      <div className="relative min-h-screen flex items-start justify-center p-4 pt-[10vh]">
        <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden animate-fade-in">
          {/* Search Input */}
          <div className="flex items-center px-4 py-4 border-b border-gray-200">
            <FiSearch className="text-gray-400 mr-3" size={20} />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search orders, products, sellers, users..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 outline-none text-lg"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <FiX size={20} className="text-gray-400" />
              </button>
            )}
            <kbd className="hidden sm:block ml-2 px-2 py-1 text-xs bg-gray-100 border border-gray-300 rounded">
              ESC
            </kbd>
          </div>

          {/* Results or Recent Searches */}
          <div className="max-h-[60vh] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-2 text-sm text-gray-500">Searching...</p>
              </div>
            ) : query && results.length > 0 ? (
              <div className="py-2">
                {results.map((result, index) => (
                  <button
                    key={result.id}
                    onClick={() => handleSelect(result)}
                    className={clsx(
                      'w-full px-4 py-3 flex items-center space-x-3 text-left transition-colors',
                      selectedIndex === index
                        ? 'bg-blue-50 border-l-4 border-blue-600'
                        : 'hover:bg-gray-50'
                    )}
                  >
                    <div
                      className={clsx(
                        'w-10 h-10 rounded-lg flex items-center justify-center text-white',
                        result.type === 'order' && 'bg-blue-500',
                        result.type === 'product' && 'bg-green-500',
                        result.type === 'seller' && 'bg-purple-500',
                        result.type === 'user' && 'bg-orange-500'
                      )}
                    >
                      {result.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{result.title}</p>
                      <p className="text-sm text-gray-500 truncate">{result.subtitle}</p>
                    </div>
                    <span className="text-xs text-gray-400 uppercase">{result.type}</span>
                  </button>
                ))}
              </div>
            ) : query && !loading ? (
              <div className="p-8 text-center text-gray-500">
                No results found for "{query}"
              </div>
            ) : recentSearches.length > 0 ? (
              <div className="py-2">
                <div className="px-4 py-2 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <FiClock size={16} />
                    <span>Recent Searches</span>
                  </div>
                  <button
                    onClick={clearRecentSearches}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    Clear
                  </button>
                </div>
                {recentSearches.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setQuery(item.query)
                      if (item.result) {
                        handleSelect(item.result)
                      }
                    }}
                    className="w-full px-4 py-3 flex items-center space-x-3 text-left hover:bg-gray-50"
                  >
                    <FiClock className="text-gray-400" size={16} />
                    <span className="flex-1 text-gray-700">{item.query}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <FiSearch className="mx-auto text-gray-300 mb-3" size={48} />
                <p className="text-gray-500">Start typing to search...</p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <QuickFilter label="Orders" onClick={() => setQuery('order')} />
                  <QuickFilter label="Products" onClick={() => setQuery('product')} />
                  <QuickFilter label="Sellers" onClick={() => setQuery('seller')} />
                  <QuickFilter label="Users" onClick={() => setQuery('user')} />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1">
                <kbd className="px-2 py-1 bg-white border border-gray-300 rounded">↑↓</kbd>
                <span>Navigate</span>
              </span>
              <span className="flex items-center space-x-1">
                <kbd className="px-2 py-1 bg-white border border-gray-300 rounded">↵</kbd>
                <span>Select</span>
              </span>
            </div>
            <span className="flex items-center space-x-1">
              <kbd className="px-2 py-1 bg-white border border-gray-300 rounded">⌘K</kbd>
              <span>to open</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function QuickFilter({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-colors"
    >
      {label}
    </button>
  )
}
