// app/api/admin/categories/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import Category from '@/lib/db/models/Category'
import Product from '@/lib/db/models/Product'
import { verifyToken, isAdmin } from '@/lib/utils/adminAuth'

export async function GET(request) {
  try {
    await connectDB()
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const decoded = verifyToken(token)

    if (!decoded || !isAdmin(decoded)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''

    let query = {}
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ]
    }

    const categories = await Category.find(query)
      .populate('parentCategory', 'name slug')
      .populate('subCategories', 'name slug')
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean()

    // Get product counts for each category
    const categoriesWithCounts = await Promise.all(
      categories.map(async (cat) => {
        const productCount = await Product.countDocuments({ category: cat.name })
        return { ...cat, productCount }
      })
    )

    const stats = {
      totalCategories: categories.length,
      activeCategories: categories.filter((c) => c.isActive).length,
      inactiveCategories: categories.filter((c) => !c.isActive).length,
      parentCategories: categories.filter((c) => !c.parentCategory).length,
      totalProducts: await Product.countDocuments(),
    }

    return NextResponse.json({
      success: true,
      categories: categoriesWithCounts,
      stats,
    })
  } catch (error) {
    console.error('Categories GET error:', error)
    return NextResponse.json({ success: false, message: 'Server error', error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    await connectDB()
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const decoded = verifyToken(token)

    if (!decoded || !isAdmin(decoded)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, image, parentCategory, commissionRate, isActive, sortOrder } = body

    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    // Check if category with same slug exists
    const existing = await Category.findOne({ slug })
    if (existing) {
      return NextResponse.json({ success: false, message: 'Category with this name already exists' }, { status: 400 })
    }

    const category = await Category.create({
      name,
      slug,
      description,
      image,
      parentCategory: parentCategory || null,
      commissionRate: commissionRate || 5,
      isActive: isActive !== undefined ? isActive : true,
      sortOrder: sortOrder || 0,
    })

    // If this category has a parent, add it to parent's subCategories
    if (parentCategory) {
      await Category.findByIdAndUpdate(parentCategory, {
        $addToSet: { subCategories: category._id },
      })
    }

    const populatedCategory = await Category.findById(category._id)
      .populate('parentCategory', 'name slug')
      .populate('subCategories', 'name slug')

    return NextResponse.json({ success: true, message: 'Category created successfully', category: populatedCategory })
  } catch (error) {
    console.error('Category POST error:', error)
    return NextResponse.json({ success: false, message: 'Server error', error: error.message }, { status: 500 })
  }
}
