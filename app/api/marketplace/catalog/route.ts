import { json, routeError } from "../../../../lib/server/http";
import { catalog } from "../../../../lib/server/marketplace";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const data = await catalog({
      query: url.searchParams.get("q"),
      state: url.searchParams.get("state"),
      category: url.searchParams.get("category"),
    });
    return json(data);
  } catch (error) {
    return routeError(error);
  }
}
