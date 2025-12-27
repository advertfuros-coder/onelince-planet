# Email Deliverability Guide - Fix Spam Issues

## 🎯 Why Your Emails Go to Spam

Your emails are technically sending **perfectly** - they're just being filtered by Gmail's spam detection. This is normal for new domains and can be fixed.

## ✅ Immediate Actions (Do These Now)

### 1. Mark as "Not Spam" 
- Open the email in your Spam folder
- Click **"Not Spam"** or **"Report Not Spam"**
- This trains Gmail to trust future emails from info@onlineplanet.ae

### 2. Add to Contacts
- Add `info@onlineplanet.ae` to your Gmail contacts
- Future emails will bypass spam filters

### 3. Create a Filter (Optional)
- In Gmail, search: `from:info@onlineplanet.ae`
- Click the filter icon
- Create filter → "Never send to Spam"

---

## 🔧 Long-term Solutions (Configure in Hostinger)

### **Step 1: Configure SPF Record**

SPF (Sender Policy Framework) tells email servers which IPs can send email from your domain.

**Add this DNS TXT record in Hostinger:**
```
Type: TXT
Name: @
Value: v=spf1 include:_spf.hostinger.com ~all
TTL: 14400
```

### **Step 2: Configure DKIM**

DKIM (DomainKeys Identified Mail) adds a digital signature to your emails.

**In Hostinger Control Panel:**
1. Go to **Email** → **Email Accounts**
2. Find **DKIM Settings**
3. Click **Enable DKIM**
4. Copy the DKIM record
5. Add it to your DNS as a TXT record

**Example DKIM record:**
```
Type: TXT
Name: default._domainkey
Value: v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBA... (long key)
TTL: 14400
```

### **Step 3: Configure DMARC**

DMARC tells email servers what to do with emails that fail SPF/DKIM checks.

**Add this DNS TXT record:**
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@onlineplanet.ae
TTL: 14400
```

### **Step 4: Set Up Reverse DNS (PTR Record)**

Contact Hostinger support to set up reverse DNS for your SMTP server.

---

## 📊 How to Configure DNS Records in Hostinger

### Method 1: Via Hostinger Control Panel

1. **Log into Hostinger**
2. Go to **Domains** → Select `onlineplanet.ae`
3. Click **DNS / Nameservers**
4. Click **Add Record**
5. Add each record (SPF, DKIM, DMARC) as shown above
6. Click **Save**

### Method 2: Contact Hostinger Support

If you're unsure, contact Hostinger support and ask them to:
- Enable SPF for your domain
- Enable DKIM for your email account
- Set up DMARC policy
- Configure reverse DNS (PTR record)

---

## 🧪 Test Your Email Configuration

### Check SPF, DKIM, DMARC Status

Use these free tools:

1. **MXToolbox**: https://mxtoolbox.com/SuperTool.aspx
   - Enter: `onlineplanet.ae`
   - Check SPF, DKIM, DMARC records

2. **Mail Tester**: https://www.mail-tester.com/
   - Send a test email to the address shown
   - Get a spam score (aim for 10/10)

3. **Google Postmaster Tools**: https://postmaster.google.com/
   - Monitor your domain's reputation with Gmail
   - See spam rate and authentication status

---

## ⏱️ Timeline for Improvement

- **Immediate** (0-24 hours): Mark as "Not Spam" helps your personal inbox
- **Short-term** (1-3 days): DNS records propagate, authentication improves
- **Medium-term** (1-2 weeks): Domain reputation builds, fewer spam flags
- **Long-term** (1-3 months): Established sender reputation, consistent inbox delivery

---

## 🎯 Quick Wins (Do These First)

### Priority 1: SPF Record ⭐⭐⭐
**Impact**: High | **Difficulty**: Easy | **Time**: 5 minutes

Add SPF record to authorize Hostinger to send emails for your domain.

### Priority 2: DKIM ⭐⭐⭐
**Impact**: High | **Difficulty**: Medium | **Time**: 10 minutes

Enable DKIM in Hostinger and add the DNS record.

### Priority 3: DMARC ⭐⭐
**Impact**: Medium | **Difficulty**: Easy | **Time**: 5 minutes

Add DMARC policy to improve deliverability.

---

## 📝 Email Content Best Practices

### Avoid Spam Triggers:

❌ **Don't:**
- Use ALL CAPS in subject lines
- Include too many exclamation marks!!!
- Use words like "FREE", "URGENT", "ACT NOW"
- Send only images (include text)
- Use URL shorteners

✅ **Do:**
- Write clear, professional subject lines
- Include plain text version
- Have a good text-to-image ratio
- Include unsubscribe link (for marketing emails)
- Use your real company name and address

---

## 🔍 Current Status Check

Run this command to check your current DNS records:

```bash
# Check SPF
dig TXT onlineplanet.ae +short | grep spf

# Check DKIM (replace 'default' with your selector)
dig TXT default._domainkey.onlineplanet.ae +short

# Check DMARC
dig TXT _dmarc.onlineplanet.ae +short
```

---

## 📞 Need Help?

### Hostinger Support
- **Email**: support@hostinger.com
- **Live Chat**: Available in your control panel
- **Phone**: Check your Hostinger account for regional numbers

**What to ask:**
> "Hi, I need help configuring SPF, DKIM, and DMARC records for my domain onlineplanet.ae to improve email deliverability. Can you help me set these up?"

---

## ✅ Success Checklist

- [ ] Marked test email as "Not Spam" in Gmail
- [ ] Added info@onlineplanet.ae to contacts
- [ ] Configured SPF record
- [ ] Enabled and configured DKIM
- [ ] Added DMARC record
- [ ] Tested with mail-tester.com (score 7+/10)
- [ ] Monitored delivery for 1 week
- [ ] Registered with Google Postmaster Tools

---

## 🎉 Expected Results

After completing these steps:

- **Week 1**: 50-70% inbox delivery
- **Week 2**: 70-85% inbox delivery  
- **Week 3+**: 85-95% inbox delivery

**Note**: Some emails may still go to spam initially, but the rate will decrease significantly.

---

## 💡 Pro Tips

1. **Warm Up Your Domain**: Start by sending to people who know you (they'll mark as "Not Spam")
2. **Consistent Sending**: Send regularly, not in bursts
3. **Monitor Bounces**: Remove invalid email addresses promptly
4. **Engagement Matters**: Higher open/click rates = better reputation
5. **Use Real Reply-To**: Use a monitored email address, not noreply@

---

## 🚨 Red Flags to Avoid

- Buying email lists
- Sending to people who didn't opt-in
- High bounce rates (>5%)
- High spam complaint rates (>0.1%)
- Sudden volume spikes
- Sending from shared hosting IPs (you're using dedicated SMTP, good!)

---

**Status**: ✅ Your email system is working perfectly! Now just need to build sender reputation.
