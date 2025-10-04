// app/api/wishlist/add/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import User from '@/lib/db/models/User'
import Product from '@/lib/db/models/Product'
import { verifyToken } from '@/lib/utils/auth'

export async function POST(request) {
  await connectDB()
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  const decoded = verifyToken(token)
  const { productId } = await request.json()
  const product = await Product.findById(productId)
  if (!product) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 })
  const user = await User.findById(decoded.id)
  if (!user.wishlist.includes(productId)) user.wishlist.push(productId)
  await user.save()
  return NextResponse.json({ success: true, message: 'Added to wishlist' })
}
