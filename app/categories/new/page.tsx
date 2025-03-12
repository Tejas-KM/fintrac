import { CategoryForm } from "@/components/category-form"

export default function NewCategoryPage() {
  return (
    <div className="container max-w-2xl py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Add Category</h1>
      <CategoryForm />
    </div>
  )
}

