import {
  Modal,
  RadioButton,
  BlockStack,
  Button,
  Text,
  Select,
} from "@shopify/polaris";
import { useState } from "react";

export default function DownloadInvoiceModal({
  open,
  onClose,
  order,
}) {
  const [docType, setDocType] = useState("invoice");
  const [copyType, setCopyType] = useState("original");
  const [template, setTemplate] = useState("celestial");
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (!order?.id) return;

    setLoading(true);

    const url = `/app/orders/download?orderId=${encodeURIComponent(
      order.id
    )}&docType=${docType}&copyType=${copyType}&template=${template}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        credentials: "include", // 🔑 REQUIRED for Shopify auth
      });

      if (!response.ok) {
        throw new Error("Download failed");
      }

      const blob = await response.blob();

      // ⬇️ trigger browser download
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `${order.name}-${docType}-${copyType}.pdf`;
      document.body.appendChild(a);
      a.click();

      a.remove();
      window.URL.revokeObjectURL(downloadUrl);

      onClose();
    } catch (err) {
      console.error("Download error:", err);
      alert("Failed to download file");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Download ${order?.name || ""}`}
      primaryAction={{
        content: "Download",
        onAction: handleDownload,
        loading,
      }}
      secondaryActions={[
        {
          content: "Close",
          onAction: onClose,
        },
      ]}
    >
      <Modal.Section>
        <BlockStack gap="400">
          <Text fontWeight="bold">Document type</Text>

          <RadioButton
            label="Invoice"
            checked={docType === "invoice"}
            onChange={() => setDocType("invoice")}
          />

          <RadioButton
            label="Packaging Slip"
            checked={docType === "packagingSlip"}
            onChange={() => setDocType("packagingSlip")}
          />

          <RadioButton
            label="Credit Note"
            checked={docType === "creditNote"}
            onChange={() => setDocType("creditNote")}
          />

          <Text fontWeight="bold">Copy type</Text>

          <RadioButton
            label="Original"
            checked={copyType === "original"}
            onChange={() => setCopyType("original")}
          />

          <RadioButton
            label="Duplicate"
            checked={copyType === "duplicate"}
            onChange={() => setCopyType("duplicate")}
          />

          <RadioButton
            label="Triplicate"
            checked={copyType === "triplicate"}
            onChange={() => setCopyType("triplicate")}
          />

          <Text fontWeight="bold">Template</Text>

          <Select
            options={[
              { label: "Celestial", value: "celestial" },
              { label: "Orbix", value: "orbix" },
              { label: "Sharp", value: "sharp" },
            ]}
            value={template}
            onChange={setTemplate}
          />
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}
