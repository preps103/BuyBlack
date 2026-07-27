const faviconPath = "/buyblack-favicon-20260726.png";

export async function GET(request: Request) {
  const location = new URL(faviconPath, request.url);

  return new Response(null, {
    status: 307,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      Expires: "0",
      Location: location.toString(),
      Pragma: "no-cache",
    },
  });
}
