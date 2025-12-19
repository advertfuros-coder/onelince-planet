// lib/db/models/ExternalIntegration.js
import mongoose from 'mongoose'

const ExternalIntegrationSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Integration details
  platform: {
    type: String,
    enum: ['shopify', 'woocommerce', 'magento', 'bigcommerce', 'custom_api'],
    required: true
  },
  platformName: String,
  
  // Connection
  status: {
    type: String,
    enum: ['connected', 'disconnected', 'error', 'syncing'],
    default: 'disconnected'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Credentials (encrypted)
  credentials: {
    apiKey: String,
    apiSecret: String,
    shopUrl: String,
    accessToken: String,
    refreshToken: String,
    webhookSecret: String
  },
  
  // Sync settings
  syncSettings: {
    autoSync: {
      type: Boolean,
      default: true
    },
    syncFrequency: {
      type: String,
      enum: ['realtime', 'hourly', 'daily', 'manual'],
      default: 'hourly'
    },
    syncDirection: {
      type: String,
      enum: ['import', 'export', 'bidirectional'],
      default: 'bidirectional'
    },
    syncProducts: {
      type: Boolean,
      default: true
    },
    syncInventory: {
      type: Boolean,
      default: true
    },
    syncOrders: {
      type: Boolean,
      default: true
    },
    syncPrices: {
      type: Boolean,
      default: true
    }
  },
  
  // Mapping
  fieldMapping: {
    productTitle: String,
    productDescription: String,
    productPrice: String,
    productSKU: String,
    productImages: String,
    productInventory: String
  },
  
  // Sync history
  lastSync: {
    startedAt: Date,
    completedAt: Date,
    status: String,
    productsImported: Number,
    productsExported: Number,
    inventoryUpdated: Number,
    ordersImported: Number,
    errors: [{
      message: String,
      timestamp: Date
    }]
  },
  
  // Statistics
  stats: {
    totalSyncs: { type: Number, default: 0 },
    successfulSyncs: { type: Number, default: 0 },
    failedSyncs: { type: Number, default: 0 },
    totalProductsSynced: { type: Number, default: 0 },
    totalOrdersSynced: { type: Number, default: 0 },
    lastSuccessfulSync: Date,
    lastError: {
      message: String,
      timestamp: Date
    }
  },
  
  // Webhooks
  webhooks: [{
    event: String,
    url: String,
    isActive: Boolean,
    lastTriggered: Date
  }]
}, {
  timestamps: true
})

// Indexes
ExternalIntegrationSchema.index({ sellerId: 1, platform: 1 })
ExternalIntegrationSchema.index({ sellerId: 1, status: 1 })

// Method to start sync
ExternalIntegrationSchema.methods.startSync = async function() {
  this.status = 'syncing'
  this.lastSync = {
    startedAt: new Date(),
    status: 'in_progress',
    productsImported: 0,
    productsExported: 0,
    inventoryUpdated: 0,
    ordersImported: 0,
    errors: []
  }
  this.stats.totalSyncs += 1
  return this.save()
}

// Method to complete sync
ExternalIntegrationSchema.methods.completeSync = async function(results) {
  this.status = 'connected'
  this.lastSync.completedAt = new Date()
  this.lastSync.status = 'completed'
  this.lastSync.productsImported = results.productsImported || 0
  this.lastSync.productsExported = results.productsExported || 0
  this.lastSync.inventoryUpdated = results.inventoryUpdated || 0
  this.lastSync.ordersImported = results.ordersImported || 0
  
  this.stats.successfulSyncs += 1
  this.stats.totalProductsSynced += results.productsImported || 0
  this.stats.totalOrdersSynced += results.ordersImported || 0
  this.stats.lastSuccessfulSync = new Date()
  
  return this.save()
}

// Method to handle sync error
ExternalIntegrationSchema.methods.handleSyncError = async function(error) {
  this.status = 'error'
  this.lastSync.status = 'failed'
  this.lastSync.completedAt = new Date()
  this.lastSync.errors.push({
    message: error.message,
    timestamp: new Date()
  })
  
  this.stats.failedSyncs += 1
  this.stats.lastError = {
    message: error.message,
    timestamp: new Date()
  }
  
  return this.save()
}

export default mongoose.models.ExternalIntegration || mongoose.model('ExternalIntegration', ExternalIntegrationSchema)
