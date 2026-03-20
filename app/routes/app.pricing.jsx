// app/routes/app.pricing.jsx

import {
  Page,
  Layout,
  Card,
  Text,
  Button,
  Badge,
  InlineStack,
  BlockStack,
  RangeSlider,
  Divider,
  ButtonGroup,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useState } from "react";

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [orders, setOrders] = useState(50);
  const [loadingPlan, setLoadingPlan] = useState(null);

  const plans = [
    {
      key: "FREE",
      name: "Free",
      priceMonthly: 0,
      description: "For stores with up to 50 orders",
      features: [
        "Up to 50 orders / month",
        "Basic invoices",
        "Manual download",
      ],
      cta: "Current Plan",
      disabled: true,
    },
    {
      key: "STARTUP",
      name: "Startup",
      priceMonthly: 9.9,
      description: "For growing stores",
      features: [
        "300 orders / month",
        "Bulk print invoices",
        "Auto email invoices",
        "Email automation",
      ],
      cta: "Start 7-day free trial",
    },
    {
      key: "BUSINESS",
      name: "Business",
      priceMonthly: 19.98,
      description: "For established businesses",
      features: [
        "2,500 orders / month",
        "Multiple templates",
        "GST reports",
        "Packaging slips & credit notes",
      ],
      cta: "Start 7-day free trial",
      highlight: true,
    },
    {
      key: "ADVANCED",
      name: "Advanced",
      priceMonthly: 69.98,
      description: "For high-volume stores",
      features: [
        "Unlimited orders",
        "Priority support",
        "WhatsApp support",
        "Advanced automation",
      ],
      cta: "Start 7-day free trial",
    },
  ];

  const handleSubscribe = async (planKey) => {
    setLoadingPlan(planKey);

    try {
      const res = await fetch("/app/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: planKey,
          billingCycle,
        }),
      });

      if (!res.ok) {
        alert("Billing failed. Please try again.");
      }
    } catch (err) {
      console.error("Billing error:", err);
      alert("Something went wrong.");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <Page>
      <TitleBar title="Plans & pricing" />

      <Layout>
        {/* Billing cycle + usage */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              {/* Billing toggle */}
              <InlineStack align="space-between" blockAlign="center">
                <Text variant="headingSm">Billing cycle</Text>

                <ButtonGroup segmented>
                  <Button
                    pressed={billingCycle === "monthly"}
                    onClick={() => setBillingCycle("monthly")}
                  >
                    Monthly
                  </Button>

                  <Button
                    pressed={billingCycle === "yearly"}
                    onClick={() => setBillingCycle("yearly")}
                  >
                    Yearly <Badge tone="success">Save 30%</Badge>
                  </Button>
                </ButtonGroup>
              </InlineStack>

              <Divider />

              {/* Orders slider */}
              <BlockStack gap="200">
                <Text variant="bodySm" tone="subdued">
                  Orders last month
                </Text>

                <RangeSlider
                  label="Orders"
                  min={0}
                  max={5000}
                  step={50}
                  value={orders}
                  onChange={setOrders}
                  output
                />
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Pricing cards */}
        <Layout.Section>
          <InlineStack gap="400" wrap>
            {plans.map((plan) => {
              const price =
                billingCycle === "monthly"
                  ? plan.priceMonthly
                  : (plan.priceMonthly * 12 * 0.7).toFixed(2);

              return (
                <Card key={plan.key} padding="400">
                  <BlockStack gap="300">
                    <InlineStack align="space-between">
                      <Text variant="headingMd">{plan.name}</Text>
                      {plan.highlight && (
                        <Badge tone="success">Most popular</Badge>
                      )}
                    </InlineStack>

                    <Text variant="headingLg">
                      ${price}
                      <Text as="span" tone="subdued">
                        {" "}
                        / {billingCycle}
                      </Text>
                    </Text>

                    <Text tone="subdued">{plan.description}</Text>

                    <BlockStack gap="200">
                      {plan.features.map((feature) => (
                        <Text key={feature}>✔ {feature}</Text>
                      ))}
                    </BlockStack>

                    <Button
                      primary={plan.highlight}
                      disabled={plan.disabled}
                      loading={loadingPlan === plan.key}
                      fullWidth
                      onClick={() => handleSubscribe(plan.key)}
                    >
                      {plan.cta}
                    </Button>

                    {!plan.disabled && (
                      <Text variant="bodySm" tone="subdued">
                        7-day free trial · Cancel anytime
                      </Text>
                    )}
                  </BlockStack>
                </Card>
              );
            })}
          </InlineStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
