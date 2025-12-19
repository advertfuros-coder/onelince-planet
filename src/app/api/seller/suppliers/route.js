// app/api/seller/suppliers/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Supplier from "@/lib/db/models/Supplier";
import { verifyToken } from "@/lib/utils/auth";

// GET - Fetch all suppliers
export async function GET(request) {
  try {
    await connectDB();

    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "seller") {
      return NextResponse.json(
        { success: false, message: "Seller access required" },
        { status: 403 }
      );
    }

    const suppliers = await Supplier.find({
      sellerId: decoded.userId,
      isActive: true,
    })
      .populate("products.productId", "name sku")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      suppliers,
    });
  } catch (error) {
    console.error("Suppliers GET Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// POST - Create new supplier
export async function POST(request) {
  try {
    await connectDB();

    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "seller") {
      return NextResponse.json(
        { success: false, message: "Seller access required" },
        { status: 403 }
      );
    }

    const supplierData = await request.json();

    const supplier = await Supplier.create({
      ...supplierData,
      sellerId: decoded.userId,
    });

    return NextResponse.json({
      success: true,
      message: "Supplier created successfully",
      supplier,
    });
  } catch (error) {
    console.error("Supplier POST Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
