// components/seller/SalesChart.jsx
'use client'
import { formatPrice } from '@/lib/utils/formatters'

export default function SalesChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="text-center text-gray-500 py-8">No sales data available</div>
  }

  const maxSales = Math.max(...data.map(d => d.sales))

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between space-x-2 h-64">
        {data.map((item, index) => {
          const height = (item.sales / maxSales) * 100
          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="relative w-full flex items-end justify-center h-48">
                <div
                  className="bg-blue-500 hover:bg-blue-600 rounded-t transition-all duration-300 w-full"
                  style={{ height: `${height}%` }}
                  title={formatPrice(item.sales)}
                />
              </div>
              <span className="text-xs text-gray-600 mt-2">{item.month}</span>
            </div>
          )
        })}
      </div>
      <div className="flex items-center justify-between text-sm text-gray-600 pt-4 border-t">
        <span>Monthly Sales</span>
        <span className="font-semibold text-gray-900">
          Total: {formatPrice(data.reduce((sum, d) => sum + d.sales, 0))}
        </span>
      </div>
    </div>
  )
}
