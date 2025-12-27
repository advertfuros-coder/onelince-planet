#!/bin/bash

# Script to update the settings page with PasswordResetSection component

FILE="src/app/seller/(seller)/settings/page.jsx"

echo "🔧 Updating settings page..."

# Use perl for multi-line replacement
perl -i -pe 'BEGIN{undef $/;} s/<div className="grid grid-cols-1 gap-8 max-w-lg">\s*<SettingInput label="Current Secure Key" type="password" placeholder="••••••••" \/>\s*<SettingInput label="New Entropy Passphrase" type="password" placeholder="Min 12 characters" \/>\s*<SettingInput label="Verify Entropy" type="password" placeholder="Confirm passphrase" \/>\s*<\/div>/<PasswordResetSection token={token} \/>/gs' "$FILE"

echo "✅ Settings page updated!"
echo ""
echo "Changes made:"
echo "  - Replaced static password inputs with PasswordResetSection component"
echo ""
echo "Please restart your dev server to see the changes."
