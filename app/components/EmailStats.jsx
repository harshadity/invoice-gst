import { Card, Text, Box, InlineStack, BlockStack, Badge } from "@shopify/polaris";

export default function EmailStats() {
  // Placeholder – later you can load from DB
  const stats = [
    { label: "Order created", sent: 42 },
    { label: "Order fulfilled", sent: 31 },
    { label: "Order delivered", sent: 18 },
  ];

  return (
    <Card>
      <Box padding="400">
        <Text variant="headingMd">Email automation</Text>
      </Box>

      <Box padding="400">
        <BlockStack gap="300">
          {stats.map((s) => (
            <InlineStack key={s.label} align="space-between">
              <Text>{s.label}</Text>
              <Badge tone="success">{s.sent} sent</Badge>
            </InlineStack>
          ))}
        </BlockStack>
      </Box>
    </Card>
  );
}
