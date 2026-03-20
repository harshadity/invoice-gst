import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function DashboardGraphs({ data }) {
  if (!Array.isArray(data) || data.length === 0) return null;

  return (
    <div style={{ width: "100%", height: 320 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />

          <Line
            type="monotone"
            dataKey="orders"
            stroke="#008060"
            strokeWidth={2}
            name="Orders"
          />

          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#5c6ac4"
            strokeWidth={2}
            name="Revenue"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
