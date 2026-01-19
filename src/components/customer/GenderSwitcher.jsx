'use client'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function GenderSwitcher() {
    const searchParams = useSearchParams()
    const currentGender = searchParams.get('gender') || 'men'

    const genders = [
        { 
            value: 'men', 
            label: 'Men',
            image: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?auto=format&fit=crop&q=80&w=200'
        },
        { 
            value: 'women', 
            label: 'Women',
            image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=200'
        },
        { 
            value: 'boys', 
            label: 'Boys',
            image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&q=80&w=200'
        },
        { 
            value: 'girls', 
            label: 'Girls',
            image: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&q=80&w=200'
        },
    ]

    return (
        <div className="w-full">
            <div className="flex items-center -mt-4 ">
                {genders.map((gender) => {
                    const isActive = currentGender === gender.value
                    return (
                        <Link
                            key={gender.value}
                            href={`/category/fashion?gender=${gender.value}`}
                            className={`
                                relative flex flex-col items-center gap-2 px-4 md:px-6  font-medium text-xs md:text-sm transition-all duration-200
                                ${isActive
                                    ? 'text-red-600'
                                    : 'text-gray-700 hover:text-gray-900'
                                }
                            `}
                        >
                            {/* Circular Image */}
                            <div className={`rounded-2xl h-24 w-20 overflow-hidden  transition-all duration-200 ${isActive ? 'border-red-600' : 'border-gray-300'}`}>
                                <img 
                                    src={gender.image} 
                                    alt={gender.label}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            
                            {/* Label */}
                            <span className="font-medium">{gender.label}</span>
                            
                            {/* Active Bottom Border */}
                            {isActive && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600" />
                            )}
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
