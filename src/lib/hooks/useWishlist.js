// lib/hooks/useWishlist.js
"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "@/lib/context/AuthContext";
import { toast } from "react-hot-toast";

export function useWishlist() {
  const { token, user } = useAuth();
  const [wishlist, setWishlist] = useState({ items: [], count: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch wishlist
  const fetchWishlist = useCallback(async () => {
    if (!token) {
      setWishlist({ items: [], count: 0 });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get("/api/wishlist", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setWishlist(res.data.wishlist);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        setWishlist({ items: [], count: 0 });
      } else {
        console.error("Fetch wishlist error:", error);
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Add to wishlist
  const addToWishlist = useCallback(
    async (productId) => {
      if (!token) {
        toast.error("Please login to add items to wishlist");
        return false;
      }

      try {
        setActionLoading(true);
        const res = await axios.post(
          "/api/wishlist",
          { productId },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.success) {
          toast.success("Added to wishlist");
          await fetchWishlist();
          return true;
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to add to wishlist"
        );
        return false;
      } finally {
        setActionLoading(false);
      }
    },
    [token, fetchWishlist]
  );

  // Remove from wishlist
  const removeFromWishlist = useCallback(
    async (productId) => {
      if (!token) {
        return false;
      }

      try {
        setActionLoading(true);
        const res = await axios.delete(`/api/wishlist?productId=${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success) {
          toast.success("Removed from wishlist");
          await fetchWishlist();
          return true;
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to remove from wishlist"
        );
        return false;
      } finally {
        setActionLoading(false);
      }
    },
    [token, fetchWishlist]
  );

  // Toggle wishlist
  const toggleWishlist = useCallback(
    async (productId) => {
      const isInWishlist = wishlist.items.some(
        (item) => item.productId?._id === productId
      );

      if (isInWishlist) {
        return await removeFromWishlist(productId);
      } else {
        return await addToWishlist(productId);
      }
    },
    [wishlist, addToWishlist, removeFromWishlist]
  );

  // Check if product is in wishlist
  const isInWishlist = useCallback(
    (productId) => {
      return wishlist.items.some((item) => item.productId?._id === productId);
    },
    [wishlist]
  );

  // Load wishlist on mount
  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  return {
    wishlist,
    loading,
    actionLoading,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    refreshWishlist: fetchWishlist,
  };
}
