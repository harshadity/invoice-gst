
import {
  Page,
  Layout,
  Card,
  Box,
  Text,
  InlineStack,
  ButtonGroup,
  Button,
  Divider,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useLoaderData } from "react-router";
import { useState } from "react";
import { authenticate } from "../shopify.server";

import RevenueChart from "../components/RevenueChart";
import GstChart from "../components/GstChart";
import TopProducts from "../components/TopProducts";
import EmailStats from "../components/EmailStats";
import SmartInsights from "../components/SmartInsights";
import OrderFunnel from "../components/OrderFunnel";

/* ---------------- LOADER ---------------- */

export async function loader({ request }) {
  const { admin } = await authenticate.admin(request);

  let orders = [];

  const query = `
    query {
      orders(first: 30, reverse: true) {
        edges {
          node {
            id
            createdAt
            currentTotalPriceSet {
              shopMoney {
                amount
              }
            }
            totalTaxSet {
              shopMoney {
                amount
              }
            }
            lineItems(first: 5) {
              edges {
                node {
                  title
                  quantity
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await admin.graphql(query);
    const json = await response.json();

    orders = json.data.orders.edges.map(({ node }) => ({
      id: node.id,
      date: node.createdAt.substring(0, 10),
      revenue: Number(node.currentTotalPriceSet.shopMoney.amount),
      gst: Number(node.totalTaxSet.shopMoney.amount || 0),
      items: node.lineItems.edges.map((i) => i.node),
    }));
  } catch (error) {
    console.error("GraphQL error:", error);
  }

  return { orders };
}

/* ---------------- COMPONENT ---------------- */

export default function Dashboard() {
  const { orders } = useLoaderData();
  const [range, setRange] = useState(7);

  const filteredOrders = [...orders].slice(0, range).reverse();

  const revenue = filteredOrders.reduce((s, o) => s + o.revenue, 0);
  const gst = filteredOrders.reduce((s, o) => s + o.gst, 0);

  const formatINR = (num) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(num);

  const kpiHeight = { minHeight: "140px" };
  const normalHeight = { minHeight: "240px" };
  const chartHeight = { minHeight: "320px" };

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

        {/* KPI CARDS */}

        <Layout.Section variant="oneThird">
          <Card>
            <Box padding="400" style={kpiHeight}>
              <Text tone="subdued">Revenue</Text>
              <Text variant="headingLg">{formatINR(revenue)}</Text>
            </Box>
          </Card>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <Card>
            <Box padding="400" style={kpiHeight}>
              <Text tone="subdued">GST Collected</Text>
              <Text variant="headingLg">{formatINR(gst)}</Text>
            </Box>
          </Card>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <Card>
            <Box padding="400" style={kpiHeight}>
              <Text tone="subdued">Orders</Text>
              <Text variant="headingLg">{filteredOrders.length}</Text>
            </Box>
          </Card>
        </Layout.Section>

        {/* CHARTS */}

        <Layout.Section variant="oneHalf">
          <Card>
            <Box padding="400" style={chartHeight}>
              <Text variant="headingMd">Revenue Trend</Text>
              <Divider />
              <Box paddingBlockStart="300">
                <RevenueChart orders={filteredOrders} />
              </Box>
            </Box>
          </Card>
        </Layout.Section>

        <Layout.Section variant="oneHalf">
          <Card>
            <Box padding="400" style={chartHeight}>
              <Text variant="headingMd">GST Trend</Text>
              <Divider />
              <Box paddingBlockStart="300">
                <GstChart orders={filteredOrders} />
              </Box>
            </Box>
          </Card>
        </Layout.Section>

        {/* INSIGHTS */}

        <Layout.Section variant="oneHalf">
          <Card>
            <Box padding="400" style={normalHeight}>
              <SmartInsights orders={filteredOrders} />
            </Box>
          </Card>
        </Layout.Section>

        <Layout.Section variant="oneHalf">
          <Card>
            <Box padding="400" style={normalHeight}>
              <OrderFunnel orders={filteredOrders} />
            </Box>
          </Card>
        </Layout.Section>

        {/* PRODUCTS */}

        <Layout.Section variant="oneHalf">
          <Card>
            <Box padding="400" style={normalHeight}>
              <TopProducts orders={filteredOrders} />
            </Box>
          </Card>
        </Layout.Section>

        {/* EMAIL */}

        <Layout.Section variant="oneHalf">
          <Card>
            <Box padding="400" style={normalHeight}>
              <EmailStats />
            </Box>
          </Card>
        </Layout.Section>

      </Layout>
    </Page>
  );
}

