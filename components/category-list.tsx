import { Edit, Trash2 } from "lucide-react"

import { getDb } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { deleteCategory } from "@/app/categories/actions"

export async function CategoryList() {
  const db = await getDb()
  const categories = await db.collection("categories").find({}).sort({ name: 1 }).toArray()

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h3 className="text-lg font-medium">No categories yet</h3>
        <p className="text-sm text-muted-foreground mt-1">Add your first category to organize your transactions.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => (
        <Card key={category._id.toString()}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }} />
                {category.name}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{category.description || "No description provided"}</p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <form action={deleteCategory}>
              <input type="hidden" name="id" value={category._id.toString()} />
              <Button variant="ghost" size="sm" type="submit">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </form>
            <Button variant="ghost" size="sm" asChild>
              <a href={`/categories/edit/${category._id.toString()}`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </a>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

