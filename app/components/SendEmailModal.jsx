
import { useState } from "react";
import {
  Modal,
  TextField,
  ChoiceList,
  Button,
  InlineStack,
} from "@shopify/polaris";

export default function SendEmailModal({
  open,
  onClose,
  order,
  onSend,
}) {
  const [template, setTemplate] = useState(["invoice"]);
  const [email, setEmail] = useState(order?.customer?.email || "");
  const [subject, setSubject] = useState("Invoice");
  const [message, setMessage] = useState(
    `Dear ${order?.customer?.firstName || "Customer"},\n\nPlease find your invoice for order ${order?.name}.\n\nThank you.`
  );

  if (!order) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Send Email"
      primaryAction={{
        content: "Send Mail",
        onAction: () =>
          onSend(order.id, email, subject, message),
      }}
      secondaryActions={[
        {
          content: "Close",
          onAction: onClose,
        },
      ]}
    >
      <Modal.Section>

        {/* TEMPLATE */}
        <ChoiceList
          title="Template types"
          choices={[
            { label: "Invoice", value: "invoice" },
            { label: "Packaging slips", value: "packing" },
            { label: "Credit Notes", value: "credit" },
          ]}
          selected={template}
          onChange={setTemplate}
        />

        {/* EMAIL */}
        <TextField
          label="To"
          value={email}
          onChange={setEmail}
          autoComplete="email"
        />

        {/* SUBJECT */}
        <TextField
          label="Subject"
          value={subject}
          onChange={setSubject}
        />

        {/* MESSAGE */}
        <TextField
          label="Message"
          value={message}
          onChange={setMessage}
          multiline={6}
        />

      </Modal.Section>
    </Modal>
  );
}

