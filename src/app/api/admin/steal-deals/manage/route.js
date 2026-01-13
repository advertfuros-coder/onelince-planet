import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import StealDeal from "@/lib/db/models/StealDeal";
import { verifyToken, isAdmin } from "@/lib/utils/adminAuth";

// GET - Fetch all steal deals for admin management
export async function GET(request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded || !isAdmin(decoded)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const deals = await StealDeal.find({})
      .populate({
        path: "product",
        select: "name slug images pricing isActive isApproved",
      })
      .sort({ order: 1 });

    return NextResponse.json({
      success: true,
      deals,
      count: deals.length,
    });
  } catch (error) {
    console.error("Error fetching steal deals for management:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
