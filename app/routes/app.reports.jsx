import React, { useState, useCallback, useEffect } from "react";
import {
  Page,
  Card,
  Tabs,
  IndexTable,
  Text,
  Badge,
  Button,
  Box,
  InlineStack,
  Banner,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useFetcher } from "react-router";
import { authenticate } from "../shopify.server";

// ---------- STATIC REPORT DEFINITIONS ----------
const REPORT_TYPES = [
  {
    id: "gstr1-full",
    initial: "G",
    initialColor: "success",
    title: "GSTR-1 Full Report",
    description: "Sales Invoice and Sales Credit Notes for GSTR1",
    category: "Orders Report",
  },
  {
    id: "gstr1-b2b",
    initial: "G",
    initialColor: "info",
    title: "GSTR-1 B2B",
    description: "B2B Sales Invoice & Sales Credit Notes for GSTR1",
    category: "Orders Report",
  },
  {
    id: "gstr1-b2c",
    initial: "G",
    initialColor: "success",
    title: "GSTR-1 B2C",
    description: "B2C Sales Invoice & Sales Credit Notes for GSTR1",
    category: "Orders Report",
  },
  {
    id: "gstr3b-supply",
    initial: "G",
    initialColor: "info",
    title: "GSTR-3B Supply Summary",
    description: "Supply Summary of GST liabilities for a tax period.",
    category: "Orders Report",
  },
  {
    id: "gstr1-b2b-offline",
    initial: "G",
    initialColor: "success",
    title: "GSTR-1 B2B Offline (CSV)",
    description: "CSV for GST Offline tool for B2B, SEZ & Deemed exports.",
    category: "Orders Report",
  },
  {
    id: "hsn-summary-b2b",
    initial: "H",
    initialColor: "info",
    title: "HSN-wise summary of outward supplies (B2B)",
    description:
      "HSN-wise summary of outward supplies for a tax period. (B2B)",
    category: "Orders Report",
  },
];

// ---------- SERVER HELPERS (RUN IN ACTION) ----------

