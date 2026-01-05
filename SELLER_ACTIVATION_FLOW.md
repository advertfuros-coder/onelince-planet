# Seller Activation & Password Change Flow

## Complete Implementation Guide

### Overview

When an admin activates a seller, the system automatically:

1. Generates a temporary password
2. Sends approval email with credentials
3. Forces password change on first login
4. Uses OTP verification for password updates

---

## Flow Diagram

```
Admin Activates Seller
    ↓
Generate Temp Password (8 chars random)
    ↓
Update User: password = hashed(tempPassword), requirePasswordChange = true
    ↓
Send Approval Email with Email & Password
    ↓
Seller Receives Email
    ↓
Seller Logs In with Temp Password
    ↓
System Detects requirePasswordChange = true
    ↓
Redirect to Change Password Page
    ↓
Seller Requests OTP (clicks "Send OTP")
    ↓
System Generates 6-digit OTP
    ↓
OTP Email Sent (valid for 10 minutes)
    ↓
Seller Enters OTP + New Password
    ↓
System Verifies OTP
    ↓
Password Updated, requirePasswordChange = false
    ↓
Seller Can Access Dashboard
```

---

## API Endpoints

### 1. Activate Seller (Admin Only)

**Endpoint:** `PATCH /api/admin/sellers/[id]/toggle-status`

**What it does when activating:**

- Generates random 8-character temporary password
- Hashes password and updates User model
- Sets `requirePasswordChange: true` on User
- Updates Seller: `isActive: true`, `verificationStatus: 'approved'`, `isVerified: true`
- Sends approval email with credentials

**Response:**

```json
{
  "success": true,
  "message": "Seller activated and approval email sent successfully"
}
```

### 2. Send OTP

**Endpoint:** `POST /api/auth/send-otp`

**Request Body:**

```json
{
  "email": "seller@example.com"
}
```

**What it does:**

- Generates 6-digit OTP
- Stores OTP in memory with 10-minute expiry
- Sends OTP email to seller
- Returns preview URL (development mode)

**Response:**

```json
{
  "success": true,
  "message": "OTP sent successfully to your email",
  "previewUrl": "https://ethereal.email/message/..." // Dev only
}
```

### 3. Verify OTP & Update Password

**Endpoint:** `POST /api/auth/verify-otp`

**Request Body:**

```json
{
  "email": "seller@example.com",
  "otp": "123456",
  "newPassword": "newSecurePassword123"
}
```

**What it does:**

- Verifies OTP is valid and not expired
- Checks attempt limit (max 3 attempts)
- Updates password (hashed)
- Sets `requirePasswordChange: false`
- Clears OTP from store

**Response:**

```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

---

## Frontend Implementation

### 1. Detect Password Change Required (in Login Page)

```javascript
// After successful login
const response = await fetch("/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});

const data = await response.json();

if (data.success) {
  if (data.user.requirePasswordChange) {
    // Redirect to password change page
    router.push("/change-password?email=" + data.user.email);
  } else {
    // Normal login - go to dashboard
    router.push("/seller/dashboard");
  }
}
```

### 2. Change Password Page Component

```javascript
// app/change-password/page.jsx
"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function ChangePasswordPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [step, setStep] = useState("request"); // 'request' or 'verify'
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Step 1: Request OTP
  const handleSendOTP = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (data.success) {
        setMessage("OTP sent to your email!");
        setStep("verify");
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage("Error sending OTP");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP & Update Password
  const handleVerifyAndUpdate = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();

      if (data.success) {
        setMessage("Password updated! Redirecting...");
        setTimeout(() => {
          window.location.href = "/seller/dashboard";
        }, 2000);
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage("Error updating password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow">
        <h2 className="text-2xl font-semibold text-center">Change Your Password</h2>

        {step === "request" ? (
          <div>
            <p className="text-gray-600 mb-4">
              You need to change your temporary password. Click below to receive
              an OTP.
            </p>
            <button
              onClick={handleSendOTP}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </div>
        ) : (
          <form onSubmit={handleVerifyAndUpdate}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">OTP Code</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                className="w-full border px-3 py-2 rounded"
                placeholder="Enter 6-digit OTP"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border px-3 py-2 rounded"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border px-3 py-2 rounded"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}

        {message && <div className="mt-4 text-center text-sm">{message}</div>}
      </div>
    </div>
  );
}
```

---

## Security Features

### 1. OTP Security

- ✅ 6-digit random OTP
- ✅ 10-minute expiry
- ✅ Max 3 verification attempts
- ✅ Automatically cleared after use

### 2. Password Security

- ✅ Bcrypt hashing (10 rounds)
- ✅ Minimum 6 characters
- ✅ Temporary password (8 random chars)
- ✅ Force change on first login

### 3. Email Security

- ✅ Professional templates
- ✅ Security warnings
- ✅ Never share credentials reminder

---

## Testing

### Test the Complete Flow:

1. **Admin activates seller**

   ```bash
   # In admin panel, toggle seller status to active
   # Check console for email preview URL
   ```

2. **Check approval email**

   ```bash
   # Click the preview URL from console
   # You'll see the email with temp password
   ```

3. **Test OTP sending**

   ```bash
   curl -X POST http://localhost:3001/api/auth/send-otp \
     -H "Content-Type: application/json" \
     -d '{"email":"seller@example.com"}'
   ```

4. **Test OTP verification**
   ```bash
   curl -X POST http://localhost:3001/api/auth/verify-otp \
     -H "Content-Type: application/json" \
     -d '{
       "email":"seller@example.com",
       "otp":"123456",
       "newPassword":"newPassword123"
     }'
   ```

---

## Production Considerations

### Current Implementation (Development):

- ✅ In-memory OTP storage (Map)
- ✅ Ethereal email for testing
- ✅ Console logs with preview URLs

### For Production:

1. **Use Redis for OTP storage**

   ```javascript
   // Instead of Map, use Redis
   await redis.setex(`otp:${email}`, 600, JSON.stringify(otpData));
   ```

2. **Use real email service**

   - Gmail SMTP
   - SendGrid
   - Amazon SES

3. **Add rate limiting**

   - Max 3 OTP requests per hour
   - Prevent spam

4. **Add logging**
   - Log all OTP requests
   - Track failed attempts
   - Security monitoring

---

## Complete Feature Checklist

✅ Admin activation generates temp password
✅ Approval email sent with credentials
✅ User model has `requirePasswordChange` flag
✅ OTP generation and sending
✅ OTP verification with attempts limit
✅ Password update after OTP verification
✅ Email templates (Approval + OTP)
✅ Security warnings in emails
✅ Professional Poppins font design

**The complete seller activation and password change system is ready!** 🎉
