'use client'
import React from 'react'
import Link from 'next/link'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, FreeMode, Autoplay, Grid } from 'swiper/modules'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/free-mode'
import 'swiper/css/autoplay'
import 'swiper/css/grid'

export default function PocketFriendlyBargain() {
    const bargains = [
        {
            id: 1,
            category: 'Kurtas',
            price: '549',
            image: 'https://assets.myntassets.com/h_720,q_90,w_540/v1/assets/images/2025/APRIL/12/njr5Dm1p_5c213231bae44a9db7cf85d42f2554ca.jpg',
            link: '/products?category=kurtas&maxPrice=549'
        },
        {
            id: 2,
            category: 'Jeans',
            price: '799',
            image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=600&fit=crop',
            link: '/products?category=jeans&maxPrice=799'
        },
        {
            id: 3,
            category: 'Backpacks',
            price: '799',
            image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=600&fit=crop',
            link: '/products?category=backpacks&maxPrice=799'
        },
        {
            id: 4,
            category: 'Casual Shoes',
            price: '1149',
            image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=600&fit=crop',
            link: '/products?category=shoes&maxPrice=1149'
        },
        {
            id: 5,
            category: 'Jackets',
            price: '1299',
            image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=600&fit=crop',
            link: '/products?category=jackets&maxPrice=1299'
        },
       
        {
            id: 7,
            category: 'T-Shirts',
            price: '399',
            image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=600&fit=crop',
            link: '/products?category=tshirts&maxPrice=399'
        }
    ]

    return (
        <section className="mt-6 bg-  overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
                            Pocket friendly bargains
                        </h2>
                        <p className="text-sm text-gray-500 mt-0.5">
                            Style that fits your budget
                        </p>
                    </div>
                </div>

                {/* Swiper Carousel */}
                <div className="relative pb-4">
                    <Swiper
                        modules={[Navigation, Pagination, FreeMode, Autoplay, Grid]}
                        spaceBetween={12}
                        slidesPerView={3}
                        slidesPerGroup={1}
                        grid={{
                            rows: 2,
                            fill: 'row'
                        }}
                        loop={true}
                        autoplay={{
                            delay: 4000,
                            disableOnInteraction: false,
                            pauseOnMouseEnter: true
                        }}
                        speed={1000}
                        freeMode={false}
                        breakpoints={{
                            640: {
                                slidesPerView: 3,
                                spaceBetween: 12,
                                grid: {
                                    rows: 2,
                                    fill: 'row'
                                }
                            },
                            768: {
                                slidesPerView: 3,
                                spaceBetween: 16,
                                grid: {
                                    rows: 2,
                                    fill: 'row'
                                }
                            },
                            1024: {
                                slidesPerView: 6,
                                spaceBetween: 16,
                            },
                        }}
                        className="!pb-2"
                    >
                        {bargains.map((item) => (
                            <SwiperSlide key={item.id}>
                                <Link href={item.link} className="block group">
                                    <div className="relative aspect-[3/4] rounded-xl md:rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 bg-gray-100">
                                        {/* Image */}
                                        <img
                                            src={item.image}
                                            alt={item.category}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                                        />

                                        {/* Gradient Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent"></div>

                                        {/* Content Overlay */}
                                        <div className="absolute bottom-3 left-3 md:bottom-5 md:left-5 text-white space-y-0.5">
                                            <p className="text-[10px] md:text-xs font-medium opacity-80 uppercase tracking-wider">
                                                Under
                                            </p>
                                            <div className="inline-block bg-yellow-400 px-1.5 md:px-2 py-0.5 rounded-md">
                                                <p className="text-base md:text-lg font-bold text-black tracking-tight leading-none">
                                                    ₹{item.price}
                                                </p>
                                            </div>
                                            <p className="text-xs md:text-sm font-semibold opacity-90 leading-tight">
                                                {item.category}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>
        </section>
    )
}
