'use client';

import { useState } from 'react';
import { FiPackage } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import axios from 'axios';

export default function MarkPickupButton({ orderId, onSuccess }) {
  const [loading, setLoading] = useState(false);

  const handleMarkPickup = async () => {
    if (!confirm('Mark this order ready for pickup?')) return;

    setLoading(true);
    try {
      const response = await axios.post(`/api/seller/orders/${orderId}/mark-pickup`);
      
      if (response.data.success) {
        toast.success('Order marked ready for pickup!');
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark pickup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleMarkPickup}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
    >
      <FiPackage />
      {loading ? 'Marking...' : 'Mark Ready for Pickup'}
    </button>
  );
}
