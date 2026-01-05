'use client';

import { useState } from 'react';
import { FiSend, FiTrash2, FiPlusCircle, FiStar } from 'react-icons/fi';

export default function ManualBulkReviews() {
  const [reviewCount, setReviewCount] = useState(10);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState([]);

  const generateEmptyReviews = (count) => {
    return Array.from({ length: count }, (_, index) => ({
      id: Date.now() + index,
      productId: '',
      userId: '',
      orderId: '',
      rating: 5,
      title: '',
      comment: '',
      images: [],
      isApproved: true,
      isVerifiedPurchase: false,
      helpful: 0,
      unhelpful: 0,
    }));
  };

  const handleCountChange = (count) => {
    setReviewCount(count);
    setReviews(generateEmptyReviews(count));
    setMessage('');
    setErrors([]);
  };

  const updateReview = (index, field, value) => {
    const updated = [...reviews];
    updated[index][field] = value;
    setReviews(updated);
  };

  const removeReview = (index) => {
    const updated = reviews.filter((_, i) => i !== index);
    setReviews(updated);
    setReviewCount(updated.length);
  };

  const addImageUrl = (index) => {
    const url = prompt('Enter image URL:');
    if (url) {
      const updated = [...reviews];
      updated[index].images.push(url);
      setReviews(updated);
    }
  };

  const removeImage = (reviewIndex, imageIndex) => {
    const updated = [...reviews];
    updated[reviewIndex].images.splice(imageIndex, 1);
    setReviews(updated);
  };

  const validateReviews = () => {
    const validationErrors = [];
    
    for (let i = 0; i < reviews.length; i++) {
      const review = reviews[i];
      
      if (!review.productId || review.productId.trim() === '') {
        validationErrors.push(`Review #${i + 1}: Product ID is required`);
      }
      if (!review.userId || review.userId.trim() === '') {
        validationErrors.push(`Review #${i + 1}: User ID is required`);
      }
      if (!review.title || review.title.trim() === '') {
        validationErrors.push(`Review #${i + 1}: Title is required`);
      }
      if (!review.comment || review.comment.trim() === '') {
        validationErrors.push(`Review #${i + 1}: Comment is required`);
      }
    }

    setErrors(validationErrors);
    return validationErrors.length === 0;
  };

  const handleSubmit = async () => {
    if (!validateReviews()) {
      setMessage('✗ Please fix validation errors');
      return;
    }

    setLoading(true);
    setMessage('');
    setErrors([]);

    try {
      const response = await fetch('/api/admin/reviews/bulk-add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          reviews: reviews.map(({ id, ...rest }) => rest), 
          importType: 'manual' 
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage(`✓ ${data.message}`);
        setReviews([]);
        setReviewCount(10);
      } else {
        setMessage(`✗ ${data.message}`);
        if (data.errors) {
          setErrors(data.errors);
        }
      }
    } catch (error) {
      setMessage('✗ Failed to add reviews: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Manual Entry</h2>
        <FiPlusCircle className="text-3xl text-green-600" />
      </div>
      
      <div className="flex flex-wrap gap-2 mb-6">
        {[10, 20, 50, 100].map(count => (
          <button
            key={count}
            onClick={() => handleCountChange(count)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              reviewCount === count 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {count} Reviews
          </button>
        ))}
      </div>

      {reviews.length > 0 && (
        <>
          <div className="space-y-4 max-h-[500px] overflow-y-auto mb-6 pr-2">
            {reviews.map((review, index) => (
              <div key={review.id} className="border border-gray-200 p-4 rounded-lg bg-gray-50">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-lg text-gray-800">Review #{index + 1}</h3>
                  <button
                    onClick={() => removeReview(index)}
                    className="text-red-600 hover:text-red-800 transition-colors p-2"
                    title="Remove review"
                  >
                    <FiTrash2 className="text-xl" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Product ID *</label>
                    <input
                      placeholder="e.g., 67123abc456def789012345"
                      value={review.productId}
                      onChange={(e) => updateReview(index, 'productId', e.target.value)}
                      className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">User ID *</label>
                    <input
                      placeholder="e.g., 67123abc456def789012346"
                      value={review.userId}
                      onChange={(e) => updateReview(index, 'userId', e.target.value)}
                      className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Order ID (optional)</label>
                    <input
                      placeholder="e.g., 67123abc456def789012347"
                      value={review.orderId}
                      onChange={(e) => updateReview(index, 'orderId', e.target.value)}
                      className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Rating *</label>
                    <select
                      value={review.rating}
                      onChange={(e) => updateReview(index, 'rating', parseInt(e.target.value))}
                      className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      {[5, 4, 3, 2, 1].map(r => (
                        <option key={r} value={r}>
                          {'⭐'.repeat(r)} ({r} Star{r > 1 ? 's' : ''})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Review Title *</label>
                    <input
                      placeholder="e.g., Excellent Product!"
                      value={review.title}
                      onChange={(e) => updateReview(index, 'title', e.target.value)}
                      className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Review Comment *</label>
                    <textarea
                      placeholder="Write detailed review comment..."
                      value={review.comment}
                      onChange={(e) => updateReview(index, 'comment', e.target.value)}
                      className="w-full border border-gray-300 p-2 rounded-lg h-24 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Images</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {review.images.map((img, imgIndex) => (
                        <div key={imgIndex} className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded text-xs">
                          <span className="truncate max-w-[150px]">{img}</span>
                          <button
                            onClick={() => removeImage(index, imgIndex)}
                            className="text-red-600 hover:text-red-800"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => addImageUrl(index)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      + Add Image URL
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={review.isApproved}
                        onChange={(e) => updateReview(index, 'isApproved', e.target.checked)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-700">Approved</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={review.isVerifiedPurchase}
                        onChange={(e) => updateReview(index, 'isVerifiedPurchase', e.target.checked)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-700">Verified Purchase</span>
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">Helpful</label>
                      <input
                        type="number"
                        min="0"
                        value={review.helpful}
                        onChange={(e) => updateReview(index, 'helpful', parseInt(e.target.value) || 0)}
                        className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">Unhelpful</label>
                      <input
                        type="number"
                        min="0"
                        value={review.unhelpful}
                        onChange={(e) => updateReview(index, 'unhelpful', parseInt(e.target.value) || 0)}
                        className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || reviews.length === 0}
            className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            <FiSend className="text-lg" />
            <span>{loading ? 'Submitting...' : `Add ${reviews.length} Review${reviews.length > 1 ? 's' : ''}`}</span>
          </button>
        </>
      )}

      {message && (
        <div className={`mt-4 p-4 rounded-lg ${
          message.includes('✓') 
            ? 'bg-green-50 border border-green-200 text-green-700' 
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message}
        </div>
      )}

      {errors.length > 0 && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="font-semibold text-red-800 mb-2">Validation Errors:</h3>
          <ul className="list-disc list-inside space-y-1">
            {errors.map((error, index) => (
              <li key={index} className="text-sm text-red-700">{error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
