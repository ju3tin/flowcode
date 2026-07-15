import { NextRequest, NextResponse } from "next/server";
import {
  getAnthropicClient,
  AUDIT_SYSTEM_PROMPT,
  MODEL,
  parseJsonResponse,
} from "@/lib/anthropic";
import type { AuditRequest, AuditResponse } from "@/types/flow";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AuditRequest;

    if (!body?.code || typeof body.code !== "string") {
      return NextResponse.json(
        { error: "Missing required field: code" },
        { status: 400 }
      );
    }

    const anthropic = getAnthropicClient();

    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4000,
      system: AUDIT_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Audit the following Solidity contract:\n\n\`\`\`solidity\n${body.code}\n\`\`\``,
        },
      ],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json(
        { error: "Model returned no text content" },
        { status: 502 }
      );
    }

    const parsed = parseJsonResponse<AuditResponse>(textBlock.text);
    return NextResponse.json(parsed);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
