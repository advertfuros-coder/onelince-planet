# 🌱 Database Seeding Script

## What it creates:

### Seller Account

- **Email:** seller@onlineplanet.ae
- **Password:** Seller@123456
- **Business:** Premium Electronics Store
- **Status:** Verified & Active

### Products (6 items)

1. iPhone 15 Pro Max - ₹5,199
2. Samsung Galaxy S24 Ultra - ₹4,999
3. MacBook Air M3 - ₹5,699
4. Sony WH-1000XM5 Headphones - ₹1,299
5. iPad Pro 12.9" M2 - ₹4,599
6. Dell XPS 15 Laptop - ₹7,499

### Test Data

- **3 Customer accounts** (for orders)
- **10 Orders** (various statuses)
- **15 Reviews** (4-5 stars)
- **Notifications** for admin

## How to run:

```bash
# Make sure you're in the project root
cd /Users/harsh/Developer/Personal\ Projects/Online\ Planet/my-app

# Run the seeding script
node scripts/seedDatabase.js
```

## What it does:

1. ✅ Creates seller user & profile
2. ✅ Adds 6 premium electronics products
3. ✅ Creates 3 customer accounts
4. ✅ Generates 10 realistic orders
5. ✅ Adds 15 product reviews
6. ✅ Creates admin notifications

## Login Credentials:

**Seller Account:**

- Email: seller@onlineplanet.ae
- Password: Seller@123456

**Customer Accounts:**

- ahmed@example.com / Customer@123
- fatima@example.com / Customer@123
- mohammed@example.com / Customer@123

## After Seeding:

You can now:

- ✅ Test the seller admin panel
- ✅ View realistic products
- ✅ See orders in different statuses
- ✅ Check reviews and ratings
- ✅ Test all the features we built today!

## Notes:

- Script is idempotent (safe to run multiple times)
- Won't create duplicates if data exists
- Uses realistic UAE data (Dubai addresses, AED prices)

Enjoy testing! 🎉



impletemt realtime notification system do competitor research and add you can use any npm package 