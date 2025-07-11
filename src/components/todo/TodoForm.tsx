"use client";

import { createTodo, updateTodo } from "@/actions/todo-actions";
import { useTransition } from "react";
import { useTodoStore } from "@/store/Store";
import { useEffect, useRef, useState } from "react";
import { Category } from "@/generated/prisma";

interface TodoFormProps {
  categories: Category[];
}

export const TodoForm = ({ categories }: TodoFormProps) => {
  const { editingTodo, isEditMode, clearEditingTodo } = useTodoStore();
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState<{ message?: string; error?: string } | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Initialize selected categories when editing
  useEffect(() => {
    if (editingTodo) {
      setSelectedCategories(editingTodo.categories.map(cat => cat.id));
    } else {
      setSelectedCategories([]);
    }
  }, [editingTodo]);

  // Clear edit mode when form is successfully submitted
  useEffect(() => {
    if (data?.message) {
      clearEditingTodo();
      setData(null);
      setSelectedCategories([]);
    }
  }, [data?.message, clearEditingTodo]);

  const handleCancel = () => {
    clearEditingTodo();
    setData(null);
    setSelectedCategories([]);
    // Reset the form
    if (formRef.current) {
      formRef.current.reset();
    }
  };

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories(prev => [...prev, categoryId]);
    } else {
      setSelectedCategories(prev => prev.filter(id => id !== categoryId));
    }
  };

  const handleSubmit = (formData: FormData) => {
    // Add selected categories to form data
    selectedCategories.forEach(categoryId => {
      formData.append("categoryIds", categoryId);
    });

    startTransition(async () => {
      try {
        const result = isEditMode 
          ? await updateTodo(null, formData)
          : await createTodo(null, formData);
        
        setData(result);
      } catch {
        setData({ error: "An error occurred" });
      }
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 h-fit">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        {isEditMode ? "Edit Todo" : "Create New Todo"}
      </h2>
      
      <form 
        ref={formRef}
        action={handleSubmit} 
        className="space-y-4"
      >
        {isEditMode && editingTodo && (
          <input 
            type="hidden" 
            name="todoId" 
            value={editingTodo.id} 
          />
        )}
        
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Todo Title
          </label>
          <input 
            type="text" 
            id="title"
            name="title" 
            placeholder="Enter todo title..." 
            defaultValue={editingTodo?.title || ""}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            required
          />
        </div>

        {categories.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Categories (Optional)
            </label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {categories.map((category) => (
                <label key={category.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category.id)}
                    onChange={(e) => handleCategoryChange(category.id, e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {category.name}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}
        
        {data?.error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-600 dark:text-red-400">
              {data.error}
            </p>
          </div>
        )}
        
        <div className="flex gap-3">
          <button 
            type="submit"
            disabled={isPending}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed"
          >
            {isPending 
              ? (isEditMode ? "Updating..." : "Creating...") 
              : (isEditMode ? "Update Todo" : "Create Todo")
            }
          </button>
          
          {isEditMode && (
            <button 
              type="button"
              onClick={handleCancel}
              disabled={isPending}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}; 