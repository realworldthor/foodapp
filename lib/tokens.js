import crypto from 'crypto';
import connectDB from '@/lib/db';
import Token from '@/models/Token';

export function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

export async function createPasswordResetToken(userId) {
  await connectDB();

  // Delete any existing reset tokens for this user
  await Token.deleteMany({ userId, type: 'password_reset' });

  const token = generateToken();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await Token.create({
    userId,
    token,
    type: 'password_reset',
    expiresAt,
  });

  return token;
}

export async function validatePasswordResetToken(token) {
  await connectDB();

  const tokenDoc = await Token.findOne({
    token,
    type: 'password_reset',
    used: false,
    expiresAt: { $gt: new Date() },
  });

  if (!tokenDoc) return null;
  return tokenDoc;
}

export async function markTokenAsUsed(tokenId) {
  await connectDB();
  await Token.findByIdAndUpdate(tokenId, { used: true });
}
