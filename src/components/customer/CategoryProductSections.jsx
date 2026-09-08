'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FiChevronLeft, FiChevronRight, FiArrowRight } from 'react-icons/fi';
import ProductCard from './ProductCard';

export default function CategoryProductSections() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);
  const [wishlist, setWishlist] = useState(new Set());
  const carouselRefs = useRef({});

  useEffect(() => {
    async function loadSections() {
      try {
        setLoading(true);
        const res = await fetch('/api/homepage/category-sections');
        const data = await res.json();
        if (data.success && Array.isArray(data.sections)) {
          setSections(data.sections);
          if (data.sections.length > 0) {
            setActiveCategory(data.sections[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load category sections:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSections();
  }, []);

  const toggleWishlist = (productId) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  const scrollCarousel = (sectionId, direction) => {
    const el = carouselRefs.current[sectionId];
    if (el) {
      const scrollAmount = direction === 'left' ? -650 : 650;
      el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollToSection = (sectionId) => {
    setActiveCategory(sectionId);
    const target = document.getElementById(`cat-section-${sectionId}`);
    if (target) {
      const yOffset = -90; // offset for sticky headers
      const y = target.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <section className="py-12 bg-gray-50/50">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Quick jump skeleton */}
          <div className="flex gap-2 overflow-hidden py-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-10 w-28 bg-gray-200 animate-pulse rounded-full flex-shrink-0" />
            ))}
          </div>

          {/* Section skeleton */}
          {[1, 2, 3].map((s) => (
            <div key={s} className="space-y-4">
              <div className="flex justify-between items-end">
                <div className="space-y-2">
                  <div className="h-5 w-24 bg-gray-200 animate-pulse rounded-full" />
                  <div className="h-8 w-64 bg-gray-200 animate-pulse rounded-lg" />
                  <div className="h-4 w-96 bg-gray-100 animate-pulse rounded" />
                </div>
                <div className="h-10 w-28 bg-gray-200 animate-pulse rounded-xl" />
              </div>
              <div className="flex gap-4 overflow-hidden py-2">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="min-w-[260px] h-[380px] bg-gray-100 animate-pulse rounded-[32px] flex-shrink-0"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!sections || sections.length === 0) {
    return null;
  }

  return (
    <div className="py-10 bg-gradient-to-b from-white via-gray-50/40 to-white">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

        {/* Section Header Title & Quick Category Pill Bar */}
        <div className="space-y-5">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-100 pb-5">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2">
                <span>Featured Catalog</span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              </div>
              <h2 className="text-3xl md:text-5xl font-[1000] text-gray-900 tracking-tight">
                Shop By <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Category</span>
              </h2>
              <p className="text-gray-500 text-sm md:text-base mt-1">
                Explore curated, high-demand collections with at least top 10 verified products in every category.
              </p>
            </div>

            <div className="text-xs font-semibold text-gray-500 bg-gray-100/80 px-3.5 py-2 rounded-xl self-start md:self-auto border border-gray-200/50">
              {sections.length} Categories • Verified 2025–2026 In-Stock
            </div>
          </div>

          {/* Quick Jump Horizontal Navigation Bar */}
          <div className="sticky top-16 z-20 py-2 bg-white/95 backdrop-blur-md border-y border-gray-100 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider pr-1 whitespace-nowrap">
                Jump To:
              </span>
              {sections.map((sec) => {
                const isActive = activeCategory === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => scrollToSection(sec.id)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs md:text-sm font-semibold whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-[1.02]'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900'
                    }`}
                  >
                    <span>{sec.iconEmoji}</span>
                    <span>{sec.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isActive ? 'bg-white/20 text-white' : 'bg-gray-200/70 text-gray-600'
                      }`}
                    >
                      {sec.totalProducts}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Render Each Category Section */}
        {sections.map((sec) => (
          <section
            key={sec.id}
            id={`cat-section-${sec.id}`}
            className="scroll-mt-32 relative "
          >
            {/* Section Header Row */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
              <div className="space-y-1">
                

                <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                  {sec.title}
                </h3>
                <p className="text-sm text-gray-500 max-w-2xl">
                  {sec.subtitle}
                </p>
              </div>

              {/* Action Controls: Carousel Scroll Buttons + View All */}
              <div className="flex items-center gap-2 self-end md:self-auto">
                {/* Carousel Left/Right Buttons */}
                <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-full border border-gray-200/50">
                  <button
                    onClick={() => scrollCarousel(sec.id, 'left')}
                    aria-label={`Scroll ${sec.title} left`}
                    className="w-8 h-8 rounded-full bg-white text-gray-700 hover:text-blue-600 hover:bg-blue-50 flex items-center justify-center transition-all shadow-sm active:scale-95"
                  >
                    <FiChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => scrollCarousel(sec.id, 'right')}
                    aria-label={`Scroll ${sec.title} right`}
                    className="w-8 h-8 rounded-full bg-white text-gray-700 hover:text-blue-600 hover:bg-blue-50 flex items-center justify-center transition-all shadow-sm active:scale-95"
                  >
                    <FiChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* View All Link */}
                <Link
                  href={sec.link}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white text-xs md:text-sm font-bold transition-all duration-200 group"
                >
                  <span>View All</span>
                  <FiArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>

            {/* Product Cards Carousel */}
            <div
              ref={(el) => {
                carouselRefs.current[sec.id] = el;
              }}
              className="flex gap-4 md:gap-5 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-2 px-1"
            >
              {sec.products.map((product) => (
                <div
                  key={product._id}
                  className="min-w-[240px] sm:min-w-[260px] md:min-w-[280px] lg:min-w-[290px] max-w-[300px] snap-start flex-shrink-0 flex flex-col"
                >
                  <ProductCard
                    product={product}
                    isWishlisted={wishlist.has(product._id)}
                    onToggleWishlist={toggleWishlist}
                  />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
