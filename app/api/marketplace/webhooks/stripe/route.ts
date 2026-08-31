import { acknowledgeRetiredWebhook } from "../../../../../lib/server/http";

export async function POST() {
  return acknowledgeRetiredWebhook();
}
