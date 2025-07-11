import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { redirect } from "next/navigation";
import { getTodosByCategoryIdOrSlug } from "@/actions/todo-actions";
import { getCategoryByIdOrSlug } from "@/actions/category-actions";
import { getCategories } from "@/actions/category-actions";
import { TodoTabs } from "@/components";

interface CategoryPageProps {
  params: {
    id: string;
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }

  const categoryIdentifier = params.id;
  
  // Fetch the specific category, todos for this category, and all categories
  const [currentCategory, todos, categories] = await Promise.all([
    getCategoryByIdOrSlug(categoryIdentifier),
    getTodosByCategoryIdOrSlug(categoryIdentifier),
    getCategories()
  ]);

  if (!currentCategory) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {currentCategory.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {todos.length} todo{todos.length !== 1 ? 's' : ''} in this category
          </p>
        </div>

        {/* Todo Tabs */}
        <TodoTabs initialTodos={todos} categories={categories} />
      </div>
    </div>
  );
} 