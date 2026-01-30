'use client'
import { useState } from 'react'
import { FiCheckCircle, FiChevronRight, FiRefreshCw } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'

export function ProductMatcher({ category = 'skin', productName }) {
    const [step, setStep] = useState(0)
    const [answers, setAnswers] = useState({})
    const [result, setResult] = useState(null)

    // Quiz configuration
    const quizzes = {
        skin: {
            title: 'Find Your Perfect Skincare Match',
            questions: [
                {
                    id: 'type',
                    text: 'What is your skin type?',
                    options: [
                        { label: 'Oily', value: 'oily' },
                        { label: 'Dry', value: 'dry' },
                        { label: 'Combination', value: 'combo' },
                        { label: 'Sensitive', value: 'sensitive' }
                    ]
                },
                {
                    id: 'concern',
                    text: 'What is your main skin concern?',
                    options: [
                        { label: 'Acne & Blemishes', value: 'acne' },
                        { label: 'Aging & Wrinkles', value: 'aging' },
                        { label: 'Dullness', value: 'dull' },
                        { label: 'Dryness', value: 'dryness' }
                    ]
                }
            ]
        },
        hair: {
            title: 'Hair Care Matcher',
            questions: [
                {
                    id: 'texture',
                    text: 'What is your hair texture?',
                    options: [
                        { label: 'Straight', value: 'straight' },
                        { label: 'Wavy', value: 'wavy' },
                        { label: 'Curly', value: 'curly' },
                        { label: 'Coily', value: 'coily' }
                    ]
                },
                {
                    id: 'goal',
                    text: 'What is your primary hair goal?',
                    options: [
                        { label: 'Volume', value: 'volume' },
                        { label: 'Strength', value: 'strength' },
                        { label: 'Shine', value: 'shine' },
                        { label: 'Frizz Control', value: 'frizz' }
                    ]
                }
            ]
        }
    }

    // Determine which quiz to show based on prop or simplistic detection
    const quizType = category.toLowerCase().includes('hair') ? 'hair' : 'skin'
    const currentQuiz = quizzes[quizType]

    const handleOptionSelect = (questionId, value) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }))

        if (step < currentQuiz.questions.length - 1) {
            setStep(prev => prev + 1)
        } else {
            // Logic would go here to determine best product
            // For now, valid match is always "This Product"
            calculateResult()
        }
    }

    const calculateResult = () => {
        setResult({
            match: true,
            score: 95,
            message: `Great news! Based on your answers (${Object.values(answers).join(', ')}), this product is an excellent match for you.`
        })
    }

    const resetQuiz = () => {
        setStep(0)
        setAnswers({})
        setResult(null)
    }

    return (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100 my-8">
            <div className="flex items-start justify-between mb-4">
                <div>
                   
                    <h3 className="text-xl font-bold text-gray-900 mt-">{currentQuiz.title}</h3>
                    <p className="text-gray-600 text-sm mt-1">Answer 2 quick questions to see if this is right for you.</p>
                </div>
                {step > 0 && !result && (
                    <button onClick={resetQuiz} className="text-gray-400 hover:text-indigo-600">
                        <FiRefreshCw />
                    </button>
                )}
            </div>

            <div className="min-h-[150px] flex items-center">
                {!result ? (
                    <div className="w-full">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="w-full"
                        >
                            <h4 className="text-lg font-medium text-gray-800 mb-4">
                                {currentQuiz.questions[step].text}
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                                {currentQuiz.questions[step].options.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => handleOptionSelect(currentQuiz.questions[step].id, option.value)}
                                        className="px-4 py-3 bg-white border border-indigo-100 rounded-xl hover:border-indigo-400 hover:bg-indigo-50 text-left transition-all shadow-sm hover:shadow-md text-gray-700 font-medium"
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </motion.div>

                        {/* Progress dots */}
                        <div className="flex gap-2 mt-6 justify-center">
                            {currentQuiz.questions.map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-2 h-2 rounded-full transition-colors ${i === step ? 'bg-indigo-600' : 'bg-indigo-200'}`}
                                />
                            ))}
                        </div>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full bg-white rounded-xl p-6 shadow-sm border border-green-100"
                    >
                        <div className="flex items-center gap-4 mb-3">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <FiCheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-gray-900">It's a Match!</h4>
                                <p className="text-green-600 font-semibold text-sm">{result.score}% Compatibility Score</p>
                            </div>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed mb-4">
                            {result.message}
                        </p>
                        <button
                            onClick={resetQuiz}
                            className="text-xs text-gray-400 hover:text-indigo-600 flex items-center gap-1"
                        >
                            <FiRefreshCw className="w-3 h-3" />
                            Retake Quiz
                        </button>
                    </motion.div>
                )}
            </div>
        </div>
    )
}