function buildReportData(reportId, orderEdges) {
  const orders = orderEdges.map((e) => e.node);

  // NOTE: This is a simplified example.
  // You can plug in real GST logic later (GSTIN, HSN, tax breakup, etc.)

  switch (reportId) {
    case "gstr1-b2b":
    case "gstr1-b2b-offline": {
      const columns = [
        "Invoice No",
        "Invoice Date",
        "Customer Name",
        "Customer Email",
        "Place of Supply",
        "Taxable Value",
        "Total Tax",
        "Invoice Value",
      ];

      const rows = orders.map((order) => {
        const billing = order.billingAddress;
        const taxable =
          Number(order.subtotalPriceSet.shopMoney.amount || "0") || 0;
        const tax = Number(order.totalTaxSet?.shopMoney?.amount || "0") || 0;
        const total = Number(order.totalPriceSet.shopMoney.amount || "0") || 0;

        return [
          order.name,
          order.createdAt?.slice(0, 10) || "",
          `${order.customer?.firstName || ""} ${order.customer?.lastName || ""}`.trim(),
          order.customer?.email || "",
          billing ? `${billing.city || ""}, ${billing.country || ""}` : "",
          taxable.toFixed(2),
          tax.toFixed(2),
          total.toFixed(2),
        ];
      });

      return { columns, rows };
    }

    case "gstr1-b2c": {
      const columns = [
        "Invoice No",
        "Invoice Date",
        "Customer Type",
        "Place of Supply",
        "Taxable Value",
        "Invoice Value",
      ];

      const rows = orders.map((order) => {
        const shipping = order.shippingAddress;
        const taxable =
          Number(order.subtotalPriceSet.shopMoney.amount || "0") || 0;
        const total = Number(order.totalPriceSet.shopMoney.amount || "0") || 0;

        return [
          order.name,
          order.createdAt?.slice(0, 10) || "",
          "B2C",
          shipping ? `${shipping.city || ""}, ${shipping.country || ""}` : "",
          taxable.toFixed(2),
          total.toFixed(2),
        ];
      });

      return { columns, rows };
    }

    case "gstr3b-supply": {
      const columns = [
        "Invoice No",
        "Invoice Date",
        "Taxable Value",
        "CGST",
        "SGST",
        "IGST",
        "Total Tax",
        "Invoice Value",
      ];

      // Here we just split tax equally into CGST/SGST as a placeholder.
      const rows = orders.map((order) => {
        const taxable =
          Number(order.subtotalPriceSet.shopMoney.amount || "0") || 0;
        const tax = Number(order.totalTaxSet?.shopMoney?.amount || "0") || 0;
        const total = Number(order.totalPriceSet.shopMoney.amount || "0") || 0;
        const cgst = (tax / 2).toFixed(2);
        const sgst = (tax / 2).toFixed(2);
        const igst = 0;

        return [
          order.name,
          order.createdAt?.slice(0, 10) || "",
          taxable.toFixed(2),
          cgst,
          sgst,
          igst.toFixed(2),
          tax.toFixed(2),
          total.toFixed(2),
        ];
      });

      return { columns, rows };
    }

    case "hsn-summary-b2b": {
      const columns = [
        "HSN Code",
        "Description",
        "Total Quantity",
        "Taxable Value",
        "Total Tax",
        "Total Value",
      ];

      // Very simplified: aggregate by product title as "HSN"
      const map = new Map();

      for (const order of orders) {
        const orderTotal =
          Number(order.totalPriceSet.shopMoney.amount || "0") || 0;
        const orderTax =
          Number(order.totalTaxSet?.shopMoney?.amount || "0") || 0;

        for (const edge of order.lineItems.edges) {
          const item = edge.node;
          const key = item.title || "UNKNOWN";
          const current = map.get(key) || {
            hsn: key,
            description: item.variantTitle || "",
            qty: 0,
            taxable: 0,
            tax: 0,
            total: 0,
          };

          current.qty += item.quantity || 0;
          current.taxable +=
            Number(
              item.originalUnitPriceSet?.shopMoney?.amount || "0"
            ) * (item.quantity || 0);
          current.tax += orderTax; // approximate
          current.total += orderTotal;

          map.set(key, current);
        }
      }

      const rows = Array.from(map.values()).map((r) => [
        r.hsn,
        r.description,
        r.qty,
        r.taxable.toFixed(2),
        r.tax.toFixed(2),
        r.total.toFixed(2),
      ]);

      return { columns, rows };
    }

    case "gstr1-full":
    default: {
      const columns = [
        "Invoice No",
        "Invoice Date",
        "Customer Name",
        "Customer Email",
        "Status",
        "Taxable Value",
        "Total Tax",
        "Invoice Value",
        "Currency",
      ];

      const rows = orders.map((order) => {
        const taxable =
          Number(order.subtotalPriceSet.shopMoney.amount || "0") || 0;
        const tax = Number(order.totalTaxSet?.shopMoney?.amount || "0") || 0;
        const total = Number(order.totalPriceSet.shopMoney.amount || "0") || 0;

        return [
          order.name,
          order.createdAt?.slice(0, 10) || "",
          `${order.customer?.firstName || ""} ${
            order.customer?.lastName || ""
          }`.trim(),
          order.customer?.email || "",
          order.displayFinancialStatus || "",
          taxable.toFixed(2),
          tax.toFixed(2),
          total.toFixed(2),
          order.currencyCode || "",
        ];
      });

      return { columns, rows };
    }
  }
}

