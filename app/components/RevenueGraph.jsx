import { Card, Text, Box } from "@shopify/polaris";
import { ClientOnly } from "remix-utils/client-only";

export default function RevenueGraph({ data }) {
  return (
    <Card>
      <Box padding="400">
        <Text variant="headingMd">Revenue trend</Text>

        <ClientOnly fallback={<Text tone="subdued">Loading chart…</Text>}>
          {() => {
            const { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } =
              require("recharts");

            return (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={data}>
                  <XAxis dataKey="date" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#008060"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            );
          }}
        </ClientOnly>
      </Box>
    </Card>
  );
}
