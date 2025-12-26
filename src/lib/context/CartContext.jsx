// lib/context/CartContext.jsx
'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'

export const CartContext = createContext()

export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart')
      if (savedCart) {
        setItems(JSON.parse(savedCart))
      }
    } catch (error) {
      console.error('Error loading cart:', error)
    }
    setIsLoaded(true)
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      if (items.length > 0) {
        localStorage.setItem('cart', JSON.stringify(items))
      } else {
        localStorage.removeItem('cart')
      }
    }
  }, [items, isLoaded])

  const addToCart = (product, quantity = 1, variant = null) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(
        item => item.productId === product._id && 
        JSON.stringify(item.variant) === JSON.stringify(variant)
      )

      if (existingItem) {
        setTimeout(() => toast.success('Updated cart quantity'), 0)
        return prevItems.map(item =>
          item.productId === product._id && 
          JSON.stringify(item.variant) === JSON.stringify(variant)
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }

      setTimeout(() => toast.success('Added to cart'), 0)
      
      const itemPrice = variant?.price || product.pricing?.salePrice || product.pricing?.basePrice;
      const itemImage = (variant?.imageIndex !== undefined && product.images?.[variant.imageIndex]?.url) 
        || product.images?.[0]?.url;

      return [...prevItems, {
        productId: product._id,
        name: product.name,
        price: itemPrice,
        image: itemImage,
        quantity,
        variant,
        stock: variant?.stock ?? product.inventory?.stock
      }]
    })
  }

  const removeFromCart = (productId, variant = null) => {
    setItems(prevItems => {
      const newItems = prevItems.filter(
        item => !(item.productId === productId && 
        JSON.stringify(item.variant) === JSON.stringify(variant))
      )
      setTimeout(() => toast.success('Removed from cart'), 0)
      return newItems
    })
  }

  const updateQuantity = (productId, quantity, variant = null) => {
    if (quantity < 1) {
      removeFromCart(productId, variant)
      return
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.productId === productId && 
        JSON.stringify(item.variant) === JSON.stringify(variant)
          ? { ...item, quantity }
          : item
      )
    )
  }

  const clearCart = () => {
    setItems([])
    localStorage.removeItem('cart')
    setTimeout(() => toast.success('Cart cleared'), 0)
  }

  const getCartTotal = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const getCartCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0)
  }

  // Calculate all cart values
  const subtotal = getCartTotal()
  const shipping = subtotal > 500 ? 0 : 50 // Free shipping over 500
  const tax = Math.round(subtotal * 0.18) // 18% GST
  const total = subtotal + shipping + tax

  const value = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    isLoaded,
    // Add these new values
    subtotal,
    shipping,
    tax,
    total
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}
