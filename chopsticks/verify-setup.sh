#!/bin/bash
# Chopsticks Setup Verification Script

echo "🥢 Chopsticks Setup Verification"
echo "================================"
echo ""

# Check .env file
echo "1. Checking .env file..."
if [ -f ".env" ]; then
    if grep -q "YOUR_PROJECT" .env; then
        echo "   ⚠️  .env exists but contains placeholder values"
        echo "   → Update with your actual Supabase URL and keys"
    else
        echo "   ✅ .env file exists and configured"
    fi
else
    echo "   ❌ .env file not found"
    echo "   → Copy .env.example to .env and fill in values"
fi
echo ""

# Check Firebase Android config
echo "2. Checking Firebase Android config..."
if [ -f "android/app/google-services.json" ]; then
    echo "   ✅ google-services.json found"
else
    echo "   ❌ android/app/google-services.json not found"
    echo "   → Download from Firebase Console → Project Settings → Android app"
fi
echo ""

# Check Firebase iOS config
echo "3. Checking Firebase iOS config..."
if [ -f "ios/GoogleService-Info.plist" ]; then
    echo "   ✅ GoogleService-Info.plist found"
else
    echo "   ❌ ios/GoogleService-Info.plist not found"
    echo "   → Download from Firebase Console → Project Settings → iOS app"
fi
echo ""

# Check migration file
echo "4. Checking database migration..."
if [ -f "supabase/migrations/001_complete_schema.sql" ]; then
    echo "   ✅ Migration file exists"
    echo "   → Run this in Supabase SQL Editor"
else
    echo "   ❌ Migration file not found"
fi
echo ""

# Check Edge Function
echo "5. Checking Edge Function..."
if [ -f "supabase/functions/exchange-firebase-token/index.ts" ]; then
    echo "   ✅ Edge Function code exists"
    echo "   → Deploy with: supabase functions deploy exchange-firebase-token"
else
    echo "   ❌ Edge Function not found"
fi
echo ""

echo "================================"
echo "Summary:"
echo ""
echo "Once all items are ✅, run:"
echo "  npx expo start"
echo ""
echo "For detailed setup instructions, see SETUP_GUIDE.md"
