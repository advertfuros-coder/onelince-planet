import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import GlobalSetting from '@/lib/db/models/GlobalSetting'
import { verifyToken } from '@/lib/utils/auth'

export async function GET(request) {
  try {
    await connectDB()
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const decoded = verifyToken(token)

    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    let settings = await GlobalSetting.findOne()
    
    if (!settings) {
      settings = await GlobalSetting.create({})
    }

    return NextResponse.json({
      success: true,
      settings
    })

  } catch (error) {
    console.error('Settings GET Error:', error)
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    await connectDB()
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const decoded = verifyToken(token)

    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    
    // Update or Create
    const settings = await GlobalSetting.findOneAndUpdate(
      {}, 
      { $set: data },
      { new: true, upsert: true }
    )

    return NextResponse.json({
      success: true,
      settings,
      message: 'Settings updated successfully'
    })

  } catch (error) {
    console.error('Settings PUT Error:', error)
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}
