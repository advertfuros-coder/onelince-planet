// app/api/wishlist/price-alert/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import PriceAlert from '@/lib/db/models/PriceAlert'
import Product from '@/lib/db/models/Product'
import { verifyToken } from '@/lib/utils/auth'

// GET - Fetch user's price alerts
export async function GET(request) {
  try {
    await connectDB()
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 })
    }

    const alerts = await PriceAlert.find({ 
      userId: decoded.userId,
      isActive: true 
    }).populate('productId', 'name images pricing')

    return NextResponse.json({
      success: true,
      alerts
    })
  } catch (error) {
    console.error('Price Alert GET Error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    }, { status: 500 })
  }
}

// POST - Create price alert
export async function POST(request) {
  try {
    await connectDB()
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 })
    }

    const { productId, targetPrice } = await request.json()

    if (!productId || !targetPrice) {
      return NextResponse.json({ 
        success: false, 
        message: 'Product ID and target price required' 
      }, { status: 400 })
    }

    // Get product current price
    const product = await Product.findById(productId)
    if (!product) {
      return NextResponse.json({ 
        success: false, 
        message: 'Product not found' 
      }, { status: 404 })
    }

    // Check if alert already exists
    const existingAlert = await PriceAlert.findOne({
      userId: decoded.userId,
      productId,
      isActive: true
    })

    if (existingAlert) {
      // Update existing alert
      existingAlert.targetPrice = targetPrice
      existingAlert.currentPrice = product.pricing.salePrice
      existingAlert.notified = false
      await existingAlert.save()

      return NextResponse.json({
        success: true,
        message: 'Price alert updated',
        alert: existingAlert
      })
    }

    // Create new alert
    const alert = await PriceAlert.create({
      userId: decoded.userId,
      productId,
      targetPrice,
      currentPrice: product.pricing.salePrice
    })

    return NextResponse.json({
      success: true,
      message: 'Price alert created',
      alert
    })
  } catch (error) {
    console.error('Price Alert POST Error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    }, { status: 500 })
  }
}

// DELETE - Remove price alert
export async function DELETE(request) {
  try {
    await connectDB()
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const alertId = searchParams.get('alertId')

    if (!alertId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Alert ID required' 
      }, { status: 400 })
    }

    const alert = await PriceAlert.findOneAndUpdate(
      { _id: alertId, userId: decoded.userId },
      { isActive: false },
      { new: true }
    )

    if (!alert) {
      return NextResponse.json({ 
        success: false, 
        message: 'Alert not found' 
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Price alert removed'
    })
  } catch (error) {
    console.error('Price Alert DELETE Error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    }, { status: 500 })
  }
}
