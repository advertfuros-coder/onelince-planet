// app/api/customer/products/route.js
import { Product } from '@/lib/db/models';
import dbConnect from '@/lib/dbConnect';
import { NextResponse } from 'next/server';
import { buildCategoryFilter } from '@/lib/db/utils/categoryMatcher';
 
export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory') || searchParams.get('sub') || '';
    const search = searchParams.get('search');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    const query = { isActive: true };

    // Add filters
    if (category || subcategory) {
      const categoryFilter = await buildCategoryFilter(category, subcategory);
      if (categoryFilter) {
        query.$and = query.$and || [];
        query.$and.push(categoryFilter);
      }
    }
    if (search) {
      query.$text = { $search: search };
    }
    if (minPrice || maxPrice) {
      query['pricing.salePrice'] = {};
      if (minPrice) query['pricing.salePrice'].$gte = parseInt(minPrice);
      if (maxPrice) query['pricing.salePrice'].$lte = parseInt(maxPrice);
    }

    const sortOrder = order === 'desc' ? -1 : 1;
    const sortObj = { [sortBy]: sortOrder };

    const products = await Product.find(query)
      .populate('sellerId', 'storeInfo.storeName storeInfo.storeLogo ratings')
      .select('-sellerId.bankDetails -sellerId.documents')
      .sort(sortObj)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(query);

    return NextResponse.json({
      success: true,
      products,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalProducts: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Products fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
