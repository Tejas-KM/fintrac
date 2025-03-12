import { Suspense } from "react"
import { subMonths, format, startOfMonth, endOfMonth } from "date-fns"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MonthlyExpensesChart } from "@/components/monthly-expenses-chart"
import { CategoryPieChart } from "@/components/category-pie-chart"
import { BudgetVsActualChart } from "@/components/budget-vs-actual-chart"
import { DashboardSkeleton } from "@/components/dashboard-skeleton"
import { DashboardStats } from "@/components/dashboard-stats"
import { getDb } from "@/lib/db"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export const dynamic = "force-dynamic"

export default function DashboardPage() {
  return (
    <div className="container py-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <Suspense fallback={<DashboardSkeleton />}>
            <DashboardStats />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Monthly Expenses</CardTitle>
                  <CardDescription>Your spending over the last 6 months</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <Suspense>
                    <MonthlyExpensesData />
                  </Suspense>
                </CardContent>
              </Card>

              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>Your latest financial activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <Suspense>
                    <RecentTransactions />
                  </Suspense>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Spending by Category</CardTitle>
                  <CardDescription>How your expenses are distributed</CardDescription>
                </CardHeader>
                <CardContent>
                  <Suspense>
                    <CategoryBreakdown />
                  </Suspense>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Categories</CardTitle>
                  <CardDescription>Your highest spending categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <Suspense>
                    <TopCategories />
                  </Suspense>
                </CardContent>
              </Card>
            </div>
          </Suspense>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Budget vs Actual</CardTitle>
              <CardDescription>Compare your spending against your budget</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense>
                <BudgetVsActualData />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="budgets" className="space-y-4">
          <Suspense>
            <BudgetAlerts />
          </Suspense>

          <Card>
            <CardHeader>
              <CardTitle>Budget Status</CardTitle>
              <CardDescription>Your current month's budget status</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense>
                <BudgetStatusList />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

async function MonthlyExpensesData() {
  const db = await getDb()
  const now = new Date()

  // Get total budget amount
  const budgets = await db.collection("budgets").find({}).toArray()

  const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0)

  // Get expenses for the last 6 months
  const monthlyData = []

  for (let i = 5; i >= 0; i--) {
    const date = subMonths(now, i)
    const monthStart = startOfMonth(date)
    const monthEnd = endOfMonth(date)

    // Query transactions for this month
    const transactions = await db
      .collection("transactions")
      .find({
        date: {
          $gte: monthStart,
          $lte: monthEnd,
        },
        amount: { $lt: 0 }, // Only expenses
      })
      .toArray()

    // Calculate total expenses
    const totalExpenses = transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0)

    monthlyData.push({
      name: format(date, "MMM"),
      expenses: totalExpenses,
      budget: i === 0 ? totalBudget : undefined, // Only show budget for current month
    })
  }

  return <MonthlyExpensesChart realData={monthlyData} />
}

async function RecentTransactions() {
  const db = await getDb()
  const transactions = await db.collection("transactions").find({}).sort({ date: -1 }).limit(5).toArray()

  // Get all categories
  const categories = await db.collection("categories").find({}).toArray()

  // Create a map for quick lookup
  const categoryMap = categories.reduce(
    (acc, category) => {
      acc[category._id.toString()] = category
      return acc
    },
    {} as Record<string, any>,
  )

  if (transactions.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground">No transactions yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => {
        const category = transaction.categoryId ? categoryMap[transaction.categoryId.toString()] : null

        return (
          <div key={transaction._id.toString()} className="flex justify-between items-center">
            <div>
              <p className="font-medium">{transaction.description}</p>
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">{new Date(transaction.date).toLocaleDateString()}</p>
                {category && (
                  <div className="flex items-center gap-1 text-xs">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: category.color }} />
                    {category.name}
                  </div>
                )}
              </div>
            </div>
            <div className={`font-medium ${transaction.amount < 0 ? "text-red-500" : "text-green-500"}`}>
              ${Math.abs(transaction.amount).toFixed(2)}
            </div>
          </div>
        )
      })}
    </div>
  )
}

