import { NextRequest, NextResponse } from "next/server";
import { generateOTP, verifyOTP } from "@/lib/otp";
import { sendSMS } from "@/lib/twilio";

// POST /api/sms — Send or verify OTP
export async function POST(request: NextRequest) {
  try {
    const { action, phone, code } = await request.json();

    if (action === "send") {
      if (!phone) {
        return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
      }

      const otp = generateOTP(phone);

      // Try sending SMS via Twilio; if not configured, return code in dev
      try {
        await sendSMS(phone, `Your Rihan Heights verification code is: ${otp}`);
      } catch (err) {
        console.warn("SMS send failed (Twilio may not be configured):", err);
        // In development, return the code so the feature still works
        if (process.env.NODE_ENV === "development") {
          return NextResponse.json({ success: true, devCode: otp });
        }
      }

      return NextResponse.json({ success: true });
    }

    if (action === "verify") {
      if (!phone || !code) {
        return NextResponse.json({ error: "Phone and code are required" }, { status: 400 });
      }

      const result = verifyOTP(phone, code);

      if (!result.valid) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      return NextResponse.json({ verified: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("OTP error:", error);
    return NextResponse.json({ error: "Failed to process verification" }, { status: 500 });
  }
}