// Basic CSV builder (no external libs)
function escapeCsv(value) {
  if (value == null) return "";
  const str = String(value);
  if (str.includes('"') || str.includes(",") || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function buildCsvString(columns, rows) {
  const header = columns.map(escapeCsv).join(",");
  const lines = rows.map((row) => row.map(escapeCsv).join(","));
  return [header, ...lines].join("\n");
}

// ---------- SERVER ACTION ----------
export async function action({ request }) {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const reportId = formData.get("reportId");

  if (!reportId) {
    return { ok: false, message: "Missing report type." };
  }

  // For now we fetch last 50 orders; you can add filters/date range later.
  const response = await admin.graphql(
    `#graphql
    query GetOrdersForReports {
      orders(first: 50, reverse: true) {
        edges {
          node {
            id
            name
            createdAt
            displayFinancialStatus
            currencyCode
            subtotalPriceSet {
              shopMoney {
                amount
                currencyCode
              }
            }
            totalPriceSet {
              shopMoney {
                amount
                currencyCode
              }
            }
            totalTaxSet {
              shopMoney {
                amount
                currencyCode
              }
            }
            customer {
              firstName
              lastName
              email
            }
            billingAddress {
              address1
              city
              country
            }
            shippingAddress {
              address1
              city
              country
            }
            lineItems(first: 10) {
              edges {
                node {
                  title
                  quantity
                  variantTitle
                  originalUnitPriceSet {
                    shopMoney {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `
  );

  const json = await response.json();

  if (json.errors) {
    console.error("Report query error:", json.errors);
    return { ok: false, message: json.errors[0].message };
  }

  const edges = json.data.orders.edges || [];
  const { columns, rows } = buildReportData(reportId, edges);

  const generatedAt = new Date().toISOString();
  const reportName =
    REPORT_TYPES.find((r) => r.id === reportId)?.title || reportId;

  // We also build CSV here (so you could store/upload it server-side if you want)
  const csvString = buildCsvString(columns, rows);

  return {
    ok: true,
    message: `Report "${reportName}" generated successfully.`,
    reportId,
    reportName,
    generatedAt,
    columns,
    rows,
    csvString,
  };
}

// ---------- CLIENT HELPERS (RUN IN BROWSER ONLY) ----------

async function downloadPdf(reportName, columns, rows) {
  const [{ jsPDF }, autoTableModule] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const autoTable =
    autoTableModule.default || autoTableModule.autoTable || autoTableModule;

  const doc = new jsPDF("landscape");

  // Add report header
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(reportName, 14, 20);

  // Add generation date
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, 28);

  // Add table
  autoTable(doc, {
    startY: 35,
    head: [columns],
    body: rows,
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    theme: 'grid',
  });

  // Add summary totals if applicable
  const finalY = doc.lastAutoTable.finalY + 10;
  if (rows.length > 0) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`Total Records: ${rows.length}`, 14, finalY);

    // Calculate totals for numeric columns
    const numericColumns = [];
    rows[0]?.forEach((cell, index) => {
      const numValue = parseFloat(String(cell).replace(/[^0-9.-]/g, ''));
      if (!isNaN(numValue) && columns[index]) {
        numericColumns.push(index);
      }
    });

    if (numericColumns.length > 0) {
      let yPos = finalY + 7;
      numericColumns.forEach(colIndex => {
        const total = rows.reduce((sum, row) => {
          const value = parseFloat(String(row[colIndex]).replace(/[^0-9.-]/g, ''));
          return sum + (isNaN(value) ? 0 : value);
        }, 0);
        doc.text(`Total ${columns[colIndex]}: ${total.toFixed(2)}`, 14, yPos);
        yPos += 7;
      });
    }
  }

  // Add page numbers
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.getWidth() - 30, doc.internal.pageSize.getHeight() - 10);
  }

  doc.save(`${reportName.replace(/\s+/g, "_")}_${new Date().toISOString().split('T')[0]}.pdf`);
}

