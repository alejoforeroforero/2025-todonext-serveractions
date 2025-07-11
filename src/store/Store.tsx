import { create } from 'zustand';
import { Category, Todo } from '@/generated/prisma';

interface CategoryStore {
  editingCategory: Category | null;
  isEditMode: boolean;
  setEditingCategory: (category: Category | null) => void;
  clearEditingCategory: () => void;
}

interface TodoStore {
  editingTodo: (Todo & { categories: Category[] }) | null;
  isEditMode: boolean;
  setEditingTodo: (todo: (Todo & { categories: Category[] }) | null) => void;
  clearEditingTodo: () => void;
}

export const useCategoryStore = create<CategoryStore>((set) => ({
  editingCategory: null,
  isEditMode: false,
  setEditingCategory: (category) => set({ 
    editingCategory: category, 
    isEditMode: category !== null 
  }),
  clearEditingCategory: () => set({ 
    editingCategory: null, 
    isEditMode: false 
  }),
}));

export const useTodoStore = create<TodoStore>((set) => ({
  editingTodo: null,
  isEditMode: false,
  setEditingTodo: (todo) => set({ 
    editingTodo: todo, 
    isEditMode: todo !== null 
  }),
  clearEditingTodo: () => set({ 
    editingTodo: null, 
    isEditMode: false 
  }),
}));
