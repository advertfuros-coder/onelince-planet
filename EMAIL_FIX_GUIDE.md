# Email Configuration Fix - Summary

## Problem

Emails were failing to send when activating sellers with the error:

```
❌ Email sending error: [Error: Missing credentials for "PLAIN"] {
  code: 'EAUTH',
  command: 'API'
}
```

## Root Cause

The `.env.local` file used `SMTP_PASS` but the code was looking for `SMTP_PASSWORD`, causing authentication to fail.

## Solution Applied

### 1. Fixed Environment Variable Mismatch

Updated `/src/lib/email/emailService.js` to support both variable naming conventions:

**Before:**

```javascript
auth: {
  user: process.env.SMTP_USER,
  pass: process.env.SMTP_PASSWORD  // ❌ Variable didn't exist
}
```

**After:**

```javascript
auth: {
  user: process.env.SMTP_USER,
  pass: process.env.SMTP_PASS || process.env.SMTP_PASSWORD  // ✅ Supports both
}
```

### 2. Fixed Email "From" Configuration

Updated to support both `SMTP_FROM_*` and `EMAIL_FROM*` environment variables:

```javascript
from: `"${
  process.env.SMTP_FROM_NAME || process.env.EMAIL_FROM_NAME || "Online Planet"
}" <${
  process.env.SMTP_FROM_EMAIL ||
  process.env.EMAIL_FROM ||
  "noreply@onlineplanet.com"
}>`;
```

## Required Environment Variables

Make sure your `.env.local` file contains:

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password-here
SMTP_FROM_NAME=Online Planet
SMTP_FROM_EMAIL=noreply@onlineplanet.com
```

### For Gmail Users

If using Gmail, you need to:

1. Enable 2-factor authentication on your Google account
2. Generate an "App Password" at: https://myaccount.google.com/apppasswords
3. Use the app password as `SMTP_PASS` (not your regular password)

### Alternative: Use Gmail Service

You can also configure it to use Gmail service directly:

```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

## Testing Email Configuration

Run the test script to verify your setup:

```bash
node scripts/testEmail.js
```

This will:

1. Check all required environment variables
2. Attempt to send a test email
3. Show preview URL for Ethereal (development mode)
4. Display success/failure status

## How It Works Now

When a seller is activated via the admin panel:

1. **Toggle Status Route** (`/api/admin/sellers/[id]/toggle-status`)

   - Changes seller status from inactive → active
   - Generates a temporary password
   - Updates user password in database
   - Sends approval email with credentials

2. **Email Service**
   - Loads correct SMTP credentials from `.env.local`
   - Creates transporter with proper authentication
   - Sends email using configured SMTP server
   - Returns success/failure status

## Development Mode

If no SMTP credentials are configured, the system automatically:

- Uses Ethereal Email (fake SMTP service)
- Logs preview URL to console
- Doesn't actually send emails

This is perfect for testing without real email setup!

## Troubleshooting

If emails still fail:

1. **Check Environment Variables**

   ```bash
   grep SMTP .env.local
   ```

2. **Verify SMTP Credentials**

   - Ensure SMTP_USER and SMTP_PASS are correct
   - For Gmail, ensure you're using an app password

3. **Check SMTP Server Settings**

   - Gmail: smtp.gmail.com:587
   - Outlook: smtp-mail.outlook.com:587
   - Other providers: Check their documentation

4. **Test Connection**

   ```bash
   node scripts/testEmail.js
   ```

5. **Check Server Logs**
   Look for email-related errors in the console output

## Files Modified

- ✅ `/src/lib/email/emailService.js` - Fixed credential configuration
- ✅ `/scripts/testEmail.js` - Created diagnostic tool

## Next Steps

After fixing the configuration:

1. Restart your development server
2. Try activating a seller again
3. Check the console for email success messages
4. Verify the seller receives the welcome email with credentials