async function CategoryBreakdown() {
  const db = await getDb()

  // Get all categories
  const categories = await db.collection("categories").find({}).toArray()

  if (categories.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground">No categories yet</p>
      </div>
    )
  }

  // Get all transactions
  const transactions = await db
    .collection("transactions")
    .find({ amount: { $lt: 0 } }) // Only expenses
    .toArray()

  // Calculate total amount per category
  const categoryData = categories
    .map((category) => {
      const categoryTransactions = transactions.filter((t) => t.categoryId === category._id.toString())

      const amount = categoryTransactions.reduce((sum, t) => sum + t.amount, 0)

      return {
        _id: category._id.toString(),
        name: category.name,
        color: category.color,
        amount,
      }
    })
    .filter((c) => c.amount !== 0)

  if (categoryData.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground">No categorized expenses yet</p>
      </div>
    )
  }

  return <CategoryPieChart data={categoryData} />
}

async function TopCategories() {
  const db = await getDb()

  // Get all categories
  const categories = await db.collection("categories").find({}).toArray()

  if (categories.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground">No categories yet</p>
      </div>
    )
  }

  // Get all transactions
  const transactions = await db
    .collection("transactions")
    .find({ amount: { $lt: 0 } }) // Only expenses
    .toArray()

  // Calculate total amount per category
  const categoryData = categories
    .map((category) => {
      const categoryTransactions = transactions.filter((t) => t.categoryId === category._id.toString())

      const amount = categoryTransactions.reduce((sum, t) => sum + t.amount, 0)

      return {
        _id: category._id.toString(),
        name: category.name,
        color: category.color,
        amount,
      }
    })
    .filter((c) => c.amount !== 0)
    .sort((a, b) => a.amount - b.amount) // Sort by amount (ascending since expenses are negative)
    .slice(0, 5) // Get top 5

  if (categoryData.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground">No categorized expenses yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {categoryData.map((category) => (
        <div key={category._id} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
            <span>{category.name}</span>
          </div>
          <span className="font-medium text-red-500">${Math.abs(category.amount).toFixed(2)}</span>
        </div>
      ))}
    </div>
  )
}

async function BudgetVsActualData() {
  const db = await getDb()

  // Get all budgets
  const budgets = await db.collection("budgets").find({}).toArray()

  if (budgets.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground">No budgets yet</p>
      </div>
    )
  }

  // Get all categories
  const categories = await db.collection("categories").find({}).toArray()

  // Create a map for quick lookup
  const categoryMap = categories.reduce(
    (acc, category) => {
      acc[category._id.toString()] = category
      return acc
    },
    {} as Record<string, any>,
  )

  // Get current month's transactions
  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)

  const transactions = await db
    .collection("transactions")
    .find({
      date: {
        $gte: monthStart,
        $lte: monthEnd,
      },
      amount: { $lt: 0 }, // Only expenses
    })
    .toArray()

  // Calculate actual spending for each budget
  const chartData = budgets
    .map((budget) => {
      const category = categoryMap[budget.categoryId.toString()]

      if (!category) return null

      // Calculate spent amount for this category
      const categoryTransactions = transactions.filter((t) => t.categoryId === budget.categoryId)

      const spentAmount = categoryTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0)

      return {
        category: category.name,
        budget: budget.amount,
        actual: spentAmount,
        color: category.color,
      }
    })
    .filter(Boolean)

  return <BudgetVsActualChart data={chartData} />
}

