"use client";
import { useState, useEffect } from "react";

const STORAGE_KEY = "recentlyViewedProducts";
const MAX_ITEMS = 10;
const EXPIRY_DAYS = 30;

/**
 * Hook to manage recently viewed products
 * Stores product IDs with timestamps in localStorage
 */
export function useRecentlyViewed() {
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  // Load recently viewed from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Filter out expired items
        const now = Date.now();
        const expiryTime = EXPIRY_DAYS * 24 * 60 * 60 * 1000;
        const valid = parsed.filter(
          (item) => now - item.timestamp < expiryTime,
        );
        setRecentlyViewed(valid);

        // Update storage if items were filtered
        if (valid.length !== parsed.length) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(valid));
        }
      } catch (error) {
        console.error("Error loading recently viewed:", error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Add a product to recently viewed
  const addToRecentlyViewed = (productId) => {
    if (!productId) return;

    setRecentlyViewed((prev) => {
      // Remove if already exists
      const filtered = prev.filter((item) => item.productId !== productId);

      // Add to beginning
      const updated = [{ productId, timestamp: Date.now() }, ...filtered].slice(
        0,
        MAX_ITEMS,
      ); // Keep only MAX_ITEMS

      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      return updated;
    });
  };

  // Get product IDs (most recent first)
  const getRecentlyViewedIds = () => {
    return recentlyViewed.map((item) => item.productId);
  };

  // Clear all recently viewed
  const clearRecentlyViewed = () => {
    localStorage.removeItem(STORAGE_KEY);
    setRecentlyViewed([]);
  };

  return {
    recentlyViewed,
    addToRecentlyViewed,
    getRecentlyViewedIds,
    clearRecentlyViewed,
  };
}
