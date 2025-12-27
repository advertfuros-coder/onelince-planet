// app/seller/onboarding/layout.jsx
// This layout overrides the parent seller layout to make onboarding public
export default function OnboardingLayout({ children }) {
    return (
        <div className="onboarding-public-layout">
            {children}
        </div>
    )
}
