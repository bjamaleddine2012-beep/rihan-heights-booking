// Simple in-memory OTP store (server-side only)
// For production, use Redis or Firestore

interface OTPEntry {
  code: string;
  phone: string;
  expiresAt: number;
  attempts: number;
}

const otpStore = new Map<string, OTPEntry>();

// Clean up expired entries periodically
function cleanup() {
  const now = Date.now();
  for (const [key, entry] of otpStore.entries()) {
    if (entry.expiresAt < now) otpStore.delete(key);
  }
}

/** Generate a 6-digit OTP */
export function generateOTP(phone: string): string {
  cleanup();

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const key = phone.replace(/\D/g, ""); // normalize

  otpStore.set(key, {
    code,
    phone,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
    attempts: 0,
  });

  return code;
}

/** Verify OTP — returns true if valid */
export function verifyOTP(phone: string, code: string): { valid: boolean; error?: string } {
  cleanup();

  const key = phone.replace(/\D/g, "");
  const entry = otpStore.get(key);

  if (!entry) {
    return { valid: false, error: "No verification code found. Please request a new one." };
  }

  if (entry.expiresAt < Date.now()) {
    otpStore.delete(key);
    return { valid: false, error: "Code expired. Please request a new one." };
  }

  entry.attempts++;

  if (entry.attempts > 5) {
    otpStore.delete(key);
    return { valid: false, error: "Too many attempts. Please request a new code." };
  }

  if (entry.code !== code) {
    return { valid: false, error: "Invalid code. Please try again." };
  }

  // Success — remove the used code
  otpStore.delete(key);
  return { valid: true };
}
