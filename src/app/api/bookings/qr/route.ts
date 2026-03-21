import { NextRequest, NextResponse } from "next/server";

// GET /api/bookings/qr?ref=RH-...
// Generate QR code as SVG for a booking reference
export async function GET(request: NextRequest) {
  const ref = request.nextUrl.searchParams.get("ref");
  if (!ref) {
    return NextResponse.json({ error: "Reference number required" }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const bookingUrl = `${appUrl}/booking/lookup/${encodeURIComponent(ref)}`;

  // Use a public QR code API to generate the image
  // We'll return a redirect to the QR image
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(bookingUrl)}&bgcolor=0f172a&color=d4a853&format=png`;

  // Fetch and proxy the QR image
  const res = await fetch(qrApiUrl);
  if (!res.ok) {
    return NextResponse.json({ error: "Failed to generate QR code" }, { status: 500 });
  }

  const imageBuffer = await res.arrayBuffer();

  return new NextResponse(imageBuffer, {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `inline; filename="qr-${ref}.png"`,
      "Cache-Control": "public, max-age=86400",
    },
  });
}
