import { getGoodOsUser } from "../../../../lib/server/auth";
import {
  assertSameOrigin,
  json,
  readJson,
  routeError,
} from "../../../../lib/server/http";
import { createReview } from "../../../../lib/server/marketplace";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await getGoodOsUser(request, true);
    const payload = await readJson(request);
    const review = await createReview(user!, payload);
    return json({ review }, 201);
  } catch (error) {
    return routeError(error);
  }
}
