// app/api/customer/orders/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import Order from '@/lib/db/models/Order'
import Product from '@/lib/db/models/Product'
import Cart from '@/lib/db/models/Cart'
import Coupon from '@/lib/db/models/Coupon'
import { verifyToken } from '@/lib/utils/auth'

export async function GET(request) {
  try {
    await connectDB()

    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10

    const skip = (page - 1) * limit

    let query = { customer: decoded.id }
    if (status) {
      query.status = status
    }

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('items.product', 'name images pricing category')
        .populate('items.seller', 'businessName name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(query)
    ])

    return NextResponse.json({
      success: true,
      orders,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    })
  } catch (error) {
    console.error('Orders GET error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    await connectDB()

    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const decoded = verifyToken(token)
    
    if (!decoded) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { items, shippingAddress, paymentMethod, couponCode } = body

    console.log('📦 Received order request for user:', decoded.id)

    // Validation
    if (!items || items.length === 0) {
      return NextResponse.json({ success: false, message: 'Cart is empty' }, { status: 400 })
    }

    if (!shippingAddress || !shippingAddress.name || !shippingAddress.phone || 
        !shippingAddress.addressLine1 || !shippingAddress.city || 
        !shippingAddress.state || !shippingAddress.pincode) {
      return NextResponse.json({ 
        success: false, 
        message: 'Complete shipping address is required' 
      }, { status: 400 })
    }

    if (!paymentMethod || !['cod', 'online', 'card', 'upi', 'wallet'].includes(paymentMethod)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Valid payment method required' 
      }, { status: 400 })
    }

    // Process all items and calculate totals
    let orderItems = []
    let subtotal = 0

    for (const item of items) {
      const product = await Product.findById(item.productId)
      
      if (!product) {
        return NextResponse.json({ 
          success: false, 
          message: `Product not found: ${item.productId}` 
        }, { status: 404 })
      }

      // ✅ CORRECT: Get price from pricing.salePrice (or fallback to basePrice)
      let itemPrice = product.pricing?.salePrice || product.pricing?.basePrice || 0

      console.log('💰 Product pricing:', { 
        productId: product._id,
        name: product.name, 
        salePrice: product.pricing?.salePrice,
        basePrice: product.pricing?.basePrice,
        finalPrice: itemPrice
      })

      // Validate product is active
      if (!product.isActive) {
        return NextResponse.json({ 
          success: false, 
          message: `Product "${product.name}" is currently unavailable` 
        }, { status: 400 })
      }

      // Check stock availability
      const availableStock = product.inventory?.stock || 0
      if (availableStock < item.quantity) {
        return NextResponse.json({
          success: false,
          message: `Only ${availableStock} units available for "${product.name}"`
        }, { status: 400 })
      }

      // Validate price is a valid number
      itemPrice = parseFloat(itemPrice)
      if (isNaN(itemPrice) || itemPrice <= 0) {
        console.error('❌ Invalid price:', { 
          productId: product._id, 
          productName: product.name,
          pricing: product.pricing,
          itemPrice 
        })
        return NextResponse.json({
          success: false,
          message: `Invalid price for product "${product.name}"`
        }, { status: 400 })
      }

      // Validate quantity
      const quantity = parseInt(item.quantity)
      if (isNaN(quantity) || quantity <= 0) {
        return NextResponse.json({
          success: false,
          message: `Invalid quantity for product "${product.name}"`
        }, { status: 400 })
      }

      // Calculate item total
      const itemTotal = itemPrice * quantity
      subtotal += itemTotal

      console.log('🧮 Item calculation:', { 
        name: product.name, 
        price: itemPrice, 
        quantity, 
        itemTotal,
        runningSubtotal: subtotal 
      })

      // Add to order items
      orderItems.push({
        product: product._id,
        seller: product.sellerId,
        name: product.name,
        price: itemPrice,
        quantity: quantity,
        images: product.images || [],
        status: 'pending'
      })

      // Reduce stock
      product.inventory.stock -= quantity
      if (product.inventory.stock === 0) {
        product.isActive = false
      }
      await product.save()

      console.log('📦 Stock updated:', { 
        productId: product._id, 
        remainingStock: product.inventory.stock 
      })
    }

    // Calculate shipping, tax, discount
    subtotal = parseFloat(subtotal.toFixed(2))
    const shippingCharge = subtotal >= 500 ? 0 : 50
    const taxRate = 0.18
    const tax = parseFloat(((subtotal + shippingCharge) * taxRate).toFixed(2))
    
    let discount = 0
    let appliedCoupon = null

    // Apply coupon if provided
    if (couponCode && couponCode.trim()) {
      try {
        const coupon = await Coupon.findOne({ 
          code: couponCode.toUpperCase(), 
          isActive: true 
        })

        if (coupon) {
          const now = new Date()
          if (now >= coupon.validFrom && now <= coupon.validUntil) {
            if (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit) {
              if (subtotal >= coupon.minOrderValue) {
                if (coupon.discountType === 'percentage') {
                  discount = (subtotal * coupon.discountValue) / 100
                  if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
                    discount = coupon.maxDiscountAmount
                  }
                } else if (coupon.discountType === 'fixed') {
                  discount = coupon.discountValue
                }

                discount = parseFloat(discount.toFixed(2))
                appliedCoupon = couponCode.toUpperCase()

                coupon.usedCount += 1
                await coupon.save()

                console.log('🎟️ Coupon applied:', { code: appliedCoupon, discount })
              }
            }
          }
        }
      } catch (couponError) {
        console.error('Coupon error:', couponError)
      }
    }

    // Calculate final total
    const total = parseFloat((subtotal + tax + shippingCharge - discount).toFixed(2))

    console.log('💵 Final pricing:', {
      subtotal,
      tax,
      shippingCharge,
      discount,
      total
    })

    // Validate all amounts are valid
    if (isNaN(subtotal) || isNaN(tax) || isNaN(total)) {
      console.error('Invalid calculation:', { subtotal, tax, shippingCharge, discount, total })
      return NextResponse.json({
        success: false,
        message: 'Error calculating order total'
      }, { status: 500 })
    }

    // Generate unique order number
    const orderNumber = `OP${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`

    // Create order
    const newOrder = await Order.create({
      orderNumber,
      customer: decoded.id,
      items: orderItems,
      pricing: {
        subtotal: subtotal,
        tax: tax,
        shipping: shippingCharge,
        discount: discount,
        total: total
      },
      shippingAddress: {
        name: shippingAddress.name,
        phone: shippingAddress.phone,
        email: shippingAddress.email || decoded.email || '',
        addressLine1: shippingAddress.addressLine1,
        addressLine2: shippingAddress.addressLine2 || '',
        city: shippingAddress.city,
        state: shippingAddress.state,
        pincode: shippingAddress.pincode,
        country: shippingAddress.country || 'India'
      },
      status: 'pending',
      payment: {
        method: paymentMethod,
        status: paymentMethod === 'cod' ? 'pending' : 'pending',
        couponCode: appliedCoupon
      },
      timeline: [{
        status: 'pending',
        description: 'Order placed successfully',
        timestamp: new Date()
      }]
    })

    console.log('✅ Order created:', { orderId: newOrder._id, orderNumber: newOrder.orderNumber })

    // Clear cart
    await Cart.findOneAndUpdate(
      { userId: decoded.id },
      { $set: { items: [] } }
    )

    // Populate order for response
    const populatedOrder = await Order.findById(newOrder._id)
      .populate('items.product', 'name images category pricing')
      .populate('items.seller', 'businessName name email phone')

    return NextResponse.json({
      success: true,
      message: 'Order placed successfully',
      order: populatedOrder,
      orderNumber: newOrder.orderNumber,
      paymentRequired: paymentMethod !== 'cod'
    }, { status: 201 })

  } catch (error) {
    console.error('❌ Order creation error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to place order', error: error.message },
      { status: 500 }
    )
  }
}
