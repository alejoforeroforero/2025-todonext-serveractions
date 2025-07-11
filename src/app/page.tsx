import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { UnauthenticatedUser, HomeTodoTabs } from "@/components";
import { getTodos } from "@/actions/todo-actions";
import { getCategories } from "@/actions/category-actions";
import Link from "next/link";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return <UnauthenticatedUser />
  }

  // Fetch todos and categories for the tab system
  const [todos, categories] = await Promise.all([
    getTodos(),
    getCategories()
  ]);

  // Calculate stats
  const totalTodos = todos.length;
  const completedTodos = todos.filter(todo => todo.completed).length;
  const pendingTodos = totalTodos - completedTodos;
  const totalCategories = categories.length;
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome back, {session.user?.name || "User"}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Ready to boost your productivity? Let&apos;s get organized!
          </p>
        </div>

        {/* Todo Tabs Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Your Todos
          </h2>
          <HomeTodoTabs />
        </div>

        {/* Quick Actions Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Todos Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow duration-200">
            <div className="text-center">
              <div className="text-6xl mb-4">📝</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Manage Todos
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Create, organize, and track your tasks with custom categories
              </p>
              <Link 
                href="/todos"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Go to Todos
              </Link>
            </div>
          </div>

          {/* Categories Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow duration-200">
            <div className="text-center">
              <div className="text-6xl mb-4">📁</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Organize Categories
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Create custom categories to better organize your todos
              </p>
              <Link 
                href="/categories"
                className="inline-block bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Manage Categories
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Quick Stats
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalTodos}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Todos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{completedTodos}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{pendingTodos}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{totalCategories}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Categories</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
