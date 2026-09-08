'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiChevronLeft, FiChevronRight, FiShoppingBag, FiStar, FiArrowRight, FiCheck } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import { useCart } from '@/lib/context/CartContext';
import { toast } from 'react-hot-toast';

const CATEGORIES = [
  {
    id: 'backpacks',
    name: 'Backpacks',
    subCategory: 'Backpacks',
    image: '/images/back-to-school/backpack.jpg',
    tag: 'Up to 50% Off',
  },
  {
    id: 'stationery',
    name: 'Stationery Supplies',
    subCategory: 'Stationery Supplies',
    image: '/images/back-to-school/stationery.jpg',
    tag: 'Starting ₹197',
  },
  {
    id: 'laptops',
    name: 'Laptops & Accessories',
    subCategory: 'Laptops & Accessories',
    image: '/images/back-to-school/laptop.jpg',
    tag: 'Tech Deals',
  },
  {
    id: 'lunchboxes',
    name: 'Lunch Boxes',
    subCategory: 'Lunch Boxes',
    image: '/images/back-to-school/lunchbox.jpg',
    tag: 'Bento & Thermal',
  },
  {
    id: 'waterbottles',
    name: 'Water Bottles',
    subCategory: 'Water Bottles',
    image: '/images/back-to-school/waterbottle.jpg',
    tag: 'Insulated Steel',
  },
  {
    id: 'desksetup',
    name: 'Desk Setup',
    subCategory: 'Desk Setup',
    image: '/images/back-to-school/desk.jpg',
    tag: 'Study Essentials',
  },
  {
    id: 'nursery',
    name: 'Back To Nursery',
    subCategory: 'Back To Nursery',
    image: '/images/back-to-school/nursery.jpg',
    tag: 'Cute & Safe',
  },
];

