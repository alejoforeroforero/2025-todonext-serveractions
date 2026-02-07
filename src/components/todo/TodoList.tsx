"use client";

import { Todo, Category } from "@/generated/prisma";
import { useTodoStore } from "@/store/Store";
import { useEffect, useState } from "react";
import { deleteTodo, toggleTodo } from "@/actions/todo-actions";
import { useTransition } from "react";
import { Modal } from "@/components";
import { Button, Card, Checkbox } from "@heroui/react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

interface TodoListProps {
  initialTodos: (Todo & { categories: Category[] })[];
}

export const TodoList = ({ initialTodos }: TodoListProps) => {
  const [todos, setTodos] = useState<(Todo & { categories: Category[] })[]>(initialTodos);
  const { editingTodo, setEditingTodo } = useTodoStore();
  const [isPending, startTransition] = useTransition();
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; todo: (Todo & { categories: Category[] }) | null }>({
    isOpen: false,
    todo: null
  });

  useEffect(() => {
    setTodos(initialTodos);
  }, [initialTodos]);

  const handleTodoClick = (todo: Todo & { categories: Category[] }) => {
    setEditingTodo(todo);
  };

  const handleToggle = (todoId: string, completed: boolean) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("todoId", todoId);
      formData.append("completed", (!completed).toString());

      await toggleTodo(null, formData);
    });
  };

  const handleDelete = (todo: Todo & { categories: Category[] }) => {
    setDeleteModal({ isOpen: true, todo });
  };

  const confirmDelete = () => {
    if (deleteModal.todo) {
      startTransition(async () => {
        const formData = new FormData();
        formData.append("todoId", deleteModal.todo!.id);

        await deleteTodo(null, formData);
      });
    }
  };

  if (todos.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 text-6xl mb-4">📝</div>
        <p className="text-gray-500 dark:text-gray-400">No todos found</p>
        <p className="text-gray-400 dark:text-gray-500 text-sm">Create your first todo to get started</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {todos.map((todo) => {
          const isEditing = editingTodo?.id === todo.id;
          return (
            <Card
              key={todo.id}
              className={`transition-all duration-200 ${
                isEditing
                  ? 'border-purple-500 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/20'
                  : ''
              } ${todo.completed ? 'opacity-75' : ''}`}
            >
              <Card.Content className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <Checkbox
                      isSelected={todo.completed}
                      onChange={() => handleToggle(todo.id, todo.completed)}
                      isDisabled={isPending}
                      variant="primary"
                    >
                      <Checkbox.Control>
                        <Checkbox.Indicator />
                      </Checkbox.Control>
                    </Checkbox>

                    <div className="flex-1 min-w-0">
                      <div
                        className={`cursor-pointer group ${
                          isEditing ? 'text-purple-700 dark:text-purple-300' : 'text-gray-800 dark:text-gray-200'
                        }`}
                        onClick={() => handleTodoClick(todo)}
                      >
                        <h3 className={`font-medium transition-colors ${
                          todo.completed ? 'line-through text-gray-500 dark:text-gray-400' : ''
                        }`}>
                          {todo.title}
                        </h3>

                        {todo.categories.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {todo.categories.map((category) => (
                              <span
                                key={category.id}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200"
                              >
                                {category.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {isEditing && (
                        <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded-full mt-2 inline-block">
                          Editing
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="ghost"
                      isIconOnly
                      size="sm"
                      onPress={() => handleTodoClick(todo)}
                    >
                      <PencilIcon className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      isIconOnly
                      size="sm"
                      onPress={() => handleDelete(todo)}
                      isDisabled={isPending}
                      className="hover:text-red-500"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card.Content>
            </Card>
          );
        })}
      </div>

      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, todo: null })}
        onConfirm={confirmDelete}
        title="Delete Todo"
        message={`Are you sure you want to delete "${deleteModal.todo?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </>
  );
};
