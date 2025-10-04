// components/seller/TopProducts.jsx
import { formatPrice } from '@/lib/utils/formatters'

export default function TopProducts({ products }) {
  if (!products || products.length === 0) {
    return <div className="text-center text-gray-500 py-8">No product data available</div>
  }

  return (
    <div className="space-y-4">
      {products.map((product, index) => (
        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex-1">
            <p className="font-medium text-gray-900">{product.name}</p>
            <p className="text-sm text-gray-600">{product.sales} units sold</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-gray-900">{formatPrice(product.revenue)}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
