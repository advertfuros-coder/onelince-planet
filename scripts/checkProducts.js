// scripts/checkProducts.js
const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

async function checkProducts() {
  await mongoose.connect(process.env.MONGODB_URI)
  
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }))
  
  const allProducts = await Product.find({})
  console.log(`📦 Total products in DB: ${allProducts.length}`)
  
  const activeProducts = await Product.find({ isActive: true })
  console.log(`✅ Active products: ${activeProducts.length}`)
  
  const approvedProducts = await Product.find({ isApproved: true })
  console.log(`✅ Approved products: ${approvedProducts.length}`)
  
  const activeAndApproved = await Product.find({ isActive: true, isApproved: true })
  console.log(`✅ Active AND Approved: ${activeAndApproved.length}`)
  
  console.log('\n📋 Products summary:')
  allProducts.forEach(p => {
    console.log(`- ${p.name} | Active: ${p.isActive} | Approved: ${p.isApproved}`)
  })
  
  mongoose.connection.close()
}

checkProducts()
