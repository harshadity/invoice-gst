import { Modal, TextField, Button, BlockStack } from "@shopify/polaris";
import { useState } from "react";

export default function AddB2BCustomerModal({ open, onClose }) {
  const [search, setSearch] = useState("");
  const [gst, setGst] = useState("");
  const [company, setCompany] = useState("");

  const handleSubmit = () => {
    console.log({ search, gst, company });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add B2B customer"
      primaryAction={{
        content: "Submit",
        onAction: handleSubmit,
        disabled: !gst || !company,
      }}
      secondaryActions={[
        {
          content: "Cancel",
          onAction: onClose,
        },
      ]}
    >
      <Modal.Section>
        <BlockStack gap="300">
          <TextField
            label="Search Customers"
            value={search}
            onChange={setSearch}
            placeholder="Search Customers"
            autoComplete="off"
          />

          <TextField
            label="GST number"
            value={gst}
            onChange={setGst}
            autoComplete="off"
          />

          <TextField
            label="Company"
            value={company}
            onChange={setCompany}
            autoComplete="off"
          />
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}
