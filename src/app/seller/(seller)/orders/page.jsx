// app/seller/(seller)/orders/page.jsx
'use client';

import { Suspense } from 'react';
import OrderManagement from '@/components/seller/OrderManagement';

export default function SellerOrdersPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <OrderManagement />
    </Suspense>
  );
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Loading orders...</p>
      </div>
    </div>
  );
}
