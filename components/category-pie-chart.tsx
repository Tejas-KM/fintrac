"use client"

import { useTheme } from "next-themes"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "@/components/ui/chart"

interface CategoryData {
  _id: string
  name: string
  color: string
  amount: number
}

interface CategoryPieChartProps {
  data: CategoryData[]
}

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  const { theme } = useTheme()
  const textColor = theme === "dark" ? "#f8fafc" : "#0f172a"

  // Format data for the pie chart
  const chartData = data.map((category) => ({
    name: category.name,
    value: Math.abs(category.amount),
    color: category.color,
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => [`${value}`, "Amount"]}
          contentStyle={{
            backgroundColor: theme === "dark" ? "#1e293b" : "#ffffff",
            borderColor: theme === "dark" ? "#334155" : "#e2e8f0",
            color: textColor,
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

