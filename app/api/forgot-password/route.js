import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { createPasswordResetToken } from '@/lib/tokens';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email });

    // Always return success even if user not found
    // This prevents email enumeration attacks
    if (!user) {
      return NextResponse.json({
        message: 'If an account exists with this email, you will receive a reset link shortly.',
      });
    }

    // Create reset token
    const token = await createPasswordResetToken(user._id);

    // Build reset URL
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password/${token}`;

    // Send email
    const sent = await sendPasswordResetEmail(user.email, user.name, resetUrl);

    if (!sent) {
      return NextResponse.json(
        { error: 'Failed to send email. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'If an account exists with this email, you will receive a reset link shortly.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}