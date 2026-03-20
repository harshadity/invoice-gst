import { useState, useEffect } from "react";
import {
  Page,
  Layout,
  Card,
  Text,
  Select,
  TextField,
  Button,
  InlineStack,
  Badge,
  BlockStack,
  Divider,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { Form, useLoaderData, useNavigation } from "react-router";

import { authenticate } from "../shopify.server";
import { db } from "../db.server";

/* ---------------- CONSTANTS ---------------- */

const TRIGGERS = [
  { label: "Order created", value: "order_created" },
  { label: "Order fulfilled", value: "order_fulfilled" },
  { label: "Order shipped", value: "order_shipped" },
  {
    label: "Order delivered (Thank you + feedback)",
    value: "order_delivered",
  },
];

/* ---------------- LOADER ---------------- */

export async function loader({ request }) {
  const { session } = await authenticate.admin(request);

  const automations = await db.emailAutomation.findMany({
    where: { shop: session.shop },
  });

  // map by trigger
  const automationMap = {};
  automations.forEach((a) => {
    automationMap[a.trigger] = a;
  });

  return { automations: automationMap };
}

/* ---------------- ACTION ---------------- */

export async function action({ request }) {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();

  const trigger = formData.get("trigger");

  await db.emailAutomation.upsert({
    where: {
      shop_trigger: {
        shop: session.shop,
        trigger,
      },
    },
    update: {
      enabled: formData.get("enabled") === "true",
      documentType: formData.get("documentType"),
      templateId: formData.get("templateId"),
      subject: formData.get("subject"),
      message: formData.get("message"),
    },
    create: {
      shop: session.shop,
      trigger,
      enabled: formData.get("enabled") === "true",
      documentType: formData.get("documentType"),
      templateId: formData.get("templateId"),
      subject: formData.get("subject"),
      message: formData.get("message"),
    },
  });

  return { ok: true };
}

/* ---------------- COMPONENT ---------------- */

export default function EmailAutomationPage() {
  const { automations } = useLoaderData();
  const navigation = useNavigation();

  const [trigger, setTrigger] = useState("order_created");
  const activeAutomation = automations[trigger];

  const [enabled, setEnabled] = useState(activeAutomation?.enabled ?? false);
  const [documentType, setDocumentType] = useState(
    activeAutomation?.documentType || "invoice"
  );
  const [templateId, setTemplateId] = useState(
    activeAutomation?.templateId || "celestial"
  );
  const [subject, setSubject] = useState(
    activeAutomation?.subject || ""
  );
  const [message, setMessage] = useState(
    activeAutomation?.message || ""
  );

  // 🔄 reload when trigger changes
  useEffect(() => {
    const a = automations[trigger];
    setEnabled(a?.enabled ?? false);
    setDocumentType(a?.documentType || "invoice");
    setTemplateId(a?.templateId || "celestial");
    setSubject(a?.subject || "");
    setMessage(a?.message || "");
  }, [trigger]);

  return (
    <Page title="Email Automation">
      <TitleBar title="Email Automation" />

      <Layout>
        <Layout.Section>
          <Card>
            <Form method="post">
              <BlockStack gap="400">
                <InlineStack align="space-between">
                  <Text variant="headingMd">Automation</Text>
                  <Badge tone={enabled ? "success" : "subdued"}>
                    {enabled ? "Enabled" : "Disabled"}
                  </Badge>
                </InlineStack>

                <Select
                  label="Trigger"
                  options={TRIGGERS}
                  value={trigger}
                  onChange={setTrigger}
                  name="trigger"
                />

                <Divider />

                <Select
                  label="Document type"
                  options={[
                    { label: "Invoice", value: "invoice" },
                    { label: "Packaging Slip", value: "packagingSlip" },
                    { label: "Credit Note", value: "creditNote" },
                  ]}
                  value={documentType}
                  onChange={setDocumentType}
                  name="documentType"
                />

                <Select
                  label="Template"
                  options={[
                    { label: "Celestial", value: "celestial" },
                    { label: "Orbix", value: "orbix" },
                    { label: "Sharp", value: "sharp" },
                  ]}
                  value={templateId}
                  onChange={setTemplateId}
                  name="templateId"
                />

                <TextField
                  label="Email subject"
                  value={subject}
                  onChange={setSubject}
                  name="subject"
                />

                <TextField
                  label="Email message"
                  multiline={6}
                  value={message}
                  onChange={setMessage}
                  name="message"
                  helpText={
                    trigger === "order_delivered"
                      ? "Tip: Add feedback or review link"
                      : ""
                  }
                />

                <input type="hidden" name="enabled" value={enabled} />

                <InlineStack gap="200">
                  <Button onClick={() => setEnabled(!enabled)}>
                    {enabled ? "Disable" : "Enable"}
                  </Button>

                  <Button
                    submit
                    primary
                    loading={navigation.state === "submitting"}
                  >
                    Save Automation
                  </Button>
                </InlineStack>
              </BlockStack>
            </Form>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
