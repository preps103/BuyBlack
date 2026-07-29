type ApiEnvelope<T> = {
  success: boolean;
  data?: T;
  message?: string;
  code?: string;
};

export async function apiRequest<T>(
  input: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(input, {
    credentials: "include",
    ...init,
    headers: {
      Accept: "application/json",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });
  const payload = (await response.json().catch(() => ({}))) as ApiEnvelope<T>;

  if (!response.ok || payload.success === false || payload.data === undefined) {
    const error = new Error(payload.message || "The request could not be completed.");
    Object.assign(error, { code: payload.code, status: response.status });
    throw error;
  }

  return payload.data;
}

export function money(cents: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(cents / 100);
}
