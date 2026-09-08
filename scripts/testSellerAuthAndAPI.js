// scripts/testSellerAuthAndAPI.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

async function testAuth() {
  await mongoose.connect(process.env.MONGODB_URI);

  const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
    name: String,
    email: String,
    role: String,
    isVerified: Boolean,
    password: { type: String, select: true }
  }, { strict: false }));

  const Seller = mongoose.models.Seller || mongoose.model('Seller', new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    businessInfo: Object,
    storeInfo: Object,
    verificationStatus: String
  }, { strict: false }));

  const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller' },
    name: String,
    isActive: Boolean,
    isApproved: Boolean,
    isDraft: Boolean
  }, { strict: false }));

  console.log('Testing Seller Authentication Simulation...');
  const user = await User.findOne({ email: 'dream.electronics@onlineplanet.com' });
  if (!user) throw new Error('Seller user not found');

  const isPasswordValid = await bcrypt.compare('DreamElectronics@2026', user.password);
  console.log('Credentials valid:', isPasswordValid);

  // Generate JWT token as done in app auth login
  const token = jwt.sign(
    {
      userId: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: '7d' }
  );
  console.log('JWT Token generated successfully (Length: ' + token.length + ')');

  // Verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
  console.log('Decoded Token:', { userId: decoded.userId, role: decoded.role });

  // Simulate seller dashboard products endpoint
  const seller = await Seller.findOne({ userId: decoded.userId });
  console.log('Resolved Seller Profile for logged-in user:', seller?.storeInfo?.storeName);

  const sellerProducts = await Product.find({ sellerId: seller._id, isDraft: { $ne: true } });
  console.log('Seller Dashboard Product List count:', sellerProducts.length);
  sellerProducts.forEach((p, i) => console.log(`  [${i + 1}] ${p.name}`));

  await mongoose.connection.close();
  console.log('✅ Auth and Dashboard simulation test passed!');
}

testAuth().catch(err => {
  console.error(err);
  process.exit(1);
});
