"use client"

import { subMonths, format } from "date-fns"
import { useTheme } from "next-themes"

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "@/components/ui/chart"

// This would normally come from the database
// For demo purposes, we're generating sample data
const generateSampleData = () => {
  const data = []
  const now = new Date()

  for (let i = 5; i >= 0; i--) {
    const date = subMonths(now, i)
    data.push({
      name: format(date, "MMM"),
      expenses: Math.floor(Math.random() * 1000) + 500,
      budget: Math.floor(Math.random() * 1000) + 1000,
    })
  }

  return data
}

interface MonthlyExpensesChartProps {
  realData?: { name: string; expenses: number; budget?: number }[]
}

export function MonthlyExpensesChart({ realData }: MonthlyExpensesChartProps) {
  const { theme } = useTheme()
  const data = realData || generateSampleData()

  // Determine colors based on theme
  const textColor = theme === "dark" ? "#f8fafc" : "#0f172a"
  const gridColor = theme === "dark" ? "#334155" : "#e2e8f0"

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
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
        <Bar dataKey="expenses" name="Expenses" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} barSize={20} />
        {data[0].budget && (
          <Bar dataKey="budget" name="Budget" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={20} />
        )}
      </BarChart>
    </ResponsiveContainer>
  )
}

