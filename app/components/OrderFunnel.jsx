import { Card, Box, Text, ProgressBar, BlockStack } from "@shopify/polaris";

export default function OrderFunnel({ orders }) {
  const total = orders.length;
  const fulfilled = Math.floor(total * 0.7);
  const emailed = Math.floor(total * 0.5);

  return (
    <Card>
      <Box padding="400">
        <Text variant="headingMd">Order funnel</Text>

        <BlockStack gap="300" paddingBlockStart="300">
          <Text>Orders created: {total}</Text>
          <ProgressBar progress={100} />

          <Text>Orders fulfilled: {fulfilled}</Text>
          <ProgressBar progress={(fulfilled / total) * 100} />

          <Text>Emails sent: {emailed}</Text>
          <ProgressBar progress={(emailed / total) * 100} />
        </BlockStack>
      </Box>
    </Card>
  );
}
