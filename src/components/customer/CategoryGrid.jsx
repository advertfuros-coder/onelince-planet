'use client'
import Link from 'next/link'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Autoplay, Grid } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/grid'

export default function CategoryGrid() {
    const categories = [
      
        { name: 'Mobiles', image: '/category-icons/mobile.png', href: '/category/electronics', gradient: 'from-gray-700 to-gray-900' },
        { name: 'Beauty', image: '/category-icons/beauty.png', href: '/category/beauty', gradient: 'from-pink-400 to-pink-600' },
        { name: 'Electronics', image: '/category-icons/electronics.png', href: '/category/electronics', gradient: 'from-red-500 to-red-700' },
        { name: 'Laptops', image: '/category-icons/laptops.png', href: '/category/electronics', gradient: 'from-blue-500 to-blue-700' },
          { name: "Women's Fashion", image: '/category-icons/womenfashion.png', href: '/category/fashion?gender=women', gradient: 'from-teal-400 to-teal-600' },
        { name: 'Health', image: '/category-icons/gym.png', href: '/category/health', gradient: 'from-green-400 to-green-600' },
        { name: 'Headphones', image: '/category-icons/headphone.png', href: '/category/electronics', gradient: 'from-gray-600 to-gray-800' },
        { name: 'Home', image: '/category-icons/home.png', href: '/category/home', gradient: 'from-amber-600 to-amber-800' },
        { name: "Men's Fashion", image: '/category-icons/menfashion.png', href: '/category/fashion?gender=men', gradient: 'from-indigo-400 to-indigo-600' },
        { name: 'Appliances', image: '/category-icons/appliances.png', href: '/category/home', gradient: 'from-gray-500 to-gray-700' },
         { name: 'Gaming', image: '/category-icons/gaming.png', href: '/category/electronics', gradient: 'from-purple-600 to-purple-800' },
          { name: 'Home Decor', image: '/category-icons/home.png', href: '/category/home', gradient: 'from-amber-400 to-amber-600' },
         { name: 'Snacks & Chips', image: '/category-icons/snacks.png', href: '/category/groceries', gradient: 'from-yellow-400 to-orange-500' },
          { name: 'Jewelry', image: '/category-icons/jewel.png', href: '/category/fashion', gradient: 'from-yellow-600 to-amber-700' },
         { name: 'Music & Media', image: '/category-icons/guitar.png', href: '/category/electronics', gradient: 'from-red-500 to-pink-600' },
          { name: 'Kitchen Dining', image: '/category-icons/kitchen.png', href: '/category/home', gradient: 'from-slate-500 to-slate-700' },
         { name: 'Computer Accessories', image: '/category-icons/computeraccess.png', href: '/category/electronics', gradient: 'from-gray-600 to-gray-800' },
        { name: "Kids' Fashion", image: '/category-icons/kids.png', href: '/category/fashion?gender=kids', gradient: 'from-blue-400 to-blue-600' },
         { name: 'Mobile Accessories', image: '/category-icons/mobileaccess.png', href: '/category/electronics', gradient: 'from-gray-800 to-black' },
        { name: 'Hair Care', image: '/category-icons/hair.png', href: '/category/beauty', gradient: 'from-pink-500 to-rose-600' },
        { name: 'Pet Store', image: '/category-icons/toys.png', href: '/category/pets', gradient: 'from-amber-500 to-orange-600' },
        { name: 'Fragrances', image: '/category-icons/perfumes.png', href: '/category/beauty', gradient: 'from-purple-500 to-purple-700' },
        { name: 'TWS', image: '/category-icons/TWS.png', href: '/category/electronics', gradient: 'from-slate-600 to-slate-800' },
        { name: 'Backpack', image: '/category-icons/bagpacks.png', href: '/category/fashion', gradient: 'from-red-700 to-red-900' },
        { name: 'Televisions', image: '/category-icons/tv.png', href: '/category/electronics', gradient: 'from-blue-600 to-blue-800' },
        { name: 'Camera', image: '/category-icons/camera.png', href: '/category/electronics', gradient: 'from-gray-700 to-gray-900' },
        { name: 'Footwear', image: '/category-icons/footwaer.png', href: '/category/fashion', gradient: 'from-red-600 to-red-800' },
        { name: 'Luggage', image: '/category-icons/luggage.png', href: '/category/travel', gradient: 'from-gray-400 to-gray-600' },
        { name: 'Watches', image: '/category-icons/watches.png', href: '/category/fashion', gradient: 'from-amber-700 to-amber-900' },
        { name: 'Makeup', image: '/category-icons/beauty.png', href: '/category/beauty', gradient: 'from-rose-400 to-pink-600' },
        { name: 'Eyewear', image: '/category-icons/eyewear.png', href: '/category/fashion', gradient: 'from-gray-800 to-black' },
         { name: 'Personal Care', image: '/category-icons/menscare.png', href: '/category/beauty', gradient: 'from-pink-500 to-rose-600' },
        { name: 'Travel Store', image: '/category-icons/luggage.png', href: '/category/travel', gradient: 'from-sky-500 to-blue-700' },
        { name: 'Sports & Fitness', image: '/category-icons/gym.png', href: '/category/health', gradient: 'from-green-600 to-green-800' },
        { name: 'Stationery', image: '/category-icons/books.png', href: '/category/books', gradient: 'from-cyan-500 to-blue-600' },
         { name: 'Baby', image: '/category-icons/baby.png', href: '/category/baby', gradient: 'from-blue-300 to-blue-500' },
        { name: 'Toys & Games', image: '/category-icons/toys.png', href: '/category/toys', gradient: 'from-yellow-600 to-orange-700' },
        { name: 'Furniture', image: '/category-icons/furnitures.png', href: '/category/home', gradient: 'from-brown-500 to-brown-700' },
        { name: 'Skincare', image: '/category-icons/beauty.png', href: '/category/beauty', gradient: 'from-teal-500 to-teal-700' },
        { name: "Men's Care", image: '/category-icons/menscare.png', href: '/category/beauty', gradient: 'from-slate-600 to-slate-800' },
        { name: 'Books', image: '/category-icons/books.png', href: '/category/books', gradient: 'from-amber-400 to-orange-500' },
        { name: 'Office Supplies', image: '/category-icons/books.png', href: '/category/office', gradient: 'from-blue-600 to-indigo-700' },
        { name: 'Car Care', image: '/category-icons/mobileaccess.png', href: '/category/automotive', gradient: 'from-gray-700 to-slate-900' },
        { name: 'Oral Care', image: '/category-icons/beauty.png', href: '/category/beauty', gradient: 'from-indigo-400 to-blue-600' },
    ]

    return (
        <section className="py-6 md:py-8 bg-white">
            <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative category-grid-swiper">
                    <Swiper
                        modules={[Navigation, Autoplay, Grid]}
                        spaceBetween={8}
                        slidesPerView={4}
                        grid={{ rows: 2, fill: 'row' }}
                        navigation={{
                            nextEl: '.category-swiper-button-next',
                            prevEl: '.category-swiper-button-prev',
                        }}
                        autoplay={{
                            delay: 3000,
                            disableOnInteraction: false,
                            pauseOnMouseEnter: true,
                        }}
                        loop={true}
                        breakpoints={{
                            640: { slidesPerView: 4, spaceBetween: 12, grid: { rows: 2, fill: 'row' } },
                            768: { slidesPerView: 5, spaceBetween: 16, grid: { rows: 2, fill: 'row' } },
                            1024: { slidesPerView: 6, spaceBetween: 16, grid: { rows: 2, fill: 'row' } },
                            1280: { slidesPerView: 8, spaceBetween: 16, grid: { rows: 2, fill: 'row' } }
                        }}
                        className="!pb-4"
                    >
                        {categories.map((category, idx) => (
                            <SwiperSlide key={idx}>
                                <Link href={category.href} className="group relative bg-white rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-gray-200 hover:border-gray-300 block h-full">
                                    {category.badge && (
                                        <div className="absolute top-1 right-1 md:top-2 md:right-2 bg-red-600 text-white text-[8px] md:text-[10px] font-bold px-1.5 md:px-2 py-0.5 rounded-full shadow-lg z-10">
                                            {category.badge}
                                        </div>
                                    )}
                                    <div className="w-full aspect-square relative overflow-hidden bg-white rounded-3xl  p-3">
                                        <img
                                            src={category.image}
                                            alt={category.name}
                                            className="w-full h-full object-contain rounded-3xl"
                                        />
                                    </div>
                                    <div className="p-1 bg-white">
                                        <h3 className="text-xs md:text-sm font-semibold text-gray-900 text-center line-clamp-2 leading-tight">
                                            {category.name}
                                        </h3>
                                    </div>
                                </Link>
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    <button className="category-swiper-button-prev absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200 -ml-5 hidden md:flex">
                        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button className="category-swiper-button-next absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200 -mr-5 hidden md:flex">
                        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>

            <style jsx global>{`
                .category-grid-swiper .swiper-slide {
                    height: auto;
                }
            `}</style>
        </section>
    )
}
