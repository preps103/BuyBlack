import { getGoodOsUser } from "../../../../lib/server/auth";
import { json, routeError } from "../../../../lib/server/http";
import { dashboard } from "../../../../lib/server/marketplace";

export async function GET(request: Request) {
  try {
    const user = await getGoodOsUser(request, true);
    return json(await dashboard(user!));
  } catch (error) {
    return routeError(error);
  }
}
