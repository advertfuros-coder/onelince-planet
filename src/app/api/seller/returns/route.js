// app/api/seller/returns/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Order from "@/lib/db/models/Order";
import Seller from "@/lib/db/models/Seller";
import { verifyToken } from "@/lib/utils/auth";

export async function GET(request) {
  try {
    await connectDB();
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== "seller") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const seller = await Seller.findOne({ userId: decoded.userId });
    if (!seller) {
      return NextResponse.json(
        { success: false, message: "Seller not found" },
        { status: 404 }
      );
    }

    // Fetch orders with return requests for this seller
    const returns = await Order.find({
      "items.seller": seller._id, // In some cases this is userId, in some its sellerId. Let's check model.
      // Actually, Order model says items.seller is ref: 'User' (which is the seller's user ID)
      "items.seller": decoded.userId,
      status: "returned",
      returnRequest: { $exists: true },
    })
      .populate("customer", "name email phone")
      .sort({ "returnRequest.requestedAt": -1 });

    // Fallback search if 'returned' status is not set yet but request exists
    const pendingReturns = await Order.find({
      "items.seller": decoded.userId,
      returnRequest: { $exists: true },
      "returnRequest.status": "requested",
    })
      .populate("customer", "name email phone")
      .sort({ "returnRequest.requestedAt": -1 });

    // Combine and remove duplicates
    const combined = [...returns, ...pendingReturns];
    const uniqueReturns = Array.from(
      new Set(combined.map((a) => a._id.toString()))
    ).map((id) => combined.find((a) => a._id.toString() === id));

    return NextResponse.json({
      success: true,
      returns: uniqueReturns,
    });
  } catch (error) {
    console.error("Returns GET Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
