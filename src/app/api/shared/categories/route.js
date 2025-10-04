// app/api/shared/categories/route.js
import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db/connection';
import { Category } from '../../../../lib/db/models';

export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get('parent');

    let query = { isActive: true };
    if (parentId) {
      query.parentCategory = parentId;
    } else {
      query.parentCategory = null; // Get main categories only
    }

    const categories = await Category.find(query)
      .populate('subCategories', 'name slug image')
      .sort({ sortOrder: 1, name: 1 });

    return NextResponse.json({
      success: true,
      categories
    });

  } catch (error) {
    console.error('Categories fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
