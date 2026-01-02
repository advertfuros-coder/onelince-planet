// lib/security/encryption.js
import crypto from "crypto";

/**
 * Encrypts sensitive data using AES-256-GCM
 * @param {string} data - Data to encrypt
 * @param {string} salt - Unique salt (e.g., user ID)
 * @returns {object} - Encrypted data with IV and auth tag
 */
export function encryptData(data, salt) {
  if (!process.env.ENCRYPTION_KEY) {
    throw new Error("ENCRYPTION_KEY environment variable is not set");
  }

  const algorithm = "aes-256-gcm";

  // Derive key from master key + salt
  const key = crypto.scryptSync(process.env.ENCRYPTION_KEY, salt, 32);

  // Generate random IV
  const iv = crypto.randomBytes(16);

  // Create cipher
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  // Encrypt data
  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");

  // Get authentication tag
  const authTag = cipher.getAuthTag();

  return {
    encrypted,
    iv: iv.toString("hex"),
    authTag: authTag.toString("hex"),
  };
}

/**
 * Decrypts data encrypted with encryptData
 * @param {string} encrypted - Encrypted data
 * @param {string} iv - Initialization vector
 * @param {string} authTag - Authentication tag
 * @param {string} salt - Same salt used for encryption
 * @returns {string} - Decrypted data
 */
export function decryptData(encrypted, iv, authTag, salt) {
  if (!process.env.ENCRYPTION_KEY) {
    throw new Error("ENCRYPTION_KEY environment variable is not set");
  }

  const algorithm = "aes-256-gcm";

  // Derive same key
  const key = crypto.scryptSync(process.env.ENCRYPTION_KEY, salt, 32);

  // Create decipher
  const decipher = crypto.createDecipheriv(
    algorithm,
    key,
    Buffer.from(iv, "hex")
  );

  // Set auth tag
  decipher.setAuthTag(Buffer.from(authTag, "hex"));

  // Decrypt
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

/**
 * Get last N characters of a string for display
 * @param {string} str - String to truncate
 * @param {number} n - Number of characters to show
 * @returns {string} - Last N characters
 */
export function getLastChars(str, n = 4) {
  if (!str || str.length < n) return str;
  return str.slice(-n);
}

/**
 * Hash data using SHA-256 (for comparison, not encryption)
 * @param {string} data - Data to hash
 * @returns {string} - Hashed data
 */
export function hashData(data) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

/**
 * Generate a secure random token
 * @param {number} length - Length in bytes
 * @returns {string} - Random token
 */
export function generateSecureToken(length = 32) {
  return crypto.randomBytes(length).toString("hex");
}
