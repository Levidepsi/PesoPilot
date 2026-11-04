"use client";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts";
export function CashChart({
  data,
}: {
  data: { month: string; income: number; expenses: number }[];
}) {
  return (
    <div className="chart">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="inc" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#54855d" stopOpacity={0.22} />
              <stop offset="95%" stopColor="#54855d" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#eef0f3"
            vertical={false}
          />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: "#657361" }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: "#657361" }}
            tickFormatter={(v) =>
              `₱${Math.abs(v) >= 1000 ? (v / 1000).toFixed(1) : v}${Math.abs(v) >= 1000 ? "k" : ""}`
            }
          />
          <Tooltip
            formatter={(v) =>
              `₱${Number(v).toLocaleString("en-PH", { maximumFractionDigits: 2 })}`
            }
          />
          <Legend />
          <Area
            isAnimationActive={false}
            type="monotone"
            dataKey="income"
            name="Income"
            stroke="#54855d"
            fill="url(#inc)"
            strokeWidth={3}
          />
          <Area
            isAnimationActive={false}
            type="monotone"
            dataKey="expenses"
            name="Expenses"
            stroke="#d47a4d"
            fill="none"
            strokeWidth={3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
export function BarSummary({
  data,
}: {
  data: { month: string; income: number; expenses: number }[];
}) {
  return (
    <div className="chart short">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#eef0f3"
          />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "#657361" }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "#657361" }}
            tickFormatter={(v) =>
              `${Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(1)}${Math.abs(v) >= 1000 ? "k" : ""}` : v}`
            }
          />
          <Tooltip formatter={(v) => `₱${Number(v).toLocaleString()}`} />
          <Bar
            isAnimationActive={false}
            dataKey="income"
            name="Income"
            fill="#54855d"
            radius={[5, 5, 0, 0]}
          />
          <Bar
            isAnimationActive={false}
            dataKey="expenses"
            name="Expenses"
            fill="#d9ab6b"
            radius={[5, 5, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
