// middleware.js
import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export function middleware(request) {
  const { pathname } = request.nextUrl

  // Define role-based protected route prefixes
  const roleRoutes = {
    admin: ['/api/admin'],
    seller: ['/api/seller'],
    customer: ['/api/customer/orders', '/api/customer/profile'],
  }

  // Determine required role for the current request path
  let requiredRole = null
  for (const [role, routes] of Object.entries(roleRoutes)) {
    if (routes.some(route => pathname.startsWith(route))) {
      requiredRole = role
      break
    }
  }

  // If route requires role, verify JWT and check authorization
  if (requiredRole) {
    const authHeader = request.headers.get('authorization') || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Access token required' },
        { status: 401 }
      )
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      // Check if user role matches required role
      if (decoded.role !== requiredRole) {
        return NextResponse.json(
          { success: false, message: 'Insufficient permissions' },
          { status: 403 }
        )
      }

      // Append user info to headers for downstream handlers
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('user-id', decoded.id)
      requestHeaders.set('user-role', decoded.role)
      requestHeaders.set('user-email', decoded.email)

      return NextResponse.next({
        request: { headers: requestHeaders },
      })
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      )
    }
  }

  // For unprotected routes, just continue
  return NextResponse.next()
}

// Matcher for routes to run this middleware on
export const config = {
  matcher: [
    '/api/admin/:path*',
    '/api/seller/:path*',
    '/api/customer/orders/:path*',
    '/api/customer/profile/:path*',
  ],
}
