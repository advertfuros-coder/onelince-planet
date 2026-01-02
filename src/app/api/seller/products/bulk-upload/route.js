// app/api/seller/products/bulk-upload/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Product from "@/lib/db/models/Product";
import Seller from "@/lib/db/models/Seller";
import { verifyToken } from "@/lib/utils/auth";

// POST - Bulk upload products from CSV
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

    // Find seller profile to get internal seller ID
    const seller = await Seller.findOne({ userId: decoded.userId });
    if (!seller) {
      return NextResponse.json(
        { success: false, message: "Seller profile not found" },
        { status: 404 }
      );
    }

    const { products } = await request.json();

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Products array required",
        },
        { status: 400 }
      );
    }

    const results = {
      success: [],
      failed: [],
      total: products.length,
    };

    // Process each product
    for (let i = 0; i < products.length; i++) {
      const productData = products[i];

      try {
        // Validate required fields
        if (!productData.name || !productData.category) {
          results.failed.push({
            row: i + 1,
            data: productData,
            error: "Missing required fields: name and category",
          });
          continue;
        }

        // Create product with internal seller ID
        const product = await Product.create({
          ...productData,
          sellerId: seller._id,
          pricing: {
            basePrice: parseFloat(productData.basePrice) || 0,
            salePrice:
              parseFloat(productData.salePrice) ||
              parseFloat(productData.basePrice) ||
              0,
            costPrice: parseFloat(productData.costPrice) || 0,
          },
          inventory: {
            stock: parseInt(productData.stock) || 0,
            lowStockThreshold: parseInt(productData.lowStockThreshold) || 10,
            warehouse: productData.warehouse || "Main",
          },
          images: productData.images
            ? Array.isArray(productData.images)
              ? productData.images
              : [productData.images]
            : [],
          specifications: productData.specifications || [],
          tags: productData.tags
            ? Array.isArray(productData.tags)
              ? productData.tags
              : productData.tags.split(",").map((t) => t.trim())
            : [],
          isActive:
            productData.isActive !== undefined ? productData.isActive : true,
          isApproved: false, // Requires admin approval
        });

        results.success.push({
          row: i + 1,
          productId: product._id,
          name: product.name,
        });
      } catch (error) {
        results.failed.push({
          row: i + 1,
          data: productData,
          error: error.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Uploaded ${results.success.length} of ${results.total} products`,
      results,
    });
  } catch (error) {
    console.error("Bulk Upload Error:", error);
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

// GET - Download CSV template
export async function GET(request) {
  try {
    const csvTemplate = `name,category,brand,sku,description,basePrice,salePrice,costPrice,stock,lowStockThreshold,warehouse,images,tags,specifications
"Modern Smartwatch","Electronics","FitTrack","FT-100-BLK","High-performance smartwatch with heart rate monitoring and 7-day battery life.",4999,3999,2500,50,5,"Primary","https://images.unsplash.com/photo-1546868871-70c122467d8b|https://images.unsplash.com/photo-1579586337278-3befd40fd17a","smartwatch,tech,fitness","Color:Deep Black|Battery:300mAh|Water Resistance:IP68"
"Cotton Slim Fit Shirt","Fashion","UrbanStyle","US-SH-01-NAVY","Premium cotton slim fit shirt, perfect for formal and semi-formal occasions.",1999,1499,800,100,20,"Regional","https://images.unsplash.com/photo-1596755094514-f87e34085b2c","shirt,cotton,navy","Size:L|Color:Navy Blue|Fabric:100% Cotton"`;

    return new NextResponse(csvTemplate, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition":
          'attachment; filename="product_upload_template.csv"',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate template",
      },
      { status: 500 }
    );
  }
}
