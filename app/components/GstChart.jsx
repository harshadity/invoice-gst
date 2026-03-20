import { useEffect, useState } from "react";
import ClientOnly from "./ClientOnly";

export default function GstChart({ orders }) {
  return (
    <ClientOnly>
      <Chart orders={orders} />
    </ClientOnly>
  );
}

function Chart({ orders }) {
  const [Bar, setBar] = useState(null);

  useEffect(() => {
    async function load() {
      const mod = await import("react-chartjs-2");
      await import("chart.js/auto");
      setBar(() => mod.Bar);
    }
    load();
  }, []);

  if (!Bar) return null;

  const data = {
    labels: orders.map(o => o.date),
    datasets: [
      {
        label: "GST",
        data: orders.map(o => o.gst),
        backgroundColor: "#5c6ac4",
      },
    ],
  };

  return <Bar data={data} />;
}
