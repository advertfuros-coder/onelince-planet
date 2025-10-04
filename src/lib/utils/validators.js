// lib/utils/validators.js
export function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

export function validatePhone(phone) {
  const regex = /^[+]?[0-9]{10,13}$/
  return regex.test(phone.replace(/[\s-]/g, ''))
}

export function validatePassword(password) {
  return password.length >= 8
}

export function validatePincode(pincode) {
  const regex = /^[1-9][0-9]{5}$/
  return regex.test(pincode)
}
