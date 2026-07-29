import { getGoodOsUser } from "../../../../../../lib/server/auth";
import {
  assertSameOrigin,
  json,
  readJson,
  routeError,
} from "../../../../../../lib/server/http";
import { updateBusinessStatus } from "../../../../../../lib/server/marketplace";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ businessId: string }> },
) {
  try {
    assertSameOrigin(request);
    const user = await getGoodOsUser(request, true);
    const payload = await readJson(request);
    const { businessId } = await context.params;
    const business = await updateBusinessStatus(user!, businessId, payload);
    return json({ business });
  } catch (error) {
    return routeError(error);
  }
}
