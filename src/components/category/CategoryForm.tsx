"use client";

import { createCategory, updateCategory } from "@/actions/category-actions";
import { useTransition } from "react";
import { useCategoryStore } from "@/store/Store";
import { useEffect, useRef, useState } from "react";

export const CategoryForm = () => {
  const { editingCategory, isEditMode, clearEditingCategory } = useCategoryStore();
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState<{ message?: string; error?: string } | null>(null);

  // Clear edit mode when form is successfully submitted
  useEffect(() => {
    if (data?.message) {
      clearEditingCategory();
      setData(null);
    }
  }, [data?.message, clearEditingCategory]);

  const handleCancel = () => {
    clearEditingCategory();
    setData(null);
    // Reset the form
    if (formRef.current) {
      formRef.current.reset();
    }
  };

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      try {
        const result = isEditMode 
          ? await updateCategory(null, formData)
          : await createCategory(null, formData);
        
        setData(result);
      } catch {
        setData({ error: "An error occurred" });
      }
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 h-fit">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        {isEditMode ? "Edit Category" : "Create New Category"}
      </h2>
      
      <form 
        ref={formRef}
        action={handleSubmit} 
        className="space-y-4"
      >
        {isEditMode && editingCategory && (
          <input 
            type="hidden" 
            name="categoryId" 
            value={editingCategory.id} 
          />
        )}
        
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category Name
          </label>
          <input 
            type="text" 
            id="name"
            name="name" 
            placeholder="Enter category name..." 
            defaultValue={editingCategory?.name || ""}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            required
          />
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category Slug
          </label>
          <input 
            type="text" 
            id="slug"
            name="slug" 
            placeholder="Enter category slug (e.g., work-tasks)" 
            defaultValue={editingCategory?.slug || ""}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            required
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            A unique identifier for the category (lowercase, no spaces, use hyphens)
          </p>
        </div>
        
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
              : (isEditMode ? "Update Category" : "Create Category")
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