export default function BackToSchoolSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [addedId, setAddedId] = useState(null);

  const carouselRef = useRef(null);
  const productCarouselRef = useRef(null);
  const { addToCart } = useCart();

  // Load products from our API
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const res = await fetch('/api/homepage/back-to-school');
        const data = await res.json();
        if (data.success && Array.isArray(data.products)) {
          setProducts(data.products);
        }
      } catch (err) {
        console.error('Failed to load Back to School products:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // Check scroll buttons visibility
  const checkScroll = () => {
    if (!carouselRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const scrollCategories = (direction) => {
    if (!carouselRef.current) return;
    const amount = direction === 'left' ? -320 : 320;
    carouselRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    setTimeout(checkScroll, 350);
  };

  const scrollProducts = (direction) => {
    if (!productCarouselRef.current) return;
    const amount = direction === 'left' ? -380 : 380;
    productCarouselRef.current.scrollBy({ left: amount, behavior: 'smooth' });
  };

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.subCategory?.toLowerCase() === selectedCategory.toLowerCase());

  const handleQuickAdd = async (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (addToCart) {
        await addToCart(product, 1);
        setAddedId(product._id);
        toast.success(`Added ${product.name.slice(0, 30)}... to cart!`);
        setTimeout(() => setAddedId(null), 1800);
      }
    } catch (err) {
      toast.error('Failed to add to cart');
    }
  };

  return (
    <section className="py-8 sm:py-12 bg-white select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Lavender Showcase Container */}
        <div className="relative overflow-hidden rounded-[32px] sm:rounded-[44px] bg-gradient-to-b from-[#eae5fb] via-[#e6e0f8] to-[#ded7f4] border border-purple-200/70 p-5 sm:p-8 lg:p-10 shadow-[0_10px_35px_rgba(109,40,217,0.08)]">
          
          {/* Subtle Background Glows */}
          <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-purple-300/30 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-indigo-300/30 blur-3xl pointer-events-none" />

          {/* Header Section Matching Reference Image */}
          <div className="relative flex items-center justify-between pb-6 sm:pb-8">
            {/* Left 3D Stationery Prop */}
            <div className="hidden sm:block flex-shrink-0 w-24 h-24 md:w-32 md:h-32 lg:w-36 lg:h-36 relative transition-transform duration-500 hover:scale-105">
              <img
                src="/images/back-to-school/header_left.jpg"
                alt="Stationery Props"
                className="w-full h-full object-contain rounded-2xl drop-shadow-md"
              />
            </div>

            {/* Center Heading Title */}
            <div className="flex-1 text-center px-4">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/70 backdrop-blur-sm text-indigo-700 text-xs font-semibold mb-2 shadow-sm border border-purple-100">
                <HiSparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Academic Season 2026</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-[#45377f] tracking-tight">
                Back to School
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-purple-900/70 font-medium max-w-md mx-auto">
                Equip your students for excellence with verified campus gear, backpacks & study essentials
              </p>
            </div>

            {/* Right 3D Desk Organizer Prop */}
            <div className="hidden sm:block flex-shrink-0 w-24 h-24 md:w-32 md:h-32 lg:w-36 lg:h-36 relative transition-transform duration-500 hover:scale-105">
              <img
                src="/images/back-to-school/header_right.jpg"
                alt="Organizer Props"
                className="w-full h-full object-contain rounded-2xl drop-shadow-md"
              />
            </div>
          </div>

          {/* 7-Category Showcase Cards (Matching Reference Screenshot) */}
          <div className="relative mt-2">
            {/* Left Carousel Arrow */}
            {canScrollLeft && (
              <button
                type="button"
                onClick={() => scrollCategories('left')}
                className="absolute -left-3 sm:-left-4 top-1/3 -translate-y-1/2 z-30 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/95 text-gray-800 shadow-lg border border-purple-100 flex items-center justify-center hover:bg-white hover:scale-110 active:scale-95 transition-all"
                aria-label="Scroll left"
              >
                <FiChevronLeft className="w-6 h-6 stroke-[2.5]" />
              </button>
            )}

            {/* Right Carousel Arrow */}
            {canScrollRight && (
              <button
                type="button"
                onClick={() => scrollCategories('right')}
                className="absolute -right-3 sm:-right-4 top-1/3 -translate-y-1/2 z-30 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/95 text-gray-800 shadow-lg border border-purple-100 flex items-center justify-center hover:bg-white hover:scale-110 active:scale-95 transition-all"
                aria-label="Scroll right"
              >
                <FiChevronRight className="w-6 h-6 stroke-[2.5]" />
              </button>
            )}

            {/* Category Cards Carousel Track */}
            <div
              ref={carouselRef}
              onScroll={checkScroll}
              className="flex gap-3 sm:gap-4 md:gap-5 overflow-x-auto no-scrollbar scroll-smooth py-2 px-1 items-start"
            >
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory.toLowerCase() === cat.subCategory.toLowerCase();
                return (
                  <div
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(isSelected ? 'all' : cat.subCategory);
                    }}
                    className="flex flex-col items-center flex-shrink-0 cursor-pointer group w-[120px] sm:w-[145px] md:w-[160px] lg:w-[172px]"
                  >
                    {/* Rounded Cream Card (Exact Visual from Screenshot) */}
                    <div
                      className={`w-full aspect-square bg-[#fbfce8] rounded-[24px] sm:rounded-[30px] p-2.5 sm:p-3.5 flex items-center justify-center border transition-all duration-300 shadow-[0_4px_16px_rgba(0,0,0,0.03)] ${
                        isSelected
                          ? 'border-indigo-500 ring-4 ring-indigo-400/30 -translate-y-2 shadow-xl bg-white'
                          : 'border-[#edf0cb] group-hover:-translate-y-2 group-hover:shadow-[0_12px_26px_rgba(99,102,241,0.18)] group-hover:border-purple-300'
                      }`}
                    >
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-full h-full object-contain rounded-2xl drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>

                    {/* Category Label Underneath */}
                    <h3
                      className={`mt-2.5 sm:mt-3 text-center text-xs sm:text-sm font-semibold tracking-tight leading-tight transition-colors ${
                        isSelected
                          ? 'text-indigo-700 underline underline-offset-4 decoration-2'
                          : 'text-[#372e6b] group-hover:text-indigo-600'
                      }`}
                    >
                      {cat.name}
                    </h3>
                  </div>
                );
              })}
            </div>
          </div>

          

        </div>
      </div>
    </section>
  );
}
