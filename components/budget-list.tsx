import { Edit, Trash2 } from "lucide-react"

import { getDb } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { deleteBudget } from "@/app/budgets/actions"
import { startOfMonth, endOfMonth } from "date-fns"

export async function BudgetList() {
  const db = await getDb()
  const budgets = await db.collection("budgets").find({}).sort({ categoryId: 1 }).toArray()

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

  if (budgets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h3 className="text-lg font-medium">No budgets yet</h3>
        <p className="text-sm text-muted-foreground mt-1">Add your first budget to start tracking your spending.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {budgets.map((budget) => {
        const category = budget.categoryId ? categoryMap[budget.categoryId.toString()] : null

        // Calculate spent amount for this category
        const categoryTransactions = transactions.filter((t) => t.categoryId === budget.categoryId)

        const spentAmount = categoryTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0)

        const budgetAmount = budget.amount
        const percentSpent = Math.min(Math.round((spentAmount / budgetAmount) * 100), 100)

        // Determine status color
        let statusColor = "bg-green-500"
        if (percentSpent > 90) {
          statusColor = "bg-red-500"
        } else if (percentSpent > 75) {
          statusColor = "bg-yellow-500"
        }

        return (
          <Card key={budget._id.toString()}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center gap-2">
                  {category && <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }} />}
                  {category ? category.name : "Uncategorized"}
                </CardTitle>
                <div className="text-lg font-semibold">${budgetAmount.toFixed(2)}</div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Spent: ${spentAmount.toFixed(2)}</span>
                  <span className={percentSpent > 90 ? "text-red-500 font-medium" : ""}>{percentSpent}%</span>
                </div>
                <Progress value={percentSpent} className="h-2" indicatorClassName={statusColor} />
              </div>
              <p className="text-sm text-muted-foreground">Remaining: ${(budgetAmount - spentAmount).toFixed(2)}</p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <form action={deleteBudget}>
                <input type="hidden" name="id" value={budget._id.toString()} />
                <Button variant="ghost" size="sm" type="submit">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </form>
              <Button variant="ghost" size="sm" asChild>
                <a href={`/budgets/edit/${budget._id.toString()}`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </a>
              </Button>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}

