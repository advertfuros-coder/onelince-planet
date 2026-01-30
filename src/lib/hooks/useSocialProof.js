"use client";
import { useState, useEffect } from "react";

/**
 * Hook to generate realistic social proof data
 * In production, this would fetch from analytics/database
 */
export function useSocialProof(productId, currentStock) {
  const [socialProof, setSocialProof] = useState({
    viewingNow: 0,
    soldLast24Hours: 0,
    totalViews: 0,
    isLowStock: false,
    stockUrgency: null,
  });

  useEffect(() => {
    if (!productId) return;

    // Generate realistic viewing data based on product ID
    // In production, this would be real-time data from analytics
    const generateViewingData = () => {
      // Use product ID to seed random but consistent numbers
      const seed = productId
        .split("")
        .reduce((acc, char) => acc + char.charCodeAt(0), 0);

      // Generate viewing count (1-15 people)
      const baseViewing = (seed % 10) + 1;
      const randomVariation = Math.floor(Math.random() * 5);
      const viewingNow = Math.min(baseViewing + randomVariation, 15);

      // Generate sold count (5-50 in last 24 hours)
      const baseSold = (seed % 30) + 5;
      const soldVariation = Math.floor(Math.random() * 20);
      const soldLast24Hours = baseSold + soldVariation;

      // Generate total views (100-1000)
      const totalViews = (seed % 500) + 100 + Math.floor(Math.random() * 500);

      // Determine stock urgency
      let stockUrgency = null;
      let isLowStock = false;

      if (currentStock !== undefined && currentStock !== null) {
        if (currentStock === 0) {
          stockUrgency = "Out of stock";
          isLowStock = true;
        } else if (currentStock <= 3) {
          stockUrgency = `Only ${currentStock} left in stock`;
          isLowStock = true;
        } else if (currentStock <= 10) {
          stockUrgency = `Only ${currentStock} left - Order soon!`;
          isLowStock = true;
        } else if (currentStock <= 20) {
          stockUrgency = `${currentStock} available`;
        }
      }

      setSocialProof({
        viewingNow,
        soldLast24Hours,
        totalViews,
        isLowStock,
        stockUrgency,
      });
    };

    generateViewingData();

    // Update viewing count every 30 seconds to simulate real-time activity
    const interval = setInterval(() => {
      setSocialProof((prev) => ({
        ...prev,
        viewingNow: Math.max(
          1,
          prev.viewingNow + (Math.random() > 0.5 ? 1 : -1),
        ),
      }));
    }, 30000);

    return () => clearInterval(interval);
  }, [productId, currentStock]);

  return socialProof;
}

/**
 * Hook to track and display recent purchases
 * In production, this would fetch real order data
 */
export function useRecentPurchases(productId) {
  const [recentPurchases, setRecentPurchases] = useState([]);

  useEffect(() => {
    if (!productId) return;

    // Generate mock recent purchases
    // In production, fetch from orders API
    const generateRecentPurchases = () => {
      const locations = [
        "Mumbai",
        "Delhi",
        "Bangalore",
        "Hyderabad",
        "Chennai",
        "Kolkata",
        "Pune",
        "Ahmedabad",
        "Jaipur",
        "Lucknow",
      ];

      const purchases = [];
      const now = Date.now();

      // Generate 3-5 recent purchases
      const count = Math.floor(Math.random() * 3) + 3;

      for (let i = 0; i < count; i++) {
        const hoursAgo = Math.floor(Math.random() * 24);
        const location =
          locations[Math.floor(Math.random() * locations.length)];

        purchases.push({
          id: `purchase-${i}`,
          location,
          timeAgo:
            hoursAgo === 0
              ? "Just now"
              : hoursAgo === 1
                ? "1 hour ago"
                : `${hoursAgo} hours ago`,
          timestamp: now - hoursAgo * 60 * 60 * 1000,
        });
      }

      // Sort by most recent
      purchases.sort((a, b) => b.timestamp - a.timestamp);
      setRecentPurchases(purchases);
    };

    generateRecentPurchases();
  }, [productId]);

  return recentPurchases;
}
