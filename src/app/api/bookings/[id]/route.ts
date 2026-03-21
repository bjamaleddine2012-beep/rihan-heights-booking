import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { sendStatusUpdateEmail } from "@/lib/email";
import { sendBookingWhatsApp } from "@/lib/twilio";

// PATCH /api/bookings/:id — Update booking status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const password = request.headers.get("x-admin-password");
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status || !["approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Status must be 'approved' or 'rejected'" },
        { status: 400 }
      );
    }

    const docRef = adminDb.collection("bookings").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    const statusUpdatedAt = new Date().toISOString();
    await docRef.update({ status, statusUpdatedAt });

    const bookingData = doc.data()!;
    const updatedBooking = {
      id,
      referenceNumber: bookingData.referenceNumber || "",
      name: bookingData.name || "",
      email: bookingData.email || "",
      phone: bookingData.phone || "",
      nationality: bookingData.nationality || "",
      date: bookingData.date || "",
      time: bookingData.time || "",
      guests: bookingData.guests || 1,
      message: bookingData.message || "",
      status,
      statusUpdatedAt,
    };

    // Send email notification (non-blocking)
    sendStatusUpdateEmail(updatedBooking).catch((err) =>
      console.error("Failed to send status update email:", err)
    );

    // Send WhatsApp notification (non-blocking)
    if (updatedBooking.phone) {
      sendBookingWhatsApp(
        updatedBooking.phone,
        status as "approved" | "rejected",
        {
          name: updatedBooking.name,
          referenceNumber: updatedBooking.referenceNumber,
          date: updatedBooking.date,
          time: updatedBooking.time,
        }
      ).catch((err) => console.error("WhatsApp status update failed:", err));
    }

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 }
    );
  }
}

// DELETE /api/bookings/:id — Delete a booking
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const password = request.headers.get("x-admin-password");
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const docRef = adminDb.collection("bookings").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    await docRef.delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting booking:", error);
    return NextResponse.json(
      { error: "Failed to delete booking" },
      { status: 500 }
    );
  }
}
