// components/product/WriteReviewForm.jsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import cloudinaryService from '@/lib/services/cloudinaryService';

export default function WriteReviewForm({ productId, onSuccess, onCancel }) {
    const [formData, setFormData] = useState({
        rating: 5,
        title: '',
        comment: '',
        photos: [],
        videos: []
    });
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handlePhotoUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploading(true);
        const uploadedPhotos = [];

        for (const file of files) {
            try {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('upload_preset', cloudinaryService.uploadPreset);
                formData.append('folder', 'reviews/photos');

                const response = await axios.post(cloudinaryService.getUploadUrl(), formData);

                uploadedPhotos.push({
                    url: response.data.secure_url,
                    cloudinaryId: response.data.public_id
                });
            } catch (error) {
                console.error('Photo upload error:', error);
                toast.error('Failed to upload photo');
            }
        }

        setFormData(prev => ({
            ...prev,
            photos: [...prev.photos, ...uploadedPhotos]
        }));
        setUploading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title.trim() || !formData.comment.trim()) {
            toast.error('Please fill in all required fields');
            return;
        }

        setSubmitting(true);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                '/api/reviews',
                {
                    productId,
                    ...formData
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                toast.success('Review submitted! It will appear after moderation.');
                onSuccess?.();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg border p-6"
        >
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Write a Review</h3>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Rating */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Rating *
                    </label>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(star => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setFormData({ ...formData, rating: star })}
                                className={`text-4xl transition-colors ${star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'
                                    } hover:text-yellow-400`}
                            >
                                ★
                            </button>
                        ))}
                    </div>
                </div>

                {/* Title */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Review Title *
                    </label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Summarize your experience"
                        maxLength={200}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                {/* Comment */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Review *
                    </label>
                    <textarea
                        value={formData.comment}
                        onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                        placeholder="Tell us about your experience with this product..."
                        rows={6}
                        maxLength={5000}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                        required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        {formData.comment.length} / 5000 characters
                    </p>
                </div>

                {/* Photos */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Add Photos (Optional)
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePhotoUpload}
                        disabled={uploading}
                        className="hidden"
                        id="photo-upload"
                    />
                    <label
                        htmlFor="photo-upload"
                        className={`inline-flex items-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer hover:border-blue-500 transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {uploading ? 'Uploading...' : 'Upload Photos'}
                    </label>

                    {formData.photos.length > 0 && (
                        <div className="grid grid-cols-4 gap-2 mt-3">
                            {formData.photos.map((photo, idx) => (
                                <div key={idx} className="relative group">
                                    <img
                                        src={photo.url}
                                        alt={`Upload ${idx + 1}`}
                                        className="w-full h-24 object-cover rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFormData(prev => ({
                                                ...prev,
                                                photos: prev.photos.filter((_, i) => i !== idx)
                                            }));
                                        }}
                                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={submitting || uploading}
                        className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-semibold"
                    >
                        {submitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                </div>
            </form>
        </motion.div>
    );
}
