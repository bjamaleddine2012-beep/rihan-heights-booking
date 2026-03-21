// Twilio helper for WhatsApp and SMS
// Twilio uses basic auth: AccountSID:AuthToken

async function twilioRequest(endpoint: string, body: Record<string, string>) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    console.warn("Twilio credentials not set — skipping");
    return null;
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/${endpoint}`;
  const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(body).toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Twilio error ${res.status}: ${err}`);
  }

  return res.json();
}

/** Send a WhatsApp message */
export async function sendWhatsApp(to: string, message: string) {
  const from = process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886";
  // Ensure 'whatsapp:' prefix
  const toNumber = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;

  return twilioRequest("Messages.json", {
    From: from,
    To: toNumber,
    Body: message,
  });
}

/** Send an SMS message */
export async function sendSMS(to: string, message: string) {
  const from = process.env.TWILIO_PHONE_FROM;
  if (!from) {
    console.warn("TWILIO_PHONE_FROM not set — skipping SMS");
    return null;
  }

  return twilioRequest("Messages.json", {
    From: from,
    To: to,
    Body: message,
  });
}

/** Send WhatsApp notification for booking events */
export async function sendBookingWhatsApp(
  phone: string,
  type: "new" | "approved" | "rejected",
  data: { name: string; referenceNumber: string; date: string; time: string }
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const trackUrl = `${appUrl}/booking/lookup/${data.referenceNumber}`;

  const messages: Record<string, string> = {
    new: `🏢 *Rihan Heights B701*\n\nHi ${data.name}, your booking request has been received!\n\n📋 Ref: ${data.referenceNumber}\n📅 ${data.date} at ${data.time}\n\nWe'll notify you once it's reviewed.\n🔗 Track: ${trackUrl}`,
    approved: `🏢 *Rihan Heights B701*\n\n✅ Great news, ${data.name}! Your booking has been *approved*!\n\n📋 Ref: ${data.referenceNumber}\n📅 ${data.date} at ${data.time}\n\n🔗 Track & share your arrival: ${trackUrl}`,
    rejected: `🏢 *Rihan Heights B701*\n\n❌ Hi ${data.name}, unfortunately your booking (${data.referenceNumber}) for ${data.date} could not be accommodated.\n\nFeel free to book another date.\n🔗 ${appUrl}`,
  };

  return sendWhatsApp(phone, messages[type]);
}

/** Send admin WhatsApp notification */
export async function sendAdminWhatsApp(data: {
  name: string;
  referenceNumber: string;
  date: string;
  time: string;
  phone: string;
  nationality: string;
}) {
  const adminPhone = process.env.ADMIN_WHATSAPP;
  if (!adminPhone) return null;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const msg = `🏢 *New Booking Request*\n\n👤 ${data.name}\n🌍 ${data.nationality || "N/A"}\n📱 ${data.phone}\n📅 ${data.date} at ${data.time}\n📋 ${data.referenceNumber}\n\n🔗 ${appUrl}/admin`;

  return sendWhatsApp(adminPhone, msg);
}
