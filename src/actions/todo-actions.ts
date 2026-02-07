'use server'

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const createTodo = async (
  prevState: unknown,
  formData: FormData
) => {
  const session = await auth();

  if (!session) {
    throw new Error("Unauthorized");
  }

  const title = formData.get("title") as string;
  const categoryIds = formData.getAll("categoryIds") as string[];
  const userId = session.user?.id;

  if (!title) {
    return { error: "Title is required" };
  }

  if (!userId) {
    return { error: "User ID is required" };
  }

  await prisma.todo.create({
    data: {
      title,
      userId,
      categories: categoryIds.length > 0 ? {
        connect: categoryIds.map(id => ({ id }))
      } : undefined,
    },
  });

  revalidatePath("/todos");

  return { message: "Todo created" };
};

export const updateTodo = async (
  prevState: unknown,
  formData: FormData
) => {
  const session = await auth();

  if (!session) {
    throw new Error("Unauthorized");
  }

  const title = formData.get("title") as string;
  const todoId = formData.get("todoId") as string;
  const categoryIds = formData.getAll("categoryIds") as string[];
  const userId = session.user?.id;

  if (!title) {
    return { error: "Title is required" };
  }

  if (!todoId) {
    return { error: "Todo ID is required" };
  }

  if (!userId) {
    return { error: "User ID is required" };
  }

  await prisma.todo.update({
    where: {
      id: todoId,
      userId, // Ensure user owns the todo
    },
    data: {
      title,
      categories: {
        set: [], // Clear existing categories
        connect: categoryIds.map(id => ({ id })) // Connect new categories
      },
    },
  });

  revalidatePath("/todos");

  return { message: "Todo updated" };
};

export const deleteTodo = async (
  prevState: unknown,
  formData: FormData
) => {
  const session = await auth();

  if (!session) {
    throw new Error("Unauthorized");
  }

  const todoId = formData.get("todoId") as string;
  const userId = session.user?.id;

  if (!todoId) {
    return { error: "Todo ID is required" };
  }

  if (!userId) {
    return { error: "User ID is required" };
  }

  await prisma.todo.delete({
    where: {
      id: todoId,
      userId, // Ensure user owns the todo
    },
  });

  revalidatePath("/todos");

  return { message: "Todo deleted" };
};

export const toggleTodo = async (
  prevState: unknown,
  formData: FormData
) => {
  const session = await auth();

  if (!session) {
    throw new Error("Unauthorized");
  }

  const todoId = formData.get("todoId") as string;
  const completed = formData.get("completed") === "true";
  const userId = session.user?.id;

  if (!todoId) {
    return { error: "Todo ID is required" };
  }

  if (!userId) {
    return { error: "User ID is required" };
  }

  await prisma.todo.update({
    where: {
      id: todoId,
      userId, // Ensure user owns the todo
    },
    data: {
      completed,
    },
  });

  revalidatePath("/todos");

  return { message: "Todo updated" };
};

export const getTodos = async () => {
  const session = await auth();

  if (!session) {
    throw new Error("Unauthorized");
  }

  const todos = await prisma.todo.findMany({
    where: {
      userId: session.user?.id,
    },
    include: {
      categories: true,
    },
    orderBy: [
      { completed: "asc" },
      { createdAt: "desc" },
    ],
  });

  return todos;
};

export const getTodosByCategory = async (categoryId?: string) => {
  const session = await auth();

  if (!session) {
    throw new Error("Unauthorized");
  }

  if (!session.user?.id) {
    throw new Error("User ID is required");
  }

  const whereClause: {
    userId: string;
    categories?: {
      some: {
        id: string;
      };
    };
  } = {
    userId: session.user.id,
  };

  // If categoryId is provided, filter by that category
  // If not provided (undefined), get all todos
  if (categoryId) {
    whereClause.categories = {
      some: {
        id: categoryId
      }
    };
  }

  const todos = await prisma.todo.findMany({
    where: whereClause,
    include: {
      categories: true,
    },
    orderBy: [
      { completed: "asc" },
      { createdAt: "desc" },
    ],
  });

  return todos;
};

export const getTodosByCategorySlug = async (categorySlug?: string) => {
  const session = await auth();

  if (!session) {
    throw new Error("Unauthorized");
  }

  if (!session.user?.id) {
    throw new Error("User ID is required");
  }

  const whereClause: {
    userId: string;
    categories?: {
      some: {
        slug: string;
      };
    };
  } = {
    userId: session.user.id,
  };

  // If categorySlug is provided, filter by that category
  // If not provided (undefined), get all todos
  if (categorySlug) {
    whereClause.categories = {
      some: {
        slug: categorySlug
      }
    };
  }

  const todos = await prisma.todo.findMany({
    where: whereClause,
    include: {
      categories: true,
    },
    orderBy: [
      { completed: "asc" },
      { createdAt: "desc" },
    ],
  });

  return todos;
};

export const getTodosByCategoryIdOrSlug = async (categoryIdentifier?: string) => {
  const session = await auth();

  if (!session) {
    throw new Error("Unauthorized");
  }

  if (!session.user?.id) {
    throw new Error("User ID is required");
  }

  const whereClause: {
    userId: string;
    categories?: {
      some: {
        OR: Array<{
          id?: string;
          slug?: string;
        }>;
      };
    };
  } = {
    userId: session.user.id,
  };

  // If categoryIdentifier is provided, filter by that category (id or slug)
  // If not provided (undefined), get all todos
  if (categoryIdentifier) {
    whereClause.categories = {
      some: {
        OR: [
          { id: categoryIdentifier },
          { slug: categoryIdentifier }
        ]
      }
    };
  }

  const todos = await prisma.todo.findMany({
    where: whereClause,
    include: {
      categories: true,
    },
    orderBy: [
      { completed: "asc" },
      { createdAt: "desc" },
    ],
  });

  return todos;
}; 