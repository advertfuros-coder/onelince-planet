// lib/store/cartStore.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import toast from 'react-hot-toast'

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        const items = get().items
        const existingItem = items.find(item => item._id === product._id)

        if (existingItem) {
          set({
            items: items.map(item =>
              item._id === product._id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          })
          toast.success('Quantity updated')
        } else {
          set({ items: [...items, { ...product, quantity: 1 }] })
          toast.success('Added to cart')
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter(item => item._id !== productId) })
        toast.success('Removed from cart')
      },

      updateQuantity: (productId, quantity) => {
        if (quantity < 1) {
          get().removeItem(productId)
          return
        }
        set({
          items: get().items.map(item =>
            item._id === productId ? { ...item, quantity } : item
          )
        })
      },

      clearCart: () => {
        set({ items: [] })
      },

      getTotal: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0)
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0)
      }
    }),
    {
      name: 'cart-storage'
    }
  )
)
