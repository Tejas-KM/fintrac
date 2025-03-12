import { BudgetForm } from "@/components/budget-form"

export const dynamic = "force-dynamic"

export default function NewBudgetPage() {
  return (
    <div className="container max-w-2xl py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Add Budget</h1>
      <BudgetForm />
    </div>
  )
}

