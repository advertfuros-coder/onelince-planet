// app/api/products/[id]/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import Product from '@/lib/db/models/Product'
import { verifyToken } from '@/lib/utils/auth'

export async function GET(request, { params }) {
  try {
    await connectDB()
    
    const product = await Product.findById(params.id)
      .populate('seller', 'name email')
    
    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      product
    })

  } catch (error) {
    console.error('Get product error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB()
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const decoded = verifyToken(token)
    
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const product = await Product.findById(params.id)
    
    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      )
    }

    // Check if user is seller of this product or admin
    if (product.seller.toString() !== decoded.id && decoded.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Not authorized to update this product' },
        { status: 403 }
      )
    }

    const updates = await request.json()
    const updatedProduct = await Product.findByIdAndUpdate(
      params.id,
      updates,
      { new: true, runValidators: true }
    )

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct
    })

  } catch (error) {
    console.error('Update product error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB()
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const decoded = verifyToken(token)
    
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const product = await Product.findById(params.id)
    
    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      )
    }

    // Check if user is seller of this product or admin
    if (product.seller.toString() !== decoded.id && decoded.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Not authorized to delete this product' },
        { status: 403 }
      )
    }

    await Product.findByIdAndDelete(params.id)

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    })

  } catch (error) {
    console.error('Delete product error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    )
  }
}
