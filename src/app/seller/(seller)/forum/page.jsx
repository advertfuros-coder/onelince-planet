// app/seller/(seller)/forum/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import axios from 'axios'
import Link from 'next/link'
import {
    FiMessageSquare,
    FiTrendingUp,
    FiUsers,
    FiStar,
    FiThumbsUp,
    FiMessageCircle,
    FiPlus,
} from 'react-icons/fi'
import { toast } from 'react-hot-toast'

const categories = [
    { id: 'all', name: 'All Posts', icon: '📋', color: 'gray' },
    { id: 'getting_started', name: 'Getting Started', icon: '🚀', color: 'blue' },
    { id: 'marketing', name: 'Marketing', icon: '📢', color: 'purple' },
    { id: 'operations', name: 'Operations', icon: '⚙️', color: 'green' },
    { id: 'technical', name: 'Technical', icon: '💻', color: 'indigo' },
    { id: 'success_stories', name: 'Success Stories', icon: '🏆', color: 'yellow' },
    { id: 'questions', name: 'Q&A', icon: '❓', color: 'red' },
]

export default function ForumPage() {
    const { token } = useAuth()
    const [posts, setPosts] = useState([])
    const [stats, setStats] = useState({})
    const [loading, setLoading] = useState(true)
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        if (token) fetchPosts()
    }, [token, selectedCategory, searchQuery])

    async function fetchPosts() {
        try {
            setLoading(true)
            const params = new URLSearchParams()
            if (selectedCategory !== 'all') params.append('category', selectedCategory)
            if (searchQuery) params.append('search', searchQuery)

            const res = await axios.get(`/api/forum/posts?${params}`)

            if (res.data.success) {
                setPosts(res.data.posts)
                setStats(res.data.stats)
            }
        } catch (error) {
            console.error('Error fetching posts:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">💬 Seller Community Forum</h1>
                        <p className="mt-2 text-indigo-100">Connect, learn, and grow with fellow sellers</p>
                    </div>
                    <Link
                        href="/seller/forum/new"
                        className="flex items-center space-x-2 px-6 py-3 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 font-semibold shadow-lg transition-all"
                    >
                        <FiPlus />
                        <span>New Post</span>
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard icon={<FiMessageSquare />} label="Total Posts" value={stats.total || 0} color="blue" />
                <StatCard icon={<FiUsers />} label="Active Members" value="1,234" color="green" />
                <StatCard icon={<FiTrendingUp />} label="Today's Posts" value="45" color="purple" />
                <StatCard icon={<FiStar />} label="Helpful Answers" value="892" color="yellow" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Categories Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <h3 className="font-bold text-gray-900 mb-4">Categories</h3>
                        <div className="space-y-2">
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => setSelectedCategory(category.id)}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${selectedCategory === category.id
                                            ? 'bg-indigo-100 text-indigo-700'
                                            : 'hover:bg-gray-100 text-gray-700'
                                        }`}
                                >
                                    <span className="text-2xl">{category.icon}</span>
                                    <span className="font-medium">{category.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Posts List */}
                <div className="lg:col-span-3 space-y-4">
                    {/* Search */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <input
                            type="text"
                            placeholder="Search discussions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Posts */}
                    {posts.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                            <FiMessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No posts yet</h3>
                            <p className="text-gray-600 mb-6">Be the first to start a discussion!</p>
                            <Link
                                href="/seller/forum/new"
                                className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold"
                            >
                                Create First Post
                            </Link>
                        </div>
                    ) : (
                        posts.map((post) => (
                            <PostCard key={post._id} post={post} />
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}

function PostCard({ post }) {
    const categoryInfo = categories.find(c => c.id === post.category) || categories[0]

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
            <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-2xl">{categoryInfo.icon}</span>
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                            <Link href={`/seller/forum/${post.slug}`} className="hover:text-indigo-600">
                                <h3 className="text-lg font-bold text-gray-900 mb-1">{post.title}</h3>
                            </Link>
                            <div className="flex items-center space-x-3 text-sm text-gray-600">
                                <span>by {post.authorId?.name || 'Anonymous'}</span>
                                <span>•</span>
                                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                                    {categoryInfo.name}
                                </span>
                            </div>
                        </div>
                        {post.isPinned && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-semibold">
                                Pinned
                            </span>
                        )}
                    </div>

                    <p className="text-gray-700 mb-4 line-clamp-2">{post.content}</p>

                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                            <FiThumbsUp className="w-4 h-4" />
                            <span>{post.likes?.length || 0} likes</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <FiMessageCircle className="w-4 h-4" />
                            <span>{post.replyCount || 0} replies</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <FiUsers className="w-4 h-4" />
                            <span>{post.views || 0} views</span>
                        </div>
                    </div>
                </div>
            </div>
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