async function BudgetAlerts() {
  const db = await getDb()

  // Get all budgets
  const budgets = await db.collection("budgets").find({}).toArray()

  if (budgets.length === 0) {
    return null
  }

  // Get all categories
  const categories = await db.collection("categories").find({}).toArray()

  // Create a map for quick lookup
  const categoryMap = categories.reduce(
    (acc, category) => {
      acc[category._id.toString()] = category
      return acc
    },
    {} as Record<string, any>,
  )

  // Get current month's transactions
  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)

  const transactions = await db
    .collection("transactions")
    .find({
      date: {
        $gte: monthStart,
        $lte: monthEnd,
      },
      amount: { $lt: 0 }, // Only expenses
    })
    .toArray()

  // Find budgets that are over or close to limit
  const alerts = []

  for (const budget of budgets) {
    const category = categoryMap[budget.categoryId.toString()]

    if (!category) continue

    // Calculate spent amount for this category
    const categoryTransactions = transactions.filter((t) => t.categoryId === budget.categoryId)

    const spentAmount = categoryTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0)

    const percentSpent = (spentAmount / budget.amount) * 100

    if (percentSpent >= 100) {
      alerts.push({
        category,
        budget,
        spentAmount,
        percentSpent,
        type: "over",
      })
    } else if (percentSpent >= 90) {
      alerts.push({
        category,
        budget,
        spentAmount,
        percentSpent,
        type: "warning",
      })
    }
  }

  if (alerts.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      {alerts.map((alert, index) => (
        <Alert key={index} variant={alert.type === "over" ? "destructive" : "default"}>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>
            {alert.type === "over"
              ? `Budget Exceeded: ${alert.category.name}`
              : `Budget Warning: ${alert.category.name}`}
          </AlertTitle>
          <AlertDescription>
            {alert.type === "over"
              ? `You've spent $${alert.spentAmount.toFixed(2)} of your $${alert.budget.amount.toFixed(2)} budget (${Math.round(alert.percentSpent)}%).`
              : `You've spent $${alert.spentAmount.toFixed(2)} of your $${alert.budget.amount.toFixed(2)} budget (${Math.round(alert.percentSpent)}%).`}
          </AlertDescription>
        </Alert>
      ))}
    </div>
  )
}

async function BudgetStatusList() {
  const db = await getDb()

  // Get all budgets
  const budgets = await db.collection("budgets").find({}).toArray()

  if (budgets.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground">No budgets yet</p>
      </div>
    )
  }

  // Get all categories
  const categories = await db.collection("categories").find({}).toArray()

  // Create a map for quick lookup
  const categoryMap = categories.reduce(
    (acc, category) => {
      acc[category._id.toString()] = category
      return acc
    },
    {} as Record<string, any>,
  )

  // Get current month's transactions
  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)

  const transactions = await db
    .collection("transactions")
    .find({
      date: {
        $gte: monthStart,
        $lte: monthEnd,
      },
      amount: { $lt: 0 }, // Only expenses
    })
    .toArray()

  return (
    <div className="space-y-4">
      {budgets.map((budget) => {
        const category = categoryMap[budget.categoryId.toString()]

        if (!category) return null

        // Calculate spent amount for this category
        const categoryTransactions = transactions.filter((t) => t.categoryId === budget.categoryId)

        const spentAmount = categoryTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0)

        const percentSpent = Math.min(Math.round((spentAmount / budget.amount) * 100), 100)

        // Determine status color
        let statusColor = "bg-green-500"
        if (percentSpent > 90) {
          statusColor = "bg-red-500"
        } else if (percentSpent > 75) {
          statusColor = "bg-yellow-500"
        }

        return (
          <div key={budget._id.toString()} className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                <span className="font-medium">{category.name}</span>
              </div>
              <div className="text-sm">
                ${spentAmount.toFixed(2)} / ${budget.amount.toFixed(2)}
              </div>
            </div>
            <div className="space-y-1">
              <Progress value={percentSpent} className="h-2" indicatorClassName={statusColor} />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Remaining: ${(budget.amount - spentAmount).toFixed(2)}</span>
                <span className={percentSpent > 90 ? "text-red-500 font-medium" : ""}>{percentSpent}%</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

