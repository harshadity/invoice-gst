import { authenticate } from "../shopify.server";
import { db } from "../db.server";
import { redirect } from "react-router";

export async function loader({ request }) {
  const { session } = await authenticate.admin(request);

  await db.subscription.update({
    where: { shop: session.shop },
    data: { status: "active" },
  });

  return redirect("/app");
}
