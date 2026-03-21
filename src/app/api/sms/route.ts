import { NextRequest, NextResponse } from "next/server";
import { generateOTP, verifyOTP } from "@/lib/otp";
import { sendWhatsApp } from "@/lib/twilio";

// POST /api/sms — Send or verify OTP via WhatsApp
export async function POST(request: NextRequest) {
  try {
    const { action, phone, code } = await request.json();

    if (action === "send") {
      if (!phone) {
        return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
      }

      const otp = generateOTP(phone);

      try {
        await sendWhatsApp(
          phone,
          `🏢 *Rihan Heights B701*\n\nYour verification code is: *${otp}*\n\nThis code expires in 5 minutes.`
        );
      } catch (err) {
        console.warn("WhatsApp OTP send failed:", err);
        // In development, return the code so the feature still works
        if (process.env.NODE_ENV === "development") {
          return NextResponse.json({ success: true, devCode: otp });
        }
        return NextResponse.json(
          { error: "Failed to send verification code. Make sure you've joined the WhatsApp sandbox." },
          { status: 500 }
        );
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
