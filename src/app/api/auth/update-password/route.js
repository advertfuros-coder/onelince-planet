// app/api/auth/update-password/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import User from '@/lib/db/models/User'
import { verifyToken } from '@/lib/utils/auth'
import bcrypt from 'bcryptjs'

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

    const { currentPassword, newPassword } = await request.json()

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json({ success: false, message: 'New password must be at least 8 characters' }, { status: 400 })
    }

    const user = await User.findById(decoded.id).select('+password')
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword)
    if (!isMatch) {
      return NextResponse.json({ success: false, message: 'Current password is incorrect' }, { status: 400 })
    }

    // Update password and clear flag
    user.password = newPassword
    user.requirePasswordChange = false
    await user.save()

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully'
    })

  } catch (error) {
    console.error('Update password error:', error)
    return NextResponse.json({ success: false, message: 'Server error', error: error.message }, { status: 500 })
  }
}
