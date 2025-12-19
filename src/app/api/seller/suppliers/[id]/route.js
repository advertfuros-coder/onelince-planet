// app/api/seller/suppliers/[id]/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import Supplier from '@/lib/db/models/Supplier'
import { verifyToken } from '@/lib/utils/auth'

// PUT - Update supplier
export async function PUT(request, { params }) {
  try {
    await connectDB()
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'seller') {
      return NextResponse.json({ success: false, message: 'Seller access required' }, { status: 403 })
    }

    const { id } = await params
    const updateData = await request.json()

    const supplier = await Supplier.findOneAndUpdate(
      { _id: id, sellerId: decoded.userId },
      updateData,
      { new: true }
    )

    if (!supplier) {
      return NextResponse.json({ success: false, message: 'Supplier not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Supplier updated successfully',
      supplier
    })
  } catch (error) {
    console.error('Supplier PUT Error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    }, { status: 500 })
  }
}

// DELETE - Delete supplier
export async function DELETE(request, { params }) {
  try {
    await connectDB()
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'seller') {
      return NextResponse.json({ success: false, message: 'Seller access required' }, { status: 403 })
    }

    const { id } = await params

    const supplier = await Supplier.findOneAndUpdate(
      { _id: id, sellerId: decoded.userId },
      { isActive: false },
      { new: true }
    )

    if (!supplier) {
      return NextResponse.json({ success: false, message: 'Supplier not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Supplier deleted successfully'
    })
  } catch (error) {
    console.error('Supplier DELETE Error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    }, { status: 500 })
  }
}
