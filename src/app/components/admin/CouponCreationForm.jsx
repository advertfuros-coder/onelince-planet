'use client';

import { useState } from 'react';
import { 
  FiPercent, FiDollarSign, FiTruck, FiCalendar, 
  FiUsers, FiPackage, FiTag, FiCheck, FiX 
} from 'react-icons/fi';

export default function CouponCreationForm({ onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    maxDiscountAmount: '',
    scope: 'platform',
    sellerId: '',
    applicableProducts: [],
    applicableCategories: [],
    minPurchaseAmount: '0',
    minItemQuantity: '1',
    totalUsageLimit: '',
    perUserLimit: '1',
    startDate: '',
    endDate: '',
    userEligibility: 'all',
    specificUserEmails: [],
    specificUsers: [],
    isActive: true,
  });

  const [productIdInput, setProductIdInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('');
  const [emailInput, setEmailInput] = useState('');

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addProductId = () => {
    if (productIdInput.trim()) {
      setFormData(prev => ({
        ...prev,
        applicableProducts: [...prev.applicableProducts, productIdInput.trim()]
      }));
      setProductIdInput('');
    }
  };

  const removeProductId = (index) => {
    setFormData(prev => ({
      ...prev,
      applicableProducts: prev.applicableProducts.filter((_, i) => i !== index)
    }));
  };

  const addCategory = () => {
    if (categoryInput.trim()) {
      setFormData(prev => ({
        ...prev,
        applicableCategories: [...prev.applicableCategories, categoryInput.trim()]
      }));
      setCategoryInput('');
    }
  };

  const removeCategory = (index) => {
    setFormData(prev => ({
      ...prev,
      applicableCategories: prev.applicableCategories.filter((_, i) => i !== index)
    }));
  };

  const addEmail = () => {
    if (emailInput.trim() && emailInput.includes('@')) {
      setFormData(prev => ({
        ...prev,
        specificUserEmails: [...prev.specificUserEmails, emailInput.trim()]
      }));
      setEmailInput('');
    }
  };

  const removeEmail = (index) => {
    setFormData(prev => ({
      ...prev,
      specificUserEmails: prev.specificUserEmails.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/coupons/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setMessage('✓ Coupon created successfully!');
        // Reset form
        setFormData({
          code: '',
          description: '',
          discountType: 'percentage',
          discountValue: '',
          maxDiscountAmount: '',
          scope: 'platform',
          sellerId: '',
          applicableProducts: [],
          applicableCategories: [],
          minPurchaseAmount: '0',
          minItemQuantity: '1',
          totalUsageLimit: '',
          perUserLimit: '1',
          startDate: '',
          endDate: '',
          userEligibility: 'all',
          specificUserEmails: [],
          specificUsers: [],
          isActive: true,
        });
        if (onSuccess) onSuccess(data.coupon);
      } else {
        setMessage(`✗ ${data.message}`);
      }
    } catch (error) {
      setMessage(`✗ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h2 className="text-3xl font-semibold text-gray-800 flex items-center gap-3">
          <FiTag className="text-blue-600" />
          Create New Coupon
        </h2>
        <p className="text-gray-600 mt-1">Configure all coupon settings below</p>
      </div>

      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <FiTag className="text-blue-600" />
          Basic Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Coupon Code *
            </label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
              placeholder="e.g., SUMMER2025"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.isActive}
              onChange={(e) => handleChange('isActive', e.target.value === 'true')}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            required
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Describe the coupon offer..."
            rows="3"
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Discount Configuration */}
      <div className="space-y-4 bg-blue-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <FiPercent className="text-blue-600" />
          Discount Configuration
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Discount Type *
            </label>
            <select
              value={formData.discountType}
              onChange={(e) => handleChange('discountType', e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="percentage">Percentage Off (%)</option>
              <option value="fixed">Fixed Amount Off (₹)</option>
              <option value="free_shipping">Free Shipping</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Discount Value *
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.discountValue}
              onChange={(e) => handleChange('discountValue', e.target.value)}
              placeholder={formData.discountType === 'percentage' ? 'e.g., 20' : 'e.g., 500'}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {formData.discountType === 'percentage' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Max Discount (₹)
              </label>
              <input
                type="number"
                min="0"
                value={formData.maxDiscountAmount}
                onChange={(e) => handleChange('maxDiscountAmount', e.target.value)}
                placeholder="e.g., 1000"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* Coupon Scope */}
      <div className="space-y-4 bg-green-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <FiPackage className="text-green-600" />
          Coupon Scope
        </h3>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Applicable To *
          </label>
          <select
            value={formData.scope}
            onChange={(e) => handleChange('scope', e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="platform">Entire Platform</option>
            <option value="seller">Specific Seller</option>
            <option value="product">Specific Products</option>
            <option value="category">Specific Categories</option>
          </select>
        </div>

        {formData.scope === 'seller' && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Seller ID
            </label>
            <input
              type="text"
              value={formData.sellerId}
              onChange={(e) => handleChange('sellerId', e.target.value)}
              placeholder="Enter Seller ID"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        )}

        {formData.scope === 'product' && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Product IDs
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={productIdInput}
                onChange={(e) => setProductIdInput(e.target.value)}
                placeholder="Enter Product ID"
                className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                type="button"
                onClick={addProductId}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.applicableProducts.map((id, index) => (
                <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  {id}
                  <button type="button" onClick={() => removeProductId(index)}>
                    <FiX className="text-red-600" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {formData.scope === 'category' && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Categories
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value)}
                placeholder="Enter Category Name"
                className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                type="button"
                onClick={addCategory}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.applicableCategories.map((cat, index) => (
                <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  {cat}
                  <button type="button" onClick={() => removeCategory(index)}>
                    <FiX className="text-red-600" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Purchase Requirements */}
      <div className="space-y-4 bg-purple-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <FiDollarSign className="text-purple-600" />
          Purchase Requirements
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Minimum Purchase Amount (₹)
            </label>
            <input
              type="number"
              min="0"
              value={formData.minPurchaseAmount}
              onChange={(e) => handleChange('minPurchaseAmount', e.target.value)}
              placeholder="e.g., 500"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Minimum Item Quantity
            </label>
            <input
              type="number"
              min="1"
              value={formData.minItemQuantity}
              onChange={(e) => handleChange('minItemQuantity', e.target.value)}
              placeholder="e.g., 1"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Usage Limits */}
      <div className="space-y-4 bg-orange-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <FiUsers className="text-orange-600" />
          Usage Limits
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Total Usage Limit
            </label>
            <input
              type="number"
              min="1"
              value={formData.totalUsageLimit}
              onChange={(e) => handleChange('totalUsageLimit', e.target.value)}
              placeholder="Leave empty for unlimited"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <p className="text-xs text-gray-600 mt-1">Maximum times this coupon can be used</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Per User Limit *
            </label>
            <input
              type="number"
              required
              min="1"
              value={formData.perUserLimit}
              onChange={(e) => handleChange('perUserLimit', e.target.value)}
              placeholder="e.g., 1"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <p className="text-xs text-gray-600 mt-1">How many times one user can use it</p>
          </div>
        </div>
      </div>

      {/* Date Validity */}
      <div className="space-y-4 bg-pink-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <FiCalendar className="text-pink-600" />
          Validity Period
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Start Date *
            </label>
            <input
              type="datetime-local"
              required
              value={formData.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              End Date *
            </label>
            <input
              type="datetime-local"
              required
              value={formData.endDate}
              onChange={(e) => handleChange('endDate', e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
        </div>
      </div>

      {/* User Eligibility */}
      <div className="space-y-4 bg-indigo-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <FiUsers className="text-indigo-600" />
          User Eligibility
        </h3>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Who can use this coupon? *
          </label>
          <select
            value={formData.userEligibility}
            onChange={(e) => handleChange('userEligibility', e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Users</option>
            <option value="new_customers">New Customers Only</option>
            <option value="specific_users">Specific Users</option>
          </select>
        </div>

        {formData.userEligibility === 'specific_users' && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              User Emails
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Enter user email"
                className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={addEmail}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.specificUserEmails.map((email, index) => (
                <span key={index} className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  {email}
                  <button type="button" onClick={() => removeEmail(index)}>
                    <FiX className="text-red-600" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 shadow-lg font-semibold text-lg"
      >
        <FiCheck className="text-2xl" />
        <span>{loading ? 'Creating Coupon...' : 'Create Coupon'}</span>
      </button>

      {/* Message Display */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.includes('✓')
            ? 'bg-green-50 border-2 border-green-200 text-green-700'
            : 'bg-red-50 border-2 border-red-200 text-red-700'
        }`}>
          {message}
        </div>
      )}
    </form>
  );
}
