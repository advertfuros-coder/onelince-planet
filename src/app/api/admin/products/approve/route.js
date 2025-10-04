// app/api/admin/products/[id]/approve/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import Product from '@/lib/db/models/Product'
import { verifyToken } from '@/lib/utils/auth'

export async function PATCH(request, { params }) {
  try {
    await connectDB()
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const decoded = verifyToken(token)
    
    // Check if admin (you can add admin check here)
    if (!decoded) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const product = await Product.findById(params.id)
    
    if (!product) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 })
    }

    product.isApproved = true
    await product.save()

    return NextResponse.json({
      success: true,
      message: 'Product approved successfully',
      product
    })

  } catch (error) {
    console.error('Approve product error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}
