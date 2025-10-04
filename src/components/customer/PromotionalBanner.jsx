// components/customer/PromotionalBanner.jsx
import Link from 'next/link'
import Image from 'next/image'
import Button from '../ui/Button'

const promotions = [
  {
    id: 1,
    title: 'Free Shipping',
    subtitle: 'On orders above ₹500',
    description: 'Get your favorite products delivered to your doorstep at no extra cost',
    image: '/images/free-shipping.jpg',
    ctaText: 'Shop Now',
    ctaLink: '/products',
    bgColor: 'bg-blue-500'
  },
  {
    id: 2,
    title: 'New Seller Program',
    subtitle: 'Join OnlinePlanet Today',
    description: 'Start selling your products and reach millions of customers across India',
    image: '/images/seller-program.jpg',
    ctaText: 'Become a Seller',
    ctaLink: '/register?role=seller',
    bgColor: 'bg-green-500'
  }
]

export default function PromotionalBanner() {
  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {promotions.map((promo) => (
            <div
              key={promo.id}
              className={`${promo.bgColor} rounded-2xl overflow-hidden text-white relative`}
            >
              <div className="absolute inset-0 bg-black bg-opacity-20" />
              <div className="relative p-8 lg:p-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                  <div className="space-y-4">
                    <h3 className="text-3xl font-bold">{promo.title}</h3>
                    <h4 className="text-xl opacity-90">{promo.subtitle}</h4>
                    <p className="opacity-80">{promo.description}</p>
                    <Link href={promo.ctaLink}>
                      <Button className="bg-white text-gray-900 hover:bg-gray-100">
                        {promo.ctaText}
                      </Button>
                    </Link>
                  </div>
                  <div className="hidden lg:block">
                    <Image
                      src={promo.image}
                      alt={promo.title}
                      width={300}
                      height={200}
                      className="rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
