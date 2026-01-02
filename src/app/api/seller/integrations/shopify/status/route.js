// app/api/seller/integrations/shopify/status/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import User from '@/lib/db/models/User'
import jwt from 'jsonwebtoken'

export async function GET(request) {
    try {
        const authHeader = request.headers.get('authorization')
        if (!authHeader) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
        }

        const token = authHeader.split(' ')[1]
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        await connectDB()

        const seller = await User.findById(decoded.userId).select('shopifyIntegration')

        if (!seller) {
            return NextResponse.json({ success: false, message: 'Seller not found' }, { status: 404 })
        }

        // Don't send the access token to frontend
        const integration = seller.shopifyIntegration ? {
            isConnected: seller.shopifyIntegration.isConnected || false,
            shopDomain: seller.shopifyIntegration.shopDomain || null,
            lastSyncAt: seller.shopifyIntegration.lastSyncAt || null,
            syncSettings: seller.shopifyIntegration.syncSettings || {
                autoSyncProducts: true,
                autoSyncInventory: true,
                autoSyncOrders: false,
                syncInterval: 'daily'
            }
        } : {
            isConnected: false,
            shopDomain: null,
            lastSyncAt: null,
            syncSettings: null
        }

        return NextResponse.json({ 
            success: true, 
            integration 
        })

    } catch (error) {
        console.error('Get integration status error:', error)
        return NextResponse.json({ 
            success: false, 
            message: 'Failed to get integration status' 
        }, { status: 500 })
    }
}
