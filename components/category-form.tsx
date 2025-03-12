"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useState } from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { createCategory, updateCategory } from "@/app/categories/actions"
import { toast } from "@/components/ui/use-toast"

const COLORS = [
  "#f87171", // red
  "#fb923c", // orange
  "#fbbf24", // amber
  "#facc15", // yellow
  "#a3e635", // lime
  "#4ade80", // green
  "#34d399", // emerald
  "#2dd4bf", // teal
  "#22d3ee", // cyan
  "#38bdf8", // sky
  "#60a5fa", // blue
  "#818cf8", // indigo
  "#a78bfa", // violet
  "#c084fc", // purple
  "#e879f9", // fuchsia
  "#f472b6", // pink
  "#fb7185", // rose
]

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, {
    message: "Color must be a valid hex color code.",
  }),
})

type FormValues = z.infer<typeof formSchema>

interface CategoryFormProps {
  category?: any
}

export function CategoryForm({ category }: CategoryFormProps) {
  const router = useRouter()
  const isEditing = !!category
  const [isSubmitting, setIsSubmitting] = useState(false)

  const defaultValues: Partial<FormValues> = {
    name: category?.name || "",
    description: category?.description || "",
    color: category?.color || COLORS[0],
  }

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true)
    try {
      let result

      if (isEditing) {
        result = await updateCategory({
          id: category._id.toString(),
          ...data,
        })
      } else {
        result = await createCategory(data)
      }

      if (!result.success) {
        throw new Error(result.error || "Something went wrong")
      }

      toast({
        title: isEditing ? "Category updated" : "Category created",
        description: isEditing
          ? "Your category has been updated successfully."
          : "Your category has been created successfully.",
      })

      router.push("/categories")
      router.refresh()
    } catch (error) {
      console.error("Error submitting category:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Groceries" {...field} />
              </FormControl>
              <FormDescription>A name for this category.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Food and household items" className="resize-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color</FormLabel>
              <FormControl>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((color) => (
                    <div
                      key={color}
                      className={cn(
                        "w-8 h-8 rounded-full cursor-pointer border-2",
                        field.value === color ? "border-primary" : "border-transparent",
                      )}
                      style={{ backgroundColor: color }}
                      onClick={() => form.setValue("color", color)}
                    />
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : isEditing ? "Update" : "Create"} Category
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}

