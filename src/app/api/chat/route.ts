import Groq from "groq-sdk";

export const runtime = "edge";

const MODEL = "openai/gpt-oss-120b";

const SYSTEM_PROMPT = `You are Abhi's portfolio assistant. Abhi is an MS Computer Science student at Northeastern University's Khoury College (GPA 4.0), based in Miami, FL. He is a Teaching Assistant for CS 5004 (OOD) and CS 5800 (Algorithms). He has built: Doly (AI legal-tech platform, NUGIC finalist, built with Next.js, TypeScript, Supabase, Groq AI), Vibes (gamification platform for KidzHack practicum), SellCRE (real estate platform for Gorin Systems), and healthcare AI research projects (Parkinson's and breast cancer detection). His tech stack includes React, Next.js, TypeScript, Node.js, PostgreSQL, MongoDB, Redis, AWS, Docker, Supabase, and the Anthropic API. He is seeking Full Stack Developer and SDE internship/co-op roles. He is on an F-1 visa with CPT/OPT eligibility. He is curious, performance-oriented, and passionate about user experience. Answer recruiter questions about Abhi concisely and professionally. If asked something you don't know, say so honestly.`;

// Simple best-effort rate limit: max requests per IP per window. Backed by an
// in-memory Map — note that on Edge each instance keeps its own Map, so this is
// a soft guard against bursts rather than a strict global limit.
const RATE_LIMIT = 10;
const WINDOW_MS = 60_000;

interface RateEntry {
  count: number;
  resetAt: number;
}

const hits = new Map<string, RateEntry>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);

  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  entry.count += 1;
  return entry.count > RATE_LIMIT;
}

export async function POST(request: Request): Promise<Response> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "Chat is not configured." },
      { status: 500 },
    );
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (isRateLimited(ip)) {
    return Response.json(
      { error: "Too many requests. Please try again in a minute." },
      { status: 429 },
    );
  }

  let message: unknown;
  try {
    const body = await request.json();
    message = (body as { message?: unknown }).message;
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (typeof message !== "string" || message.trim().length === 0) {
    return Response.json(
      { error: "A non-empty 'message' string is required." },
      { status: 400 },
    );
  }

  const groq = new Groq({ apiKey });

  try {
    const response = await groq.chat.completions.create({
      model: MODEL,
      max_tokens: 1024,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message },
      ],
    });

    const reply = (response.choices[0]?.message?.content ?? "").trim();

    return Response.json({ reply });
  } catch {
    return Response.json(
      { error: "Failed to generate a reply. Please try again." },
      { status: 502 },
    );
  }
}
