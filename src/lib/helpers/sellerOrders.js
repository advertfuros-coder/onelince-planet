import Order from '@/lib/db/models/Order';
import Product from '@/lib/db/models/Product';

export async function getSellerOrders(sellerId, filters = {}) {
  const query = {
    'items.seller': sellerId
  };

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.search) {
    query.$or = [
      { orderNumber: { $regex: filters.search, $options: 'i' } },
      { 'shippingAddress.name': { $regex: filters.search, $options: 'i' } },
      { 'shippingAddress.phone': { $regex: filters.search, $options: 'i' } }
    ];
  }

  const orders = await Order.find(query)
    .populate('customer', 'name email phone')
    .populate('items.product', 'name images')
    .sort({ createdAt: -1 })
    .lean();

  return orders;
}

export function getOrderStats(orders) {
  const stats = {
    total: orders.length,
    pending: 0,
    processing: 0,
    confirmed: 0,
    ready_for_pickup: 0,
    pickup: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    totalRevenue: 0
  };

  orders.forEach(order => {
    if (stats[order.status] !== undefined) {
      stats[order.status]++;
    }
    if (['confirmed', 'processing', 'shipped', 'delivered'].includes(order.status)) {
      stats.totalRevenue += order.pricing.total;
    }
  });

  return stats;
}
