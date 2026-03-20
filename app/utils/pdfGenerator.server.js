import PDFDocument from "pdfkit";

/**
 * Main PDF generator
 */
export async function generateInvoicePDF({
  order,
  shop,
  settings,
  template = "celestial",
  docType = "invoice",
  copyType = "original",
}) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 40 });

      const buffers = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      /* ---------- HEADER ---------- */
      renderHeader(doc, shop, settings, docType, copyType);

      /* ---------- BODY ---------- */
      if (docType === "invoice") {
        renderInvoice(doc, order, settings);
      } else if (docType === "packagingSlip") {
        renderPackagingSlip(doc, order, settings);
      } else if (docType === "creditNote") {
        renderCreditNote(doc, order, settings);
      } else {
        doc.text("Unsupported document type");
      }

      /* ---------- FOOTER ---------- */
      renderFooter(doc, settings);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

/* ======================================================
   COMMON SECTIONS
====================================================== */

function renderHeader(doc, shop, settings, docType, copyType) {
  doc
    .fontSize(16)
    .text(
      settings?.companyLegalName ||
        settings?.brandName ||
        shop?.name ||
        "Company Name",
      { align: "center" }
    );

  if (settings?.gstin) {
    doc
      .fontSize(9)
      .text(`GSTIN: ${settings.gstin}`, { align: "center" });
  }

  if (settings?.fullAddress) {
    doc
      .fontSize(9)
      .text(settings.fullAddress, { align: "center" });
  }

  doc.moveDown(1);

  doc
    .fontSize(13)
    .text(docTypeLabel(docType), { align: "center" });

  if (copyType) {
    doc
      .fontSize(9)
      .text(`(${copyType.toUpperCase()} COPY)`, {
        align: "center",
      });
  }

  doc.moveDown(1.5);
}

function renderFooter(doc, settings) {
  doc.moveDown(2);

  if (settings?.invoiceFooterLine) {
    doc
      .fontSize(9)
      .text(settings.invoiceFooterLine, {
        align: "center",
      });
  }

  if (settings?.terms) {
    doc.moveDown(0.5);
    doc
      .fontSize(8)
      .text(`Terms: ${settings.terms}`, {
        align: "center",
      });
  }
}

function docTypeLabel(type) {
  switch (type) {
    case "invoice":
      return "TAX INVOICE";
    case "packagingSlip":
      return "PACKAGING SLIP";
    case "creditNote":
      return "CREDIT NOTE";
    default:
      return type.toUpperCase();
  }
}

/* ======================================================
   INVOICE
====================================================== */

function renderInvoice(doc, order, settings) {
  doc.fontSize(10);

  doc.text(`Invoice No: ${order.name}`);
  doc.text(
    `Invoice Date: ${new Date(order.createdAt).toDateString()}`
  );
  doc.moveDown();

  /* ---- Customer ---- */
  if (order.customer) {
    doc.text("Billed To:");
    doc.text(
      `${order.customer.firstName || ""} ${
        order.customer.lastName || ""
      }`
    );
    if (order.customer.email) {
      doc.text(order.customer.email);
    }
    doc.moveDown();
  }

  /* ---- Items ---- */
  doc.text("Items", { underline: true });
  doc.moveDown(0.5);

  order.lineItems.edges.forEach(({ node }) => {
    doc.text(
      `${node.title} | Qty: ${
        node.quantity
      } | ₹${node.originalUnitPriceSet.shopMoney.amount}`
    );
  });

  doc.moveDown();

  /* ---- Totals ---- */
  if (order.subtotalPriceSet) {
    doc.text(
      `Subtotal: ₹${order.subtotalPriceSet.shopMoney.amount}`
    );
  }

  if (order.totalTaxSet) {
    doc.text(
      `Tax: ₹${order.totalTaxSet.shopMoney.amount}`
    );
  }

  doc
    .fontSize(12)
    .text(
      `Total: ₹${order.totalPriceSet.shopMoney.amount}`,
      { bold: true }
    );
}

/* ======================================================
   PACKAGING SLIP
====================================================== */

function renderPackagingSlip(doc, order) {
  doc.fontSize(10);

  doc.text(`Order: ${order.name}`);
  doc.text(
    `Order Date: ${new Date(order.createdAt).toDateString()}`
  );
  doc.moveDown();

  doc.text("Items", { underline: true });
  doc.moveDown(0.5);

  order.lineItems.edges.forEach(({ node }) => {
    doc.text(`${node.title} — Qty: ${node.quantity}`);
  });
}

/* ======================================================
   CREDIT NOTE
====================================================== */

function renderCreditNote(doc, order) {
  doc.fontSize(10);

  doc.text(`Reference Order: ${order.name}`);
  doc.moveDown();

  let totalRefund = 0;

  order.lineItems.edges.forEach(({ node }) => {
    const amount =
      node.quantity *
      parseFloat(node.originalUnitPriceSet.shopMoney.amount);

    totalRefund += amount;

    doc.text(`${node.title} — Refund ₹${amount.toFixed(2)}`);
  });

  doc.moveDown();
  doc
    .fontSize(12)
    .text(`Total Credit: ₹${totalRefund.toFixed(2)}`);
}
