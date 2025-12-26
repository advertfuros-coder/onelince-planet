// components/product/ProductQA.jsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function ProductQA({ productId }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAskForm, setShowAskForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, [productId]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/products/${productId}/qa?page=1&limit=10`);
      if (response.data.success) {
        setQuestions(response.data.questions);
      }
    } catch (error) {
      console.error('Failed to load questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitQuestion = async (e) => {
    e.preventDefault();

    if (newQuestion.trim().length < 10) {
      toast.error('Question must be at least 10 characters');
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to ask a question');
        return;
      }

      const response = await axios.post(
        `/api/products/${productId}/qa`,
        { question: newQuestion },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('Question posted successfully!');
        setNewQuestion('');
        setShowAskForm(false);
        fetchQuestions();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to post question');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">Questions & Answers</h3>
        <button
          onClick={() => setShowAskForm(!showAskForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
        >
          Ask a Question
        </button>
      </div>

      {/* Ask Question Form */}
      {showAskForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-white rounded-lg border p-6"
        >
          <form onSubmit={handleSubmitQuestion} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Question
              </label>
              <textarea
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="What would you like to know about this product?"
                rows={4}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum 10 characters ({newQuestion.length}/500)
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowAskForm(false);
                  setNewQuestion('');
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || newQuestion.trim().length < 10}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-semibold"
              >
                {submitting ? 'Posting...' : 'Post Question'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Questions List */}
      <div className="space-y-4">
        {questions.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <div className="text-4xl mb-4">❓</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No questions yet</h3>
            <p className="text-gray-600">Be the first to ask about this product!</p>
          </div>
        ) : (
          questions.map((qa) => (
            <QACard key={qa._id} qa={qa} />
          ))
        )}
      </div>
    </div>
  );
}

function QACard({ qa }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border p-6"
    >
      {/* Question */}
      <div className="flex gap-4 mb-4">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
            Q
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-gray-900">
              {qa.question.askedBy?.name || 'Anonymous'}
            </span>
            <span className="text-xs text-gray-500">
              {new Date(qa.question.askedAt).toLocaleDateString()}
            </span>
          </div>
          <p className="text-gray-900">{qa.question.text}</p>
        </div>
      </div>

      {/* Answers */}
      {qa.answers && qa.answers.length > 0 && (
        <div className="ml-14 space-y-4 border-l-2 border-gray-200 pl-6">
          {qa.answers.map((answer, idx) => (
            <div key={idx} className="flex gap-4">
              <div className="flex-shrink-0">
                <div className={`w-10 h-10 rounded-full ${
                  answer.isSeller
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-100 text-gray-600'
                } flex items-center justify-center font-semibold`}>
                  A
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-gray-900">
                    {answer.answeredBy?.name || 'Anonymous'}
                  </span>
                  {answer.isSeller && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full font-semibold">
                      Seller
                    </span>
                  )}
                  {answer.isVerifiedPurchase && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full font-semibold">
                      Verified Purchase
                    </span>
                  )}
                  <span className="text-xs text-gray-500">
                    {new Date(answer.answeredAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700">{answer.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
