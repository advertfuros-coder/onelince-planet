// lib/hooks/useProducts.js
'use client'
import { useState, useCallback } from 'react'
import { apiClient } from '../api/client'

export const useProducts = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchProducts = useCallback(async (filters = {}) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })

      const response = await apiClient.get(`/api/customer/products?${params}`)
      
      if (response.data.success) {
        setProducts(response.data.products)
        setTotalPages(response.data.pagination.totalPages)
        setCurrentPage(response.data.pagination.currentPage)
        setTotal(response.data.pagination.totalProducts)
      } else {
        setError(response.data.message)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      setError(error.response?.data?.message || 'Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchProduct = useCallback(async (id) => {
    setLoading(true)
    setError(null)

    try {
      const response = await apiClient.get(`/api/customer/products/${id}`)
      
      if (response.data.success) {
        return response.data.product
      } else {
        throw new Error(response.data.message)
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      setError(error.response?.data?.message || 'Failed to fetch product')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    products,
    loading,
    error,
    totalPages,
    currentPage,
    total,
    fetchProducts,
    fetchProduct
  }
}
