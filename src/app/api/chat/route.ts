import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are a friendly and helpful AI concierge for Rihan Heights Tower B701, a premium property in Abu Dhabi.

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

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "AI assistant is not configured" }, { status: 503 });
    }

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    const textBlock = response.content.find((block) => block.type === "text");
    const reply = textBlock ? textBlock.text : "I'm sorry, I couldn't generate a response.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Failed to get AI response" }, { status: 500 });
  }
}
