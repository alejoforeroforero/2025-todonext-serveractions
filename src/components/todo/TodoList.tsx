"use client";

import { Todo, Category } from "@/generated/prisma";
import { useTodoStore } from "@/store/Store";
import { useEffect, useState } from "react";
import { deleteTodo, toggleTodo } from "@/actions/todo-actions";
import { useTransition } from "react";
import { Modal } from "@/components";

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

  // Update todos when initialTodos prop changes (from server revalidation)
  useEffect(() => {
    setTodos(initialTodos);
  }, [initialTodos]);

  // Refresh todos when edit mode is cleared (after successful update)
  useEffect(() => {
    if (!editingTodo) {
      // The server component will re-render with fresh data due to revalidatePath
      // So we don't need to manually fetch here
    }
  }, [editingTodo]);

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
            <div
              key={todo.id}
              className={`bg-white dark:bg-gray-700 border rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200 ${
                isEditing 
                  ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-gray-200 dark:border-gray-600'
              } ${todo.completed ? 'opacity-75' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <button
                    onClick={() => handleToggle(todo.id, todo.completed)}
                    disabled={isPending}
                    className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      todo.completed
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 dark:border-gray-600 hover:border-green-500'
                    }`}
                  >
                    {todo.completed && (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <div 
                      className={`cursor-pointer group ${
                        isEditing ? 'text-blue-700 dark:text-blue-300' : 'text-gray-800 dark:text-gray-200'
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
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                            >
                              {category.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {isEditing && (
                      <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full mt-2 inline-block">
                        Editing
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleTodoClick(todo)}
                    className="p-1 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={() => handleDelete(todo)}
                    disabled={isPending}
                    className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Modal */}
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