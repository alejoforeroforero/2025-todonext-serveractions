'use server'

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from 'bcryptjs';

export const updateUserProfile = async (
  prevState: unknown,
  formData: FormData
) => {
  const session = await auth();

  if (!session) {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const image = formData.get("image") as string;

  const userId = session.user?.id;

  if (!userId) {
    return { error: "User ID is required" };
  }

  try {
    // Get current user data
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!currentUser) {
      return { error: "User not found" };
    }

    // Prepare update data
    const updateData: {
      name?: string;
      email?: string;
      password?: string;
      image?: string;
    } = {};

    // Update name if provided
    if (name && name.trim() !== currentUser.name) {
      updateData.name = name.trim();
    }

    // Update email if provided and different
    if (email && email !== currentUser.email) {
      // Check if email is already taken by another user
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser && existingUser.id !== userId) {
        return { error: "Email is already taken by another user" };
      }

      updateData.email = email;
    }

    // Update password if provided
    if (currentPassword && newPassword) {
      // Verify current password
      if (!currentUser.password) {
        return { error: "Current password is required to change password" };
      }

      const isCurrentPasswordValid = bcrypt.compareSync(currentPassword, currentUser.password);
      if (!isCurrentPasswordValid) {
        return { error: "Current password is incorrect" };
      }

      // Hash new password
      updateData.password = bcrypt.hashSync(newPassword, 10);
    }

    // Update image if provided
    if (image && image !== currentUser.image) {
      updateData.image = image;
    }

    // Only update if there are changes
    if (Object.keys(updateData).length > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: updateData,
      });

      revalidatePath("/profile");
      return { message: "Profile updated successfully" };
    }

    return { message: "No changes to update" };
  } catch (error) {
    console.error("Error updating user profile:", error);
    return { error: "Failed to update profile" };
  }
};

export const getUserProfile = async () => {
  const session = await auth();

  if (!session) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user?.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      roles: true,
      isActive: true,
      accounts: {
        select: {
          provider: true,
        },
      },
    },
  });

  return user;
};

export const deleteUserAccount = async (
  prevState: unknown,
  formData: FormData
) => {
  const session = await auth();

  if (!session) {
    throw new Error("Unauthorized");
  }

  const password = formData.get("password") as string;
  const userId = session.user?.id;

  if (!userId) {
    return { error: "User ID is required" };
  }

  try {
    // Get current user and their accounts
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        accounts: {
          select: {
            provider: true,
          },
        },
      },
    });

    if (!currentUser) {
      return { error: "User not found" };
    }

    // Check if user signed in with Google
    const isGoogleUser = currentUser.accounts.some(account => account.provider === 'google');

    // For non-Google users, require password verification
    if (!isGoogleUser) {
      if (!password) {
        return { error: "Password is required to delete account" };
      }

      // Verify password
      if (!currentUser.password) {
        return { error: "Password verification failed" };
      }

      const isPasswordValid = bcrypt.compareSync(password, currentUser.password);
      if (!isPasswordValid) {
        return { error: "Password is incorrect" };
      }
    }

    // Delete user account (this will cascade delete todos, categories, etc.)
    await prisma.user.delete({
      where: { id: userId },
    });

    return { message: "Account deleted successfully" };
  } catch (error) {
    console.error("Error deleting user account:", error);
    return { error: "Failed to delete account" };
  }
}; 