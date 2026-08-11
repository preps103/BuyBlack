import {
  ApiError,
  assertSameOrigin,
  readText,
  routeError,
} from "../../../../lib/server/http";

const GOODOS_AUTH_ORIGIN = "https://base.goodos.app";

const allowedRoutes = new Map([
  ["/api/auth/me", "GET"],
  ["/api/auth/login", "POST"],
  ["/api/auth/logout", "POST"],
]);

async function proxyGoodOSAuth(request: Request) {
  try {
    const incomingUrl = new URL(request.url);
    const allowedMethod = allowedRoutes.get(incomingUrl.pathname);
    if (!allowedMethod) {
      throw new ApiError("Authentication route not found.", 404, "NOT_FOUND");
    }
    if (request.method !== allowedMethod) {
      throw new ApiError("Method not allowed.", 405, "METHOD_NOT_ALLOWED");
    }
    if (request.method === "POST") assertSameOrigin(request);

    const upstreamUrl = new URL(
      `${incomingUrl.pathname}${incomingUrl.search}`,
      GOODOS_AUTH_ORIGIN,
    );
    const headers = new Headers();
    for (const name of [
      "accept",
      "authorization",
      "content-type",
      "cookie",
      "origin",
      "user-agent",
    ]) {
      const value = request.headers.get(name);
      if (value) headers.set(name, value);
    }
    headers.set("accept", headers.get("accept") || "application/json");
    headers.set("x-forwarded-host", incomingUrl.host);
    headers.set("x-forwarded-proto", incomingUrl.protocol.replace(":", ""));

    const response = await fetch(upstreamUrl, {
      method: request.method,
      headers,
      body:
        request.method === "GET"
          ? undefined
          : await readText(request, 64 * 1024),
      redirect: "manual",
    });
    const responseHeaders = new Headers(response.headers);
    responseHeaders.set("cache-control", "no-store");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    return routeError(error);
  }
}

export const GET = proxyGoodOSAuth;
export const POST = proxyGoodOSAuth;
