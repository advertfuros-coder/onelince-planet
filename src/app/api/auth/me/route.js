// app/api/auth/me/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import User from '@/lib/db/models/User'
import { verifyToken } from '@/lib/utils/auth'

export async function GET(request) {
  await connectDB()
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  const user = token && verifyToken(token) ? await User.findById(verifyToken(token).id).select('-password') : null
  if (!user) return NextResponse.json({ success: false, message: 'Not found' }, { status: 401 })
  return NextResponse.json({ success: true, user })
}
