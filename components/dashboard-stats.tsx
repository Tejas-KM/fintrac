import { DollarSign, TrendingDown, TrendingUp, Target } from "lucide-react"
import { startOfMonth, endOfMonth } from "date-fns"

import { getDb } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export async function DashboardStats() {
  const db = await getDb()

  // Get all transactions
  const transactions = await db.collection("transactions").find({}).toArray()

  // Get all categories
  const categories = await db.collection("categories").find({}).toArray()

  // Get all budgets
  const budgets = await db.collection("budgets").find({}).toArray()

  // Get current month's transactions
  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)

  const currentMonthTransactions = transactions.filter(
    (t) => new Date(t.date) >= monthStart && new Date(t.date) <= monthEnd,
  )

  // Calculate total income, expenses, and balance
  const stats = transactions.reduce(
    (acc, transaction) => {
      if (transaction.amount > 0) {
        acc.income += transaction.amount
      } else {
        acc.expenses += Math.abs(transaction.amount)
      }
      acc.balance += transaction.amount

      // Count categorized transactions
      if (transaction.categoryId) {
        acc.categorized++
      }

      return acc
    },
    { income: 0, expenses: 0, balance: 0, categorized: 0 },
  )

  // Calculate current month's expenses
  const currentMonthExpenses = currentMonthTransactions.reduce(
    (sum, t) => (t.amount < 0 ? sum + Math.abs(t.amount) : sum),
    0,
  )

  // Calculate total budget amount
  const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0)

  // Calculate percentage of budget used
  const budgetUsedPercentage = totalBudget > 0 ? Math.round((currentMonthExpenses / totalBudget) * 100) : 0

  // Calculate percentage of categorized transactions
  const categorizedPercentage =
    transactions.length > 0 ? Math.round((stats.categorized / transactions.length) * 100) : 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${stats.balance.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">Your current financial balance</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Income</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-500">${stats.income.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">Total money coming in</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Expenses</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-500">${stats.expenses.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">Total money going out</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Budget Status</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{budgetUsedPercentage}%</div>
          <p className="text-xs text-muted-foreground">
            {totalBudget > 0
              ? `$${currentMonthExpenses.toFixed(2)} of $${totalBudget.toFixed(2)} budget used`
              : "No budgets set"}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

