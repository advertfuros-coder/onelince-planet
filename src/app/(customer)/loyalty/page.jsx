// app/(customer)/loyalty/page.jsx
'use client';

import LoyaltyDashboard from '@/components/customer/LoyaltyDashboard';

export default function LoyaltyPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <LoyaltyDashboard />
        </div>
    );
}
