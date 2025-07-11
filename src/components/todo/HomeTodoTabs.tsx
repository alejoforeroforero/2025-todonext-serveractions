import { getTodos } from "@/actions/todo-actions";
import { getCategories } from "@/actions/category-actions";
import { TodoTabs } from "./TodoTabs";

export const HomeTodoTabs = async () => {
  // Fetch todos and categories for the tab system
  const [todos, categories] = await Promise.all([
    getTodos(),
    getCategories()
  ]);

  return <TodoTabs initialTodos={todos} categories={categories} />;
}; 