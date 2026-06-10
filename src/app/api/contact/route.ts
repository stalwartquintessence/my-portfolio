import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export const runtime = "edge";

// Simple best-effort rate limit: max submissions per IP per window. Backed by an
// in-memory Map — on Edge each instance keeps its own Map, so this is a soft
// guard against bursts rather than a strict global limit.
const RATE_LIMIT = 5;
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

interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parsePayload(body: unknown): ContactPayload | null {
  if (typeof body !== "object" || body === null) return null;
  const { name, email, subject, message } = body as Record<string, unknown>;

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof subject !== "string" ||
    typeof message !== "string"
  ) {
    return null;
  }

  const trimmed: ContactPayload = {
    name: name.trim(),
    email: email.trim(),
    subject: subject.trim(),
    message: message.trim(),
  };

  if (
    !trimmed.name ||
    !trimmed.subject ||
    !trimmed.message ||
    !EMAIL_RE.test(trimmed.email)
  ) {
    return null;
  }

  return trimmed;
}

// Strip angle brackets so a submitted value can't break out of the header line
// we build for the email subject.
function sanitizeHeader(value: string): string {
  return value.replace(/[<>\r\n]/g, " ").trim();
}

export async function POST(request: Request): Promise<Response> {
  const recipient = process.env.CONTACT_EMAIL;
  const resendKey = process.env.RESEND_API_KEY;

  if (!recipient || !resendKey) {
    return Response.json(
      { error: "Contact form is not configured." },
      { status: 500 },
    );
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (isRateLimited(ip)) {
    return Response.json(
      { error: "Too many messages. Please try again in a minute." },
      { status: 429 },
    );
  }

  let payload: ContactPayload | null;
  try {
    payload = parsePayload(await request.json());
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!payload) {
    return Response.json(
      { error: "Please provide a name, valid email, subject, and message." },
      { status: 400 },
    );
  }

  // Log the submission to Supabase first (best-effort — a logging failure must
  // not stop the email from going out). Uses the service-role key, which is
  // server-side only and never exposed to the client.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (supabaseUrl && serviceRoleKey) {
    try {
      const supabase = createClient(supabaseUrl, serviceRoleKey);
      const { error } = await supabase.from("contact_submissions").insert({
        name: payload.name,
        email: payload.email,
        subject: payload.subject,
        message: payload.message,
      });
      if (error) {
        console.error("Supabase contact log failed:", error.message);
      }
    } catch (err) {
      console.error("Supabase contact log threw:", err);
    }
  }

  // Send the notification email. The "from" address must be on a Resend-verified
  // domain in production; falls back to Resend's sandbox sender for local dev.
  const fromAddress =
    process.env.CONTACT_FROM_EMAIL ?? "Portfolio Contact <onboarding@resend.dev>";

  try {
    const resend = new Resend(resendKey);
    const { error } = await resend.emails.send({
      from: fromAddress,
      to: recipient,
      replyTo: payload.email,
      subject: `Portfolio contact: ${sanitizeHeader(payload.subject)}`,
      text:
        `New message from your portfolio contact form\n\n` +
        `Name: ${payload.name}\n` +
        `Email: ${payload.email}\n` +
        `Subject: ${payload.subject}\n\n` +
        `${payload.message}\n`,
    });

    if (error) {
      console.error("Resend send failed:", error);
      return Response.json(
        { error: "Failed to send your message. Please try again." },
        { status: 502 },
      );
    }
  } catch (err) {
    console.error("Resend send threw:", err);
    return Response.json(
      { error: "Failed to send your message. Please try again." },
      { status: 502 },
    );
  }

  return Response.json({ ok: true });
}
