// scripts/approveAllProducts.js
const mongoose = require('mongoose')
require('dotenv').config({ path: '.env' })

async function approveAllProducts() {
  await mongoose.connect(process.env.MONGODB_URI)
  
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }))
  
  const result = await Product.updateMany(
    { isApproved: false },
    { $set: { isApproved: true } }
  )
  
  console.log(`✅ Approved ${result.modifiedCount} products`)
  
  mongoose.connection.close()
}

approveAllProducts()
