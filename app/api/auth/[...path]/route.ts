const GOODOS_AUTH_ORIGIN = "https://base.goodos.app";

async function proxyGoodOSAuth(request: Request) {
  const incomingUrl = new URL(request.url);
  const upstreamUrl = new URL(
    `${incomingUrl.pathname}${incomingUrl.search}`,
    GOODOS_AUTH_ORIGIN,
  );
  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.set("accept", headers.get("accept") || "application/json");
  headers.set("x-forwarded-host", incomingUrl.host);
  headers.set("x-forwarded-proto", incomingUrl.protocol.replace(":", ""));

  const response = await fetch(upstreamUrl, {
    method: request.method,
    headers,
    body:
      request.method === "GET" || request.method === "HEAD"
        ? undefined
        : await request.arrayBuffer(),
    redirect: "manual",
  });
  const responseHeaders = new Headers(response.headers);
  responseHeaders.set("cache-control", "no-store");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}

export const GET = proxyGoodOSAuth;
export const POST = proxyGoodOSAuth;
export const PUT = proxyGoodOSAuth;
export const PATCH = proxyGoodOSAuth;
export const DELETE = proxyGoodOSAuth;
export const OPTIONS = proxyGoodOSAuth;
