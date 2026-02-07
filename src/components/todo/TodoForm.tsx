"use client";

import { createTodo, updateTodo } from "@/actions/todo-actions";
import { useTransition } from "react";
import { useTodoStore } from "@/store/Store";
import { useEffect, useRef, useState } from "react";
import { Category } from "@/generated/prisma";
import { Button, Input, Label, Checkbox, Card } from "@heroui/react";

interface TodoFormProps {
  categories: Category[];
}

export const TodoForm = ({ categories }: TodoFormProps) => {
  const { editingTodo, isEditMode, clearEditingTodo } = useTodoStore();
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState<{ message?: string; error?: string } | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    if (editingTodo) {
      setSelectedCategories(editingTodo.categories.map(cat => cat.id));
    } else {
      setSelectedCategories([]);
    }
  }, [editingTodo]);

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
    <Card className="h-fit shadow-md">
      <Card.Header>
        <Card.Title className="text-gray-900 dark:text-white text-xl font-bold">
          {isEditMode ? "Edit Todo" : "Create New Todo"}
        </Card.Title>
      </Card.Header>
      <Card.Content>
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

          <div className="flex flex-col gap-1">
            <Label htmlFor="title" className="text-gray-700 dark:text-gray-200 font-medium">Todo Title</Label>
            <Input
              type="text"
              id="title"
              name="title"
              placeholder="Enter todo title..."
              defaultValue={editingTodo?.title || ""}
              required
              fullWidth
              className="border-gray-300 text-gray-900 dark:text-white"
            />
          </div>

          {categories.length > 0 && (
            <div className="flex flex-col gap-2">
              <Label className="text-gray-700 dark:text-gray-200 font-medium">Categories (Optional)</Label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center gap-3">
                    <Checkbox
                      id={`cat-${category.id}`}
                      isSelected={selectedCategories.includes(category.id)}
                      onChange={(checked) => handleCategoryChange(category.id, checked)}
                    >
                      <Checkbox.Control className="border-gray-400">
                        <Checkbox.Indicator />
                      </Checkbox.Control>
                    </Checkbox>
                    <Label htmlFor={`cat-${category.id}`} className="cursor-pointer text-gray-700 dark:text-gray-200">
                      {category.name}
                    </Label>
                  </div>
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
            <Button
              type="submit"
              isDisabled={isPending}
              className="flex-1"
            >
              {isPending
                ? (isEditMode ? "Updating..." : "Creating...")
                : (isEditMode ? "Update Todo" : "Create Todo")
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
