import { authenticate } from "../shopify.server";
import { db } from "../db.server";
import { generateInvoicePDF } from "../utils/pdfGenerator.server";
import { sendEmailWithAttachment } from "../utils/email.server";

/**
 * Webhook handler
 * ❌ No React
 * ❌ No Polaris
 * ❌ No react-router hooks
 */

export async function action({ request }) {
  const { topic, shop, admin } = await authenticate.webhook(request);
  const payload = await request.json();

  console.log("📩 Webhook received:", topic);

  const trigger = mapTopicToTrigger(topic);
  if (!trigger) {
    console.log("⚠️ Unsupported webhook topic:", topic);
    return new Response("Ignored", { status: 200 });
  }

  const automation = await db.emailAutomation.findFirst({
    where: {
      shop,
      trigger,
      enabled: true,
    },
  });

  if (!automation) {
    console.log("⚠️ No automation enabled for", trigger);
    return new Response("No automation", { status: 200 });
  }

  // Load app settings (needed for PDF footer)
  const settings = await db.appSettings.findUnique({
    where: { shop },
  });

  // Load order
  const orderResponse = await admin.graphql(
    `#graphql
    query ($id: ID!) {
      order(id: $id) {
        id
        name
        createdAt
        customer {
          firstName
          lastName
          email
        }
        lineItems(first: 50) {
          edges {
            node {
              title
              quantity
              originalUnitPriceSet {
                shopMoney { amount }
              }
            }
          }
        }
        totalPriceSet {
          shopMoney { amount }
        }
      }
      shop {
        name
        email
      }
    }`,
    {
      variables: {
        id: payload.admin_graphql_api_id,
      },
    }
  );

  const json = await orderResponse.json();
  const { order, shop: shopData } = json.data;

  if (!order?.customer?.email) {
    console.log("⚠️ Order has no customer email");
    return new Response("No email", { status: 200 });
  }

  // Generate PDF
  const pdf = await generateInvoicePDF({
    order,
    shop: shopData,
    settings,
    template: automation.templateId,
    docType: automation.documentType,
    copyType: "original",
  });

  // Safe filename
  const filename = order.name.replace("#", "Order-") + ".pdf";

  // Send email
  await sendEmailWithAttachment({
    to: order.customer.email,
    subject: automation.subject,
    message: automation.message,
    pdf,
    filename,
  });

  return new Response("OK", { status: 200 });
}

/* ---------- helpers ---------- */

function mapTopicToTrigger(topic) {
  switch (topic) {
    case "ORDERS_CREATE":
      return "order_created";

    case "FULFILLMENTS_CREATE":
      return "order_fulfilled";

    // ❌ shipped & delivered not supported by Shopify
    default:
      return null;
  }
}
