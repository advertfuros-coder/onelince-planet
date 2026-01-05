// components/customer/LoyaltyDashboard.jsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

const TIER_CONFIG = {
    bronze: {
        name: 'Bronze',
        color: 'from-amber-700 to-amber-900',
        icon: '🥉',
        nextTier: 'Silver',
        requirement: 10000,
        benefits: ['1x Points', 'Standard Support']
    },
    silver: {
        name: 'Silver',
        color: 'from-gray-400 to-gray-600',
        icon: '🥈',
        nextTier: 'Gold',
        requirement: 50000,
        benefits: ['1.5x Points', 'Free Shipping', 'Priority Support']
    },
    gold: {
        name: 'Gold',
        color: 'from-yellow-400 to-yellow-600',
        icon: '🥇',
        nextTier: 'Platinum',
        requirement: 100000,
        benefits: ['2x Points', 'Free Shipping', 'Priority Support']
    },
    platinum: {
        name: 'Platinum',
        color: 'from-purple-400 to-pink-600',
        icon: '💎',
        nextTier: null,
        benefits: ['3x Points', 'Free Shipping', 'Priority Support', 'Early Access']
    }
};

export default function LoyaltyDashboard() {
    const [loyalty, setLoyalty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showRedeemModal, setShowRedeemModal] = useState(false);

    useEffect(() => {
        fetchLoyalty();
    }, []);

    const fetchLoyalty = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/loyalty', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setLoyalty(response.data.loyalty);
            }
        } catch (error) {
            toast.error('Failed to load loyalty program');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!loyalty) {
        return (
            <div className="text-center py-12">
                <div className="text-4xl mb-4">🎁</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Loyalty Program Not Active</h3>
                <p className="text-gray-600">Start shopping to earn points!</p>
            </div>
        );
    }

    const tierConfig = TIER_CONFIG[loyalty.tier];
    const progress = tierConfig.requirement
        ? (loyalty.tierProgress.currentSpending / tierConfig.requirement) * 100
        : 100;

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-semibold text-gray-900">Loyalty Program</h1>
                    <p className="text-gray-600 mt-1">Earn points, unlock rewards</p>
                </div>
            </div>

            {/* Current Tier Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-gradient-to-r ${tierConfig.color} rounded-xl p-8 text-white shadow-xl`}
            >
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-5xl">{tierConfig.icon}</span>
                            <div>
                                <h2 className="text-3xl font-semibold">{tierConfig.name} Member</h2>
                                <p className="text-white/80">Your current tier</p>
                            </div>
                        </div>

                        {/* Points */}
                        <div className="mt-6 grid grid-cols-3 gap-6">
                            <div>
                                <p className="text-white/80 text-sm">Available Points</p>
                                <p className="text-3xl font-semibold">{loyalty.points.available.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-white/80 text-sm">Total Earned</p>
                                <p className="text-2xl font-semibold">{loyalty.lifetimeStats.totalPointsEarned.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-white/80 text-sm">Points Multiplier</p>
                                <p className="text-2xl font-semibold">{loyalty.benefits.pointsMultiplier}x</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress to Next Tier */}
                {tierConfig.nextTier && (
                    <div className="mt-6 pt-6 border-t border-white/20">
                        <div className="flex justify-between text-sm mb-2">
                            <span>Progress to {tierConfig.nextTier}</span>
                            <span>₹{loyalty.tierProgress.currentSpending.toLocaleString()} / ₹{tierConfig.requirement.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-3">
                            <div
                                className="bg-white h-3 rounded-full transition-all"
                                style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Benefits & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Benefits */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Benefits</h3>
                    <div className="space-y-3">
                        {tierConfig.benefits.map((benefit, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                                <span className="text-green-600">✓</span>
                                <span className="text-gray-700">{benefit}</span>
                            </div>
                        ))}
                    </div>

                    {loyalty.points.available > 0 && (
                        <button
                            onClick={() => setShowRedeemModal(true)}
                            className="mt-6 w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                        >
                            Redeem Points
                        </button>
                    )}
                </div>

                {/* Lifetime Stats */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Lifetime Stats</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Total Orders</span>
                            <span className="font-semibold text-gray-900">
                                {loyalty.lifetimeStats.totalOrders}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Total Spent</span>
                            <span className="font-semibold text-gray-900">
                                ₹{loyalty.lifetimeStats.totalSpent.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Points Redeemed</span>
                            <span className="font-semibold text-gray-900">
                                {loyalty.lifetimeStats.totalPointsRedeemed.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Transactions */}
            {loyalty.transactions.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                        {loyalty.transactions.slice(0, 10).map((transaction, idx) => (
                            <div key={idx} className="flex items-center justify-between py-2 border-b last:border-b-0">
                                <div>
                                    <p className="font-medium text-gray-900">{transaction.description}</p>
                                    <p className="text-xs text-gray-500">
                                        {new Date(transaction.timestamp).toLocaleDateString()}
                                    </p>
                                </div>
                                <span className={`font-semibold ${transaction.type === 'earned' ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                    {transaction.type === 'earned' ? '+' : '-'}{Math.abs(transaction.points)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Redeem Modal */}
            {showRedeemModal && (
                <RedeemPointsModal
                    availablePoints={loyalty.points.available}
                    onClose={() => setShowRedeemModal(false)}
                    onSuccess={() => {
                        setShowRedeemModal(false);
                        fetchLoyalty();
                    }}
                />
            )}
        </div>
    );
}

function RedeemPointsModal({ availablePoints, onClose, onSuccess }) {
    const [points, setPoints] = useState('');
    const [redeeming, setRedeeming] = useState(false);

    const pointsValue = parseInt(points) || 0;
    const discountAmount = pointsValue; // 1 point = ₹1

    const handleRedeem = async () => {
        if (pointsValue > availablePoints) {
            toast.error('Insufficient points');
            return;
        }

        if (pointsValue < 100) {
            toast.error('Minimum 100 points required');
            return;
        }

        setRedeeming(true);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('/api/loyalty', {
                points: pointsValue,
                description: `Redeemed ${pointsValue} points for ₹${discountAmount} discount`
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                toast.success(`Successfully redeemed ${pointsValue} points!`);
                onSuccess();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to redeem points');
        } finally {
            setRedeeming(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
            >
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Redeem Points</h2>

                <div className="mb-6">
                    <p className="text-gray-600 mb-2">Available Points: <span className="font-semibold text-blue-600">{availablePoints.toLocaleString()}</span></p>
                    <p className="text-sm text-gray-500">1 Point = ₹1 Discount</p>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Points to Redeem (min. 100)
                    </label>
                    <input
                        type="number"
                        value={points}
                        onChange={(e) => setPoints(e.target.value)}
                        placeholder="Enter points"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        min="100"
                        max={availablePoints}
                    />

                    {pointsValue >= 100 && (
                        <p className="mt-2 text-sm text-green-600">
                            You'll get ₹{discountAmount} discount
                        </p>
                    )}
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleRedeem}
                        disabled={redeeming || pointsValue < 100}
                        className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold"
                    >
                        {redeeming ? 'Redeeming...' : 'Redeem'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
