// lib/hooks/useAuth.js
'use client'
import { useContext } from 'react'
import { AuthContext } from '@/lib/context/AuthContext'

export function useAuth() {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}

// Alternative: Export directly from context if you prefer
// This is already included in the AuthContext.jsx file we created
