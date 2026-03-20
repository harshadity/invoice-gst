import { useState } from "react";
import {
  IndexTable,
  Text,
  Badge,
  Button,
  ButtonGroup,
} from "@shopify/polaris";
import DownloadInvoiceModal from "./DownloadInvoiceModal";

export default function OrdersTable({
  orders,
  shop,
  settings,
  onSendInvoice,
}) {
  const [selectedOrder, setSelectedOrder] = useState(null);

  const rows = orders.map(({ node }, index) => {
    const customerName = node.customer
      ? `${node.customer.firstName || ""} ${node.customer.lastName || ""}`
      : "Guest";

    return (
      <IndexTable.Row id={node.id} key={node.id} position={index}>
        <IndexTable.Cell>
          <Text fontWeight="bold">{node.name}</Text>
        </IndexTable.Cell>

        <IndexTable.Cell>
          {new Date(node.createdAt).toLocaleDateString()}
        </IndexTable.Cell>

        <IndexTable.Cell>{customerName}</IndexTable.Cell>

        <IndexTable.Cell>
          ₹ {node.totalPriceSet.shopMoney.amount}
        </IndexTable.Cell>

        <IndexTable.Cell>
          <Badge tone="success">
            {node.displayFinancialStatus}
          </Badge>
        </IndexTable.Cell>

        <IndexTable.Cell>
          <Badge tone="attention">
            {node.displayFulfillmentStatus}
          </Badge>
        </IndexTable.Cell>

        <IndexTable.Cell>
          <ButtonGroup>
            <Button
              size="slim"
              onClick={() =>
                onSendInvoice(node.id, node.customer?.email)
              }
            >
              Send
            </Button>

            <Button
              size="slim"
              onClick={() => setSelectedOrder(node)}
            >
              Download
            </Button>
          </ButtonGroup>
        </IndexTable.Cell>
      </IndexTable.Row>
    );
  });

  return (
    <>
      <IndexTable
        resourceName={{ singular: "order", plural: "orders" }}
        itemCount={orders.length}
        selectable={false}
        headings={[
          { title: "Order" },
          { title: "Date" },
          { title: "Customer" },
          { title: "Total" },
          { title: "Payment" },
          { title: "Fulfillment" },
          { title: "Actions" },
        ]}
      >
        {rows}
      </IndexTable>

      {/* ✅ Download Modal */}
      {selectedOrder && (
        <DownloadInvoiceModal
          open
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </>
  );
}
