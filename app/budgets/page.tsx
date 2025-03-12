import { Suspense } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { BudgetList } from "@/components/budget-list"
import { BudgetListSkeleton } from "@/components/budget-list-skeleton"

export const dynamic = "force-dynamic"

export default function BudgetsPage() {
  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Budgets</h1>
        <Link href="/budgets/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Budget
          </Button>
        </Link>
      </div>

      <Suspense fallback={<BudgetListSkeleton />}>
        <BudgetList />
      </Suspense>
    </div>
  )
}

