
import {
  Modal,
  Text,
  Divider,
  InlineStack,
  BlockStack,
  Card,
} from "@shopify/polaris";

export default function InvoicePreviewModal({ open, onClose, order }) {
  if (!order) return null;

  const items = order.lineItems?.edges || [];

  return (
    <Modal open={open} onClose={onClose} title={`Invoice ${order.name}`} large>
      <Modal.Section>

        <BlockStack gap="400">

          {/* HEADER */}
          <InlineStack align="space-between">
            <Text variant="headingMd">{order.name}</Text>
            <Text>{new Date(order.createdAt).toLocaleDateString()}</Text>
          </InlineStack>

          <Divider />

          {/* CUSTOMER */}
          <Card>
            <BlockStack gap="200">
              <Text variant="headingSm">Customer</Text>
              <Text>
                {order.customer?.firstName} {order.customer?.lastName}
              </Text>
              <Text>{order.customer?.email}</Text>
            </BlockStack>
          </Card>

          {/* ITEMS */}
          <Card>
            <BlockStack gap="200">
              <Text variant="headingSm">Items</Text>

              {items.map(({ node }, i) => (
                <InlineStack key={i} align="space-between">
                  <Text>{node.title}</Text>
                  <Text>Qty: {node.quantity}</Text>
                  <Text>
                    ₹ {node.originalUnitPriceSet?.shopMoney?.amount}
                  </Text>
                </InlineStack>
              ))}
            </BlockStack>
          </Card>

          {/* TOTAL */}
          <Card>
            <InlineStack align="space-between">
              <Text variant="headingMd">Total</Text>
              <Text variant="headingMd">
                ₹ {order.totalPriceSet?.shopMoney?.amount}
              </Text>
            </InlineStack>
          </Card>

        </BlockStack>

      </Modal.Section>
    </Modal>
  );
}

