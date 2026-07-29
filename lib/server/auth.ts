import { ApiError } from "./http";

export type GoodOsUser = {
  id: string;
  email: string;
  displayName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  platformRole?: string | null;
  role?: string | null;
};

const GOODOS_ORIGIN = "https://base.goodos.app";

export async function getGoodOsUser(
  request: Request,
  required = false,
): Promise<GoodOsUser | null> {
  const headers = new Headers({ Accept: "application/json" });
  const cookie = request.headers.get("cookie");
  const authorization = request.headers.get("authorization");

  if (cookie) headers.set("Cookie", cookie);
  if (authorization) headers.set("Authorization", authorization);

  try {
    const response = await fetch(`${GOODOS_ORIGIN}/api/auth/me`, {
      headers,
      redirect: "manual",
    });

    if (!response.ok) {
      if (required) {
        throw new ApiError(
          "Sign in with GoodOS to continue.",
          401,
          "AUTHENTICATION_REQUIRED",
        );
      }
      return null;
    }

    const payload = (await response.json()) as {
      user?: GoodOsUser;
      data?: { user?: GoodOsUser };
    };
    const user = payload.user || payload.data?.user || null;

    if (!user?.id || !user.email) {
      if (required) {
        throw new ApiError(
          "Your GoodOS session could not be verified.",
          401,
          "AUTHENTICATION_REQUIRED",
        );
      }
      return null;
    }

    return user;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (required) {
      throw new ApiError(
        "GoodOS authentication is temporarily unavailable.",
        503,
        "AUTHENTICATION_UNAVAILABLE",
      );
    }
    return null;
  }
}

export function userName(user: GoodOsUser) {
  return (
    user.displayName ||
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.email.split("@")[0]
  );
}

export function isPlatformAdmin(user: GoodOsUser) {
  const role = String(user.platformRole || user.role || "").toLowerCase();
  return role === "owner" || role === "admin";
}
