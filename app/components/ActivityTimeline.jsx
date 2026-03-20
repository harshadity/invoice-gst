import { Card, Text, BlockStack } from "@shopify/polaris";

export default function ActivityTimeline({ events }) {
  return (
    <Card>
      <BlockStack gap="200">
        <Text variant="headingMd">Recent activity</Text>

        {events.map((e, i) => (
          <Text key={i}>
            {e.icon} {e.text}
          </Text>
        ))}
      </BlockStack>
    </Card>
  );
}
