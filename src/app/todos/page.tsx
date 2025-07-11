import { TodoForm } from "@/components";
import { TodoList } from "@/components";
import { TodoToggle } from "@/components/todo/TodoToggle";
import { getTodos } from "@/actions/todo-actions";
import { getCategories } from "@/actions/category-actions";

export default async function TodosPage() {
  const [todos, categories] = await Promise.all([
    getTodos(),
    getCategories()
  ]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Centered Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            My Todos
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Stay organized and boost your productivity
          </p>
        </div>

        {/* Responsive Layout */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Todo List Section */}
          <div className="lg:col-span-2 order-1">
            <TodoToggle>
              <TodoList initialTodos={todos} />
            </TodoToggle>
          </div>

          {/* Todo Form Section */}
          <div className="order-2">
            <TodoForm categories={categories} />
          </div>
        </div>
      </div>
    </div>
  );
} 