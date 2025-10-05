// app/api/admin/marketing/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import Campaign from '@/lib/db/models/Campaign'
import Order from '@/lib/db/models/Order'
import User from '@/lib/db/models/User'
import { verifyToken, isAdmin } from '@/lib/utils/adminAuth'

export async function GET(request) {
  try {
    await connectDB()
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const decoded = verifyToken(token)

    if (!decoded || !isAdmin(decoded)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const campaigns = await Campaign.find()
      .sort({ createdAt: -1 })
      .lean()

    // Calculate campaign performance
    const campaignsWithStats = await Promise.all(
      campaigns.map(async (campaign) => {
        const ordersWithCampaign = await Order.countDocuments({
          'marketing.campaignId': campaign._id,
        })

        const revenue = await Order.aggregate([
          { $match: { 'marketing.campaignId': campaign._id } },
          { $group: { _id: null, total: { $sum: '$pricing.total' } } },
        ]).then((res) => res[0]?.total || 0)

        const roi = campaign.budget > 0 ? ((revenue - campaign.budget) / campaign.budget) * 100 : 0
        const conversionRate = campaign.stats?.clicks > 0 ? (ordersWithCampaign / campaign.stats.clicks) * 100 : 0

        return {
          ...campaign,
          performance: {
            orders: ordersWithCampaign,
            revenue,
            roi,
            conversionRate,
          },
        }
      })
    )

    // Overall stats
    const totalBudget = campaigns.reduce((sum, c) => sum + (c.budget || 0), 0)
    const totalSpent = campaigns.reduce((sum, c) => sum + (c.spent || 0), 0)
    const activeCampaigns = campaigns.filter((c) => c.status === 'active').length
    const totalRevenue = campaignsWithStats.reduce((sum, c) => sum + c.performance.revenue, 0)

    return NextResponse.json({
      success: true,
      campaigns: campaignsWithStats,
      stats: {
        totalBudget,
        totalSpent,
        activeCampaigns,
        totalCampaigns: campaigns.length,
        totalRevenue,
        overallROI: totalSpent > 0 ? ((totalRevenue - totalSpent) / totalSpent) * 100 : 0,
      },
    })
  } catch (error) {
    console.error('Marketing GET error:', error)
    return NextResponse.json({ success: false, message: 'Server error', error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    await connectDB()
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const decoded = verifyToken(token)

    if (!decoded || !isAdmin(decoded)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const campaign = await Campaign.create({
      ...body,
      createdBy: decoded.userId,
      status: 'draft',
    })

    return NextResponse.json({ success: true, message: 'Campaign created successfully', campaign })
  } catch (error) {
    console.error('Campaign POST error:', error)
    return NextResponse.json({ success: false, message: 'Server error', error: error.message }, { status: 500 })
  }
}
