
import {
  Page,
  Card,
  Box,
  Text,
  Button,
  ProgressBar,
  TextField,
  InlineStack,
  BlockStack,
} from "@shopify/polaris";
import { useFetcher } from "react-router";
import { useState } from "react";
import { authenticate } from "../shopify.server";
import { db } from "../db.server";

/* ---------------- ACTION ---------------- */

export async function action({ request }) {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();

  await db.appSettings.update({
    where: { shop: session.shop },
    data: {
      isOnboarded: true,
      gst: formData.get("gst"),
      company: formData.get("company"),
      email: formData.get("email"),
    },
  });

  return { success: true };
}

/* ---------------- COMPONENT ---------------- */

export default function OnboardingPage() {
  const fetcher = useFetcher();

  const [step, setStep] = useState(1);
  const [gst, setGst] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => s - 1);

  const finish = () => {
    fetcher.submit(
      { gst, company, email },
      { method: "POST" }
    );
  };

  return (
    <Page title="Setup Invoice GST">
      <Card>
        <Box padding="500">

          <BlockStack gap="400">

            <Text variant="headingLg">
              🚀 Setup Your Invoice GST App
            </Text>

            <ProgressBar progress={(step / 5) * 100} />

            {step === 1 && (
              <>
                <Text>Welcome! Let's get started.</Text>
                <Button variant="primary" onClick={next}>
                  Start
                </Button>
              </>
            )}

            {step === 2 && (
              <>
                <TextField
                  label="GST Number"
                  value={gst}
                  onChange={setGst}
                />
                <InlineStack>
                  <Button onClick={back}>Back</Button>
                  <Button variant="primary" onClick={next}>
                    Next
                  </Button>
                </InlineStack>
              </>
            )}

            {step === 3 && (
              <>
                <TextField
                  label="Company Name"
                  value={company}
                  onChange={setCompany}
                />
                <InlineStack>
                  <Button onClick={back}>Back</Button>
                  <Button variant="primary" onClick={next}>
                    Next
                  </Button>
                </InlineStack>
              </>
            )}

            {step === 4 && (
              <>
                <TextField
                  label="Email"
                  value={email}
                  onChange={setEmail}
                />
                <InlineStack>
                  <Button onClick={back}>Back</Button>
                  <Button variant="primary" onClick={next}>
                    Next
                  </Button>
                </InlineStack>
              </>
            )}

            {step === 5 && (
              <>
                <Text variant="headingMd">
                  🎉 Setup Complete
                </Text>

                <Button
                  variant="primary"
                  loading={fetcher.state === "submitting"}
                  onClick={finish}
                >
                  Finish Setup
                </Button>
              </>
            )}

          </BlockStack>

        </Box>
      </Card>
    </Page>
  );
}

