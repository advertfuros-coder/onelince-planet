// app/seller/layout.jsx
// Base layout for seller routes - authentication handled per route
export default function SellerLayout({ children }) {
  return (
    <div className="seller-layout">
      {children}
    </div>
  )
}
