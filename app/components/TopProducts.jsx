import { Card, Text, BlockStack, Badge } from "@shopify/polaris";

export default function TopProducts({ orders }) {
  const map = {};

  orders.forEach((o) =>
    o.items.forEach((i) => {
      map[i.title] = (map[i.title] || 0) + i.quantity;
    })
  );

  const products = Object.entries(map)
    .map(([title, qty]) => ({ title, qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  return (
    <Card>
      <BlockStack gap="300">
        <Text variant="headingMd">Top products</Text>

        {products.map((p) => (
          <Text key={p.title}>
            {p.title} <Badge tone="success">{p.qty} sold</Badge>
          </Text>
        ))}
      </BlockStack>
    </Card>
  );
}
