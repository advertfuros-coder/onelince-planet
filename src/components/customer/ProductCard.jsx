'use client';

import { useState } from 'react';
import { FiShoppingCart, FiHeart, FiStar, FiZap } from 'react-icons/fi';
import { useCart } from '@/lib/context/CartContext';
import Image from 'next/image';

export default function ProductCard({ product }) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addToCart } = useCart();

  const currentPrice = product.pricing?.salePrice || product.pricing?.basePrice;
  const discount = product.pricing?.salePrice 
    ? Math.round(((product.pricing.basePrice - product.pricing.salePrice) / product.pricing.basePrice) * 100)
    : 0;

  const handleQuickBuy = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    // Redirect to cart page
    window.location.href = '/cart';
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  return (
    <div className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
      <a href={`/products/${product._id}`} className="block">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          {/* Discount Badge */}
          {discount > 0 && (
            <div className="absolute top-3 left-3 z-10 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              {discount}% OFF
            </div>
          )}

          {/* Wishlist Button */}
          <button
            onClick={handleWishlist}
            className={`absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center rounded-full shadow-lg transition-all ${
              isWishlisted
                ? 'bg-red-500 text-white'
                : 'bg-white text-gray-600 hover:bg-red-50 hover:text-red-500'
            }`}
          >
            <FiHeart className={`text-lg ${isWishlisted ? 'fill-current' : ''}`} />
          </button>

          {/* Product Image */}
          <img
            src={product.images?.[0]?.url || '/placeholder.png'}
            alt={product.name}
            fill
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
          />

          {/* Stock Badge */}
          {product.inventory?.stock < 1 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-red-600 text-white px-4 py-2 rounded-full font-bold">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          {/* Brand */}
          {product.brand && (
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              {product.brand}
            </p>
          )}

          {/* Product Name */}
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>

          {/* Rating */}
          {product.ratings && (
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1 bg-green-600 text-white px-2 py-0.5 rounded text-xs font-semibold">
                <span>{product.ratings.average?.toFixed(1) || 0}</span>
                <FiStar className="text-xs fill-current" />
              </div>
              <span className="text-xs text-gray-600">
                ({product.ratings.count || 0})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-2xl font-bold text-gray-900">
              ₹{currentPrice?.toLocaleString()}
            </span>
            {product.pricing?.salePrice && (
              <span className="text-sm text-gray-500 line-through">
                ₹{product.pricing.basePrice?.toLocaleString()}
              </span>
            )}
          </div>

          {/* Shipping Info */}
          <div className="text-xs text-green-600 font-medium mb-3">
            {product.shipping?.freeShipping ? '🚚 Free Delivery' : `🚚 ₹${product.shipping?.shippingFee || 50}`}
          </div>

          {/* Action Buttons - Always Visible */}
          <div className="flex gap-2">
            <button
              onClick={handleQuickBuy}
              disabled={product.inventory?.stock < 1}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white py-2.5 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 shadow-md"
            >
              <FiZap className="text-lg" />
              Quick Buy
            </button>
            <button
              onClick={handleAddToCart}
              disabled={product.inventory?.stock < 1}
              className="w-11 h-11 flex items-center justify-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 shadow-md"
              title="Add to Cart"
            >
              <FiShoppingCart className="text-lg" />
            </button>
          </div>
        </div>
      </a>
    </div>
  );
}
