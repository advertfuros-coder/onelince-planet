import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/lib/db/models/Order";
import Product from "@/lib/db/models/Product";
import User from "@/lib/db/models/User";
import Seller from "@/lib/db/models/Seller";
import { FiShoppingCart, FiBox, FiUsers, FiUserPlus } from "react-icons/fi";

/**
 * Global Admin Search API
 * Searches across orders, products, sellers, and users
 * Returns unified results with icons and metadata
 */
export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim();

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    // Search regex (case-insensitive)
    const searchRegex = new RegExp(query, "i");

    // Search in parallel across all entities
    const [orders, products, sellers, users] = await Promise.all([
      // Search Orders by order number or customer
      Order.find({
        $or: [
          { orderNumber: searchRegex },
          { "shippingAddress.name": searchRegex },
        ],
      })
        .populate("customer", "name email")
        .limit(5)
        .lean(),

      // Search Products by name or category
      Product.find({
        $or: [
          { name: searchRegex },
          { category: searchRegex },
          { subcategory: searchRegex },
        ],
        isActive: true,
      })
        .limit(5)
        .lean(),

      // Search Sellers by business name
      Seller.find({
        businessName: searchRegex,
        isActive: true,
      })
        .limit(5)
        .lean(),

      // Search Users by name or email
      User.find({
        $or: [{ name: searchRegex }, { email: searchRegex }],
      })
        .limit(5)
        .lean(),
    ]);

    // Format results
    const results = [
      ...orders.map((order) => ({
        id: order._id.toString(),
        type: "order",
        title: `Order #${order.orderNumber || order._id.toString().slice(-8)}`,
        subtitle: `${order.customer?.name || "Unknown"} - ₹${
          order.pricing?.total || 0
        }`,
        url: `/admin/orders/${order._id}`,
        icon: "🛒",
      })),
      ...products.map((product) => ({
        id: product._id.toString(),
        type: "product",
        title: product.name,
        subtitle: `${product.category} - ₹${product.pricing?.selling || 0}`,
        url: `/admin/products/${product._id}`,
        icon: "📦",
      })),
      ...sellers.map((seller) => ({
        id: seller._id.toString(),
        type: "seller",
        title: seller.businessInfo?.businessName,
        subtitle: `${seller.storeInfo?.storeName || "Store"} - ${
          seller.businessInfo?.businessType
        }`,
        url: `/admin/sellers/${seller._id}`,
        icon: "🏪",
      })),
      ...users.map((user) => ({
        id: user._id.toString(),
        type: "user",
        title: user.name,
        subtitle: `${user.email} - ${user.role}`,
        url: `/admin/users/${user._id}`,
        icon: "👤",
      })),
    ];

    // Sort by relevance (exact matches first)
    results.sort((a, b) => {
      const aExact = a.title.toLowerCase().includes(query.toLowerCase());
      const bExact = b.title.toLowerCase().includes(query.toLowerCase());
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return 0;
    });

    return NextResponse.json({
      success: true,
      results: results.slice(0, 10), // Top 10 results
      query,
    });
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Search failed",
        results: [],
      },
      { status: 500 }
    );
  }
}
