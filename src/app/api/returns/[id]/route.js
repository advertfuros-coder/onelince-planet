import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import ReturnRequest from "@/lib/db/models/ReturnRequest";
import Order from "@/lib/db/models/Order";
import { verifyToken } from "@/lib/utils/auth";

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = params;
    const body = await request.json();
    const { status, sellerNotes } = body;

    const returnRequest = await ReturnRequest.findById(id);
    if (!returnRequest) {
      return NextResponse.json(
        { success: false, message: "Request not found" },
        { status: 404 },
      );
    }

    // Check if user is the assigned seller or an admin
    if (
      returnRequest.sellerId.toString() !== decoded.id &&
      decoded.role !== "admin" &&
      decoded.id !== returnRequest.sellerId.toString()
    ) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 },
      );
    }

    returnRequest.status = status;
    if (sellerNotes) returnRequest.sellerNotes = sellerNotes;

    await returnRequest.save();

    // Update main order timeline
    const order = await Order.findById(returnRequest.orderId);
    if (order) {
      order.timeline.push({
        status: `return_${status}`,
        description: `Return/Replacement request was ${status} by seller. ${sellerNotes ? `Note: ${sellerNotes}` : ""}`,
        timestamp: new Date(),
      });

      // If approved and it was a return, we might want to flag the items as needing refund?
      // For now, just update the timeline.

      await order.save();
    }

    return NextResponse.json({ success: true, returnRequest });
  } catch (error) {
    console.error("Update Return Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
