import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "admin_authed";

function isValidCredentials(username: string, password: string): boolean {
  return (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  );
}

export function middleware(request: NextRequest) {
  // Check cookie first (set after successful Basic Auth)
  const cookie = request.cookies.get(COOKIE_NAME);
  if (cookie?.value === "1") {
    return NextResponse.next();
  }

  // Fall back to Basic Auth header
  const authHeader = request.headers.get("authorization");
  if (authHeader) {
    const [scheme, encoded] = authHeader.split(" ");
    if (scheme === "Basic" && encoded) {
      const decoded = atob(encoded);
      const [username, password] = decoded.split(":");

      if (isValidCredentials(username, password)) {
        // Set a session cookie so subsequent fetch() calls are also authenticated
        const response = NextResponse.next();
        response.cookies.set(COOKIE_NAME, "1", {
          httpOnly: true,
          secure: true,
          sameSite: "lax",
          path: "/",
        });
        return response;
      }
    }
  }

  return new NextResponse("Unauthorized", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Admin"',
    },
  });
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
