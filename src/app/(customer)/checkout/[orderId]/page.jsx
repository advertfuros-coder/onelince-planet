// app/(customer)/checkout/[orderId]/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import PaymentCheckout from '@/components/payment/PaymentCheckout';
import toast from 'react-hot-toast';

export default function CheckoutPage({ params }) {
    const router = useRouter();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrder();
    }, [params.orderId]);

    const fetchOrder = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`/api/orders/${params.orderId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setOrder(response.data.order);
            }
        } catch (error) {
            toast.error('Failed to load order');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentSuccess = (updatedOrder) => {
        toast.success('Payment successful! Redirecting...');
        setTimeout(() => {
            router.push(`/orders/${params.orderId}`);
        }, 2000);
    };

    const handleCancel = () => {
        router.push(`/orders/${params.orderId}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Order not found</h2>
                    <p className="text-gray-600 mb-4">The order you're looking for doesn't exist</p>
                    <button
                        onClick={() => router.push('/orders')}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg"
                    >
                        View Orders
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <PaymentCheckout
                order={order}
                onSuccess={handlePaymentSuccess}
                onCancel={handleCancel}
            />
        </div>
    );
}
