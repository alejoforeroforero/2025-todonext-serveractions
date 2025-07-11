"use client";

import { Category } from "@/generated/prisma";
import { useCategoryStore } from "@/store/Store";
import { deleteCategory } from "@/actions/category-actions";
import { useEffect, useState } from "react";
import { Modal } from "@/components";

interface CategoryListProps {
  initialCategories: Category[];
}

export const CategoryList = ({ initialCategories }: CategoryListProps) => {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const { editingCategory, setEditingCategory } = useCategoryStore();
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; category: Category | null }>({
    isOpen: false,
    category: null
  });
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; message: string }>({
    isOpen: false,
    message: ""
  });

  // Update categories when initialCategories prop changes (from server revalidation)
  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  // Refresh categories when edit mode is cleared (after successful update)
  useEffect(() => {
    if (!editingCategory) {
      // The server component will re-render with fresh data due to revalidatePath
      // So we don't need to manually fetch here
    }
  }, [editingCategory]);

  const handleCategoryClick = (category: Category) => {
    setEditingCategory(category);
  };

  const handleDeleteCategory = (e: React.MouseEvent, category: Category) => {
    e.stopPropagation(); // Prevent triggering the category click
    setDeleteModal({ isOpen: true, category });
  };

  const confirmDeleteCategory = async () => {
    if (deleteModal.category) {
      try {
        await deleteCategory(deleteModal.category.id);
        // Remove the category from local state
        setCategories(prev => prev.filter(c => c.id !== deleteModal.category!.id));
      } catch (error) {
        console.error('Failed to delete category:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete category';
        setErrorModal({ isOpen: true, message: errorMessage });
      }
    }
  };

  return (
    <>
      <div className="space-y-4">
        {categories.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-6xl mb-4">📁</div>
            <p className="text-gray-500 dark:text-gray-400">No categories found</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm">Create your first category to get started</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {categories.map((category: Category) => {
              const isEditing = editingCategory?.id === category.id;
              return (
                <div
                  key={category.id}
                  onClick={() => handleCategoryClick(category)}
                  className={`bg-white dark:bg-gray-700 border rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group ${
                    isEditing 
                      ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                      : 'border-gray-200 dark:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        isEditing ? 'bg-blue-600' : 'bg-blue-500'
                      }`}></div>
                      <span className={`font-medium transition-colors ${
                        isEditing 
                          ? 'text-blue-700 dark:text-blue-300' 
                          : 'text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                      }`}>
                        {category.name}
                      </span>
                      {isEditing && (
                        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                          Editing
                        </span>
                      )}
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-2">
                      {/* Edit icon */}
                      <svg
                        className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      {/* Delete icon */}
                      <button
                        onClick={(e) => handleDeleteCategory(e, category)}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                        title="Delete category"
                      >
                        <svg
                          className="w-5 h-5 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, category: null })}
        onConfirm={confirmDeleteCategory}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteModal.category?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      {/* Error Modal */}
      <Modal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ isOpen: false, message: "" })}
        onConfirm={() => setErrorModal({ isOpen: false, message: "" })}
        title="Error"
        message={errorModal.message}
        confirmText="OK"
        type="danger"
      />
    </>
  );
};
