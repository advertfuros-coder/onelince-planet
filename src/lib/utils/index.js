// lib/utils/index.js
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(price)
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date))
}

export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export function generateOrderNumber() {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 1000)
  return `OP${timestamp}${random}`
}

export function generateSKU(productName, sellerId) {
  const cleanName = productName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 6)
  const sellerCode = sellerId.toString().substring(-4)
  const random = Math.floor(Math.random() * 1000)
  return `${cleanName}${sellerCode}${random}`
}

export function getImageUrl(path, fallback = '/images/placeholder.jpg') {
  if (!path) return fallback
  if (path.startsWith('http')) return path
  return `${process.env.NEXT_PUBLIC_IMAGE_URL || ''}${path}`
}

export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePhone(phone) {
  const phoneRegex = /^[6-9]\d{9}$/
  return phoneRegex.test(phone)
}

export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}
