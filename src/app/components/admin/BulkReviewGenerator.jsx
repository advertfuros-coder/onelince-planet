'use client';

import { useState } from 'react';
import { FiUpload, FiDownload, FiZap, FiCheckCircle, FiAlertCircle, FiPackage } from 'react-icons/fi';

export default function BulkReviewGenerator() {
  const [productId, setProductId] = useState('');
  const [reviewCount, setReviewCount] = useState(10);
  const [csvFile, setCsvFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
      setMessage('');
      setResult(null);
    } else {
      setMessage('Please select a valid CSV file');
      setCsvFile(null);
    }
  };

  const handleGenerate = async () => {
    if (!productId.trim()) {
      setMessage('Please enter Product ID');
      return;
    }

    if (!csvFile) {
      setMessage('Please upload CSV file with review templates');
      return;
    }

    setLoading(true);
    setMessage('');
    setResult(null);

    const reader = new FileReader();

    reader.onload = async (e) => {
      const csvData = e.target.result;

      try {
        const response = await fetch('/api/admin/reviews/bulk-generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: productId.trim(),
            reviewCount: reviewCount,
            csvData: csvData
          }),
        });

        const data = await response.json();

        if (data.success) {
          setMessage(`✓ ${data.message}`);
          setResult(data);
          setProductId('');
          setCsvFile(null);
          document.getElementById('csvInput').value = '';
        } else {
          setMessage(`✗ ${data.message}`);
        }
      } catch (error) {
        setMessage('✗ Generation failed: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = () => {
      setMessage('✗ Failed to read CSV file');
      setLoading(false);
    };

    reader.readAsText(csvFile);
  };

  const downloadTemplate = () => {
    const csvContent = `name,rating,title,comment
John Doe,5,Excellent Product!,This product exceeded all my expectations. The quality is outstanding and delivery was fast. Highly recommend!
Jane Smith,5,Amazing quality,Best purchase I've made this year. Worth every penny!
Mike Johnson,4,Very good,Great product overall. Minor improvements needed but still very satisfied.
Sarah Williams,5,Love it!,Absolutely love this product. It's exactly what I was looking for.
David Brown,4,Good value for money,Quality is good considering the price. Would buy again.
Emily Davis,5,Highly recommended,One of the best products in this category. Great features!
Chris Wilson,3,Decent product,It's okay. Does the job but nothing special.
Lisa Anderson,5,Perfect!,Perfect product! No complaints at all. Fast shipping too.
Tom Martinez,4,Satisfied customer,Happy with my purchase. Good quality and works as described.
Anna Taylor,5,Superb quality,Outstanding quality and excellent customer service. Very impressed!
Robert Lee,4,Great purchase,Very pleased with this product. Meets all my requirements.
Jennifer White,5,Fantastic!,Fantastic product! Exceeded my expectations in every way.
James Harris,5,Best in class,This is the best product in its category. No doubt about it.
Mary Clark,4,Good product,Good quality product. Delivery was quick and packaging was secure.
Daniel Lewis,5,Exceptional,Exceptional quality and performance. Worth the investment!
Susan Walker,3,Average,It's an average product. Nothing extraordinary but does the basic job.
Mark Hall,5,Outstanding,Outstanding product! Very happy with the quality and features.
Patricia Young,4,Impressed,Quite impressed with the build quality and attention to detail.
Kevin King,5,Wonderful,Wonderful product! Everything works perfectly as advertised.
Nancy Scott,5,Brilliant,Brilliant purchase! Couldn't be happier with my decision.`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'review_templates.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
            <div className="flex items-center gap-4">
              <FiZap className="text-5xl" />
              <div>
                <h1 className="text-3xl font-bold mb-2">Bulk Review Generator</h1>
                <p className="text-blue-100">Generate multiple reviews for any product instantly</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            {/* Product ID Input */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                <FiPackage className="text-blue-600" />
                Product ID
              </label>
              <input
                type="text"
                placeholder="Enter Product ID (e.g., 67123abc456def789012345)"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              <p className="text-xs text-gray-500 mt-1">Enter the MongoDB ObjectId of the product</p>
            </div>

            {/* Review Count Selection */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Number of Reviews to Generate
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[10, 20, 50, 100].map(count => (
                  <button
                    key={count}
                    onClick={() => setReviewCount(count)}
                    className={`px-6 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105 ${
                      reviewCount === count
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>

            {/* CSV Template Download */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <FiDownload className="text-2xl text-blue-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 mb-2">Step 1: Download Template</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Download the CSV template with sample review data. Customize names, ratings, titles, and comments.
                  </p>
                  <button
                    onClick={downloadTemplate}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    Download CSV Template
                  </button>
                </div>
              </div>
            </div>

            {/* CSV Upload */}
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <FiUpload className="text-2xl text-green-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 mb-2">Step 2: Upload CSV File</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Upload your customized CSV file with review templates.
                  </p>
                  <input
                    id="csvInput"
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-600
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-lg file:border-0
                      file:text-sm file:font-semibold
                      file:bg-green-600 file:text-white
                      hover:file:bg-green-700
                      cursor-pointer"
                  />
                  {csvFile && (
                    <div className="flex items-center gap-2 mt-3 p-2 bg-white rounded-lg border border-green-300">
                      <FiCheckCircle className="text-green-600" />
                      <span className="text-sm text-green-700 font-medium">{csvFile.name}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={!productId || !csvFile || loading}
              className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 shadow-lg font-bold text-lg"
            >
              <FiZap className="text-2xl" />
              <span>{loading ? 'Generating Reviews...' : `Generate ${reviewCount} Reviews`}</span>
            </button>

            {/* Message Display */}
            {message && (
              <div className={`flex items-start gap-3 p-4 rounded-lg ${
                message.includes('✓')
                  ? 'bg-green-50 border-2 border-green-200'
                  : 'bg-red-50 border-2 border-red-200'
              }`}>
                {message.includes('✓')
                  ? <FiCheckCircle className="text-green-600 text-2xl flex-shrink-0 mt-0.5" />
                  : <FiAlertCircle className="text-red-600 text-2xl flex-shrink-0 mt-0.5" />
                }
                <span className={`font-medium ${
                  message.includes('✓') ? 'text-green-700' : 'text-red-700'
                }`}>
                  {message}
                </span>
              </div>
            )}

            {/* Result Display */}
            {result && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-6">
                <h3 className="font-bold text-xl text-gray-800 mb-4 flex items-center gap-2">
                  <FiCheckCircle className="text-green-600 text-2xl" />
                  Generation Complete!
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Reviews Created</p>
                    <p className="text-3xl font-bold text-blue-600">{result.insertedCount}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Total Reviews</p>
                    <p className="text-3xl font-bold text-green-600">{result.newRating?.count || 0}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg col-span-2">
                    <p className="text-sm text-gray-600">New Average Rating</p>
                    <div className="flex items-center gap-2">
                      <p className="text-3xl font-bold text-yellow-600">{result.newRating?.average || 0}</p>
                      <span className="text-2xl">⭐</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Info Box */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-bold text-gray-800 mb-2">How it works:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">1.</span>
                  <span>System creates dummy user accounts for each review</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">2.</span>
                  <span>Reviews are rotated from your CSV templates</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">3.</span>
                  <span>All reviews marked as Verified Purchase & Auto-approved</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">4.</span>
                  <span>Product rating automatically updated</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
