# Email Service Configuration Guide

## Email Configuration Options

### Option 1: Gmail (Recommended for production)

Add these to your `.env.local`:

```
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM=noreply@onlineplanet.com
EMAIL_FROM_NAME=Online Planet
```

**How to set up Gmail:**

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use that app password as `EMAIL_PASSWORD`
4. Set `EMAIL_USER` to your full Gmail address

### Option 2: Custom SMTP (for enterprise email services)

Add these to your `.env.local`:

```
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-username
SMTP_PASSWORD=your-password
EMAIL_FROM=noreply@onlineplanet.com
EMAIL_FROM_NAME=Online Planet
```

### Option 3: Development Mode (Default)

Leave all email variables empty in `.env.local`

The system will automatically use **Ethereal Email** (fake SMTP) for testing:

- Emails won't be actually sent
- Preview URLs will be logged in the console
- Check the server console for preview links

## Email Templates

### Seller Welcome Email

Sent automatically after successful onboarding registration.

**Includes:**

- Beautiful gradient header with welcome message
- Application details (ID, business name, status)
- 3-step "What Happens Next" guide
- App download links
- Support contact information
- Social media links

### Testing Emails

1. **Complete a seller registration**
2. **Check server console** for logs:
   ```
   ✅ Welcome email sent to: seller@example.com
   📧 Email preview: https://ethereal.email/message/xxx
   ```
3. **Click the preview URL** to see the email

## Production Setup

For production, use a professional email service:

### Recommended Services:

- **SendGrid** - 100 emails/day free
- **Amazon SES** - Very affordable
- **Gmail SMTP** - Free for low volume
- **Mailgun** - 5,000 emails/month free

### Important:

- Never commit your `.env.local` file
- Use app-specific passwords, not your main password
- Monitor email delivery rates
- Set up SPF/DKIM records for better deliverability
