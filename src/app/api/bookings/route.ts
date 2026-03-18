import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { sendAdminNotification } from "@/lib/email";

// POST /api/bookings — Create a new booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, date, time, message } = body;

    // Validate required fields
    if (!name || !email || !date || !time) {
      return NextResponse.json(
        { error: "Name, email, date, and time are required" },
        { status: 400 }
      );
    }

    // Create booking document
    const bookingData = {
      name,
      email,
      date,
      time,
      message: message || "",
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    const docRef = await adminDb.collection("bookings").add(bookingData);

    // Send email notification to admin (don't block the response)
    sendAdminNotification({ id: docRef.id, ...bookingData }).catch((err) =>
      console.error("Failed to send admin notification:", err)
    );

    return NextResponse.json(
      { id: docRef.id, ...bookingData },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Error creating booking:", message, error);
    return NextResponse.json(
      { error: "Failed to create booking", details: message },
      { status: 500 }
    );
  }
}

// GET /api/bookings — Fetch all bookings (admin use)
export async function GET(request: NextRequest) {
  try {
    // Simple auth check via query param or header
    const password =
      request.headers.get("x-admin-password") ||
      request.nextUrl.searchParams.get("password");

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const snapshot = await adminDb
      .collection("bookings")
      .orderBy("createdAt", "desc")
      .get();

    const bookings = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
