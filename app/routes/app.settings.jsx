// app/routes/app.settings.jsx

import React, { useState, useEffect } from "react";
import {
  Page,
  Layout,
  Card,
  Box,
  Text,
  TextField,
  InlineStack,
  BlockStack,
  Button,
  Divider,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import {
  useLoaderData,
  useNavigation,
  useActionData,
  Form,
} from "react-router";
import { authenticate } from "../shopify.server";
import { db } from "../db.server";

/* ---------------- LOADER ---------------- */

export async function loader({ request }) {
  const { session } = await authenticate.admin(request);

  let settings = await db.appSettings.findUnique({
    where: { shop: session.shop },
  });

  if (!settings) {
    settings = await db.appSettings.create({
      data: {
        shop: session.shop,
        invoiceStartNumber: 1,
        defaultTaxPercentage: 18,
      },
    });
  }

  return { settings };
}

/* ---------------- ACTION ---------------- */

export async function action({ request }) {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();

  const get = (k) => formData.get(k) || "";

  const fullAddress = [
    get("addressLine1"),
    get("addressLine2"),
    get("city"),
    get("state"),
    get("pincode"),
    get("country"),
  ]
    .filter(Boolean)
    .join(", ");

  await db.appSettings.upsert({
    where: { shop: session.shop },
    update: {
      companyLegalName: get("companyLegalName"),
      brandName: get("brandName"),
      businessType: get("businessType"),
      gstin: get("gstin"),
      pan: get("pan"),
      registeredNumber: get("registeredNumber"),
      cin: get("cin"),
      authorizedSignatory: get("authorizedSignatory"),

      addressLine1: get("addressLine1"),
      addressLine2: get("addressLine2"),
      city: get("city"),
      state: get("state"),
      pincode: get("pincode"),
      country: get("country"),
      fullAddress,

      phone: get("phone"),
      whatsapp: get("whatsapp"),
      supportEmail: get("supportEmail"),
      website: get("website"),
      supportTimings: get("supportTimings"),

      invoicePrefix: get("invoicePrefix"),
      invoiceStartNumber: Number(get("invoiceStartNumber") || 1),
      defaultTaxPercentage: Number(get("defaultTaxPercentage") || 0),
      invoiceFooterLine: get("invoiceFooterLine"),
      terms: get("terms"),
      declaration: get("declaration"),

      logoUrl: get("logoUrl"),
      signatureUrl: get("signatureUrl"),
      brandColor: get("brandColor"),
      accentColor: get("accentColor"),
      fontFamily: get("fontFamily"),

      facebook: get("facebook"),
      instagram: get("instagram"),
      twitter: get("twitter"),
      linkedin: get("linkedin"),
      youtube: get("youtube"),
      pinterest: get("pinterest"),
    },
    create: {
      shop: session.shop,
      invoiceStartNumber: 1,
      defaultTaxPercentage: 18,
    },
  });

  return { ok: true, message: "Settings saved successfully" };
}

/* ---------------- COMPONENT ---------------- */

export default function GeneralSettingsPage() {
  const { settings } = useLoaderData();
  const navigation = useNavigation();
  const actionData = useActionData();

  const [values, setValues] = useState(settings);

  useEffect(() => {
    setValues(settings);
  }, [settings]);

  const updating = navigation.state === "submitting";

  const handleChange = (field) => (value) =>
    setValues((prev) => ({ ...prev, [field]: value }));

  const renderField = (label, key) => (
    <TextField
      label={label}
      value={values?.[key] || ""}
      onChange={handleChange(key)}
    />
  );

  return (
    <Page title="General Settings">
      <TitleBar title="General Settings" />

      <Layout>

        {/* BUSINESS */}
        <Layout.Section>
          <Card>
            <Box padding="400"><Text variant="headingMd">Business & Legal</Text></Box>
            <Divider />
            <Box padding="400">
              <BlockStack gap="300">
                {renderField("Company legal name", "companyLegalName")}
                {renderField("Brand name", "brandName")}
                {renderField("Business type", "businessType")}
                {renderField("GSTIN", "gstin")}
                {renderField("PAN", "pan")}
                {renderField("Registered number", "registeredNumber")}
                {renderField("CIN", "cin")}
                {renderField("Authorized signatory", "authorizedSignatory")}
              </BlockStack>
            </Box>
          </Card>
        </Layout.Section>

        {/* ADDRESS */}
        <Layout.Section>
          <Card>
            <Box padding="400"><Text variant="headingMd">Address</Text></Box>
            <Divider />
            <Box padding="400">
              <BlockStack gap="300">
                {renderField("Address line 1", "addressLine1")}
                {renderField("Address line 2", "addressLine2")}
                <InlineStack gap="300">
                  {renderField("City", "city")}
                  {renderField("State", "state")}
                </InlineStack>
                <InlineStack gap="300">
                  {renderField("Pincode", "pincode")}
                  {renderField("Country", "country")}
                </InlineStack>
              </BlockStack>
            </Box>
          </Card>
        </Layout.Section>

        {/* CONTACT */}
        <Layout.Section>
          <Card>
            <Box padding="400"><Text variant="headingMd">Contact</Text></Box>
            <Divider />
            <Box padding="400">
              <BlockStack gap="300">
                {renderField("Phone", "phone")}
                {renderField("WhatsApp", "whatsapp")}
                {renderField("Support email", "supportEmail")}
                {renderField("Website", "website")}
                {renderField("Support timings", "supportTimings")}
              </BlockStack>
            </Box>
          </Card>
        </Layout.Section>

        {/* INVOICE */}
        <Layout.Section>
          <Card>
            <Box padding="400"><Text variant="headingMd">Invoice & Compliance</Text></Box>
            <Divider />
            <Box padding="400">
              <BlockStack gap="300">
                {renderField("Invoice prefix", "invoicePrefix")}
                {renderField("Invoice start number", "invoiceStartNumber")}
                {renderField("Default tax percentage", "defaultTaxPercentage")}
                {renderField("Invoice footer line", "invoiceFooterLine")}
                {renderField("Terms & conditions", "terms")}
                {renderField("Declaration text", "declaration")}
              </BlockStack>
            </Box>
          </Card>
        </Layout.Section>

        {/* BRANDING */}
        <Layout.Section>
          <Card>
            <Box padding="400"><Text variant="headingMd">Branding</Text></Box>
            <Divider />
            <Box padding="400">
              <BlockStack gap="300">
                {renderField("Logo URL", "logoUrl")}
                {renderField("Signature URL", "signatureUrl")}
                {renderField("Brand color", "brandColor")}
                {renderField("Accent color", "accentColor")}
                {renderField("Font family", "fontFamily")}
              </BlockStack>
            </Box>
          </Card>
        </Layout.Section>

        {/* SOCIAL */}
        <Layout.Section>
          <Card>
            <Box padding="400"><Text variant="headingMd">Social Media</Text></Box>
            <Divider />
            <Box padding="400">
              <BlockStack gap="300">
                {renderField("Facebook", "facebook")}
                {renderField("Instagram", "instagram")}
                {renderField("Twitter / X", "twitter")}
                {renderField("LinkedIn", "linkedin")}
                {renderField("YouTube", "youtube")}
                {renderField("Pinterest", "pinterest")}
              </BlockStack>
            </Box>
          </Card>
        </Layout.Section>

        {/* SAVE */}
        <Layout.Section>
          <Form method="post">
            {Object.entries(values || {}).map(([k, v]) => (
              <input key={k} type="hidden" name={k} value={v || ""} />
            ))}
            <Button submit primary loading={updating}>
              Save all settings
            </Button>
            {actionData && (
              <Box paddingBlockStart="200">
                <Text tone={actionData.ok ? "success" : "critical"}>
                  {actionData.message}
                </Text>
              </Box>
            )}
          </Form>
        </Layout.Section>

      </Layout>
    </Page>
  );
}
