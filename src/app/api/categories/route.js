// API Route: /api/categories/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connection";
import Category from "@/lib/db/models/Category";

/**
 * GET /api/categories
 * Fetch categories with optional parent_id filter
 * Query params:
 *   - parentId: Filter by parent (use 'null' or omit for top-level)
 *   - level: Filter by level (1, 2, or 3)
 *   - includeInactive: Include inactive categories (default: false)
 */
export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get("parentId");
    const level = searchParams.get("level");
    const includeInactive = searchParams.get("includeInactive") === "true";

    const query = {};

    // Filter by parent
    if (parentId === "null" || parentId === null) {
      query.parentId = null;
    } else if (parentId) {
      query.parentId = parentId;
    }

    // Filter by level
    if (level) {
      query.level = parseInt(level);
    }

    // Filter by active status
    if (!includeInactive) {
      query.isActive = true;
    }

    const categories = await Category.find(query)
      .select(
        "_id name slug icon level path parentId isActive sortOrder requiresApproval"
      )
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: categories,
      count: categories.length,
    });
  } catch (error) {
    console.error("[API] /api/categories GET error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/categories
 * Create a new category (Admin only - add auth middleware as needed)
 */
export async function POST(request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { name, slug, parentId, icon, description, level, requiresApproval } =
      body;

    // Validation
    if (!name || !slug) {
      return NextResponse.json(
        { success: false, message: "Name and slug are required" },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existing = await Category.findOne({ slug });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Category with this slug already exists" },
        { status: 400 }
      );
    }

    // If parentId provided, validate it exists
    if (parentId) {
      const parent = await Category.findById(parentId);
      if (!parent) {
        return NextResponse.json(
          { success: false, message: "Parent category not found" },
          { status: 400 }
        );
      }

      // Prevent creating categories beyond level 3
      if (parent.level >= 3) {
        return NextResponse.json(
          {
            success: false,
            message: "Cannot create subcategories beyond level 3",
          },
          { status: 400 }
        );
      }
    }

    const category = await Category.create({
      name,
      slug,
      parentId: parentId || null,
      icon,
      description,
      level: level || 1,
      requiresApproval: requiresApproval || false,
      path: slug, // Will be updated by pre-save hook
    });

    return NextResponse.json(
      {
        success: true,
        data: category,
        message: "Category created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API] /api/categories POST error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
