// seller/(seller)/revenue/page.jsx
'use client'
import { useState, useEffect } from 'react'
import {
  FiDollarSign,
  FiTrendingUp,
  FiCreditCard,
  FiCalendar,
  FiDownload
} from 'react-icons/fi'
import DashboardCard from '@/components/seller/DashboardCard'
import Button from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils'
 
export default function SellerRevenue() {
  const [revenueData, setRevenueData] = useState({
    overview: {
      totalRevenue: 125680,
      pendingPayments: 15420,
      paidOut: 110260,
      commission: 6284
    },
    transactions: [],
    monthlyRevenue: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRevenueData()
  }, [])

  const loadRevenueData = async () => {
    try {
      // Mock revenue data
      setRevenueData({
        overview: {
          totalRevenue: 125680,
          pendingPayments: 15420,
          paidOut: 110260,
          commission: 6284
        },
        transactions: [
          {
            id: 'TXN001',
            type: 'sale',
            orderId: 'OP001234',
            amount: 2499,
            commission: 125,
            netAmount: 2374,
            status: 'completed',
            date: '2025-09-30'
          },
          {
            id: 'TXN002',
            type: 'payout',
            amount: 15000,
            status: 'pending',
            date: '2025-09-29'
          }
        ],
        monthlyRevenue: [
          { month: 'Apr', revenue: 22000 },
          { month: 'May', revenue: 25000 },
          { month: 'Jun', revenue: 28000 },
          { month: 'Jul', revenue: 32000 },
          { month: 'Aug', revenue: 29000 },
          { month: 'Sep', revenue: 35000 }
        ]
      })
    } catch (error) {
      console.error('Error loading revenue data:', error)
    } finally {
      setLoading(false)
    }
  }

  const revenueCards = [
    {
      title: 'Total Revenue',
      value: formatPrice(revenueData.overview.totalRevenue),
      icon: FiDollarSign,
      change: '+15.3%',
      changeType: 'increase',
      color: 'green'
    },
    {
      title: 'Pending Payments',
      value: formatPrice(revenueData.overview.pendingPayments),
      icon: FiCreditCard,
      change: '+5.2%',
      changeType: 'increase',
      color: 'yellow'
    },
    {
      title: 'Paid Out',
      value: formatPrice(revenueData.overview.paidOut),
      icon: FiTrendingUp,
      change: '+12.1%',
      changeType: 'increase',
      color: 'blue'
    },
    {
      title: 'Commission Paid',
      value: formatPrice(revenueData.overview.commission),
      icon: FiDollarSign,
      change: '+8.5%',
      changeType: 'increase',
      color: 'purple'
    }
  ]

  if (loading) {
    return <div className="p-6">Loading revenue data...</div>
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Revenue</h1>
          <p className="text-gray-600">Track your earnings and payments</p>
        </div>
        <Button variant="outline" className="flex items-center space-x-2">
          <FiDownload className="w-4 h-4" />
          <span>Download Report</span>
        </Button>
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {revenueCards.map((card, index) => (
          <DashboardCard key={index} {...card} />
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue</h2>
        <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500">Revenue chart will be here</p>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Net Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {revenueData.transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {transaction.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                    {transaction.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatPrice(transaction.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.commission ? formatPrice(transaction.commission) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.netAmount ? formatPrice(transaction.netAmount) : formatPrice(transaction.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      transaction.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
