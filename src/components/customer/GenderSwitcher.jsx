'use client'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function GenderSwitcher() {
    const searchParams = useSearchParams()
    const currentGender = searchParams.get('gender') || 'men'

    const genders = [
        { value: 'men', label: 'Men', color: 'blue' },
        { value: 'women', label: 'Women', color: 'pink' },
        { value: 'kids', label: 'Kids', color: 'purple' },
    ]

    return (
        <div className="flex items-center justify-center gap-2 bg-white/90 backdrop-blur-md px-2 py-2 rounded-full shadow-lg border border-gray-100">
            {genders.map((gender) => {
                const isActive = currentGender === gender.value
                return (
                    <Link
                        key={gender.value}
                        href={`/category/fashion?gender=${gender.value}`}
                        className={`
                            px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-300
                            ${isActive
                                ? `bg-gradient-to-r ${gender.color === 'blue' ? 'from-blue-500 to-blue-600' :
                                    gender.color === 'pink' ? 'from-pink-500 to-pink-600' :
                                        'from-purple-500 to-purple-600'
                                } text-white shadow-lg scale-105`
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }
                        `}
                    >
                        {gender.label}
                    </Link>
                )
            })}
        </div>
    )
}
