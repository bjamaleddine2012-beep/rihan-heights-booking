import { NextRequest, NextResponse } from "next/server";

// GET /api/bookings/calendar?ref=RH-...&name=...&date=...&time=...
// Generate an .ics calendar file for a booking
export async function GET(request: NextRequest) {
  const ref = request.nextUrl.searchParams.get("ref") || "Booking";
  const name = request.nextUrl.searchParams.get("name") || "Guest";
  const date = request.nextUrl.searchParams.get("date"); // "2026-03-20"
  const time = request.nextUrl.searchParams.get("time"); // "14:00"

  if (!date || !time) {
    return NextResponse.json({ error: "Date and time required" }, { status: 400 });
  }

  // Build start and end datetime (1 hour duration)
  const startDT = `${date.replace(/-/g, "")}T${time.replace(":", "")}00`;
  const endHour = String(Number(time.split(":")[0]) + 1).padStart(2, "0");
  const endDT = `${date.replace(/-/g, "")}T${endHour}${time.split(":")[1]}00`;

  const now = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Rihan Heights B701//Booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `DTSTART:${startDT}`,
    `DTEND:${endDT}`,
    `DTSTAMP:${now}`,
    `UID:${ref}@rihan-heights`,
    `SUMMARY:Rihan Heights B701 - Booking ${ref}`,
    `DESCRIPTION:Booking for ${name}\\nReference: ${ref}\\nDate: ${date}\\nTime: ${time}`,
    `LOCATION:Rihan Heights Tower B701, Abu Dhabi`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${ref}.ics"`,
    },
  });
}
