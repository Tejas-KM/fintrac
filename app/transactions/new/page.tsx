import { TransactionForm } from "@/components/transaction-form"

export default function NewTransactionPage() {
  return (
    <div className="container max-w-2xl py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Add Transaction</h1>
      <TransactionForm />
    </div>
  )
}