function downloadCsv(reportName, csvString) {
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute(
    "download",
    `${reportName.replace(/\s+/g, "_")}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ---------- CLIENT PAGE COMPONENT ----------
export default function ReportsPage() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [lastResult, setLastResult] = useState(null);
  const [generatingReportId, setGeneratingReportId] = useState(null);
  const fetcher = useFetcher();

  const handleTabChange = useCallback((selectedIndex) => {
    setSelectedTab(selectedIndex);
  }, []);

  const tabs = [
    {
      id: "generate-reports",
      content: "Generate GST Reports",
      panelID: "generate-reports-content",
    },
    {
      id: "history",
      content: "History",
      panelID: "history-content",
    },
  ];

  // When action returns, trigger CSV + PDF download on the client
  useEffect(() => {
    if (fetcher.data && fetcher.data.ok) {
      const { reportName, columns, rows, csvString } = fetcher.data;

      if (csvString) {
        downloadCsv(reportName, csvString);
      }
      if (columns && rows) {
        downloadPdf(reportName, columns, rows);
      }

      setLastResult(fetcher.data);
      setGeneratingReportId(null);
    } else if (fetcher.data && !fetcher.data.ok) {
      setLastResult(fetcher.data);
      setGeneratingReportId(null);
    }
  }, [fetcher.data]);

  const resourceName = {
    singular: "report",
    plural: "reports",
  };

  const handleGenerateReport = (report) => {
    setGeneratingReportId(report.id);
    fetcher.submit(
      { reportId: report.id },
      {
        method: "POST",
      }
    );
  };

  const rows = REPORT_TYPES.map((report, index) => (
    <IndexTable.Row id={report.id} key={report.id} position={index}>
      {/* Report column */}
      <IndexTable.Cell>
        <InlineStack gap="400" align="start">
          <Box
            padding="300"
            borderRadius="full"
            background={
              report.initialColor === "success"
                ? "bg-success-strong"
                : "bg-info-strong"
            }
            minWidth="32px"
            minHeight="32px"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Text as="span" variant="bodyMd" fontWeight="bold" tone="on-bg">
              {report.initial}
            </Text>
          </Box>

          <Box>
            <Text as="p" variant="bodyMd" fontWeight="bold">
              {report.title}
            </Text>
            <Text as="p" variant="bodySm" tone="subdued">
              {report.description}
            </Text>
          </Box>
        </InlineStack>
      </IndexTable.Cell>

      {/* Category */}
      <IndexTable.Cell>
        <Badge tone="subdued">{report.category}</Badge>
      </IndexTable.Cell>

      {/* Actions */}
      <IndexTable.Cell>
        <InlineStack gap="200" align="end">
          <Button
            onClick={() => handleGenerateReport(report)}
            loading={generatingReportId === report.id && fetcher.state === "submitting"}
          >
            Generate Report
          </Button>
        </InlineStack>
      </IndexTable.Cell>
    </IndexTable.Row>
  ));

  return (
    <Page
      title="Reports"
      primaryAction={{
        content: "New Report Type",
        onAction: () => {
          console.log("New report type clicked");
          // later: open modal / navigate to /app/reports/new
        },
      }}
    >
      <TitleBar title="Reports" />

      {/* Result banner */}
      {lastResult && (
        <Box paddingBlockEnd="400">
          <Banner
            tone={lastResult.ok ? "success" : "critical"}
            title={lastResult.ok ? "Report generated" : "Error"}
          >
            <p>{lastResult.message}</p>
          </Banner>
        </Box>
      )}

      <Card>
        <Tabs tabs={tabs} selected={selectedTab} onSelect={handleTabChange}>
          {selectedTab === 0 && (
            <Box padding="400">
              <IndexTable
                resourceName={resourceName}
                itemCount={REPORT_TYPES.length}
                selectable={false}
                headings={[
                  { title: "Report type" },
                  { title: "Category" },
                  { title: "Actions" },
                ]}
              >
                {rows}
              </IndexTable>
            </Box>
          )}

          {selectedTab === 1 && (
            <Box padding="400">
              <Text as="p" tone="subdued">
                Report history will appear here. After you persist generated
                reports (for example in your own DB), you can list them in this
                tab.
              </Text>
            </Box>
          )}
        </Tabs>
      </Card>
    </Page>
  );
}
