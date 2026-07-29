import { env } from "cloudflare:workers";

export function getDb(): D1Database {
  const database = (env as unknown as { DB?: D1Database }).DB;

  if (!database) {
    throw new Error(
      "BuyBlack storage is unavailable because the D1 database binding is missing.",
    );
  }

  return database;
}
