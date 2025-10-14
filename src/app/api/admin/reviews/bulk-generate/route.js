import { NextResponse } from 'next/server';
 import Review from '@/lib/db/models/Review';
import Product from '@/lib/db/models/Product';
import User from '@/lib/db/models/User';
import { parse } from 'csv-parse/sync';
import mongoose from 'mongoose';
import connectDB from '@/lib/db/mongodb';

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { productId, reviewCount, csvData } = body;

    // Validate product ID
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid Product ID' },
        { status: 400 }
      );
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    // Parse CSV data
    const reviewTemplates = parse(csvData, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    if (reviewTemplates.length === 0) {
      return NextResponse.json(
        { success: false, message: 'CSV file is empty or invalid' },
        { status: 400 }
      );
    }

    // Create dummy users and reviews
    const reviewsToInsert = [];
    const usersToInsert = [];

    for (let i = 0; i < reviewCount; i++) {
      // Use templates in rotation if reviewCount > template count
      const template = reviewTemplates[i % reviewTemplates.length];

      const timestamp = Date.now();
      const randomNum = Math.floor(Math.random() * 10000);

      // Create dummy user with required fields
      const dummyUser = {
        _id: new mongoose.Types.ObjectId(),
        name: template.name || `User ${i + 1}`,
        email: `dummy_${timestamp}_${i}_${randomNum}@fake.com`,
        phone: `999999${String(i).padStart(4, '0')}`, // Generate fake phone number
        password: `dummy_password_${timestamp}_${i}`, // Dummy password (will be hashed by User model pre-save hook if exists)
        role: 'customer',
        isActive: false, // Mark as inactive/dummy
        isDummy: true, // Custom flag to identify dummy users
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      usersToInsert.push(dummyUser);

      // Create review
      const review = {
        productId: productId,
        userId: dummyUser._id,
        orderId: null,
        rating: parseInt(template.rating) || 5,
        title: template.title || 'Great Product',
        comment: template.comment || 'Very satisfied with this product.',
        images: [],
        isApproved: true,
        isVerifiedPurchase: true,
        helpful: Math.floor(Math.random() * 10), // Random helpful count 0-9
        unhelpful: Math.floor(Math.random() * 3), // Random unhelpful count 0-2
      };

      reviewsToInsert.push(review);
    }

    // Insert dummy users
    await User.insertMany(usersToInsert, { 
      validateBeforeSave: false // Skip validation hooks if needed
    });

    // Insert reviews
    const insertedReviews = await Review.insertMany(reviewsToInsert);

    // Update product ratings
    const allProductReviews = await Review.find({ 
      productId, 
      isApproved: true 
    });
    
    if (allProductReviews.length > 0) {
      const totalRating = allProductReviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / allProductReviews.length;
      
      await Product.findByIdAndUpdate(productId, {
        'ratings.average': parseFloat(averageRating.toFixed(2)),
        'ratings.count': allProductReviews.length
      });
    }

    return NextResponse.json({
      success: true,
      message: `${insertedReviews.length} reviews generated successfully for product`,
      insertedCount: insertedReviews.length,
      productId: productId,
      newRating: {
        average: parseFloat(((allProductReviews.reduce((sum, review) => sum + review.rating, 0)) / allProductReviews.length).toFixed(2)),
        count: allProductReviews.length
      }
    });

  } catch (error) {
    console.error('Bulk review generation error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
