'use client'
import { FiEdit2, FiCheckCircle, FiUser, FiInfo, FiBriefcase, FiHome } from 'react-icons/fi'

export default function Step7Review({ formData, onEdit }) {
    const SectionHeader = ({ title, icon: Icon, onEditClick }) => (
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            </div>
            {onEditClick && (
                <button
                    onClick={onEditClick}
                    className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                    <FiEdit2 className="w-4 h-4" />
                    Edit
                </button>
            )}
        </div>
    )

    const InfoGrid = ({ items }) => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
            {items.map((item, index) => (
                <div key={index} className="flex flex-col">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                        {item.label}
                    </span>
                    <span className="text-gray-900 font-medium break-words">
                        {item.value || <span className="text-gray-400 italic">Not provided</span>}
                    </span>
                </div>
            ))}
        </div>
    )

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-white/20 rounded-full">
                        <FiCheckCircle className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">Review Your Application</h2>
                        <p className="text-blue-100">Please review all details before final submission.</p>
                    </div>
                </div>
            </div>

            {/* Section 1: Basic Info */}
            <section className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                <SectionHeader
                    title="Basic Information"
                    icon={FiUser}
                    onEditClick={() => onEdit(1)}
                />
                <InfoGrid items={[
                    { label: 'Email Address', value: formData.email },
                    { label: 'Phone Number', value: formData.phone },
                    { label: 'Business Type', value: formData.businessType }
                ]} />
            </section>

            {/* Section 2: Personal Details */}
            <section className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                <SectionHeader
                    title="Personal Details"
                    icon={FiInfo}
                    onEditClick={() => onEdit(2)}
                />
                <InfoGrid items={[
                    { label: 'Full Name', value: formData.fullName },
                    { label: 'Date of Birth', value: formData.dateOfBirth },
                    { label: 'Address', value: `${formData.residentialAddress.addressLine1}, ${formData.residentialAddress.city}, ${formData.residentialAddress.pincode}` }
                ]} />
            </section>

            {/* Section 3: Business Information */}
            <section className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                <SectionHeader
                    title="Business Details"
                    icon={FiBriefcase}
                    onEditClick={() => onEdit(3)}
                />
                <InfoGrid items={[
                    { label: 'Business Name', value: formData.businessName },
                    { label: 'GSTIN/TRN', value: formData.gstin },
                    { label: 'PAN', value: formData.pan },
                    { label: 'Business Category', value: formData.businessCategory }
                ]} />
            </section>

            {/* Section 4: Bank Details */}
            <section className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                <SectionHeader
                    title="Bank Account"
                    icon={FiHome}
                    onEditClick={() => onEdit(4)}
                />
                <InfoGrid items={[
                    { label: 'Account Holder', value: formData.bankDetails.accountHolderName },
                    { label: 'Bank Name', value: formData.bankDetails.bankName },
                    { label: 'Account Number', value: formData.bankDetails.accountNumber },
                    { label: 'IFSC/IBAN', value: formData.bankDetails.ifscCode }
                ]} />
            </section>

            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6">
                <div className="flex gap-4">
                    <div className="p-2 bg-orange-100 rounded-lg text-orange-600 h-fit">
                        <FiInfo className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-bold text-orange-900 mb-1">Final Declaration</h4>
                        <p className="text-sm text-orange-800 leading-relaxed">
                            By clicking the submit button, you agree that all given information is correct to the best of your knowledge. Any false information may lead to rejection of your application.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
