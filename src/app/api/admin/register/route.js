// app/api/admin/register/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import User from '@/lib/db/models/User'
import bcrypt from 'bcryptjs'

export async function POST(request) {
  try {
    await connectDB()

    // Read body
    const { name, email, phone, password } = await request.json()

    // Basic validation
    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      )
    }

    // Check for existing user
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create new admin user
    const newUser = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: 'admin',
      isVerified: true,
    })

    return NextResponse.json({ success: true, message: 'Admin registered successfully' })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Registration failed', error: error.message },
      { status: 500 }
    )
  }
}
