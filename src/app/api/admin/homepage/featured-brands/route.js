import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import FeaturedBrand from "@/lib/db/models/FeaturedBrand";
import { verifyToken } from "@/lib/utils/auth";

export async function GET(request) {
  try {
    await connectDB();
    const brands = await FeaturedBrand.find().sort({ order: 1, createdAt: -1 });
    return NextResponse.json({ success: true, brands });
  } catch (error) {
    console.error("Error fetching featured brands:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch featured brands" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();
    const body = await request.json();

    if (body._id) {
      // Update existing brand
      const updated = await FeaturedBrand.findByIdAndUpdate(body._id, body, {
        new: true,
        runValidators: true,
      });
      return NextResponse.json({ success: true, brand: updated });
    } else {
      // Create new brand
      const newBrand = await FeaturedBrand.create(body);
      return NextResponse.json({ success: true, brand: newBrand });
    }
  } catch (error) {
    console.error("Error saving featured brand:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to save featured brand",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Brand ID is required" },
        { status: 400 }
      );
    }

    await connectDB();
    await FeaturedBrand.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Brand deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting featured brand:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete featured brand" },
      { status: 500 }
    );
  }
}
