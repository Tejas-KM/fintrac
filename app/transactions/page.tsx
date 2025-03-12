import { Suspense } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { TransactionList } from "@/components/transaction-list"
import { TransactionListSkeleton } from "@/components/transaction-list-skeleton"

export const dynamic = "force-dynamic"

export default function TransactionsPage() {
  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
        <Link href="/transactions/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>
        </Link>
      </div>

      <Suspense fallback={<TransactionListSkeleton />}>
        <TransactionList />
      </Suspense>
    </div>
  )
}

