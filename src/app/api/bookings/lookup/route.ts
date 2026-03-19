import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

function publicBookingData(data: FirebaseFirestore.DocumentData) {
  return {
    referenceNumber: data.referenceNumber,
    name: data.name,
    date: data.date,
    time: data.time,
    guests: data.guests || 1,
    status: data.status,
    arrivalStatus: data.arrivalStatus || "none",
    arrivalUpdatedAt: data.arrivalUpdatedAt || null,
    locationLink: data.locationLink || null,
    createdAt: data.createdAt,
    statusUpdatedAt: data.statusUpdatedAt || null,
  };
}

// GET /api/bookings/lookup — Public lookup by reference or email
export async function GET(request: NextRequest) {
  try {
    const ref = request.nextUrl.searchParams.get("ref");
    const email = request.nextUrl.searchParams.get("email");

    if (!ref && !email) {
      return NextResponse.json({ error: "Provide a 'ref' or 'email' query parameter" }, { status: 400 });
    }

    if (ref) {
      const snapshot = await adminDb.collection("bookings").where("referenceNumber", "==", ref.toUpperCase()).limit(1).get();
      if (snapshot.empty) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
      return NextResponse.json(publicBookingData(snapshot.docs[0].data()));
    }

    const snapshot = await adminDb.collection("bookings").where("email", "==", email).orderBy("createdAt", "desc").get();
    return NextResponse.json(snapshot.docs.map((doc) => publicBookingData(doc.data())));
  } catch (error) {
    console.error("Error looking up booking:", error);
    return NextResponse.json({ error: "Failed to look up booking" }, { status: 500 });
  }
}

// PATCH /api/bookings/lookup — Update arrival status (public, by reference number)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { referenceNumber, arrivalStatus, locationLink } = body;

    if (!referenceNumber) {
      return NextResponse.json({ error: "Reference number is required" }, { status: 400 });
    }

    const validStatuses = ["none", "left-home", "on-the-way", "arrived"];
    if (arrivalStatus && !validStatuses.includes(arrivalStatus)) {
      return NextResponse.json({ error: "Invalid arrival status" }, { status: 400 });
    }

    const snapshot = await adminDb.collection("bookings").where("referenceNumber", "==", referenceNumber.toUpperCase()).limit(1).get();
    if (snapshot.empty) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

    const doc = snapshot.docs[0];
    const booking = doc.data();

    // Only allow arrival updates on approved bookings
    if (booking.status !== "approved") {
      return NextResponse.json({ error: "Arrival tracking is only available for approved bookings" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {
      arrivalUpdatedAt: new Date().toISOString(),
    };
    if (arrivalStatus) updateData.arrivalStatus = arrivalStatus;
    if (locationLink !== undefined) updateData.locationLink = locationLink;

    await adminDb.collection("bookings").doc(doc.id).update(updateData);

    return NextResponse.json({ success: true, ...updateData });
  } catch (error) {
    console.error("Error updating arrival status:", error);
    return NextResponse.json({ error: "Failed to update arrival status" }, { status: 500 });
  }
}
