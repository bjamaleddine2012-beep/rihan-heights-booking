import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

// GET /api/bookings/lookup — Public lookup by reference or email
export async function GET(request: NextRequest) {
  try {
    const ref = request.nextUrl.searchParams.get("ref");
    const email = request.nextUrl.searchParams.get("email");

    if (!ref && !email) {
      return NextResponse.json(
        { error: "Provide a 'ref' or 'email' query parameter" },
        { status: 400 }
      );
    }

    if (ref) {
      const snapshot = await adminDb
        .collection("bookings")
        .where("referenceNumber", "==", ref.toUpperCase())
        .limit(1)
        .get();

      if (snapshot.empty) {
        return NextResponse.json(
          { error: "Booking not found" },
          { status: 404 }
        );
      }

      const doc = snapshot.docs[0];
      const data = doc.data();

      return NextResponse.json({
        referenceNumber: data.referenceNumber,
        name: data.name,
        date: data.date,
        time: data.time,
        guests: data.guests || 1,
        status: data.status,
        createdAt: data.createdAt,
        statusUpdatedAt: data.statusUpdatedAt || null,
      });
    }

    // Lookup by email
    const snapshot = await adminDb
      .collection("bookings")
      .where("email", "==", email)
      .orderBy("createdAt", "desc")
      .get();

    const bookings = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        referenceNumber: data.referenceNumber,
        name: data.name,
        date: data.date,
        time: data.time,
        guests: data.guests || 1,
        status: data.status,
        createdAt: data.createdAt,
        statusUpdatedAt: data.statusUpdatedAt || null,
      };
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Error looking up booking:", error);
    return NextResponse.json(
      { error: "Failed to look up booking" },
      { status: 500 }
    );
  }
}
