// scripts/seedReviews.js
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const PRODUCT_ID = '68eca1eaaf8d568c7f2acb84'

// Define schemas inline
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: String,
  isActive: Boolean
}, { timestamps: true })

const reviewSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, required: true },
  comment: { type: String, required: true },
  photos: [{ url: String, caption: String }],
  videos: [{ url: String, thumbnail: String, duration: Number, caption: String }],
  verifiedPurchase: { type: Boolean, default: false },
  helpful: {
    count: { type: Number, default: 0 },
    users: [{ type: mongoose.Schema.Types.ObjectId }]
  },
  status: { type: String, default: 'approved' },
  sentiment: {
    score: Number,
    label: String,
    keywords: [String]
  },
  viewCount: { type: Number, default: 0 }
}, { timestamps: true })

// Get or create models
const User = mongoose.models.User || mongoose.model('User', userSchema)
const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema)

const reviewsData = [
  {
    rating: 5,
    title: 'Absolutely love these headphones!',
    comment: 'The platform sleek looks so sleek, and the noise cancellation is unreal on my commute. Highly recommend!',
    userName: 'Sanjay Kumar',
    userEmail: 'sanjay.kumar@example.com',
    verifiedPurchase: true,
    photos: [
      { url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=300&h=300&fit=crop', caption: 'Unboxing' },
      { url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=300&h=300&fit=crop', caption: 'Side view' },
      { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop', caption: 'Color options' }
    ],
    helpful: { count: 52, users: [] },
    sentiment: { score: 0.9, label: 'positive', keywords: ['love', 'sleek', 'recommend'] }
  },
  {
    rating: 5,
    title: 'Great sound quality!',
    comment: 'Great sound quality, bass is punchy for my music. Delivery to Mumbai was super fast, got it just 2 days ahead instead of a week I was thinking!',
    userName: 'Rahul Mehta',
    userEmail: 'rahul.mehta@example.com',
    verifiedPurchase: true,
    helpful: { count: 41, users: [] },
    sentiment: { score: 0.7, label: 'positive', keywords: ['great', 'sound quality', 'fast'] }
  },
  {
    rating: 5,
    title: 'Unpacking and first impressions!',
    comment: 'Unpacking and first impressions! These headphones are so comfortable and the sound is phenomenal. Definitely best for call quality too.',
    userName: 'Priya Sharma',
    userEmail: 'priya.sharma@example.com',
    verifiedPurchase: true,
    videos: [{
      url: 'https://example.com/video.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=400&fit=crop',
      duration: 120,
      caption: 'Unboxing review'
    }],
    helpful: { count: 31, users: [] },
    sentiment: { score: 0.95, label: 'positive', keywords: ['comfortable', 'phenomenal', 'best'] }
  },
  {
    rating: 4,
    title: 'Good headphones but expensive',
    comment: 'Really good headphones with excellent noise cancellation. Sound quality is top-notch. However, I feel they are a bit overpriced.',
    userName: 'Amit Patel',
    userEmail: 'amit.patel@example.com',
    verifiedPurchase: true,
    helpful: { count: 28, users: [] },
    sentiment: { score: 0.5, label: 'positive', keywords: ['good', 'excellent', 'expensive'] }
  },
  {
    rating: 5,
    title: 'Perfect for work from home',
    comment: 'Best purchase for working from home! The noise cancellation blocks out all background noise. Battery life is amazing.',
    userName: 'Neha Singh',
    userEmail: 'neha.singh@example.com',
    verifiedPurchase: true,
    photos: [
      { url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=300&h=300&fit=crop', caption: 'At my desk' }
    ],
    helpful: { count: 45, users: [] },
    sentiment: { score: 0.9, label: 'positive', keywords: ['best', 'amazing', 'perfect'] }
  },
  {
    rating: 4,
    title: 'Great but has minor issues',
    comment: 'Sound quality is fantastic and noise cancellation works brilliantly. However, ear cups get warm after extended use.',
    userName: 'Vikram Reddy',
    userEmail: 'vikram.reddy@example.com',
    verifiedPurchase: true,
    helpful: { count: 19, users: [] },
    sentiment: { score: 0.6, label: 'positive', keywords: ['fantastic', 'brilliantly'] }
  },
  {
    rating: 5,
    title: 'Audiophile approved!',
    comment: 'As an audiophile, I\'m very picky. These exceeded my expectations. LDAC codec support means lossless audio. Bass is punchy, mids clear, highs crisp.',
    userName: 'Arjun Kapoor',
    userEmail: 'arjun.kapoor@example.com',
    verifiedPurchase: true,
    helpful: { count: 67, users: [] },
    sentiment: { score: 0.95, label: 'positive', keywords: ['exceeded', 'lossless', 'crisp'] }
  },
  {
    rating: 3,
    title: 'Decent but not worth the price',
    comment: 'They\'re okay headphones. Sound is good, noise cancellation works. But for this price, I expected more. Build quality feels plasticky.',
    userName: 'Rohan Joshi',
    userEmail: 'rohan.joshi@example.com',
    verifiedPurchase: false,
    helpful: { count: 12, users: [] },
    sentiment: { score: 0.1, label: 'neutral', keywords: ['okay', 'decent', 'expected more'] }
  },
  {
    rating: 5,
    title: 'Best noise cancellation ever!',
    comment: 'I travel a lot for work - these are a game changer. Noise cancellation is industry-leading. Can\'t hear plane engines at all!',
    userName: 'Kavita Desai',
    userEmail: 'kavita.desai@example.com',
    verifiedPurchase: true,
    helpful: { count: 58, users: [] },
    sentiment: { score: 0.95, label: 'positive', keywords: ['best', 'game changer', 'industry-leading'] }
  },
  {
    rating: 4,
    title: 'Great for daily commute',
    comment: 'Using daily on Mumbai local trains. Noise cancellation is excellent - blocks out all chaos. Highly recommend for commuters!',
    userName: 'Anil Kumar',
    userEmail: 'anil.kumar@example.com',
    verifiedPurchase: true,
    photos: [
      { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop', caption: 'Daily commute' }
    ],
    helpful: { count: 23, users: [] },
    sentiment: { score: 0.7, label: 'positive', keywords: ['excellent', 'recommend'] }
  }
]

async function seedReviews() {
  try {
    console.log('🌱 Starting review seeding...')
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ MongoDB connected')

    // Clear existing reviews
    const deleted = await Review.deleteMany({ productId: PRODUCT_ID })
    console.log(`🗑️  Deleted ${deleted.deletedCount} existing reviews`)

    // Create reviews
    for (const reviewData of reviewsData) {
      // Find or create user
      let user = await User.findOne({ email: reviewData.userEmail })
      
      if (!user) {
        user = await User.create({
          name: reviewData.userName,
          email: reviewData.userEmail,
          password: '$2a$10$dummyhashforseededusers',
          role: 'customer',
          isActive: true
        })
        console.log(`👤 Created user: ${reviewData.userName}`)
      }

      // Create review
      await Review.create({
        productId: new mongoose.Types.ObjectId(PRODUCT_ID),
        userId: user._id,
        rating: reviewData.rating,
        title: reviewData.title,
        comment: reviewData.comment,
        verifiedPurchase: reviewData.verifiedPurchase,
        photos: reviewData.photos || [],
        videos: reviewData.videos || [],
        helpful: reviewData.helpful,
        status: 'approved',
        sentiment: reviewData.sentiment,
        viewCount: Math.floor(Math.random() * 500) + 100
      })

      console.log(`✅ Created review by ${reviewData.userName} (${reviewData.rating} stars)`)
    }

    // Calculate stats
    const stats = await Review.aggregate([
      { $match: { productId: new mongoose.Types.ObjectId(PRODUCT_ID), status: 'approved' } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratings: { $push: '$rating' }
        }
      }
    ])
    
    if (stats.length > 0) {
      const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      stats[0].ratings.forEach(rating => {
        distribution[rating] = (distribution[rating] || 0) + 1
      })
      
      console.log('\n📊 Review Statistics:')
      console.log(`   Average Rating: ${(Math.round(stats[0].averageRating * 10) / 10).toFixed(1)} ⭐`)
      console.log(`   Total Reviews: ${stats[0].totalReviews}`)
      console.log(`   Distribution:`)
      console.log(`     5⭐: ${distribution[5]} reviews`)
      console.log(`     4⭐: ${distribution[4]} reviews`)
      console.log(`     3⭐: ${distribution[3]} reviews`)
      console.log(`     2⭐: ${distribution[2]} reviews`)
      console.log(`     1⭐: ${distribution[1]} reviews`)
    }

    console.log('\n✨ Review seeding completed successfully!')
    
    await mongoose.connection.close()
    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding reviews:', error)
    process.exit(1)
  }
}

seedReviews()
