import { NextResponse } from "next/server";
import Groq from "groq-sdk";

type GenerateRequestBody = {
  subject?: string;
  topic?: string;
  style?: "Printable PDF" | "Google Sheets";
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateRequestBody;
    const subject = body.subject?.trim();
    const topic = body.topic?.trim();
    const style = body.style;

    if (!subject || !topic || !style) {
      return NextResponse.json({ error: "Subject, topic and style are required." }, { status: 400 });
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: "GROQ_API_KEY is not configured." }, { status: 500 });
    }

    const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const prompt = `Generate a classroom test about "${topic}" for the subject "${subject}". If style is "Google Sheets", output strictly in this format: Question | A | B | C | D | Correct Answer. If style is "Printable PDF", produce a clean printable layout with numbered questions and a separate answer key. Selected style: ${style}.`;

    const completion = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content:
            "You generate clear school tests for teachers. Keep output concise, practical, and directly usable.",
        },
        { role: "user", content: prompt },
      ],
    });

    const content = completion.choices[0]?.message?.content ?? "";

    return NextResponse.json({ content });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
