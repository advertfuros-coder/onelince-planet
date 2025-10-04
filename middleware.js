// middleware.js
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Define role-based protected routes
  const roleRoutes = {
    admin: ['/api/admin'],
    seller: ['/api/seller'],
    customer: ['/api/customer/orders', '/api/customer/profile']
  };

  // Check if route needs protection
  let requiredRole = null;
  for (const [role, routes] of Object.entries(roleRoutes)) {
    if (routes.some(route => pathname.startsWith(route))) {
      requiredRole = role;
      break;
    }
  }

  if (requiredRole) {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Access token required' },
        { status: 401 }
      );
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check role authorization
      if (decoded.role !== requiredRole) {
        return NextResponse.json(
          { success: false, message: 'Insufficient permissions' },
          { status: 403 }
        );
      }

      // Add user info to headers
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('user-id', decoded.userId);
      requestHeaders.set('user-role', decoded.role);
      requestHeaders.set('user-email', decoded.email);

      return NextResponse.next({
        request: { headers: requestHeaders }
      });
      
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/admin/:path*',
    '/api/seller/:path*',
    '/api/customer/orders/:path*',
    '/api/customer/profile/:path*'
  ]
};
