'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FiCheck, FiArrowRight, FiArrowLeft, FiAlertTriangle, FiRefreshCw } from 'react-icons/fi'
import Step1GetStarted from '@/components/seller/onboarding/Step1GetStarted'
import Step2PersonalDetails from '@/components/seller/onboarding/Step2PersonalDetails'
import Step3BusinessInfo from '@/components/seller/onboarding/Step3BusinessInfo'
import Step4BankDetails from '@/components/seller/onboarding/Step4BankDetails'
import Step5StoreSetup from '@/components/seller/onboarding/Step5StoreSetup'
import Step6Documents from '@/components/seller/onboarding/Step6Documents'
import Step7Review from '@/components/seller/onboarding/Step7Review'

const STEPS = [
    { id: 1, title: 'Get Started', shortTitle: 'Start' },
    { id: 2, title: 'Personal Details', shortTitle: 'Personal' },
    { id: 3, title: 'Business Info', shortTitle: 'Business' },
    { id: 4, title: 'Bank Details', shortTitle: 'Bank' },
    { id: 5, title: 'Store Setup', shortTitle: 'Store' },
    { id: 6, title: 'Documents', shortTitle: 'Docs' },
    { id: 7, title: 'Review & Submit', shortTitle: 'Review' }
]

export default function SellerOnboardingPage() {
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        // Step 1: Get Started
        email: '',
        phone: '',
        businessType: '',

        // Step 2: Personal Details
        fullName: '',
        dateOfBirth: '',
        residentialAddress: {
            addressLine1: '',
            addressLine2: '',
            city: '',
            state: '',
            pincode: '',
            country: 'AE'
        },
        governmentId: null,
        governmentIdType: '',

        // Step 3: Business Information
        businessName: '',
        gstin: '',
        pan: '',
        businessCategory: '',
        establishedYear: '',
        tradeLicense: null,

        // Step 4: Bank Details
        bankDetails: {
            accountNumber: '',
            ifscCode: '',
            accountHolderName: '',
            bankName: '',
            accountType: 'current',
            branch: '',
            upiId: ''
        },
        cancelledCheque: null,

        // Step 5: Store Setup
        storeInfo: {
            storeName: '',
            storeDescription: '',
            storeLogo: null,
            storeBanner: null,
            storeCategories: [],
            website: '',
            returnPolicy: '',
            shippingPolicy: '',
            customerSupportEmail: '',
            customerSupportPhone: '',
            socialMedia: {
                facebook: '',
                instagram: '',
                twitter: '',
                linkedin: ''
            }
        },

        // Step 6: Documents
        documents: {
            panCard: null,
            gstCertificate: null,
            idProof: null,
            addressProof: null,
            bankStatement: null
        },
        agreementAccepted: false
    })

    const [errors, setErrors] = useState({})
    const [showResumePrompt, setShowResumePrompt] = useState(false)
    const [bannedSeller, setBannedSeller] = useState(null)

    // Navigation Guard
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (currentStep > 1 && currentStep < STEPS.length) {
                e.preventDefault()
                e.returnValue = ''
            }
        }
        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => window.removeEventListener('beforeunload', handleBeforeUnload)
    }, [currentStep])

    // Load Draft
    useEffect(() => {
        const savedDraft = localStorage.getItem('sellerOnboardingDraft')
        if (savedDraft) {
            setShowResumePrompt(true)
        }
    }, [])

    const resumeDraft = () => {
        const savedDraft = localStorage.getItem('sellerOnboardingDraft')
        if (savedDraft) {
            try {
                const parsed = JSON.parse(savedDraft)
                setFormData(prev => ({ ...prev, ...parsed }))
                setShowResumePrompt(false)
            } catch (e) {
                console.error('Error parsing draft:', e)
            }
        }
    }

    const updateFormData = (stepData) => {
        setFormData(prev => ({ ...prev, ...stepData }))
        // Auto-save to localStorage
        localStorage.setItem('sellerOnboardingDraft', JSON.stringify({ ...formData, ...stepData }))
    }

    const validateStep = async (step) => {
        const newErrors = {}

        switch (step) {
            case 1:
                if (!formData.email) newErrors.email = 'Email is required'
                if (!formData.phone) newErrors.phone = 'Phone is required'
                if (!formData.businessType) newErrors.businessType = 'Business type is required'
                break
            case 2:
                if (!formData.fullName) newErrors.fullName = 'Full name is required'
                if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required'
                if (!formData.residentialAddress.addressLine1) newErrors.addressLine1 = 'Address is required'
                if (!formData.residentialAddress.city) newErrors.city = 'City is required'
                if (!formData.residentialAddress.pincode) newErrors.pincode = 'Pincode is required'
                break
            case 3:
                if (!formData.businessName) newErrors.businessName = 'Business name is required'
                if (!formData.gstin) newErrors.gstin = 'GST/TRN is required'
                if (!formData.businessCategory) newErrors.businessCategory = 'Business category is required'
                
                // If base validation passes, check if seller is banned/registered
                if (Object.keys(newErrors).length === 0) {
                    try {
                        const res = await fetch('/api/seller/onboarding/check-business', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ gstin: formData.gstin, pan: formData.pan })
                        })
                        const checkData = await res.json()
                        if (checkData.success && checkData.isRegistered) {
                            if (checkData.isBanned) {
                                setBannedSeller({
                                    reason: checkData.banReason,
                                    storeName: checkData.storeName
                                })
                                return false
                            } else {
                                alert(`Business "${checkData.storeName}" is already registered. Please log in instead.`)
                                return false
                            }
                        }
                    } catch (error) {
                        console.error('Check business error:', error)
                    }
                }
                break
            case 4:
                if (!formData.bankDetails.accountNumber) newErrors.accountNumber = 'Account number is required'
                if (!formData.bankDetails.ifscCode) newErrors.ifscCode = 'IFSC/IBAN code is required'
                if (!formData.bankDetails.accountHolderName) newErrors.accountHolderName = 'Account holder name is required'
                break
            case 5:
                if (!formData.storeInfo.storeName) newErrors.storeName = 'Store name is required'
                if (!formData.storeInfo.storeDescription) newErrors.storeDescription = 'Store description is required'
                if (formData.storeInfo.storeCategories.length === 0) newErrors.storeCategories = 'Select at least one category'
                break
            case 6:
                if (!formData.documents.panCard) newErrors.panCard = 'PAN card is required'
                if (!formData.documents.gstCertificate) newErrors.gstCertificate = 'GST certificate is required'
                if (!formData.agreementAccepted) newErrors.agreementAccepted = 'You must accept the terms and conditions'
                break
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleNext = async () => {
        if (await validateStep(currentStep)) {
            if (currentStep < STEPS.length) {
                setCurrentStep(currentStep + 1)
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }
        }
    }

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }

    const handleSubmit = async () => {
        if (!await validateStep(currentStep)) return

        setIsSubmitting(true)
        try {
            const formDataToSend = new FormData()

            // Append all text fields
            formDataToSend.append('email', formData.email)
            formDataToSend.append('phone', formData.phone)
            formDataToSend.append('businessType', formData.businessType)
            formDataToSend.append('fullName', formData.fullName)
            formDataToSend.append('dateOfBirth', formData.dateOfBirth)
            formDataToSend.append('residentialAddress', JSON.stringify(formData.residentialAddress))
            formDataToSend.append('businessName', formData.businessName)
            formDataToSend.append('gstin', formData.gstin)
            formDataToSend.append('pan', formData.pan)
            formDataToSend.append('businessCategory', formData.businessCategory)
            formDataToSend.append('establishedYear', formData.establishedYear)
            formDataToSend.append('bankDetails', JSON.stringify(formData.bankDetails))
            formDataToSend.append('storeInfo', JSON.stringify(formData.storeInfo))

            // Append file uploads
            if (formData.governmentId) formDataToSend.append('governmentId', formData.governmentId)
            if (formData.tradeLicense) formDataToSend.append('tradeLicense', formData.tradeLicense)
            if (formData.cancelledCheque) formDataToSend.append('cancelledCheque', formData.cancelledCheque)
            if (formData.storeInfo.storeLogo) formDataToSend.append('storeLogo', formData.storeInfo.storeLogo)
            if (formData.storeInfo.storeBanner) formDataToSend.append('storeBanner', formData.storeInfo.storeBanner)
            if (formData.documents.panCard) formDataToSend.append('panCard', formData.documents.panCard)
            if (formData.documents.gstCertificate) formDataToSend.append('gstCertificate', formData.documents.gstCertificate)
            if (formData.documents.idProof) formDataToSend.append('idProof', formData.documents.idProof)
            if (formData.documents.addressProof) formDataToSend.append('addressProof', formData.documents.addressProof)
            if (formData.documents.bankStatement) formDataToSend.append('bankStatement', formData.documents.bankStatement)

            const response = await fetch('/api/seller/onboarding', {
                method: 'POST',
                body: formDataToSend
            })

            const data = await response.json()

            if (data.success) {
                // Clear saved draft
                localStorage.removeItem('sellerOnboardingDraft')

                // Redirect to success page
                router.push('/seller/onboarding/success')
            } else {
                alert(data.message || 'Failed to submit registration')
            }
        } catch (error) {
            console.error('Submission error:', error)
            alert('An error occurred while submitting your registration')
        } finally {
            setIsSubmitting(false)
        }
    }

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return <Step1GetStarted formData={formData} updateFormData={updateFormData} errors={errors} />
            case 2:
                return <Step2PersonalDetails formData={formData} updateFormData={updateFormData} errors={errors} />
            case 3:
                return <Step3BusinessInfo formData={formData} updateFormData={updateFormData} errors={errors} />
            case 4:
                return <Step4BankDetails formData={formData} updateFormData={updateFormData} errors={errors} />
            case 5:
                return <Step5StoreSetup formData={formData} updateFormData={updateFormData} errors={errors} />
            case 6:
                return <Step6Documents formData={formData} updateFormData={updateFormData} errors={errors} />
            case 7:
                return <Step7Review formData={formData} onEdit={setCurrentStep} />
            default:
                return null
        }
    }

    const handleStepClick = async (stepId) => {
        // If jumping forward, validate current step
        if (stepId > currentStep) {
            if (await validateStep(currentStep)) {
                setCurrentStep(stepId)
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }
        } else {
            // Jumping back is always allowed
            setCurrentStep(stepId)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Progress Bar */}
                {/* Resume Prompt */}
                {showResumePrompt && (
                    <div className="mb-8 bg-blue-600 text-white p-4 rounded-2xl flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="flex items-center gap-3">
                            <FiRefreshCw className="w-6 h-6 animate-spin-slow" />
                            <div>
                                <p className="font-bold">Resume Previous Session?</p>
                                <p className="text-sm text-blue-100">We found an unfinished application. Would you like to continue from where you left off?</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setShowResumePrompt(false)}
                                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold transition-colors"
                            >
                                Dismiss
                            </button>
                            <button 
                                onClick={resumeDraft}
                                className="px-4 py-2 bg-white text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-bold transition-colors"
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                )}

                {/* Banned Seller Overlay */}
                {bannedSeller && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in duration-300">
                            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FiAlertTriangle className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-black text-center text-gray-900 mb-2">Registration Blocked</h3>
                            <p className="text-center text-gray-600 mb-6 font-medium">
                                The business <span className="text-gray-900 font-bold">"{bannedSeller.storeName}"</span> has been suspended or rejected.
                            </p>
                            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-8">
                                <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-1">Reason</p>
                                <p className="text-sm text-red-900 font-medium">{bannedSeller.reason}</p>
                            </div>
                            <button 
                                onClick={() => setBannedSeller(null)}
                                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-lg"
                            >
                                I Understand
                            </button>
                        </div>
                    </div>
                )}

                <div className="mb-12">
                    <div className="flex items-center justify-between mb-4">
                        {STEPS.map((step, index) => (
                            <div key={step.id} className="flex-1 relative">
                                <div className="flex items-center">
                                    {/* Step Circle */}
                                    <button 
                                        onClick={() => handleStepClick(step.id)}
                                        className={`
                    relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                    transition-all duration-300 hover:scale-110 active:scale-95
                    ${currentStep > step.id
                                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                                            : currentStep === step.id
                                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white ring-4 ring-blue-200'
                                                : 'bg-gray-200 text-gray-500 outline-none'
                                        }
                                    `}>
                                        {currentStep > step.id ? <FiCheck className="w-5 h-5" /> : step.id}
                                    </button>

                                    {/* Connector Line */}
                                    {index < STEPS.length - 1 && (
                                        <div className={`
                      flex-1 h-1 mx-2
                      ${currentStep > step.id ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gray-200'}
                    `} />
                                    )}
                                </div>

                                {/* Step Title */}
                                <button 
                                    onClick={() => handleStepClick(step.id)}
                                    className={`
                  absolute top-12 left-1/2 transform -translate-x-1/2 text-xs font-bold whitespace-nowrap transition-colors
                  ${currentStep === step.id ? 'text-blue-600' : 'text-gray-500 hover:text-blue-400'}
                `}>
                                    <span className="hidden sm:inline">{step.title}</span>
                                    <span className="sm:hidden">{step.shortTitle}</span>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12">
                    <div className="mb-8">
                        <h2 className="text-3xl font-black text-gray-900 mb-2">
                            {STEPS[currentStep - 1].title}
                        </h2>
                        <div className="h-1 w-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full" />
                    </div>

                    {/* Step Content */}
                    {renderStep()}

                    {/* Navigation Buttons */}
                    <div className="mt-12 flex items-center justify-between pt-8 border-t border-gray-200">
                        <button
                            onClick={handlePrevious}
                            disabled={currentStep === 1}
                            className={`
                flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all
                ${currentStep === 1
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }
              `}
                        >
                            <FiArrowLeft className="w-4 h-4" />
                            <span>Previous</span>
                        </button>

                        <div className="text-sm text-gray-500 font-medium">
                            Step {currentStep} of {STEPS.length}
                        </div>

                        {currentStep < STEPS.length ? (
                            <button
                                onClick={handleNext}
                                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
                            >
                                <span>Continue</span>
                                <FiArrowRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Submitting...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Submit Application</span>
                                        <FiCheck className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Help Text */}
                <div className="mt-8 text-center">
                    <p className="text-gray-600 text-sm">
                        Need help? Email us at{' '}
                        <a href="mailto:seller-support@onlineplanet.com" className="text-blue-600 font-semibold hover:underline">
                            seller-support@onlineplanet.com
                        </a>
                    </p>
                </div>
            </div>
        </div>
    )
}
