// app/routes/app.templates.jsx

import { useEffect, useState } from "react";
import {
  Page,
  Layout,
  Card,
  Box,
  Text,
  Tabs,
  InlineStack,
  Button,
  Badge,
  Select,
  Divider,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useLoaderData, useNavigation, Form } from "react-router";
import { authenticate } from "../shopify.server";
import { db } from "../db.server";

import InvoicePreview from "../components/InvoicePreview";
import PackagingSlipPreview from "../components/PackagingSlipPreview";
import CreditNotePreview from "../components/CreditNotePreview";

/* ---------------- TEMPLATE DATA ---------------- */

const TEMPLATE_DATA = {
  invoice: [
    {
      id: "celestial",
      name: "Celestial",
      description: "Elegant invoice with warm tones and strong GST layout.",
    },
    {
      id: "orbix",
      name: "Orbix",
      description: "Minimal, clean layout focused on readability.",
    },
    {
      id: "sharp",
      name: "Sharp",
      description: "Professional and bold invoice for enterprises.",
    },
  ],

  packagingSlip: [
    {
      id: "standard-slip",
      name: "Standard Slip",
      description: "Simple and clear packaging slip layout.",
    },
    {
      id: "detailed-slip",
      name: "Detailed Slip",
      description: "Includes additional product details.",
    },
    {
      id: "compact-slip",
      name: "Compact Slip",
      description: "Space-saving design for small packages.",
    },
  ],

  creditNote: [
    {
      id: "standard-credit",
      name: "Standard Credit Note",
      description: "Standard credit note layout.",
    },
    {
      id: "detailed-credit",
      name: "Detailed Credit Note",
      description: "Includes detailed adjustment breakdown.",
    },
    {
      id: "minimal-credit",
      name: "Minimal Credit Note",
      description: "Clean and simple credit note.",
    },
  ],
};

const TABS = [
  { id: "invoice", content: "Invoice" },
  { id: "packagingSlip", content: "Packaging Slip" },
  { id: "creditNote", content: "Credit Note" },
];

const CUSTOM_SECTIONS = [
  "Branding and Style",
  "Overview",
  "Supplier",
  "Shipping",
  "Billing",
  "Line items",
  "Additional text",
  "Total",
  "Footer",
];

/* ---------------- LOADER ---------------- */

export async function loader({ request }) {
  const { admin, session } = await authenticate.admin(request);

  // Fetch saved template selections
  const saved = await db.templateCustomization.findMany({
    where: { shop: session.shop },
  });

  const selected = {};
  const customizationMap = {};

  saved.forEach((row) => {
    selected[row.templateType] = row.templateId;
    customizationMap[row.templateType] = row.customizations
      ? JSON.parse(row.customizations)
      : {};
  });

  // Sample order for preview
  const orderResponse = await admin.graphql(`
    query {
      orders(first: 1, reverse: true) {
        edges {
          node {
            id
            name
            createdAt
            customer {
              firstName
              lastName
              email
            }
            lineItems(first: 5) {
              edges {
                node {
                  title
                  quantity
                  originalUnitPriceSet {
                    shopMoney {
                      amount
                    }
                  }
                }
              }
            }
            subtotalPriceSet {
              shopMoney {
                amount
              }
            }
            totalTaxSet {
              shopMoney {
                amount
              }
            }
            totalPriceSet {
              shopMoney {
                amount
              }
            }
          }
        }
      }
    }
  `);

  const orderJson = await orderResponse.json();
  const sampleOrder =
    orderJson?.data?.orders?.edges?.[0]?.node || null;

  return {
    selected,
    customizationMap,
    sampleOrder,
  };
}

/* ---------------- ACTION ---------------- */

export async function action({ request }) {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();

  const templateType = formData.get("templateType");
  const templateId = formData.get("templateId");
  const settings = JSON.parse(formData.get("settings") || "{}");

  await db.templateCustomization.upsert({
    where: {
      shop_templateType: {
        shop: session.shop,
        templateType,
      },
    },
    update: {
      templateId,
      customizations: JSON.stringify(settings),
      isActive: true,
    },
    create: {
      shop: session.shop,
      templateType,
      templateId,
      customizations: JSON.stringify(settings),
      isActive: true,
    },
  });

  return { ok: true };
}

/* ---------------- COMPONENT ---------------- */

