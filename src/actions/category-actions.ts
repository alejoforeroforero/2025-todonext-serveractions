"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const createCategory = async (
  prevState: unknown,
  formData: FormData
) => {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const userId = session.user?.id;

  if (!name) {
    return { error: "Name is required" };
  }

  if (!slug) {
    return { error: "Slug is required" };
  }

  if (!userId) {
    return { error: "User ID is required" };
  }

  // Check if slug already exists for this user
  const existingCategory = await prisma.category.findFirst({
    where: {
      slug,
      userId,
    },
  });

  if (existingCategory) {
    return { error: "A category with this slug already exists" };
  }

  await prisma.category.create({
    data: {
      name,
      slug,
      userId,
    },
  });

  revalidatePath("/categories");

  return { message: "Category created" };
};

export const updateCategory = async (
  prevState: unknown,
  formData: FormData
) => {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const categoryId = formData.get("categoryId") as string;
  const userId = session.user?.id;

  if (!name) {
    return { error: "Name is required" };
  }

  if (!slug) {
    return { error: "Slug is required" };
  }

  if (!categoryId) {
    return { error: "Category ID is required" };
  }

  if (!userId) {
    return { error: "User ID is required" };
  }

  // Check if slug already exists for this user (excluding current category)
  const existingCategory = await prisma.category.findFirst({
    where: {
      slug,
      userId,
      id: {
        not: categoryId,
      },
    },
  });

  if (existingCategory) {
    return { error: "A category with this slug already exists" };
  }

  await prisma.category.update({
    where: {
      id: categoryId,
      userId, // Ensure user owns the category
    },
    data: {
      name,
      slug,
    },
  });

  revalidatePath("/categories");

  return { message: "Category updated" };
};

export const getCategories = async () => {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new Error("Unauthorized");
  }

  const categories = await prisma.category.findMany({
    where: {
      userId: session.user?.id,
    },
    orderBy: {
      name: "asc",
    },
  });

  return categories;
};

export const getCategoryByIdOrSlug = async (identifier: string) => {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new Error("Unauthorized");
  }

  const category = await prisma.category.findFirst({
    where: {
      OR: [
        { id: identifier },
        { slug: identifier }
      ],
      userId: session.user?.id,
    },
  });

  return category;
};

export const deleteCategory = async (categoryId: string) => {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new Error("Unauthorized");
  }

  const userId = session.user?.id;

  if (!userId) {
    throw new Error("User ID is required");
  }

  // Check if category has any todos
  const todosCount = await prisma.todo.count({
    where: {
      categories: {
        some: {
          id: categoryId
        }
      },
      userId: userId,
    },
  });

  if (todosCount > 0) {
    throw new Error("Cannot delete category with existing todos");
  }

  await prisma.category.delete({
    where: {
      id: categoryId,
      userId, // Ensure user owns the category
    },
  });

  revalidatePath("/categories");

  return { message: "Category deleted" };
};
