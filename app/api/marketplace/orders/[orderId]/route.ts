import { retiredCommerce } from "../../../../../lib/server/http";

export async function GET() {
  return retiredCommerce();
}
