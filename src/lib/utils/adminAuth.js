import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET

// Verify JWT token and return decoded payload or null if invalid
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

// Check if decoded token represents an admin user
export function isAdmin(decodedToken) {
  return decodedToken?.role === 'admin'
}
