import { Card, Text, Box } from "@shopify/polaris";
import { ClientOnly } from "remix-utils/client-only";

export default function GstGraph({ data }) {
  return (
    <Card>
      <Box padding="400">
        <Text variant="headingMd">GST collected</Text>

        <ClientOnly fallback={<Text tone="subdued">Loading chart…</Text>}>
          {() => {
            const { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } =
              require("recharts");

            return (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data}>
                  <XAxis dataKey="date" />
                  <Tooltip />
                  <Bar dataKey="gst" fill="#FFC453" />
                </BarChart>
              </ResponsiveContainer>
            );
          }}
        </ClientOnly>
      </Box>
    </Card>
  );
}
