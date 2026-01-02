// app/providers.jsx
'use client'
import { AuthProvider } from '@/lib/context/AuthContext'
import { CartProvider } from '@/lib/context/CartContext'
import { CurrencyProvider } from '@/lib/context/CurrencyContext'
import { Toaster } from 'react-hot-toast'

import { RegionProvider } from '@/context/RegionContext'

export function Providers({ children }) {
  return (
    <CurrencyProvider>
      <RegionProvider>
        <AuthProvider>
          <CartProvider>
            {children}
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 2000,
                  iconTheme: {
                    primary: '#4ade80',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </CartProvider>
        </AuthProvider>
      </RegionProvider>
    </CurrencyProvider>
  )
}
