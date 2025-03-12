"use server"

import { revalidatePath } from "next/cache"
import { ObjectId } from "mongodb"

import { getDb } from "@/lib/db"

export async function createCategory(data: {
  name: string
  description?: string
  color: string
}) {
  try {
    const db = await getDb()

    await db.collection("categories").insertOne({
      ...data,
      createdAt: new Date(),
    })

    revalidatePath("/categories")
    revalidatePath("/dashboard")
    revalidatePath("/transactions")

    return { success: true }
  } catch (error) {
    console.error("Error creating category:", error)
    return { success: false, error: "Failed to create category" }
  }
}

export async function updateCategory(data: {
  id: string
  name: string
  description?: string
  color: string
}) {
  try {
    const { id, ...updateData } = data
    const db = await getDb()

    await db.collection("categories").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      },
    )

    revalidatePath("/categories")
    revalidatePath("/dashboard")
    revalidatePath("/transactions")

    return { success: true }
  } catch (error) {
    console.error("Error updating category:", error)
    return { success: false, error: "Failed to update category" }
  }
}

export async function deleteCategory(formData: FormData) {
  try {
    const id = formData.get("id") as string

    const db = await getDb()

    // First check if there are any transactions using this category
    const transactionsWithCategory = await db.collection("transactions").countDocuments({
      categoryId: id,
    })

    if (transactionsWithCategory > 0) {
      // If there are transactions, we should handle this gracefully
      return {
        success: false,
        error:
          "Cannot delete category with associated transactions. Please reassign or delete those transactions first.",
      }
    }

    await db.collection("categories").deleteOne({ _id: new ObjectId(id) })

    revalidatePath("/categories")
    revalidatePath("/dashboard")
    revalidatePath("/transactions")

    return { success: true }
  } catch (error) {
    console.error("Error deleting category:", error)
    return { success: false, error: "Failed to delete category" }
  }
}

