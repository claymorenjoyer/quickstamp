import { handlers } from "@/lib/auth";
import { checkRateLimit, recordFailedAttempt, resetAttempts } from "@/lib/rate-limiter";
import type { NextRequest } from "next/server";

const { GET: nextAuthGet, POST: nextAuthPost } = handlers;

function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1"
  );
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const isCredentialsCallback = url.pathname.endsWith("/callback/credentials");

  if (isCredentialsCallback) {
    const ip = getClientIp(request);
    const { allowed, message } = checkRateLimit(ip);

    if (!allowed) {
      return new Response(JSON.stringify({ error: message }), {
        status: 429,
        headers: { "Content-Type": "application/json" },
      });
    }

    const response = await nextAuthPost(request as NextRequest);
    const cloned = response.clone();
    const text = await cloned.text();

    try {
      const body = JSON.parse(text);
      if (body.error) {
        recordFailedAttempt(ip);
      } else {
        resetAttempts(ip);
      }
    } catch {
      const location = response.headers.get("location") || "";
      if (location.includes("error=")) {
        recordFailedAttempt(ip);
      }
    }

    return response;
  }

  return nextAuthPost(request as NextRequest);
}

export async function GET(request: Request) {
  return nextAuthGet(request as NextRequest);
}
