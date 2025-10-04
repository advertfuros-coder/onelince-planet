// app/api/admin/users/route.js

import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import User from '@/lib/db/models/User'
import { verifyToken, isAdmin } from '@/lib/utils/adminAuth'

export async function GET(request) {
  await connectDB()
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  const decoded = verifyToken(token)

  if (!decoded || !isAdmin(decoded)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  const users = await User.find()
    .select('-password')
    .lean()

  return NextResponse.json({ success: true, users })
}
