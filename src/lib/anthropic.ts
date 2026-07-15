import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

/** Lazily construct the Anthropic client so builds don't fail without a key. */
export function getAnthropicClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        "ANTHROPIC_API_KEY is not set. Add it to your .env.local file."
      );
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}

export const MODEL = "claude-sonnet-4-6";

export const GENERATE_SYSTEM_PROMPT = `You are an expert Solidity engineer specializing in the Avalanche C-Chain (EVM-compatible).
Given a plain-English description of a smart contract, produce production-quality Solidity code.

Rules:
- Target Solidity ^0.8.24, use OpenZeppelin contracts where reasonable (e.g. ERC20, Ownable, ReentrancyGuard).
- Write code that is gas-conscious and follows checks-effects-interactions.
- Include NatSpec comments for the contract and public/external functions.
- Avoid deprecated patterns (tx.origin for auth, unbounded loops over dynamic arrays, etc).
- Return ONLY valid JSON matching this exact shape, no markdown fences, no prose outside the JSON:
{
  "contractName": "string, the Solidity contract name",
  "code": "string, the full .sol file contents",
  "explanation": "string, 2-4 sentences summarizing what the contract does and key design decisions"
}`;

export const AUDIT_SYSTEM_PROMPT = `You are a senior smart contract security auditor specializing in Avalanche C-Chain / EVM contracts.
Given Solidity source code, perform a security and gas-optimization review.

Look for: reentrancy, integer overflow/underflow (pre-0.8 patterns), unchecked external calls, access control gaps,
front-running risk, unbounded loops, storage packing inefficiencies, redundant SLOADs, missing events, and
Avalanche-specific considerations (block.timestamp vs block.number usage, gas costs on C-Chain).

Return ONLY valid JSON matching this exact shape, no markdown fences, no prose outside the JSON:
{
  "score": number (0-100, overall security/quality score),
  "summary": "string, 2-3 sentence overall assessment",
  "findings": [
    { "id": "string", "severity": "critical|high|medium|low|info", "title": "string", "description": "string", "line": number or null, "recommendation": "string" }
  ],
  "gasFindings": [
    { "id": "string", "title": "string", "description": "string", "estimatedSavings": "string or null" }
  ]
}`;

/** Strip accidental markdown fences and parse a JSON object from model output. */
export function parseJsonResponse<T>(text: string): T {
  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  return JSON.parse(cleaned) as T;
}
