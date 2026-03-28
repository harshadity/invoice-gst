
import { useState } from "react";
import {
  IndexTable,
  Text,
  Badge,
  Button,
  InlineStack,
  Popover,
  ActionList,
  Modal,
  TextField,
  Box,
} from "@shopify/polaris";
import DownloadInvoiceModal from "./DownloadInvoiceModal";

export default function OrdersTable({ orders, shop, onSendInvoice }) {
  const [activePopover, setActivePopover] = useState(null);
  const [emailOrder, setEmailOrder] = useState(null);
  const [previewOrder, setPreviewOrder] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedResources, setSelectedResources] = useState([]);

  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const togglePopover = (id) => {
    setActivePopover(activePopover === id ? null : id);
  };

  /* ---------------- SAFE PDF DOWNLOAD ---------------- */
  const handleDownloadPDF = async () => {
    if (typeof window === "undefined") return;

    const html2pdf = (await import("html2pdf.js")).default;

    const element = document.getElementById("invoice-preview");

    if (!element) return;

    html2pdf()
      .set({
        margin: 0.5,
        filename: "invoice.pdf",
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
      })
      .from(element)
      .save();
  };

  /* ---------------- SAFE PRINT ---------------- */
  const handlePrint = () => {
    if (typeof window === "undefined") return;

    const element = document.getElementById("invoice-preview");
    if (!element) return;

    const win = window.open("", "_blank");
    win.document.write(element.innerHTML);
    win.document.close();
    win.print();
  };

  /* ---------------- WHATSAPP ---------------- */
  const handleWhatsApp = (order) => {
    const msg = `Invoice ${order.name}\nAmount: ₹ ${order.totalPriceSet.shopMoney.amount}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`);
  };

  /* ---------------- BULK SEND ---------------- */
  const handleBulkSend = () => {
    selectedResources.forEach((id) => {
      const order = orders.find((o) => o.node.id === id);
      if (!order) return;

      onSendInvoice({
        orderId: order.node.id,
        email: order.node.customer?.email,
        subject: `Invoice ${order.node.name}`,
        message: "Please find your invoice attached.",
      });
    });
  };

  /* ---------------- TABLE ROWS ---------------- */
  const rows = orders.map(({ node }, index) => (
    <IndexTable.Row id={node.id} key={node.id} position={index}>
      <IndexTable.Cell>{node.name}</IndexTable.Cell>

      <IndexTable.Cell>
        {new Date(node.createdAt).toLocaleDateString()}
      </IndexTable.Cell>

      <IndexTable.Cell>
        {node.customer?.firstName} {node.customer?.lastName}
      </IndexTable.Cell>

      <IndexTable.Cell>
        ₹ {node.totalPriceSet?.shopMoney?.amount || 0}
      </IndexTable.Cell>

      <IndexTable.Cell>
        <Badge tone="success">{node.displayFinancialStatus}</Badge>
      </IndexTable.Cell>

      <IndexTable.Cell>
        <Badge tone="attention">{node.displayFulfillmentStatus}</Badge>
      </IndexTable.Cell>

      <IndexTable.Cell>
        <InlineStack gap="200">

          {/* SEND */}
          <Button
            size="slim"
            variant="primary"
            onClick={() => {
              setEmailOrder(node);
              setEmail(node.customer?.email || "");
              setSubject(`Invoice ${node.name}`);
              setMessage("Please find your invoice attached.");
            }}
          >
            Send
          </Button>

          {/* MORE */}
          <Popover
            active={activePopover === node.id}
            activator={
              <Button size="slim" onClick={() => togglePopover(node.id)}>
                More
              </Button>
            }
            onClose={() => setActivePopover(null)}
          >
            <ActionList
              items={[
                {
                  content: "Download PDF",
                  onAction: () => handleDownloadPDF(),
                },
                {
                  content: "Preview",
                  onAction: () => setPreviewOrder(node),
                },
                {
                  content: "Print",
                  onAction: () => handlePrint(),
                },
                {
                  content: "WhatsApp",
                  onAction: () => handleWhatsApp(node),
                },
                {
                  content: "Download (Old)",
                  onAction: () => setSelectedOrder(node),
                },
              ]}
            />
          </Popover>

        </InlineStack>
      </IndexTable.Cell>
    </IndexTable.Row>
  ));

  return (
    <>
      {/* BULK ACTION */}
      <Box padding="200">
        <Button onClick={handleBulkSend}>
          Send Selected Invoices
        </Button>
      </Box>

      <IndexTable
        resourceName={{ singular: "order", plural: "orders" }}
        itemCount={orders.length}
        selectedItemsCount={selectedResources.length}
        onSelectionChange={setSelectedResources}
        selectable
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

      {/* EMAIL MODAL */}
      {emailOrder && (
        <Modal
          open
          onClose={() => setEmailOrder(null)}
          title="Send Email"
          primaryAction={{
            content: "Send",
            onAction: () => {
              onSendInvoice({
                orderId: emailOrder.id,
                email,
                subject,
                message,
              });
              setEmailOrder(null);
            },
          }}
        >
          <Modal.Section>
            <TextField label="Email" value={email} onChange={setEmail} />
            <TextField label="Subject" value={subject} onChange={setSubject} />
            <TextField
              label="Message"
              value={message}
              onChange={setMessage}
              multiline={4}
            />
          </Modal.Section>
        </Modal>
      )}

      {/* PREVIEW (USED FOR PDF + PRINT) */}
      {previewOrder && (
        <Modal open large onClose={() => setPreviewOrder(null)}>
          <Modal.Section>

            <div id="invoice-preview" style={{ padding: 20 }}>

              <h2>{shop?.name}</h2>
              <h3>{previewOrder.name}</h3>

              {previewOrder.lineItems?.edges.map(({ node }, i) => (
                <p key={i}>
                  {node.title} - {node.quantity} × ₹{" "}
                  {node.originalUnitPriceSet?.shopMoney?.amount}
                </p>
              ))}

              <hr />

              <p>
                Subtotal: ₹{" "}
                {previewOrder.subtotalPriceSet?.shopMoney?.amount}
              </p>

              <p>
                GST: ₹{" "}
                {previewOrder.totalTaxSet?.shopMoney?.amount}
              </p>

              <h3>
                Total: ₹{" "}
                {previewOrder.totalPriceSet?.shopMoney?.amount}
              </h3>

            </div>

          </Modal.Section>
        </Modal>
      )}

      {/* OLD DOWNLOAD */}
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

