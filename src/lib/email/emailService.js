// lib/email/emailService.js

/**
 * Email Service for sending transactional emails
 */

class EmailService {
  constructor() {
    this.transporter = null;
    this.nodemailer = null;
  }

  async loadNodemailer() {
    if (!this.nodemailer) {
      this.nodemailer = await import("nodemailer").then((m) => m.default || m);
    }
    return this.nodemailer;
  }

  async initialize() {
    // Force reinitialize to pick up any env variable changes
    this.transporter = null;

    if (!this.transporter) {
      const nodemailer = await this.loadNodemailer();

      // Configure based on environment
      if (process.env.EMAIL_SERVICE === "gmail") {
        this.transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
          },
        });
      } else if (process.env.SMTP_HOST) {
        // Custom SMTP configuration
        const smtpPort = parseInt(process.env.SMTP_PORT) || 587;
        const isSecure = process.env.SMTP_SECURE === "true";
        const smtpUser = process.env.SMTP_USER;
        const smtpPass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD;

        console.log("🔧 SMTP Configuration Debug:");
        console.log("  Host:", process.env.SMTP_HOST);
        console.log(
          "  Port (raw):",
          process.env.SMTP_PORT,
          "Type:",
          typeof process.env.SMTP_PORT
        );
        console.log("  Port (parsed):", smtpPort, "Type:", typeof smtpPort);
        console.log(
          "  Secure (raw):",
          process.env.SMTP_SECURE,
          "Type:",
          typeof process.env.SMTP_SECURE
        );
        console.log("  Secure (parsed):", isSecure, "Type:", typeof isSecure);
        console.log("  User:", smtpUser);
        console.log(
          "  Pass:",
          smtpPass ? `***${smtpPass.slice(-4)}` : "NOT SET"
        );

        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: smtpPort,
          secure: isSecure, // true for 465 (SSL), false for other ports (use STARTTLS)
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
          // Additional options for better compatibility with various SMTP providers
          tls: {
            rejectUnauthorized: false, // Accept self-signed certificates (use with caution in production)
          },
          connectionTimeout: 30000, // 30 seconds (increased from 10s)
          greetingTimeout: 30000, // 30 seconds
          socketTimeout: 30000, // 30 seconds
          pool: true, // Use connection pooling
          maxConnections: 5,
          maxMessages: 100,
        });

        console.log(
          `📧 SMTP configured: ${process.env.SMTP_HOST}:${smtpPort} (secure: ${isSecure})`
        );
      } else {
        // Development mode - use Ethereal (fake SMTP)
        const testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
        console.log("📧 Using Ethereal Email for development");
        console.log("Test account:", testAccount.user);
      }
    }
    return this.transporter;
  }

  async sendEmail({ to, subject, html, text }, retries = 3) {
    try {
      const nodemailer = await this.loadNodemailer();
      await this.initialize();

      const mailOptions = {
        from: `"${
          process.env.SMTP_FROM_NAME ||
          process.env.EMAIL_FROM_NAME ||
          "Online Planet"
        }" <${
          process.env.SMTP_FROM_EMAIL ||
          process.env.EMAIL_FROM ||
          "noreply@onlineplanet.com"
        }>`,
        to,
        subject,
        html,
        text: text || this.stripHtml(html),
      };

      let lastError;
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          console.log(`📧 Sending email (attempt ${attempt}/${retries})...`);
          const info = await this.transporter.sendMail(mailOptions);

          console.log("✅ Email sent:", info.messageId);

          // Log preview URL for Ethereal
          const previewUrl = nodemailer.getTestMessageUrl(info);
          if (previewUrl) {
            console.log("📧 Preview URL:", previewUrl);
          }

          return {
            success: true,
            messageId: info.messageId,
            previewUrl,
          };
        } catch (error) {
          lastError = error;
          console.error(`❌ Email attempt ${attempt} failed:`, error.message);
          
          // If this is a timeout error and we have retries left, wait and try again
          if (attempt < retries && (error.code === 'ETIMEDOUT' || error.code === 'ECONNECTION')) {
            const delay = Math.min(1000 * Math.pow(2, attempt), 10000); // Exponential backoff, max 10s
            console.log(`⏳ Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            // Reinitialize transporter for next attempt
            this.transporter = null;
            await this.initialize();
          } else {
            break;
          }
        }
      }

      // All retries failed
      throw lastError;
    } catch (error) {
      console.error("❌ Email sending error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  stripHtml(html) {
    return html.replace(/<[^>]*>/g, "");
  }
}

export default new EmailService();
