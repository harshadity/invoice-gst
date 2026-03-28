
import {
  Page,
  Layout,
  Card,
  Box,
  Text,
  InlineStack,
  ButtonGroup,
  Button,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useLoaderData } from "react-router";
import { useState } from "react";
import { authenticate } from "../shopify.server";

import RevenueChart from "../components/RevenueChart";
import GstChart from "../components/GstChart";

/* ---------------- LOADER ---------------- */

export async function loader({ request }) {
  const { admin } = await authenticate.admin(request);

  let orders = [];

  try {
    const response = await admin.graphql(`
      query {
        orders(first: 30, reverse: true) {
          edges {
            node {
              id
              createdAt
              currentTotalPriceSet { shopMoney { amount } }
              totalTaxSet { shopMoney { amount } }
              lineItems(first: 5) {
                edges {
                  node { title quantity }
                }
              }
            }
          }
        }
      }
    `);

    const json = await response.json();

    orders = json.data.orders.edges.map(({ node }) => ({
      id: node.id,
      date: node.createdAt.substring(0, 10),
      revenue: Number(node.currentTotalPriceSet.shopMoney.amount),
      gst: Number(node.totalTaxSet.shopMoney.amount || 0),
      items: node.lineItems.edges.map((i) => i.node),
    }));
  } catch (e) {
    console.error(e);
  }

  return { orders };
}

/* ---------------- COMPONENT ---------------- */

export default function Dashboard() {
  const { orders } = useLoaderData();

  const [range, setRange] = useState(7);

  const filteredOrders = [...orders].slice(0, range).reverse();

  const revenue = filteredOrders.reduce((s, o) => s + o.revenue, 0);
  const gstTotal = filteredOrders.reduce((s, o) => s + o.gst, 0);

  const formatINR = (num) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(num);

  return (
    <Page title="Dashboard" fullWidth>
      <TitleBar title="Dashboard" />

      <Layout>

        {/* HEADER */}
        <Layout.Section>
          <Card>
            <Box padding="400">
              <InlineStack align="space-between">
                <Text variant="headingMd">Overview</Text>

                <ButtonGroup>
                  {[7, 30, 90].map((d) => (
                    <Button
                      key={d}
                      pressed={range === d}
                      onClick={() => setRange(d)}
                    >
                      Last {d} days
                    </Button>
                  ))}
                </ButtonGroup>
              </InlineStack>
            </Box>
          </Card>
        </Layout.Section>

        {/* KPI */}
        <Layout.Section variant="oneThird">
          <Card>
            <Box padding="400">
              <Text tone="subdued">Revenue</Text>
              <Text variant="headingLg">{formatINR(revenue)}</Text>
            </Box>
          </Card>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <Card>
            <Box padding="400">
              <Text tone="subdued">GST</Text>
              <Text variant="headingLg">{formatINR(gstTotal)}</Text>
            </Box>
          </Card>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <Card>
            <Box padding="400">
              <Text tone="subdued">Orders</Text>
              <Text variant="headingLg">{filteredOrders.length}</Text>
            </Box>
          </Card>
        </Layout.Section>

        {/* CHARTS */}
        <Layout.Section variant="oneHalf">
          <Card>
            <Box padding="400">
              <RevenueChart orders={filteredOrders} />
            </Box>
          </Card>
        </Layout.Section>

        <Layout.Section variant="oneHalf">
          <Card>
            <Box padding="400">
              <GstChart orders={filteredOrders} />
            </Box>
          </Card>
        </Layout.Section>

      </Layout>
    </Page>
  );
}
