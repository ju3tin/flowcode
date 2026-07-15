import { NextRequest, NextResponse } from "next/server";
import {
  getAnthropicClient,
  GENERATE_SYSTEM_PROMPT,
  MODEL,
  parseJsonResponse,
} from "@/lib/anthropic";
import type { GenerateRequest, GenerateResponse } from "@/types/flow";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as GenerateRequest;

    if (!body?.prompt || typeof body.prompt !== "string") {
      return NextResponse.json(
        { error: "Missing required field: prompt" },
        { status: 400 }
      );
    }

    const anthropic = getAnthropicClient();

    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4000,
      system: GENERATE_SYSTEM_PROMPT,
      messages: [{ role: "user", content: body.prompt }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json(
        { error: "Model returned no text content" },
        { status: 502 }
      );
    }

    const parsed = parseJsonResponse<GenerateResponse>(textBlock.text);
    return NextResponse.json(parsed);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
