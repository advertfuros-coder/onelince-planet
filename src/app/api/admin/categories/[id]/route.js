// app/api/admin/categories/[id]/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import Category from '@/lib/db/models/Category'
import Product from '@/lib/db/models/Product'
import { verifyToken, isAdmin } from '@/lib/utils/adminAuth'

export async function PUT(request, { params }) {
  try {
    await connectDB()
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const decoded = verifyToken(token)

    if (!decoded || !isAdmin(decoded)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { name, description, image, parentCategory, commissionRate, isActive, sortOrder } = body

    const oldCategory = await Category.findById(id)
    if (!oldCategory) {
      return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 })
    }

    // Generate new slug if name changed
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    // Check if slug is taken by another category
    const existing = await Category.findOne({ slug, _id: { $ne: id } })
    if (existing) {
      return NextResponse.json({ success: false, message: 'Category with this name already exists' }, { status: 400 })
    }

    // Remove from old parent's subCategories if parent changed
    if (oldCategory.parentCategory && oldCategory.parentCategory.toString() !== parentCategory) {
      await Category.findByIdAndUpdate(oldCategory.parentCategory, {
        $pull: { subCategories: id },
      })
    }

    // Update category
    const category = await Category.findByIdAndUpdate(
      id,
      {
        name,
        slug,
        description,
        image,
        parentCategory: parentCategory || null,
        commissionRate: commissionRate || 5,
        isActive,
        sortOrder: sortOrder || 0,
      },
      { new: true }
    )
      .populate('parentCategory', 'name slug')
      .populate('subCategories', 'name slug')

    // Add to new parent's subCategories
    if (parentCategory && (!oldCategory.parentCategory || oldCategory.parentCategory.toString() !== parentCategory)) {
      await Category.findByIdAndUpdate(parentCategory, {
        $addToSet: { subCategories: id },
      })
    }

    return NextResponse.json({ success: true, message: 'Category updated successfully', category })
  } catch (error) {
    console.error('Category PUT error:', error)
    return NextResponse.json({ success: false, message: 'Server error', error: error.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB()
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const decoded = verifyToken(token)

    if (!decoded || !isAdmin(decoded)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const category = await Category.findById(id)
    if (!category) {
      return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 })
    }

    // Check if any products use this category
    const productCount = await Product.countDocuments({ category: category.name })
    if (productCount > 0) {
      return NextResponse.json(
        { success: false, message: `Cannot delete category with ${productCount} products. Please reassign products first.` },
        { status: 400 }
      )
    }

    // Check if any subcategories exist
    if (category.subCategories && category.subCategories.length > 0) {
      return NextResponse.json(
        { success: false, message: `Cannot delete category with ${category.subCategories.length} subcategories. Please delete subcategories first.` },
        { status: 400 }
      )
    }

    // Remove from parent's subCategories if exists
    if (category.parentCategory) {
      await Category.findByIdAndUpdate(category.parentCategory, {
        $pull: { subCategories: id },
      })
    }

    await Category.findByIdAndDelete(id)

    return NextResponse.json({ success: true, message: 'Category deleted successfully' })
  } catch (error) {
    console.error('Category DELETE error:', error)
    return NextResponse.json({ success: false, message: 'Server error', error: error.message }, { status: 500 })
  }
}
