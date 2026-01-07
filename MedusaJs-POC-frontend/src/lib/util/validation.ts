/**
 * Validation utilities for form inputs
 */

export const validateEmail = (email: string): boolean => {
  if (!email || typeof email !== "string") return false
  const trimmed = email.trim()
  if (trimmed.length === 0) return false
  // Basic email regex - RFC 5322 compliant pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(trimmed)
}

export const validatePhone = (phone: string): boolean => {
  if (!phone || typeof phone !== "string") return false
  const trimmed = phone.trim()
  if (trimmed.length === 0) return false
  // Allow digits, spaces, hyphens, parentheses, and + for international format
  // Minimum 10 digits (after removing non-digits)
  const digitsOnly = trimmed.replace(/\D/g, "")
  return digitsOnly.length >= 10 && digitsOnly.length <= 15
}

export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (!password || typeof password !== "string") {
    return { valid: false, message: "Password is required" }
  }
  
  if (password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters long" }
  }
  
  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one uppercase letter" }
  }
  
  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one lowercase letter" }
  }
  
  // Check for at least one number
  if (!/\d/.test(password)) {
    return { valid: false, message: "Password must contain at least one number" }
  }
  
  // Check for at least one special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, message: "Password must contain at least one special character" }
  }
  
  return { valid: true }
}

export const sanitizePhone = (phone: string): string => {
  if (!phone) return ""
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, "")
  return cleaned.trim()
}

export const sanitizeEmail = (email: string): string => {
  if (!email) return ""
  return email.trim().toLowerCase()
}

