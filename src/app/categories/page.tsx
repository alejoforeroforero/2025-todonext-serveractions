import { CategoryForm } from "@/components";
import { CategoryList } from "@/components";
import { CategoryToggle } from "@/components/category/CategoryToggle";
import { getCategories } from "@/actions/category-actions";

export default async function CategoryPage() {
  const categories = await getCategories();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Centered Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Manage Categories
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Organize your tasks with custom categories
          </p>
        </div>

        {/* Responsive Layout */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Category List Section */}
          <div className="order-1">
            <CategoryToggle>
              <CategoryList initialCategories={categories} />
            </CategoryToggle>
          </div>

          {/* Category Form Section */}
          <div className="order-2">
            <CategoryForm />
          </div>
        </div>
      </div>
    </div>
  );
}
