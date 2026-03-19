import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { sendAdminNotification, sendBookingConfirmationEmail } from "@/lib/email";
import { generateReferenceNumber } from "@/lib/reference";

// POST /api/bookings — Create a new booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, nationality, date, time, guests, message } = body;

    if (!name || !email || !phone || !date || !time) {
      return NextResponse.json(
        { error: "Name, email, phone, date, and time are required" },
        { status: 400 }
      );
    }

    const bookingData = {
      referenceNumber: generateReferenceNumber(),
      name,
      email,
      phone,
      nationality: nationality || "",
      date,
      time,
      guests: Number(guests) || 1,
      message: message || "",
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    const docRef = await adminDb.collection("bookings").add(bookingData);

    // Send emails (non-blocking)
    sendAdminNotification({ id: docRef.id, ...bookingData }).catch((err) =>
      console.error("Failed to send admin notification:", err)
    );
    sendBookingConfirmationEmail({ id: docRef.id, ...bookingData }).catch((err) =>
      console.error("Failed to send booking confirmation:", err)
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