export default function TemplatesPage() {
  const { selected, customizationMap, sampleOrder } = useLoaderData();
  const navigation = useNavigation();

  const [tabIndex, setTabIndex] = useState(0);
  const [mode, setMode] = useState("list");
  const [activeSection, setActiveSection] = useState(CUSTOM_SECTIONS[0]);
  const [brandColor, setBrandColor] = useState("#f0b45c");

  const currentTab = TABS[tabIndex].id;
  const templates = TEMPLATE_DATA[currentTab] || [];

  const [activeTemplate, setActiveTemplate] = useState(
    selected[currentTab] || templates[0]?.id
  );

  useEffect(() => {
    setActiveTemplate(selected[currentTab] || templates[0]?.id);
    setBrandColor(
      customizationMap[currentTab]?.brandColor || "#f0b45c"
    );
  }, [currentTab]);

  const currentTemplate = templates.find(
    (t) => t.id === activeTemplate
  );

  /* ---------------- LIST VIEW ---------------- */

  const renderList = () => (
    <Box padding="400">
      <InlineStack gap="400">
        {templates.map((tpl) => (
          <Card key={tpl.id}>
            <Box padding="400">
              <InlineStack align="space-between">
                <Box>
                  <Text variant="headingMd">{tpl.name}</Text>
                  <Text tone="subdued">{tpl.description}</Text>
                  {activeTemplate === tpl.id && (
                    <Badge tone="success">Selected</Badge>
                  )}
                </Box>

                <InlineStack gap="200">
                  <Button
                    onClick={() => {
                      setActiveTemplate(tpl.id);
                      setMode("customize");
                    }}
                  >
                    Preview & Customize
                  </Button>

                  {activeTemplate !== tpl.id && (
                    <Form method="post">
                      <input
                        type="hidden"
                        name="templateType"
                        value={currentTab}
                      />
                      <input
                        type="hidden"
                        name="templateId"
                        value={tpl.id}
                      />
                      <input
                        type="hidden"
                        name="settings"
                        value={JSON.stringify({ brandColor })}
                      />
                      <Button submit primary>
                        Select
                      </Button>
                    </Form>
                  )}
                </InlineStack>
              </InlineStack>
            </Box>
          </Card>
        ))}
      </InlineStack>
    </Box>
  );

  /* ---------------- CUSTOMIZE VIEW ---------------- */

  const renderCustomize = () => (
    <Layout>
      {/* Sidebar */}
      <Layout.Section secondary>
        <Card>
          <Box padding="400">
            <Text variant="headingMd">Customize</Text>
          </Box>
          <Divider />
          {CUSTOM_SECTIONS.map((section) => (
            <Box
              key={section}
              padding="300"
              background={
                activeSection === section ? "bg-subdued" : "transparent"
              }
              onClick={() => setActiveSection(section)}
              style={{ cursor: "pointer" }}
            >
              <InlineStack align="space-between">
                <Text fontWeight={activeSection === section ? "bold" : "regular"}>
                  {section}
                </Text>
                {activeSection === section && (
                  <Badge tone="info">Editing</Badge>
                )}
              </InlineStack>
            </Box>
          ))}
        </Card>
      </Layout.Section>

      {/* Preview */}
      <Layout.Section>
        <Card>
          <Box padding="400">
            <InlineStack align="space-between">
              <Button plain onClick={() => setMode("list")}>
                ← Templates
              </Button>

              <Form method="post">
                <input type="hidden" name="templateType" value={currentTab} />
                <input type="hidden" name="templateId" value={activeTemplate} />
                <input
                  type="hidden"
                  name="settings"
                  value={JSON.stringify({ brandColor })}
                />
                <Button
                  submit
                  primary
                  loading={navigation.state === "submitting"}
                >
                  Save Template
                </Button>
              </Form>
            </InlineStack>
          </Box>

          <Divider />

          <Box padding="400">
            {activeSection === "Branding and Style" && (
              <Select
                label="Brand color"
                options={[
                  { label: "Gold", value: "#f0b45c" },
                  { label: "Green", value: "#007a5c" },
                  { label: "Black", value: "#000000" },
                ]}
                value={brandColor}
                onChange={setBrandColor}
              />
            )}

            <Box paddingBlockStart="400">
              {currentTab === "invoice" && (
                <InvoicePreview
                  order={sampleOrder}
                  template={currentTemplate?.id}
                  brandColor={brandColor}
                />
              )}

              {currentTab === "packagingSlip" && (
                <PackagingSlipPreview
                  order={sampleOrder}
                  template={currentTemplate?.id}
                />
              )}

              {currentTab === "creditNote" && (
                <CreditNotePreview
                  order={sampleOrder}
                  template={currentTemplate?.id}
                />
              )}
            </Box>
          </Box>
        </Card>
      </Layout.Section>
    </Layout>
  );

  /* ---------------- RENDER ---------------- */

  return (
    <Page title="Templates">
      <TitleBar title="Templates" />

      <Layout>
        <Layout.Section>
          <Card>
            <Tabs
              tabs={TABS}
              selected={tabIndex}
              onSelect={(i) => {
                setTabIndex(i);
                setMode("list");
              }}
            />

            {mode === "list" ? renderList() : renderCustomize()}
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
