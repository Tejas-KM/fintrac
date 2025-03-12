"use client"

import * as React from "react"
import type { ChartConfig } from "./types"

interface ChartContextValue {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextValue | undefined>(undefined)

function useChartContext() {
  const context = React.useContext(ChartContext)
  if (!context) {
    throw new Error("useChartContext must be used within a ChartProvider")
  }
  return context
}

interface ChartContainerProps {
  config: ChartConfig
  children: React.ReactNode
  className?: string
}

function ChartContainer({ config, children, className }: ChartContainerProps) {
  const value = React.useMemo(() => ({ config }), [config])

  return (
    <ChartContext.Provider value={value}>
      <div
        className={className}
        style={
          {
            "--color-bar": config.bar?.color,
            "--color-line": config.line?.color,
            "--color-area": config.area?.color,
            ...Object.entries(config).reduce(
              (acc, [key, value]) => {
                if (value?.color) {
                  acc[`--color-${key}`] = value.color
                }
                return acc
              },
              {} as Record<string, string>,
            ),
          } as React.CSSProperties
        }
      >
        {children}
      </div>
    </ChartContext.Provider>
  )
}

interface ChartTooltipProps {
  className?: string
  children?: React.ReactNode
}

function ChartTooltip({ className, children }: ChartTooltipProps) {
  return children
}

interface ChartTooltipContentProps {
  active?: boolean
  payload?: Array<{
    name: string
    value: number
    dataKey: string
    payload: Record<string, any>
  }>
  label?: string
  className?: string
}

function ChartTooltipContent({ active, payload, label, className }: ChartTooltipContentProps) {
  const { config } = useChartContext()

  if (!active || !payload?.length) {
    return null
  }

  return (
    <div className="rounded-md border bg-background p-2 shadow-sm">
      <div className="grid gap-2">
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm text-muted-foreground">{label}</div>
        </div>
        <div className="grid gap-1">
          {payload.map((data) => {
            const color = config[data.dataKey]?.color
            const name = config[data.dataKey]?.label || data.name
            return (
              <div key={data.dataKey} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  {color && <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />}
                  <span className="text-sm font-medium">{name}</span>
                </div>
                <div className="text-sm font-medium">{data.value}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export { ChartContainer, ChartTooltip, ChartTooltipContent, useChartContext }

