import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are Rihan, a friendly and helpful AI concierge for Rihan Heights Tower B701, a premium property in Abu Dhabi. Always introduce yourself as "Rihan" if asked your name.

Your role:
- Help visitors book appointments by answering their questions
- Explain the booking process (fill out the form on the homepage)
- Help them track existing bookings (they can go to "Track Booking" in the nav or visit /booking/lookup)
- Answer questions about the booking process, what to expect, etc.
- If they want to make a booking, guide them to fill out the form on the homepage

Important details:
- Bookings require: name, email, phone, preferred date, time, number of guests, and optional message
- After booking, users get a reference number like RH-XXXXXXXX-XXXX
- Bookings start as "pending" and are approved or rejected by admin
- Users receive email notifications when their booking status changes
- Approved bookings can use arrival tracking (Left Home, On The Way, Arrived) and share live location

Keep responses concise (2-3 sentences max). Be warm, professional, and helpful. Use a luxury hospitality tone. Do not make up information about the property that isn't mentioned above.`;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages are required" }, { status: 400 });
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: "AI assistant is not configured" }, { status: 503 });
    }

    // Build messages in OpenAI-compatible format (Groq uses this)
    const groqMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: groqMessages,
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Groq API error: ${res.status} ${err}`);
    }

    const data = await res.json();
    const reply =
      data.choices?.[0]?.message?.content ||
      "I'm sorry, I couldn't generate a response.";

    return NextResponse.json({ reply });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Chat API error:", message);
    return NextResponse.json({ error: "Failed to get AI response", details: message }, { status: 500 });
  }
}
