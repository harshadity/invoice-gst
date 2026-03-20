import { Card, Text, BlockStack } from "@shopify/polaris";

export default function TopCustomers({ customers }) {
  return (
    <Card>
      <BlockStack gap="200">
        <Text variant="headingMd">Top customers</Text>

        {customers.map((c) => (
          <Text key={c.email}>
            {c.name} — ₹{c.total}
          </Text>
        ))}
      </BlockStack>
    </Card>
  );
}
