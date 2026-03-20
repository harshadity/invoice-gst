import { authenticate } from "../shopify.server";
import { db } from "../db.server";

export async function action({ request }) {
  const { admin, session } = await authenticate.admin(request);
  const body = await request.json();

  const { plan, billingCycle } = body;

  // ---------------- FREE PLAN ----------------
  if (plan === "FREE") {
    await db.subscription.upsert({
      where: { shop: session.shop },
      update: {
        plan: "FREE",
        billingCycle: "none",
        status: "active",
      },
      create: {
        shop: session.shop,
        plan: "FREE",
        billingCycle: "none",
        status: "active",
      },
    });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // ---------------- PAID PLANS ----------------
  const PRICES = {
    STARTUP: { monthly: 9.9, yearly: 79 },
    BUSINESS: { monthly: 19.98, yearly: 149 },
    ADVANCED: { monthly: 69.98, yearly: 499 },
  };

  const price = PRICES?.[plan]?.[billingCycle];
  if (!price) {
    return new Response(
      JSON.stringify({ error: "Invalid plan or billing cycle" }),
      { status: 400 }
    );
  }

  const response = await admin.graphql(
    `#graphql
    mutation CreateSubscription(
      $name: String!
      $lineItems: [AppSubscriptionLineItemInput!]!
      $trialDays: Int
      $returnUrl: URL!
    ) {
      appSubscriptionCreate(
        name: $name
        lineItems: $lineItems
        trialDays: $trialDays
        returnUrl: $returnUrl
      ) {
        confirmationUrl
        userErrors { message }
      }
    }`,
    {
      variables: {
        name: `${plan} Plan`,
        trialDays: 7,
        returnUrl: `${process.env.SHOPIFY_APP_URL}/app/billing/callback`,
        lineItems: [
          {
            plan: {
              appRecurringPricingDetails: {
                price: { amount: price, currencyCode: "USD" },
                interval:
                  billingCycle === "yearly"
                    ? "ANNUAL"
                    : "EVERY_30_DAYS",
              },
            },
          },
        ],
      },
    }
  );

  const jsonRes = await response.json();

  if (jsonRes.data.appSubscriptionCreate.userErrors.length) {
    return new Response(
      JSON.stringify({ error: "Billing failed" }),
      { status: 400 }
    );
  }

  await db.subscription.upsert({
    where: { shop: session.shop },
    update: { plan, billingCycle, status: "pending" },
    create: { shop: session.shop, plan, billingCycle, status: "pending" },
  });

  // 🔁 Redirect user to Shopify confirmation page
  return new Response(null, {
    status: 302,
    headers: {
      Location:
        jsonRes.data.appSubscriptionCreate.confirmationUrl,
    },
  });
}
