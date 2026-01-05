// components/customer/TestimonialSection.jsx
'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { FaChevronLeft, FaChevronRight, FaStar, FaCheck } from 'react-icons/fa'

const testimonials = [
  {
    id: 1,
    name: 'Priya Sharma',
    location: 'Mumbai, Maharashtra',
    rating: 5,
    text: 'Amazing shopping experience! Fast delivery and authentic products. OnlinePlanet has become my go-to platform for online shopping.',
    avatar: '/images/avatars/priya.jpg',
    productBought: 'Electronics',
    verifiedBuyer: true
  },
  {
    id: 2,
    name: 'Rajesh Kumar',
    location: 'Delhi, NCR',
    rating: 5,
    text: 'Great variety of products from local sellers. The quality is excellent and customer service is very responsive.',
    avatar: '/images/avatars/rajesh.jpg',
    productBought: 'Fashion',
    verifiedBuyer: true
  },
  {
    id: 3,
    name: 'Anita Patel',
    location: 'Ahmedabad, Gujarat',
    rating: 4,
    text: 'Love supporting local businesses through OnlinePlanet. The platform is user-friendly and secure.',
    avatar: '/images/avatars/anita.jpg',
    productBought: 'Home & Decor',
    verifiedBuyer: true
  },
  {
    id: 4,
    name: 'Vikram Singh',
    location: 'Bangalore, Karnataka',
    rating: 5,
    text: 'Excellent platform for discovering unique products from Indian sellers. Highly recommended!',
    avatar: '/images/avatars/vikram.jpg',
    productBought: 'Books',
    verifiedBuyer: true
  },
  {
    id: 5,
    name: 'Meera Reddy',
    location: 'Hyderabad, Telangana',
    rating: 5,
    text: 'OnlinePlanet offers the best deals and genuine products. The seller verification process gives me confidence.',
    avatar: '/images/avatars/meera.jpg',
    productBought: 'Beauty & Skin',
    verifiedBuyer: true
  }
]

export default function TestimonialSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(true)

  useEffect(() => {
    if (!isAutoPlay) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [isAutoPlay])

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const goToSlide = (index) => {
    setCurrentIndex(index)
  }

  return (
    <section className="py-16 bg-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold text-gray-900 mb-4">What Our Customers Say</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Real stories from real customers who love shopping on OnlinePlanet
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="w-full flex-shrink-0 p-8 md:p-12">
                  <div className="text-center">
                    {/* Avatar */}
                    <div className="relative w-20 h-20 mx-auto mb-6">
                      <Image
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        width={80}
                        height={80}
                        className="rounded-full border-4 border-blue-100"
                      />
                      {testimonial.verifiedBuyer && (
                        <div className="absolute -bottom-2 -right-2 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center">
                          <FaCheck className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    {/* Stars */}
                    <div className="flex items-center justify-center mb-4">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={`w-5 h-5 ${
                            i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Quote */}
                    <blockquote className="text-lg text-gray-700 mb-6 italic">
                      "{testimonial.text}"
                    </blockquote>

                    {/* Customer Info */}
                    <div>
                      <h4 className="font-semibold text-gray-900 text-lg">{testimonial.name}</h4>
                      <p className="text-gray-600">{testimonial.location}</p>
                      <p className="text-sm text-blue-600 mt-1">
                        Purchased: {testimonial.productBought}
                      </p>
                      {testimonial.verifiedBuyer && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full mt-2">
                          <FaCheck className="w-3 h-3 mr-1" />
                          Verified Buyer
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={prevTestimonial}
            onMouseEnter={() => setIsAutoPlay(false)}
            onMouseLeave={() => setIsAutoPlay(true)}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow z-10"
          >
            <FaChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          
          <button
            onClick={nextTestimonial}
            onMouseEnter={() => setIsAutoPlay(false)}
            onMouseLeave={() => setIsAutoPlay(true)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow z-10"
          >
            <FaChevronRight className="w-6 h-6 text-gray-600" />
          </button>

          {/* Dots Indicator */}
          <div className="flex justify-center space-x-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
