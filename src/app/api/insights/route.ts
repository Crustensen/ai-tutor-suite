import { NextResponse } from "next/server";
import Groq from "groq-sdk";

type InsightsRequestBody = {
  summaryTable?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as InsightsRequestBody;
    const summaryTable = body.summaryTable?.trim();

    if (!summaryTable) {
      return NextResponse.json({ error: "summaryTable is required." }, { status: 400 });
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: "GROQ_API_KEY is not configured." }, { status: 500 });
    }

    const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const completion = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content:
            "You are an educational analytics assistant. Return concise markdown with sections: Massive Errors, Weak Topics, Top Performers.",
        },
        {
          role: "user",
          content: `Analyze the class results table and provide practical teacher insights.\n\n${summaryTable}`,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content ?? "No insights generated.";

    return NextResponse.json({ content });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
