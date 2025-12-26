// components/product/ProductReviews.jsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function ProductReviews({ productId }) {
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        rating: null,
        verified: false,
        withMedia: false,
        sort: 'recent'
    });
    const [page, setPage] = useState(1);

    useEffect(() => {
        fetchReviews();
    }, [filters, page]);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                productId,
                page: page.toString(),
                limit: '10',
                sort: filters.sort
            });

            if (filters.rating) params.append('rating', filters.rating);
            if (filters.verified) params.append('verified', 'true');
            if (filters.withMedia) params.append('withMedia', 'true');

            const response = await axios.get(`/api/reviews?${params}`);

            if (response.data.success) {
                setReviews(response.data.reviews);
                setStats(response.data.stats);
            }
        } catch (error) {
            toast.error('Failed to load reviews');
        } finally {
            setLoading(false);
        }
    };

    const handleHelpful = async (reviewId, helpful) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Please login to vote');
                return;
            }

            await axios.post(
                `/api/reviews/${reviewId}/helpful`,
                { helpful },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success('Thank you for your feedback!');
            fetchReviews();
        } catch (error) {
            toast.error('Failed to submit vote');
        }
    };

    if (loading && page === 1) {
        return (
            <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Overview */}
            {stats && (
                <div className="bg-white rounded-lg border p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Average Rating */}
                        <div className="text-center">
                            <div className="text-5xl font-bold text-gray-900 mb-2">
                                {stats.averageRating.toFixed(1)}
                            </div>
                            <div className="flex justify-center mb-2">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <span
                                        key={star}
                                        className={`text-2xl ${star <= Math.round(stats.averageRating)
                                                ? 'text-yellow-400'
                                                : 'text-gray-300'
                                            }`}
                                    >
                                        ★
                                    </span>
                                ))}
                            </div>
                            <p className="text-gray-600">{stats.totalReviews} reviews</p>
                        </div>

                        {/* Rating Distribution */}
                        <div className="space-y-2">
                            {[5, 4, 3, 2, 1].map(rating => (
                                <button
                                    key={rating}
                                    onClick={() => setFilters({ ...filters, rating: filters.rating === rating ? null : rating })}
                                    className={`w-full flex items-center gap-3 hover:bg-gray-50 p-2 rounded transition-colors ${filters.rating === rating ? 'bg-blue-50' : ''
                                        }`}
                                >
                                    <span className="text-sm font-medium w-8">{rating} ★</span>
                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-yellow-400 h-2 rounded-full transition-all"
                                            style={{
                                                width: `${((stats.distribution[rating] || 0) / stats.totalReviews) * 100}%`
                                            }}
                                        />
                                    </div>
                                    <span className="text-sm text-gray-600 w-12 text-right">
                                        {stats.distribution[rating] || 0}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <select
                    value={filters.sort}
                    onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                    <option value="recent">Most Recent</option>
                    <option value="helpful">Most Helpful</option>
                    <option value="rating">Highest Rating</option>
                </select>

                <label className="flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                        type="checkbox"
                        checked={filters.verified}
                        onChange={(e) => setFilters({ ...filters, verified: e.target.checked })}
                        className="rounded"
                    />
                    <span className="text-sm">Verified Purchase Only</span>
                </label>

                <label className="flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                        type="checkbox"
                        checked={filters.withMedia}
                        onChange={(e) => setFilters({ ...filters, withMedia: e.target.checked })}
                        className="rounded"
                    />
                    <span className="text-sm">With Photos/Videos</span>
                </label>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
                {reviews.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <div className="text-4xl mb-4">📝</div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews yet</h3>
                        <p className="text-gray-600">Be the first to review this product!</p>
                    </div>
                ) : (
                    reviews.map(review => (
                        <ReviewCard
                            key={review._id}
                            review={review}
                            onHelpful={handleHelpful}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

function ReviewCard({ review, onHelpful }) {
    const [showFullComment, setShowFullComment] = useState(false);
    const isLong = review.comment.length > 300;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg border p-6"
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold">
                        {review.userId?.name?.[0] || 'U'}
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-900">{review.userId?.name || 'Anonymous'}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            {review.verifiedPurchase && (
                                <span className="inline-flex items-center gap-1 text-green-600">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Verified Purchase
                                </span>
                            )}
                            <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                {/* Rating */}
                <div className="flex">
                    {[1, 2, 3, 4, 5].map(star => (
                        <span
                            key={star}
                            className={`text-xl ${star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                        >
                            ★
                        </span>
                    ))}
                </div>
            </div>

            {/* Title */}
            <h3 className="font-semibold text-gray-900 mb-2">{review.title}</h3>

            {/* Comment */}
            <p className="text-gray-700 mb-4">
                {isLong && !showFullComment
                    ? `${review.comment.substring(0, 300)}...`
                    : review.comment}
                {isLong && (
                    <button
                        onClick={() => setShowFullComment(!showFullComment)}
                        className="text-blue-600 hover:underline ml-2"
                    >
                        {showFullComment ? 'Show less' : 'Read more'}
                    </button>
                )}
            </p>

            {/* Photos */}
            {review.photos && review.photos.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mb-4">
                    {review.photos.map((photo, idx) => (
                        <img
                            key={idx}
                            src={photo.url}
                            alt={photo.caption || 'Review photo'}
                            className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity"
                        />
                    ))}
                </div>
            )}

            {/* Seller Response */}
            {review.sellerResponse && (
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-semibold text-blue-900">Seller Response</span>
                        <span className="text-xs text-blue-700">
                            {new Date(review.sellerResponse.respondedAt).toLocaleDateString()}
                        </span>
                    </div>
                    <p className="text-blue-900 text-sm">{review.sellerResponse.comment}</p>
                </div>
            )}

            {/* Helpful Voting */}
            <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-600">Was this helpful?</span>
                <button
                    onClick={() => onHelpful(review._id, true)}
                    className="flex items-center gap-1 text-gray-700 hover:text-green-600 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                    <span>Yes ({review.helpful.count})</span>
                </button>
                <button
                    onClick={() => onHelpful(review._id, false)}
                    className="flex items-center gap-1 text-gray-700 hover:text-red-600 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                    </svg>
                    <span>No ({review.notHelpful.count})</span>
                </button>
            </div>
        </motion.div>
    );
}
