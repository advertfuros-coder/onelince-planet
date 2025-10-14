// lib/store/authStore.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,

      login: async (email, password) => {
        try {
          const res = await axios.post('/api/auth/login', { email, password })
          if (res.data.success) {
            set({ user: res.data.user, token: res.data.token })
            return { success: true }
          }
          return { success: false, message: res.data.message }
        } catch (error) {
          return { success: false, message: error.response?.data?.message || 'Login failed' }
        }
      },

      register: async (data) => {
        try {
          const res = await axios.post('/api/auth/register', data)
          if (res.data.success) {
            set({ user: res.data.user, token: res.data.token })
            return { success: true }
          }
          return { success: false, message: res.data.message }
        } catch (error) {
          return { success: false, message: error.response?.data?.message || 'Registration failed' }
        }
      },

      logout: () => {
        set({ user: null, token: null })
      },

      updateUser: (user) => {
        set({ user })
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token })
    }
  )
)
