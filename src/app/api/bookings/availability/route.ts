import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

// GET /api/bookings/availability?date=YYYY-MM-DD
// Returns booked time slots for a given date
export async function GET(request: NextRequest) {
  try {
    const date = request.nextUrl.searchParams.get("date");

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: "Valid date parameter required (YYYY-MM-DD)" },
        { status: 400 }
      );
    }

    const snapshot = await adminDb
      .collection("bookings")
      .where("date", "==", date)
      .where("status", "in", ["pending", "approved"])
      .get();

    const bookedSlots = snapshot.docs
      .map((doc) => doc.data().time as string)
      .filter(Boolean);

    return NextResponse.json({ date, bookedSlots });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Error fetching availability:", message);
    return NextResponse.json(
      { error: "Failed to fetch availability", details: message },
      { status: 500 }
    );
  }
}
