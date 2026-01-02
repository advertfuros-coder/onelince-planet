#!/usr/bin/env node

/**
 * Update Specific Seller Contact Information
 * Updates a seller with the provided contact details
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

// Import models
import Seller from '../src/lib/db/models/Seller.js';
import User from '../src/lib/db/models/User.js';

async function updateSellerContact() {
  try {
    console.log('\n🔄 Updating Seller Contact Information\n');
    console.log('=' .repeat(60));

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const contactEmail = 'advertfuros@gmail.com';
    const contactPhone = '8400043322';

    // Find seller by email or phone
    let seller = await Seller.findOne({
      $or: [
        { contactEmail },
        { contactPhone }
      ]
    }).populate('userId');

    if (!seller) {
      console.log('⚠️  Seller not found with the provided contact info.');
      console.log('   Searching for any seller to update...\n');
      
      // Get the first seller
      seller = await Seller.findOne({}).populate('userId');
      
      if (!seller) {
        console.log('❌ No sellers found in the database.\n');
        return;
      }
    }

    console.log(`📋 Found Seller: ${seller.businessName}\n`);
    console.log('Current Information:');
    console.log(`   Email: ${seller.contactEmail || 'NOT SET'}`);
    console.log(`   Phone: ${seller.contactPhone || 'NOT SET'}`);
    console.log(`   Name: ${seller.contactName || 'NOT SET'}\n`);

    // Update seller
    seller.contactEmail = contactEmail;
    seller.contactPhone = contactPhone;
    
    // If name is not set, use a default
    if (!seller.contactName && seller.userId) {
      seller.contactName = seller.userId.name || 'Dr Abid Khan';
    }

    await seller.save();

    // Also update the User model
    if (seller.userId) {
      const user = seller.userId;
      user.email = contactEmail;
      user.phone = contactPhone;
      await user.save();
      console.log('✅ Updated User model as well\n');
    }

    console.log('✅ Seller Updated Successfully!\n');
    console.log('New Information:');
    console.log(`   Email: ${seller.contactEmail}`);
    console.log(`   Phone: ${seller.contactPhone}`);
    console.log(`   Name: ${seller.contactName}\n`);

    console.log('=' .repeat(60));
    console.log('\n🎉 Contact information updated successfully!\n');

  } catch (error) {
    console.error('\n❌ Update failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB\n');
  }
}

// Run update
updateSellerContact();
