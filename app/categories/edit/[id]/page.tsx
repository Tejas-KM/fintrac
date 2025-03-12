import { notFound } from "next/navigation"
import { ObjectId } from "mongodb"

import { getDb } from "@/lib/db"
import { CategoryForm } from "@/components/category-form"

export const dynamic = "force-dynamic"

interface PageProps {
  params: {
    id: string
  }
}

export default async function EditCategoryPage({ params }: PageProps) {
  const db = await getDb()

  let category
  try {
    category = await db.collection("categories").findOne({ _id: new ObjectId(params.id) })
  } catch (error) {
    notFound()
  }

  if (!category) {
    notFound()
  }

  return (
    <div className="container max-w-2xl py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Edit Category</h1>
      <CategoryForm category={category} />
    </div>
  )
}

