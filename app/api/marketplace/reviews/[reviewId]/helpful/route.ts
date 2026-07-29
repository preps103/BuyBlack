import { getGoodOsUser } from "../../../../../../lib/server/auth";
import {
  assertSameOrigin,
  json,
  routeError,
} from "../../../../../../lib/server/http";
import { toggleHelpful } from "../../../../../../lib/server/marketplace";

export async function POST(
  request: Request,
  context: { params: Promise<{ reviewId: string }> },
) {
  try {
    assertSameOrigin(request);
    const user = await getGoodOsUser(request, true);
    const { reviewId } = await context.params;
    return json(await toggleHelpful(user!, reviewId));
  } catch (error) {
    return routeError(error);
  }
}
