export class ApiError extends Error {
  status: number;
  code: string;

  constructor(message: string, status = 400, code = "BAD_REQUEST") {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export function json(data: unknown, status = 200) {
  return Response.json(
    { success: status < 400, data },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

export function routeError(error: unknown) {
  if (error instanceof ApiError) {
    return Response.json(
      {
        success: false,
        code: error.code,
        message: error.message,
      },
      {
        status: error.status,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }

  console.error("BuyBlack API request failed:", error);
  return Response.json(
    {
      success: false,
      code: "BUYBLACK_REQUEST_FAILED",
      message: "The request could not be completed.",
    },
    {
      status: 500,
      headers: { "Cache-Control": "no-store" },
    },
  );
}

export async function readJson<T extends Record<string, unknown>>(
  request: Request,
  maximumBytes = 64 * 1024,
): Promise<T> {
  try {
    return JSON.parse(await readText(request, maximumBytes)) as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("A valid JSON request body is required.", 400, "INVALID_JSON");
  }
}

export async function readText(request: Request, maximumBytes = 64 * 1024) {
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (Number.isFinite(contentLength) && contentLength > maximumBytes) {
    throw new ApiError("The request body is too large.", 413, "PAYLOAD_TOO_LARGE");
  }

  const body = await request.text();
  if (new TextEncoder().encode(body).byteLength > maximumBytes) {
    throw new ApiError("The request body is too large.", 413, "PAYLOAD_TOO_LARGE");
  }
  return body;
}

export function cleanText(
  value: unknown,
  field: string,
  minimum = 1,
  maximum = 500,
) {
  const cleaned = String(value ?? "").trim().replace(/\s+/g, " ");

  if (cleaned.length < minimum) {
    throw new ApiError(
      `${field} must contain at least ${minimum} characters.`,
      400,
      "INVALID_FIELD",
    );
  }

  if (cleaned.length > maximum) {
    throw new ApiError(
      `${field} must contain no more than ${maximum} characters.`,
      400,
      "INVALID_FIELD",
    );
  }

  return cleaned;
}

export function optionalText(value: unknown, maximum = 500) {
  const cleaned = String(value ?? "").trim().replace(/\s+/g, " ");
  if (cleaned.length > maximum) {
    throw new ApiError(
      `This field must contain no more than ${maximum} characters.`,
      400,
      "INVALID_FIELD",
    );
  }
  return cleaned || null;
}

export function validEmail(value: unknown, field = "Email") {
  const email = cleanText(value, field, 3, 320).toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    throw new ApiError(`${field} is invalid.`, 400, "INVALID_EMAIL");
  }
  return email;
}

export function optionalHttpsUrl(value: unknown, field: string) {
  const cleaned = optionalText(value, 2048);
  if (!cleaned) return null;

  let parsed: URL;
  try {
    parsed = new URL(cleaned);
  } catch {
    throw new ApiError(`${field} must be a valid HTTPS URL.`, 400, "INVALID_URL");
  }

  if (parsed.protocol !== "https:" || parsed.username || parsed.password) {
    throw new ApiError(`${field} must be a valid HTTPS URL.`, 400, "INVALID_URL");
  }

  return parsed.toString();
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function id(prefix: string) {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "")}`;
}

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) {
    throw new ApiError(
      "A same-origin request is required.",
      403,
      "ORIGIN_REQUIRED",
    );
  }

  const requestUrl = new URL(request.url);
  let originUrl: URL;
  try {
    originUrl = new URL(origin);
  } catch {
    throw new ApiError("The request origin is invalid.", 403, "INVALID_ORIGIN");
  }

  if (
    originUrl.protocol !== requestUrl.protocol ||
    originUrl.host !== requestUrl.host
  ) {
    throw new ApiError(
      "Cross-origin write requests are not allowed.",
      403,
      "ORIGIN_NOT_ALLOWED",
    );
  }
}
