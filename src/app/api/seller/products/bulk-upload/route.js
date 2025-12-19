// app/api/seller/products/bulk-upload/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Product from "@/lib/db/models/Product";
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

        // Create product with seller ID
        const product = await Product.create({
          ...productData,
          sellerId: decoded.userId,
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
"Sample Product","Electronics","BrandName","SKU-001","Product description here",1000,899,500,100,10,"Main Warehouse","https://example.com/image1.jpg","tag1,tag2,tag3","Display:6.1 inch|RAM:8GB|Storage:128GB"
"Another Product","Fashion","BrandName","SKU-002","Another description",500,449,200,50,5,"Warehouse 2","https://example.com/image2.jpg","fashion,trending","Size:M|Color:Blue|Material:Cotton"`;

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
