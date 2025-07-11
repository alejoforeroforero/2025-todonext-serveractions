"use client";

import { Category, Todo } from "@/generated/prisma";
import { TodoList } from "./TodoList";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface TodoTabsProps {
  initialTodos: (Todo & { categories: Category[] })[];
  categories: Category[];
  showTodoList?: boolean;
}

export const TodoTabs = ({ initialTodos, categories, showTodoList = true }: TodoTabsProps) => {
  const pathname = usePathname();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 px-6 overflow-x-auto" aria-label="Tabs">
          {/* All Todos Tab */}
          <Link
            href="/"
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 whitespace-nowrap ${
              pathname === "/"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            All Todos
            <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-300 py-0.5 px-2.5 rounded-full text-xs font-medium">
              {initialTodos.length}
            </span>
          </Link>

          {/* Category Tabs */}
          {categories.map((category) => {
            const categoryTodoCount = initialTodos.filter(todo => 
              todo.categories.some(cat => cat.id === category.id)
            ).length;
            
            // Use slug if available, otherwise fall back to id
            const categoryPath = category.slug ? `/category/${category.slug}` : `/category/${category.id}`;
            const isActive = pathname === categoryPath;

            return (
              <Link
                key={category.id}
                href={categoryPath}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 whitespace-nowrap ${
                  isActive
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                {category.name}
                <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-300 py-0.5 px-2.5 rounded-full text-xs font-medium">
                  {categoryTodoCount}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {showTodoList && (
        <div className="p-6">
          <TodoList initialTodos={initialTodos} />
        </div>
      )}
    </div>
  );
}; 