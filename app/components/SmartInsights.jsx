import { Card, Box, Text, BlockStack, Badge } from "@shopify/polaris";

export default function SmartInsights({ orders }) {
  if (!orders.length) return null;

  const avgOrderValue =
    orders.reduce((s, o) => s + o.revenue, 0) / orders.length;

  const highValueOrders = orders.filter(o => o.revenue > avgOrderValue);

  return (
    <Card>
      <Box padding="400">
        <Text variant="headingMd">Smart insights</Text>

        <BlockStack gap="200" paddingBlockStart="300">
          <Text>
            📈 Average order value: <strong>₹{avgOrderValue.toFixed(2)}</strong>
          </Text>

          <Text>
            💡 {highValueOrders.length} high-value orders detected
          </Text>

          <Badge tone="success">
            Insights generated automatically
          </Badge>
        </BlockStack>
      </Box>
    </Card>
  );
}
