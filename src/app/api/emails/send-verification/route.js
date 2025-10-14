
import { NextResponse } from 'next/server';
import emailService from '@/lib/services/emailService';

export async function POST(request) {
  try {
    const { user, verificationToken } = await request.json();
    
    await emailService.sendVerificationEmail(user, verificationToken);
    
    return NextResponse.json({
      success: true,
      message: 'Verification email sent'
    });
  } catch (error) {
    console.error('Send verification email error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
