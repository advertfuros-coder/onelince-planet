import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import User from '@/lib/db/models/User'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET

export async function POST(request) {
  try {
    await connectDB()
    const { email, password } = await request.json()

    console.log('Login attempt:', { email })

    if (!email || !password) {
      console.log('Email or password missing')
      return NextResponse.json({ success: false, message: 'Missing email or password' }, { status: 400 })
    }

    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      console.log('No user found with email:', email)
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 })
    }

    console.log('User found:', { email: user.email, role: user.role, passwordHash: user.password ? 'exists' : 'none' })

    if (user.role !== 'admin') {
      console.log('User is not admin, role:', user.role)
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const passwordValid = await bcrypt.compare(password, user.password)
    console.log('Password valid:', passwordValid)
    if (!passwordValid) {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 })
    }

    if (!JWT_SECRET) {
      console.log('JWT_SECRET is not set in environment')
      return NextResponse.json({ success: false, message: 'Server configuration error' }, { status: 500 })
    }

    const token = jwt.sign({ id: user._id.toString(), email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1h' })

    console.log('Login successful, token issued')
    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ success: false, message: 'Server error', error: error.message }, { status: 500 })
  }
}
