import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "Rihan Heights B701 <onboarding@resend.dev>";

export interface BookingData {
  id: string;
  referenceNumber: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  message: string;
  status: string;
}

function emailWrapper(content: string): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 24px 32px; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 20px; font-weight: 700;">Rihan Heights Tower B701</h1>
      </div>
      <div style="padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        ${content}
      </div>
      <div style="text-align: center; padding: 16px; color: #9ca3af; font-size: 12px;">
        &copy; ${new Date().getFullYear()} Rihan Heights Tower B701. All rights reserved.
      </div>
    </div>
  `;
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
    subject: `New Booking ${booking.referenceNumber} from ${booking.name}`,
    html: emailWrapper(`
      <h2 style="color: #1e40af; margin-top: 0;">New Booking Request</h2>
      <div style="background: #f0f4ff; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px;">
        <span style="font-family: monospace; font-weight: bold; color: #1e40af; font-size: 16px;">${booking.referenceNumber}</span>
      </div>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 10px 8px; font-weight: 600; color: #374151; border-bottom: 1px solid #f3f4f6;">Name</td><td style="padding: 10px 8px; border-bottom: 1px solid #f3f4f6;">${booking.name}</td></tr>
        <tr><td style="padding: 10px 8px; font-weight: 600; color: #374151; border-bottom: 1px solid #f3f4f6;">Email</td><td style="padding: 10px 8px; border-bottom: 1px solid #f3f4f6;">${booking.email}</td></tr>
        <tr><td style="padding: 10px 8px; font-weight: 600; color: #374151; border-bottom: 1px solid #f3f4f6;">Phone</td><td style="padding: 10px 8px; border-bottom: 1px solid #f3f4f6;">${booking.phone}</td></tr>
        <tr><td style="padding: 10px 8px; font-weight: 600; color: #374151; border-bottom: 1px solid #f3f4f6;">Date</td><td style="padding: 10px 8px; border-bottom: 1px solid #f3f4f6;">${booking.date}</td></tr>
        <tr><td style="padding: 10px 8px; font-weight: 600; color: #374151; border-bottom: 1px solid #f3f4f6;">Time</td><td style="padding: 10px 8px; border-bottom: 1px solid #f3f4f6;">${booking.time}</td></tr>
        <tr><td style="padding: 10px 8px; font-weight: 600; color: #374151; border-bottom: 1px solid #f3f4f6;">Guests</td><td style="padding: 10px 8px; border-bottom: 1px solid #f3f4f6;">${booking.guests}</td></tr>
        <tr><td style="padding: 10px 8px; font-weight: 600; color: #374151;">Message</td><td style="padding: 10px 8px;">${booking.message || "—"}</td></tr>
      </table>
      <div style="margin-top: 24px; text-align: center;">
        <a href="${appUrl}/admin" style="display: inline-block; background: #1e40af; color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: 600;">
          View in Dashboard
        </a>
      </div>
    `),
  });
}

/** Send confirmation email to the user after booking */
export async function sendBookingConfirmationEmail(booking: BookingData) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  await resend.emails.send({
    from: FROM_EMAIL,
    to: booking.email,
    subject: `Booking Received — ${booking.referenceNumber}`,
    html: emailWrapper(`
      <h2 style="color: #1e40af; margin-top: 0;">Thank You for Your Booking!</h2>
      <p style="color: #374151;">Hi ${booking.name},</p>
      <p style="color: #6b7280;">We've received your booking request and will review it shortly. You'll receive an email once it's been confirmed.</p>

      <div style="background: #f0f4ff; padding: 16px 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
        <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Your Reference Number</p>
        <p style="margin: 0; font-family: monospace; font-weight: bold; color: #1e40af; font-size: 22px; letter-spacing: 2px;">${booking.referenceNumber}</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr><td style="padding: 8px; font-weight: 600; color: #374151;">Date</td><td style="padding: 8px;">${booking.date}</td></tr>
        <tr><td style="padding: 8px; font-weight: 600; color: #374151;">Time</td><td style="padding: 8px;">${booking.time}</td></tr>
        <tr><td style="padding: 8px; font-weight: 600; color: #374151;">Guests</td><td style="padding: 8px;">${booking.guests}</td></tr>
      </table>

      <div style="text-align: center; margin-top: 24px;">
        <a href="${appUrl}/booking/lookup/${booking.referenceNumber}" style="display: inline-block; background: #1e40af; color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: 600;">
          Track Your Booking
        </a>
      </div>
    `),
  });
}

/** Notify a user that a task was assigned to them */
export async function sendTaskAssignmentEmail(
  toEmail: string,
  toName: string,
  taskName: string,
  dueDate: string,
  appUrl: string
) {
  await resend.emails.send({
    from: FROM_EMAIL,
    to: toEmail,
    subject: `New Task Assigned: ${taskName}`,
    html: emailWrapper(`
      <h2 style="color: #1e40af; margin-top: 0;">New Task Assigned</h2>
      <p style="color: #374151;">Hi ${toName},</p>
      <p style="color: #6b7280;">A new task has been assigned to you.</p>

      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr><td style="padding: 10px 8px; font-weight: 600; color: #374151; border-bottom: 1px solid #f3f4f6;">Task</td><td style="padding: 10px 8px; border-bottom: 1px solid #f3f4f6;">${taskName}</td></tr>
        <tr><td style="padding: 10px 8px; font-weight: 600; color: #374151;">Due Date</td><td style="padding: 10px 8px;">${new Date(dueDate).toLocaleDateString()}</td></tr>
      </table>

      <div style="text-align: center; margin-top: 24px;">
        <a href="${appUrl}/task-management" style="display: inline-block; background: #1e40af; color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: 600;">
          View Tasks
        </a>
      </div>
    `),
  });
}

/** Notify user that their booking status was updated */
export async function sendStatusUpdateEmail(booking: BookingData) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const isApproved = booking.status === "approved";
  const statusColor = isApproved ? "#16a34a" : "#dc2626";
  const statusText = isApproved ? "Approved" : "Rejected";

  await resend.emails.send({
    from: FROM_EMAIL,
    to: booking.email,
    subject: `Booking ${booking.referenceNumber} — ${statusText}`,
    html: emailWrapper(`
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; background: ${isApproved ? "#f0fdf4" : "#fef2f2"}; padding: 8px 24px; border-radius: 24px;">
          <span style="color: ${statusColor}; font-weight: 700; font-size: 18px;">${statusText}</span>
        </div>
      </div>

      <p style="color: #374151;">Hi ${booking.name},</p>
      <p style="color: #6b7280;">Your booking <strong style="font-family: monospace;">${booking.referenceNumber}</strong> for <strong>${booking.date} at ${booking.time}</strong> (${booking.guests} guest${booking.guests !== 1 ? "s" : ""}) has been <strong style="color: ${statusColor};">${booking.status}</strong>.</p>

      ${isApproved
        ? '<p style="color: #6b7280;">We look forward to seeing you! If you need to make changes, please contact us.</p>'
        : '<p style="color: #6b7280;">Unfortunately, we are unable to accommodate your request at this time. Please feel free to submit a new booking for a different date.</p>'
      }

      <div style="text-align: center; margin-top: 24px;">
        <a href="${appUrl}/booking/lookup/${booking.referenceNumber}" style="display: inline-block; background: #1e40af; color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: 600;">
          View Booking Details
        </a>
      </div>
    `),
  });
}
