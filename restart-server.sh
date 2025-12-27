#!/bin/bash

echo "🔄 Completely restarting Next.js server..."
echo ""

# Kill all Next.js processes
echo "1️⃣ Killing all Next.js processes..."
pkill -f "next dev" || echo "   No Next.js processes found"
sleep 2

# Verify they're killed
if pgrep -f "next dev" > /dev/null; then
    echo "   ⚠️  Some processes still running, force killing..."
    pkill -9 -f "next dev"
    sleep 1
fi

echo "   ✅ All Next.js processes killed"
echo ""

# Clear Next.js cache
echo "2️⃣ Clearing Next.js cache..."
rm -rf .next
echo "   ✅ Cache cleared"
echo ""

# Show current SMTP config
echo "3️⃣ Current SMTP configuration:"
grep "SMTP_" .env.local
echo ""

echo "4️⃣ Starting fresh Next.js server..."
echo "   Run: npm run dev"
echo ""
echo "✨ Ready to restart!"
