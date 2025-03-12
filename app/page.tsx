import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-screen py-12 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Personal Finance Visualizer</h1>
        <p className="text-muted-foreground max-w-[600px]">
          Track your expenses, manage categories, and set budgets to take control of your financial life
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        <Card>
          <CardHeader>
            <CardTitle>Transaction Tracking</CardTitle>
            <CardDescription>Add, edit, and delete your financial transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Record all your expenses and income with detailed descriptions and dates.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/transactions" className="w-full">
              <Button className="w-full">
                View Transactions
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
            <CardDescription>Organize transactions by categories</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Categorize your spending to better understand where your money goes each month.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/categories" className="w-full">
              <Button className="w-full" variant="outline">
                Manage Categories
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Budget Planning</CardTitle>
            <CardDescription>Set and track your monthly budgets</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Create budgets for different categories and track your progress throughout the month.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/budgets" className="w-full">
              <Button className="w-full" variant="outline">
                Manage Budgets
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      <div className="flex justify-center">
        <Link href="/dashboard">
          <Button size="lg" className="gap-2">
            Go to Dashboard
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  )
}

