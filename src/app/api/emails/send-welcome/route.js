import { NextResponse } from 'next/server';
import emailService from '@/lib/services/emailService';

export async function POST(request) {
  try {
    const { user } = await request.json();
    
    await emailService.sendWelcomeEmail(user);
    
    return NextResponse.json({
      success: true,
      message: 'Welcome email sent'
    });
  } catch (error) {
    console.error('Send welcome email error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
