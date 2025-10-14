'use client';

import { useState } from 'react';
import { 
  FiX, FiMinus, FiPlus, FiShoppingCart, FiStar, 
  FiTruck, FiHeart, FiZoomIn 
} from 'react-icons/fi';
import { useCart } from '@/lib/context/CartContext';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

export default function QuickBuyModal({ product, isOpen, onClose }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const { addToCart } = useCart();

  if (!isOpen || !product) return null;

  const currentPrice = product.pricing?.salePrice || product.pricing?.basePrice;
  const discount = product.pricing?.salePrice 
    ? Math.round(((product.pricing.basePrice - product.pricing.salePrice) / product.pricing.basePrice) * 100)
    : 0;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    onClose();
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    window.location.href = '/cart';
  };

  const incrementQuantity = () => {
    if (quantity < product.inventory?.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <h2 className="text-xl font-bold text-gray-900">Quick Buy</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 transition"
          >
            <FiX className="text-2xl text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            {/* Left: Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative bg-gray-50 rounded-xl overflow-hidden aspect-square">
                {discount > 0 && (
                  <div className="absolute top-3 left-3 z-10 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {discount}% OFF
                  </div>
                )}
                <a
                  href={`/products/${product._id}`}
                  target="_blank"
                  className="absolute top-3 right-3 z-10 bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition"
                  title="View full details"
                >
                  <FiZoomIn className="text-xl text-gray-700" />
                </a>
                <img
                  src={product.images?.[selectedImage]?.url || '/placeholder.png'}
                  alt={product.name}
                  fill
                  className="object-contain p-6"
                />
              </div>

              {/* Thumbnails */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                        selectedImage === index
                          ? 'border-blue-600 shadow-md'
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={`${product.name} ${index + 1}`}
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Product Info */}
            <div className="space-y-4">
              {/* Title */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h3>
                {product.brand && (
                  <p className="text-gray-600 text-sm">
                    Brand: <span className="font-semibold">{product.brand}</span>
                  </p>
                )}
              </div>

              {/* Rating */}
              {product.ratings && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 bg-green-600 text-white px-2 py-1 rounded-lg">
                    <span className="font-bold">{product.ratings.average?.toFixed(1) || 0}</span>
                    <FiStar className="text-sm fill-current" />
                  </div>
                  <span className="text-sm text-gray-600">
                    {product.ratings.count || 0} ratings
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl">
                <div className="flex items-baseline gap-3 mb-1">
                  <span className="text-3xl font-bold text-gray-900">
                    ₹{currentPrice?.toLocaleString()}
                  </span>
                  {product.pricing?.salePrice && (
                    <span className="text-xl text-gray-500 line-through">
                      ₹{product.pricing.basePrice?.toLocaleString()}
                    </span>
                  )}
                </div>
                <p className="text-sm text-green-600 font-medium">Inclusive of all taxes</p>
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2">
                {product.inventory?.stock > 0 ? (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-600 font-medium text-sm">
                      In Stock ({product.inventory.stock} available)
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-red-600 font-medium text-sm">Out of Stock</span>
                  </>
                )}
              </div>

              {/* Short Description */}
              {product.shortDescription && (
                <p className="text-sm text-gray-700 line-clamp-3">
                  {product.shortDescription}
                </p>
              )}

              {/* Key Features */}
              {product.specifications && product.specifications.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">Key Features</h4>
                  <ul className="space-y-1">
                    {product.specifications.slice(0, 3).map((spec, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span><strong>{spec.key}:</strong> {spec.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Quantity Selector */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                    className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <FiMinus />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(product.inventory?.stock || 1, parseInt(e.target.value) || 1)))}
                    className="w-16 h-10 text-center border-2 border-gray-300 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={incrementQuantity}
                    disabled={quantity >= (product.inventory?.stock || 0)}
                    className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <FiPlus />
                  </button>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                <div className="flex items-center gap-2 text-green-700">
                  <FiTruck className="text-lg" />
                  <span className="text-sm font-medium">
                    {product.shipping?.freeShipping 
                      ? 'Free Delivery' 
                      : `Delivery ₹${product.shipping?.shippingFee || 50}`}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={handleAddToCart}
                  disabled={product.inventory?.stock < 1}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 shadow-lg"
                >
                  <FiShoppingCart className="text-xl" />
                  Add to Cart
                </button>
                
                <button
                  onClick={handleBuyNow}
                  disabled={product.inventory?.stock < 1}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-bold hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 shadow-lg"
                >
                  Buy Now
                </button>
              </div>

              {/* View Full Details Link */}
              <a
                href={`/products/${product._id}`}
                target="_blank"
                className="block text-center text-blue-600 hover:text-blue-700 font-medium text-sm underline"
              >
                View Full Product Details →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
