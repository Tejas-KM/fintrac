import { notFound } from "next/navigation"
import { ObjectId } from "mongodb"

import { getDb } from "@/lib/db"
import { TransactionForm } from "@/components/transaction-form"

export const dynamic = "force-dynamic"

interface PageProps {
  params: {
    id: string
  }
}

export default async function EditTransactionPage({ params }: PageProps) {
  const db = await getDb()

  let transaction
  try {
    transaction = await db.collection("transactions").findOne({ _id: new ObjectId(params.id) })
  } catch (error) {
    notFound()
  }

  if (!transaction) {
    notFound()
  }

  return (
    <div className="container max-w-2xl py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Edit Transaction</h1>
      <TransactionForm transaction={transaction} />
    </div>
  )
}

