import { useFetcher, useLoaderData } from "react-router";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { Card, Layout, Page } from "@shopify/polaris";
import OrdersTable from "../components/OrdersTable";
import { authenticate } from "../shopify.server";
import { db } from "../db.server";

// DATA LOADER (React Router style)
export async function loader({ request }) {
  try {
    const { admin, session } = await authenticate.admin(request);

    const response = await admin.graphql(
      `#graphql
      query GetOrders {
        orders(first: 50, reverse: true) {
          edges {
            node {
              id
              name
              createdAt
              displayFulfillmentStatus
              displayFinancialStatus
              currencyCode
              subtotalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              totalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              totalTaxSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              customer {
                id
                firstName
                lastName
                email
              }
              shippingAddress {
                address1
                address2
                city
                province
                zip
                country
              }
              totalPriceSet {
                shopMoney {
                  amount
                }
              }
              lineItems(first: 5) {
                edges {
                  node {
                    title
                    quantity
                    variantTitle
                    originalUnitPriceSet {
                      shopMoney {
                        amount
                        currencyCode
                      }
                    }
                    taxLines {
                      priceSet {
                        shopMoney {
                          amount
                          currencyCode
                        }
                      }
                      rate
                      title
                    }
                  }
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
          taxNumber: metafield(namespace: "company", key: "gstin") {
            value
          }
        }
      }`
    );

    const responseJson = await response.json();

    if (responseJson.errors) {
      throw new Error(responseJson.errors[0].message);
    }

    // Load app settings from database
    const settings = await db.appSettings.findUnique({
      where: { shop: session.shop },
    });

    // React Router loader just returns plain data
    return {
      orders: responseJson.data.orders.edges,
      shop: responseJson.data.shop,
      settings: settings || null,
    };
  } catch (error) {
    console.error("Loader error:", error);
    throw new Response("Error loading orders", { status: 500 });
  }
}

// ACTION (React Router style)
export async function action({ request }) {
  try {
    const { admin } = await authenticate.admin(request);
    const formData = await request.formData();

    const orderId = formData.get("orderId");
    const email = formData.get("email");

    if (!orderId || !email) {
      return { error: "Missing required fields" };
    }

    const response = await admin.graphql(
      `#graphql
      mutation orderInvoiceSend($id: ID!, $email: EmailInput!) {
        orderInvoiceSend(id: $id, email: $email) {
          userErrors {
            field
            message
          }
          order {
            id
          }
        }
      }`,
      {
        variables: {
          id: orderId,
          email: {
            to: email,
            subject: "Your Order Invoice",
            customMessage: "Thank you for your order!",
          },
        },
      }
    );

    const responseJson = await response.json();

    if (responseJson.errors) {
      return { error: responseJson.errors[0].message };
    }

    if (responseJson.data?.orderInvoiceSend?.userErrors?.length > 0) {
      return {
        error: responseJson.data.orderInvoiceSend.userErrors[0].message,
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Action error:", error);
    return {
      error: "Failed to send invoice. Please try again.",
    };
  }
}

export default function OrdersPage() {
  const { orders, shop, settings } = useLoaderData();
  const fetcher = useFetcher();
  const app = useAppBridge();

  const sendInvoice = (orderId, customerEmail) => {
    if (!orderId || !customerEmail) {
      console.log("Missing order ID or customer email");
      return;
    }

    console.log(
      "Sending invoice for order ID:",
      orderId,
      "to customer email:",
      customerEmail
    );

    fetcher.submit(
      {
        orderId,
        email: customerEmail,
      },
      { method: "POST" }
    );
  };

  return (
    <Page>
      <TitleBar title="Orders" />
      <Layout>
        <Layout.Section>
          <Card>
            <OrdersTable
              orders={orders}
              shop={shop}
              settings={settings}
              onSendInvoice={sendInvoice}
            />
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
