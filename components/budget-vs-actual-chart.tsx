"use client"

import { useTheme } from "next-themes"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "@/components/ui/chart"

interface BudgetData {
  category: string
  budget: number
  actual: number
  color: string
}

interface BudgetVsActualChartProps {
  data: BudgetData[]
}

export function BudgetVsActualChart({ data }: BudgetVsActualChartProps) {
  const { theme } = useTheme()
  const textColor = theme === "dark" ? "#f8fafc" : "#0f172a"
  const gridColor = theme === "dark" ? "#334155" : "#e2e8f0"

  // Format data for the chart
  const chartData = data.map((item) => ({
    name: item.category,
    Budget: item.budget,
    Actual: item.actual,
    color: item.color,
  }))

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
        <XAxis dataKey="name" stroke={textColor} fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke={textColor}
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip
          formatter={(value) => [`$${value}`, ""]}
          contentStyle={{
            backgroundColor: theme === "dark" ? "#1e293b" : "#ffffff",
            borderColor: theme === "dark" ? "#334155" : "#e2e8f0",
            color: textColor,
          }}
        />
        <Legend />
        <Bar dataKey="Budget" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={20} />
        <Bar dataKey="Actual" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} barSize={20} />
      </BarChart>
    </ResponsiveContainer>
  )
}

