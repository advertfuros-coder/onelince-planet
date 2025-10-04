// lib/utils/auth.js
import jwt from 'jsonwebtoken'

export function verifyToken(token) {
  try {
    if (!token) return null
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    return decoded
  } catch (error) {
    return null
  }
}

export function generateToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' })
}
