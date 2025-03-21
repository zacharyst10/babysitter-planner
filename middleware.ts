import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define API rate limits (requests per minute)
const RATE_LIMIT_REQUESTS = 60;
const RATE_LIMIT_DURATION_MS = 60 * 1000; // 1 minute

// In-memory store for rate limiting (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; timestamp: number }>();

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Get IP address for rate limiting
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0] : "anonymous";

  // Simple rate limiting for API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const now = Date.now();
    const rateLimitInfo = rateLimitStore.get(ip);

    // If this IP has made requests before
    if (rateLimitInfo) {
      // Reset count if outside the window
      if (now - rateLimitInfo.timestamp > RATE_LIMIT_DURATION_MS) {
        rateLimitStore.set(ip, { count: 1, timestamp: now });
      } else {
        // Increment count
        const newCount = rateLimitInfo.count + 1;
        rateLimitStore.set(ip, {
          count: newCount,
          timestamp: rateLimitInfo.timestamp,
        });

        // Apply rate limit if exceeded
        if (newCount > RATE_LIMIT_REQUESTS) {
          return new NextResponse(
            JSON.stringify({ error: "Too many requests" }),
            {
              status: 429,
              headers: {
                "Content-Type": "application/json",
                "X-RateLimit-Limit": String(RATE_LIMIT_REQUESTS),
                "X-RateLimit-Remaining": "0",
                "Retry-After": String(
                  Math.ceil(
                    (RATE_LIMIT_DURATION_MS - (now - rateLimitInfo.timestamp)) /
                      1000
                  )
                ),
              },
            }
          );
        }

        // Set rate limit headers
        response.headers.set("X-RateLimit-Limit", String(RATE_LIMIT_REQUESTS));
        response.headers.set(
          "X-RateLimit-Remaining",
          String(RATE_LIMIT_REQUESTS - newCount)
        );
      }
    } else {
      // First request from this IP
      rateLimitStore.set(ip, { count: 1, timestamp: now });
      response.headers.set("X-RateLimit-Limit", String(RATE_LIMIT_REQUESTS));
      response.headers.set(
        "X-RateLimit-Remaining",
        String(RATE_LIMIT_REQUESTS - 1)
      );
    }
  }

  // In a real app, you would add authentication checks here
  // Example: if (!isAuthenticated && request.nextUrl.pathname.startsWith('/dashboard'))

  return response;
}

// Apply middleware to selected routes
export const config = {
  matcher: ["/api/:path*", "/dashboard/:path*", "/admin/:path*"],
};
