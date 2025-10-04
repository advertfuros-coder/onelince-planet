// // app/layout.jsx
// import { Inter } from 'next/font/google'
// import { AuthProvider } from '@/lib/context/AuthContext'
// import { CartProvider } from '@/lib/context/CartContext'
// import { Toaster } from 'react-hot-toast'
// import './globals.css'

// const inter = Inter({ subsets: ['latin'] })

// export const metadata = {
//   title: 'OnlinePlanet - India\'s Best Multi-Vendor Marketplace',
//   description: 'Shop from thousands of sellers across India. Best prices, quality products, fast delivery.',
// }

// export default function RootLayout({ children }) {
//   return (
//     <html lang="en">
//       <body >
//         <AuthProvider>
//           <CartProvider>
//             {children}
//             <Toaster 
//               position="top-right"
//               toastOptions={{
//                 duration: 3000,
//                 style: {
//                   background: '#363636',
//                   color: '#fff',
//                 },
//                 success: {
//                   duration: 3000,
//                   iconTheme: {
//                     primary: '#4ade80',
//                     secondary: '#fff',
//                   },
//                 },
//                 error: {
//                   duration: 4000,
//                   iconTheme: {
//                     primary: '#ef4444',
//                     secondary: '#fff',
//                   },
//                 },
//               }}
//             />
//           </CartProvider>
//         </AuthProvider>
//       </body>
//     </html>
//   )
// }


"use client"
import {Providers} from './providers.jsx'
import './globals.css'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}