import { authenticate } from "../shopify.server";
import { generateInvoicePDF } from "../utils/pdfGenerator.server";
import { db } from "../db.server";

export async function loader({ request }) {
  const { admin, session } = await authenticate.admin(request);

  const url = new URL(request.url);

  const orderId = url.searchParams.get("orderId");
  const template = url.searchParams.get("template") || "default";
  const docType = url.searchParams.get("docType") || "invoice"; 
  const copyType = url.searchParams.get("copyType") || "original";

  /* ---------------- VALIDATION ---------------- */

  if (!orderId) {
    throw new Response("Missing orderId", { status: 400 });
  }

  /* ---------------- LOAD ORDER ---------------- */

  const response = await admin.graphql(
    `#graphql
    query GetOrder($id: ID!) {
      order(id: $id) {
        id
        name
        createdAt
        customer {
          firstName
          lastName
          email
        }
        subtotalPriceSet {
          shopMoney { amount }
        }
        totalTaxSet {
          shopMoney { amount }
        }
        totalPriceSet {
          shopMoney { amount }
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
      }
      shop {
        name
        email
        billingAddress {
          formatted
        }
        gstin: metafield(namespace: "company", key: "gstin") {
          value
        }
      }
    }`,
    { variables: { id: orderId } }
  );

  const json = await response.json();

  if (json.errors || !json.data?.order) {
    console.error("Shopify GraphQL error:", json.errors);
    throw new Response("Order not found", { status: 404 });
  }

  const { order, shop } = json.data;

  /* ---------------- LOAD SETTINGS ---------------- */

  const settings = await db.appSettings.findUnique({
    where: { shop: session.shop },
  });

  /* ---------------- GENERATE PDF ---------------- */

  const pdfBuffer = await generateInvoicePDF({
    order,
    shop,
    settings,
    template,
    docType,     // invoice | packagingSlip | creditNote
    copyType,    // original | duplicate
  });

  /* ---------------- RESPONSE ---------------- */

  return new Response(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${order.name}-${docType}-${copyType}.pdf"`,
    },
  });
}
