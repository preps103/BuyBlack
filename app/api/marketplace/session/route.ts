import { getGoodOsUser } from "../../../../lib/server/auth";
import { json, routeError } from "../../../../lib/server/http";

export async function GET(request: Request) {
  try {
    const user = await getGoodOsUser(request);
    return json({ user });
  } catch (error) {
    return routeError(error);
  }
}
