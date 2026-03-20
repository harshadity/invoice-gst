import { Card, Text, BlockStack, ProgressBar } from "@shopify/polaris";

export default function EmailPerformance({ sent, failed }) {
  const total = sent + failed;
  const success = total ? (sent / total) * 100 : 0;

  return (
    <Card>
      <BlockStack gap="300">
        <Text variant="headingMd">Email performance</Text>

        <Text>Success rate</Text>
        <ProgressBar progress={success} />

        <Text tone="subdued">
          {sent} sent · {failed} failed
        </Text>
      </BlockStack>
    </Card>
  );
}
