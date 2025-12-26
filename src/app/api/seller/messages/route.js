// app/api/seller/messages/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import Message from '@/lib/db/models/Message'
import User from '@/lib/db/models/User'
import { verifyToken } from '@/lib/utils/auth'

export async function GET(request) {
  try {
    await connectDB()
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const decoded = verifyToken(token)

    if (!decoded || decoded.role !== 'seller') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const userId = decoded.userId

    // Find all messages involving this user
    const messages = await Message.find({
      $or: [{ sender: userId }, { recipient: userId }]
    })
    .sort({ createdAt: -1 })
    .populate('sender', 'name')
    .populate('recipient', 'name')
    .lean()

    // Group by conversation (the other party)
    const conversationsMap = new Map()

    for (const msg of messages) {
      const isSender = msg.sender._id.toString() === userId
      const otherUser = isSender ? msg.recipient : msg.sender
      const otherId = otherUser._id.toString()

      if (!conversationsMap.has(otherId)) {
        conversationsMap.set(otherId, {
          id: otherId,
          customer: {
            id: otherId,
            name: otherUser.name || 'Unknown User',
            lastSeen: new Date().toISOString() // Placeholder
          },
          messages: [],
          lastMessage: {
            content: msg.content,
            timestamp: msg.createdAt
          },
          unreadCount: 0
        })
      }

      const conv = conversationsMap.get(otherId)
      // Add message to conversation (formatted for frontend)
      conv.messages.push({
        id: msg._id,
        content: msg.content,
        timestamp: msg.createdAt,
        sender: isSender ? 'seller' : 'customer'
      })

      // Count unread if I am the recipient
      if (!isSender && !msg.read) {
        conv.unreadCount++
      }
    }

    // Convert map to array and sort by latest message
    const conversations = Array.from(conversationsMap.values()).map(conv => ({
      ...conv,
      messages: conv.messages.reverse() // Oldest first for chat view
    }))

    return NextResponse.json({
      success: true,
      conversations
    })

  } catch (error) {
    console.error('Messages GET Error:', error)
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    await connectDB()
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const decoded = verifyToken(token)

    if (!decoded || decoded.role !== 'seller') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { recipientId, content } = await request.json()

    if (!recipientId || !content) {
      return NextResponse.json({ success: false, message: 'Missing recipient or content' }, { status: 400 })
    }

    const message = await Message.create({
      sender: decoded.userId,
      recipient: recipientId,
      content
    })

    return NextResponse.json({
      success: true,
      message
    })

  } catch (error) {
    console.error('Messages POST Error:', error)
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}
