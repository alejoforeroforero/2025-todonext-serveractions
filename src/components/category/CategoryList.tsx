"use client";

import { Category } from "@/generated/prisma";
import { useCategoryStore } from "@/store/Store";
import { deleteCategory } from "@/actions/category-actions";
import { useEffect, useState } from "react";
import { Modal } from "@/components";
import { Button, Card } from "@heroui/react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

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

  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  const handleCategoryClick = (category: Category) => {
    setEditingCategory(category);
  };

  const handleDeleteCategory = (e: React.MouseEvent, category: Category) => {
    e.stopPropagation();
    setDeleteModal({ isOpen: true, category });
  };

  const confirmDeleteCategory = async () => {
    if (deleteModal.category) {
      try {
        await deleteCategory(deleteModal.category.id);
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
                <Card
                  key={category.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    isEditing
                      ? 'border-purple-500 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/20'
                      : ''
                  }`}
                >
                  <Card.Content className="p-4" onClick={() => handleCategoryClick(category)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          isEditing ? 'bg-purple-600' : 'bg-purple-500'
                        }`}></div>
                        <span className={`font-medium transition-colors ${
                          isEditing
                            ? 'text-purple-700 dark:text-purple-300'
                            : 'text-gray-800 dark:text-gray-200'
                        }`}>
                          {category.name}
                        </span>
                        {isEditing && (
                          <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded-full">
                            Editing
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          isIconOnly
                          size="sm"
                          onPress={() => handleCategoryClick(category)}
                        >
                          <PencilIcon className="w-5 h-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          isIconOnly
                          size="sm"
                          onPress={(e) => {
                            e.continuePropagation?.();
                            setDeleteModal({ isOpen: true, category });
                          }}
                          className="hover:text-red-500"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  </Card.Content>
                </Card>
              );
            })}
          </div>
        )}
      </div>

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
