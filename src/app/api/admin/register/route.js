// app/api/admin/register/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import User from '@/lib/db/models/User'
import bcrypt from 'bcryptjs'

export async function POST(request) {
  try {
    await connectDB()
    const { name, email, password, phone } = await request.json()

    if (!name || !email || !password || !phone) {
      return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 })
    }

    // Make sure user doesn't exist already
    const userExists = await User.findOne({ email })
    if (userExists) {
      return NextResponse.json({ success: false, message: 'User already exists' }, { status: 400 })
    }

    // Create admin user
    const adminUser = await User.create({
      name,
      email,
      password: await bcrypt.hash(password, 10),
      phone,
      role: 'admin',
      isVerified: true,
    })

    return NextResponse.json({ success: true, message: 'Admin registered!' })
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
