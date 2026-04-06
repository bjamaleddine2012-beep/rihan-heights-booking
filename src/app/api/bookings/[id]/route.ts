import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { sendStatusUpdateEmail, sendRescheduleEmail } from "@/lib/email";
import { sendBookingWhatsApp } from "@/lib/twilio";

// PATCH /api/bookings/:id — Update status, reschedule, or save admin notes
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
    const docRef = adminDb.collection("bookings").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const bookingData = doc.data()!;
    const updates: Record<string, unknown> = {};

    // --- Status update (approve/reject) ---
    if (body.status) {
      if (!["approved", "rejected"].includes(body.status)) {
        return NextResponse.json(
          { error: "Status must be 'approved' or 'rejected'" },
          { status: 400 }
        );
      }
      updates.status = body.status;
      updates.statusUpdatedAt = new Date().toISOString();
    }

    // --- Reschedule (change date/time) ---
    if (body.date && body.time) {
      updates.rescheduledFrom = { date: bookingData.date, time: bookingData.time };
      updates.date = body.date;
      updates.time = body.time;
    }

    // --- Admin notes ---
    if (body.adminNotes !== undefined) {
      updates.adminNotes = body.adminNotes;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    await docRef.update(updates);

    const updatedBooking = {
      id,
      referenceNumber: bookingData.referenceNumber || "",
      name: bookingData.name || "",
      email: bookingData.email || "",
      phone: bookingData.phone || "",
      nationality: bookingData.nationality || "",
      date: (updates.date as string) || bookingData.date || "",
      time: (updates.time as string) || bookingData.time || "",
      guests: bookingData.guests || 1,
      message: bookingData.message || "",
      service: bookingData.service || "other",
      status: (updates.status as string) || bookingData.status,
      adminNotes: (updates.adminNotes as string) ?? bookingData.adminNotes ?? "",
      rescheduledFrom: (updates.rescheduledFrom as { date: string; time: string }) || bookingData.rescheduledFrom || null,
      statusUpdatedAt: (updates.statusUpdatedAt as string) || bookingData.statusUpdatedAt || "",
    };

    // Send notifications for status changes
    if (body.status) {
      sendStatusUpdateEmail(updatedBooking).catch((err) =>
        console.error("Failed to send status update email:", err)
      );
      if (updatedBooking.phone) {
        sendBookingWhatsApp(
          updatedBooking.phone,
          body.status as "approved" | "rejected",
          {
            name: updatedBooking.name,
            referenceNumber: updatedBooking.referenceNumber,
            date: updatedBooking.date,
            time: updatedBooking.time,
          }
        ).catch((err) => console.error("WhatsApp status update failed:", err));
      }
    }

    // Send notifications for reschedule
    if (body.date && body.time) {
      sendRescheduleEmail(updatedBooking, bookingData.date, bookingData.time).catch((err) =>
        console.error("Failed to send reschedule email:", err)
      );
      if (updatedBooking.phone) {
        sendBookingWhatsApp(
          updatedBooking.phone,
          "rescheduled",
          {
            name: updatedBooking.name,
            referenceNumber: updatedBooking.referenceNumber,
            date: updatedBooking.date,
            time: updatedBooking.time,
          }
        ).catch((err) => console.error("WhatsApp reschedule failed:", err));
      }
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
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
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
