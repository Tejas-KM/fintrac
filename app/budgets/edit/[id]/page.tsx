import { notFound } from "next/navigation"
import { ObjectId } from "mongodb"

import { getDb } from "@/lib/db"
import { BudgetForm } from "@/components/budget-form"

export const dynamic = "force-dynamic"

interface PageProps {
  params: {
    id: string
  }
}

export default async function EditBudgetPage({ params }: PageProps) {
  const db = await getDb()

  let budget
  try {
    budget = await db.collection("budgets").findOne({ _id: new ObjectId(params.id) })
  } catch (error) {
    notFound()
  }

  if (!budget) {
    notFound()
  }

  return (
    <div className="container max-w-2xl py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Edit Budget</h1>
      <BudgetForm budget={budget} />
    </div>
  )
}

