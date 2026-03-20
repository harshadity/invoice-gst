import { useEffect, useState } from "react";
import ClientOnly from "./ClientOnly";

export default function RevenueChart({ orders }) {
  return (
    <ClientOnly>
      <Chart orders={orders} />
    </ClientOnly>
  );
}

function Chart({ orders }) {
  const [Line, setLine] = useState(null);

  useEffect(() => {
    async function load() {
      const mod = await import("react-chartjs-2");
      await import("chart.js/auto");
      setLine(() => mod.Line);
    }
    load();
  }, []);

  if (!Line) return null;

  const data = {
    labels: orders.map(o => o.date),
    datasets: [
      {
        label: "Revenue",
        data: orders.map(o => o.revenue),
        borderColor: "#008060",
        tension: 0.4,
      },
    ],
  };

  return <Line data={data} />;
}
