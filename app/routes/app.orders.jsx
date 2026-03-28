
import { useFetcher, useLoaderData } from "react-router";
import { useState, useMemo } from "react";
import { TitleBar } from "@shopify/app-bridge-react";
import {
  Card,
  Layout,
  Page,
  Filters,
  ChoiceList,
} from "@shopify/polaris";
import OrdersTable from "../components/OrdersTable";
import { authenticate } from "../shopify.server";

/* ---------------- LOADER ---------------- */

export async function loader({ request }) {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(`
    query {
      orders(first: 50, reverse: true) {
        edges {
          node {
            id
            name
            createdAt
            displayFulfillmentStatus
            displayFinancialStatus

            subtotalPriceSet { shopMoney { amount } }
            totalTaxSet { shopMoney { amount } }
            totalPriceSet { shopMoney { amount } }

            customer {
              firstName
              lastName
              email
            }

            lineItems(first: 20) {
              edges {
                node {
                  title
                  quantity
                  originalUnitPriceSet {
                    shopMoney { amount }
                  }
                  taxLines {
                    title
                    priceSet { shopMoney { amount } }
                  }
                }
              }
            }
          }
        }
      }
      shop { name }
    }
  `);

  const json = await response.json();

  return {
    orders: json.data.orders.edges,
    shop: json.data.shop,
  };
}

/* ---------------- ACTION ---------------- */

export async function action({ request }) {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();

  await admin.graphql(
    `#graphql
    mutation orderInvoiceSend($id: ID!, $email: EmailInput!) {
      orderInvoiceSend(id: $id, email: $email) {
        userErrors { message }
      }
    }`,
    {
      variables: {
        id: formData.get("orderId"),
        email: {
          to: formData.get("email"),
          subject: formData.get("subject"),
          customMessage: formData.get("message"),
        },
      },
    }
  );

  return { success: true };
}

/* ---------------- COMPONENT ---------------- */

export default function OrdersPage() {
  const { orders, shop } = useLoaderData();
  const fetcher = useFetcher();

  const [queryValue, setQueryValue] = useState("");
  const [dateRange, setDateRange] = useState([]);
  const [paymentStatus, setPaymentStatus] = useState([]);
  const [fulfillmentStatus, setFulfillmentStatus] = useState([]);

  const filteredOrders = useMemo(() => {
    return orders.filter(({ node }) => {
      const search = queryValue.toLowerCase();

      let matchesDate = true;
      if (dateRange.length > 0) {
        const days = parseInt(dateRange[0], 10);
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        matchesDate = new Date(node.createdAt) >= cutoff;
      }

      const matchesPayment =
        paymentStatus.length === 0 ||
        paymentStatus.includes(node.displayFinancialStatus);

      const matchesFulfillment =
        fulfillmentStatus.length === 0 ||
        fulfillmentStatus.includes(node.displayFulfillmentStatus);

      return (
        node.name.toLowerCase().includes(search) &&
        matchesDate &&
        matchesPayment &&
        matchesFulfillment
      );
    });
  }, [orders, queryValue, dateRange, paymentStatus, fulfillmentStatus]);

  const sendInvoice = (data) => {
    fetcher.submit(data, { method: "POST" });
  };

  return (
    <Page>
      <TitleBar title="Orders" />

      <Layout>

        <Layout.Section>
          <Card>
            <Filters
              queryValue={queryValue}
              filters={[
                {
                  key: "date",
                  label: "Date",
                  filter: (
                    <ChoiceList
                      choices={[
                        { label: "Last 7 days", value: "7" },
                        { label: "Last 30 days", value: "30" },
                        { label: "Last 90 days", value: "90" },
                      ]}
                      selected={dateRange}
                      onChange={setDateRange}
                    />
                  ),
                },
                {
                  key: "payment",
                  label: "Payment",
                  filter: (
                    <ChoiceList
                      choices={[
                        { label: "Paid", value: "PAID" },
                        { label: "Pending", value: "PENDING" },
                        { label: "Refunded", value: "REFUNDED" },
                      ]}
                      selected={paymentStatus}
                      onChange={setPaymentStatus}
                      allowMultiple
                    />
                  ),
                },
                {
                  key: "fulfillment",
                  label: "Fulfillment",
                  filter: (
                    <ChoiceList
                      choices={[
                        { label: "Fulfilled", value: "FULFILLED" },
                        { label: "Unfulfilled", value: "UNFULFILLED" },
                        { label: "Partial", value: "PARTIALLY_FULFILLED" },
                      ]}
                      selected={fulfillmentStatus}
                      onChange={setFulfillmentStatus}
                      allowMultiple
                    />
                  ),
                },
              ]}
              onQueryChange={setQueryValue}
            />
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <OrdersTable
              orders={filteredOrders}
              shop={shop}
              onSendInvoice={sendInvoice}
            />
          </Card>
        </Layout.Section>

      </Layout>
    </Page>
  );
}

