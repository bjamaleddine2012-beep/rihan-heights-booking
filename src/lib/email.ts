import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "Rihan Heights B701 <onboarding@resend.dev>";

export interface BookingData {
  id: string;
  name: string;
  email: string;
  date: string;
  time: string;
  message: string;
  status: string;
}

/** Notify admin that a new booking was created */
export async function sendAdminNotification(booking: BookingData) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.warn("ADMIN_EMAIL not set — skipping admin notification");
    return;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  await resend.emails.send({
    from: FROM_EMAIL,
    to: adminEmail,
    subject: `New Booking Request from ${booking.name}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e40af;">New Booking — Rihan Heights B701</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px; font-weight: bold;">Name:</td><td style="padding: 8px;">${booking.name}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Email:</td><td style="padding: 8px;">${booking.email}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Date:</td><td style="padding: 8px;">${booking.date}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Time:</td><td style="padding: 8px;">${booking.time}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Message:</td><td style="padding: 8px;">${booking.message || "No message"}</td></tr>
        </table>
        <p style="margin-top: 24px;">
          <a href="${appUrl}/admin" style="background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            View in Dashboard
          </a>
        </p>
      </div>
    `,
  });
}

/** Notify user that their booking status was updated */
export async function sendStatusUpdateEmail(booking: BookingData) {
  const isApproved = booking.status === "approved";
  const statusColor = isApproved ? "#16a34a" : "#dc2626";
  const statusText = isApproved ? "Approved" : "Rejected";

  await resend.emails.send({
    from: FROM_EMAIL,
    to: booking.email,
    subject: `Your Booking Has Been ${statusText}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${statusColor};">Booking ${statusText}</h2>
        <p>Hi ${booking.name},</p>
        <p>Your booking for <strong>${booking.date} at ${booking.time}</strong> has been <strong style="color: ${statusColor};">${booking.status}</strong>.</p>
        ${isApproved
          ? "<p>We look forward to seeing you! If you need to make changes, please contact us.</p>"
          : "<p>Unfortunately, we are unable to accommodate your request at this time. Please feel free to submit a new booking for a different date.</p>"
        }
        <p style="color: #6b7280; margin-top: 24px; font-size: 14px;">
          Thank you for booking with Rihan Heights Tower B701.
        </p>
      </div>
    `,
  });
}
