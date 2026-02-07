"use client";

import { createCategory, updateCategory } from "@/actions/category-actions";
import { useTransition } from "react";
import { useCategoryStore } from "@/store/Store";
import { useEffect, useRef, useState } from "react";
import { Button, Input, Label, Card } from "@heroui/react";

export const CategoryForm = () => {
  const { editingCategory, isEditMode, clearEditingCategory } = useCategoryStore();
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState<{ message?: string; error?: string } | null>(null);

  useEffect(() => {
    if (data?.message) {
      clearEditingCategory();
      setData(null);
    }
  }, [data?.message, clearEditingCategory]);

  const handleCancel = () => {
    clearEditingCategory();
    setData(null);
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
    <Card className="h-fit shadow-md">
      <Card.Header>
        <Card.Title className="text-gray-900 dark:text-white text-xl font-bold">
          {isEditMode ? "Edit Category" : "Create New Category"}
        </Card.Title>
      </Card.Header>
      <Card.Content>
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

          <div className="flex flex-col gap-1">
            <Label htmlFor="name" className="text-gray-700 dark:text-gray-200 font-medium">Category Name</Label>
            <Input
              type="text"
              id="name"
              name="name"
              placeholder="Enter category name..."
              defaultValue={editingCategory?.name || ""}
              required
              fullWidth
              className="border-gray-300 text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="slug" className="text-gray-700 dark:text-gray-200 font-medium">Category Slug</Label>
            <Input
              type="text"
              id="slug"
              name="slug"
              placeholder="Enter category slug (e.g., work-tasks)"
              defaultValue={editingCategory?.slug || ""}
              required
              fullWidth
              className="border-gray-300 text-gray-900 dark:text-white"
            />
            <p className="text-sm text-gray-600 dark:text-gray-400">
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
            <Button
              type="submit"
              isDisabled={isPending}
              className="flex-1"
            >
              {isPending
                ? (isEditMode ? "Updating..." : "Creating...")
                : (isEditMode ? "Update Category" : "Create Category")
              }
            </Button>

            {isEditMode && (
              <Button
                type="button"
                variant="secondary"
                onPress={handleCancel}
                isDisabled={isPending}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </Card.Content>
    </Card>
  );
};
