import { getGoodOsUser } from "../../../../lib/server/auth";
import {
  assertSameOrigin,
  json,
  readJson,
  routeError,
} from "../../../../lib/server/http";
import { createProduct } from "../../../../lib/server/marketplace";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await getGoodOsUser(request, true);
    const payload = await readJson(request);
    const product = await createProduct(user!, payload);
    return json({ product }, 201);
  } catch (error) {
    return routeError(error);
  }
}
