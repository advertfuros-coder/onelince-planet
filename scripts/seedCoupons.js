require('dotenv').config()
const mongoose = require('mongoose')

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables')
  process.exit(1)
}

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return
  return mongoose.connect(MONGODB_URI)
}

// CouponBanner Schema
const CouponBannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    discount: { type: Number, required: true },
    discountType: { type: String, enum: ['flat', 'percentage'], default: 'flat' },
    backgroundColor: { type: String, default: '#92C7CF' },
    textColor: { type: String, default: '#FFD66B' },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, default: null },
    termsAndConditions: { type: String, default: 'T&C Apply' },
  },
  { timestamps: true }
)

const CouponBanner = mongoose.models.CouponBanner || mongoose.model('CouponBanner', CouponBannerSchema)

const seedCoupons = async () => {
  try {
    console.log('Connecting to MongoDB...')
    await connectDB()
    console.log('✅ Connected to MongoDB')

    // Clear existing coupons
    const deleted = await CouponBanner.deleteMany({})
    console.log(`🗑️  Cleared ${deleted.deletedCount} existing coupon banners`)

    // Sample coupon banners
    const coupons = [
      {
        title: 'FLAT ₹300 OFF',
        code: 'PLANET300',
        discount: 300,
        discountType: 'flat',
        backgroundColor: '#92C7CF',
        textColor: '#FFD66B',
        order: 0,
        active: true,
        termsAndConditions: 'T&C Apply',
      },
      {
        title: '50% OFF',
        code: 'MEGA50',
        discount: 50,
        discountType: 'percentage',
        backgroundColor: '#FF6B6B',
        textColor: '#FFE66D',
        order: 1,
        active: true,
        termsAndConditions: 'Valid on orders above ₹999',
      },
      {
        title: 'FLAT ₹500 OFF',
        code: 'SAVE500',
        discount: 500,
        discountType: 'flat',
        backgroundColor: '#4ECDC4',
        textColor: '#FFE66D',
        order: 2,
        active: true,
        termsAndConditions: 'Min order ₹1999',
      },
      {
        title: '30% OFF',
        code: 'WELCOME30',
        discount: 30,
        discountType: 'percentage',
        backgroundColor: '#9B59B6',
        textColor: '#F1C40F',
        order: 3,
        active: true,
        termsAndConditions: 'New users only',
      },
      {
        title: 'FLAT ₹100 OFF',
        code: 'FIRST100',
        discount: 100,
        discountType: 'flat',
        backgroundColor: '#3498DB',
        textColor: '#FFFFFF',
        order: 4,
        active: true,
        termsAndConditions: 'First order only',
      },
    ]

    // Insert coupons
    const inserted = await CouponBanner.insertMany(coupons)
    console.log(`\n✅ Successfully seeded ${inserted.length} coupon banners:\n`)
    inserted.forEach((coupon, index) => {
      console.log(`${index + 1}. ${coupon.code}: ${coupon.title}`)
      console.log(`   Type: ${coupon.discountType === 'flat' ? 'Flat ₹' : ''}${coupon.discount}${coupon.discountType === 'percentage' ? '%' : ''}`)
      console.log(`   Colors: BG ${coupon.backgroundColor} / Text ${coupon.textColor}`)
      console.log()
    })

    await mongoose.connection.close()
    console.log('✅ Database connection closed')
    console.log('\n🎉 Coupon seeding completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding coupons:', error.message)
    process.exit(1)
  }
}

seedCoupons()
