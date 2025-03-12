import { formatDistanceToNow } from "date-fns"
import { Edit, Trash2 } from "lucide-react"

import { getDb } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { deleteTransaction } from "@/app/transactions/actions"
import { Badge } from "@/components/ui/badge"

export async function TransactionList() {
  const db = await getDb()
  const transactions = await db.collection("transactions").find({}).sort({ date: -1 }).toArray()

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
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h3 className="text-lg font-medium">No transactions yet</h3>
        <p className="text-sm text-muted-foreground mt-1">Add your first transaction to get started.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {transactions.map((transaction) => {
        const category = transaction.categoryId ? categoryMap[transaction.categoryId.toString()] : null

        return (
          <Card key={transaction._id.toString()}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{transaction.description}</CardTitle>
                  <CardDescription>
                    {formatDistanceToNow(new Date(transaction.date), { addSuffix: true })}
                  </CardDescription>
                </div>
                <div className={`text-lg font-semibold ${transaction.amount < 0 ? "text-red-500" : "text-green-500"}`}>
                  ${Math.abs(transaction.amount).toFixed(2)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <p className="text-sm text-muted-foreground">{new Date(transaction.date).toLocaleDateString()}</p>
                {category && (
                  <Badge variant="outline" className="w-fit flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: category.color }} />
                    {category.name}
                  </Badge>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <form action={deleteTransaction}>
                <input type="hidden" name="id" value={transaction._id.toString()} />
                <Button variant="ghost" size="sm" type="submit">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </form>
              <Button variant="ghost" size="sm" asChild>
                <a href={`/transactions/edit/${transaction._id.toString()}`}>
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

