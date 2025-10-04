// lib/hooks/useOrders.js
'use client'
import { useState, useCallback } from 'react'
import { apiClient } from '../api/client'

export const useOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchOrders = useCallback(async (params = {}) => {
    setLoading(true)
    setError(null)

    try {
      const queryParams = new URLSearchParams(params)
      const response = await apiClient.get(`/api/customer/orders?${queryParams}`)
      
      if (response.data.success) {
        setOrders(response.data.orders)
        return response.data
      } else {
        setError(response.data.message)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      setError(error.response?.data?.message || 'Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }, [])

  const createOrder = useCallback(async (orderData) => {
    setLoading(true)
    setError(null)

    try {
      const response = await apiClient.post('/api/customer/orders', orderData)
      
      if (response.data.success) {
        return response.data.order
      } else {
        throw new Error(response.data.message)
      }
    } catch (error) {
      console.error('Error creating order:', error)
      setError(error.response?.data?.message || 'Failed to create order')
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    orders,
    loading,
    error,
    fetchOrders,
    createOrder
  }
}
