'use client'

import { useState, useTransition } from "react";
import { updateUserProfile, deleteUserAccount } from "@/actions/user-actions";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { Button, Input, Label, Card } from "@heroui/react";

interface UserFormProps {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    roles: string[];
    isActive: boolean;
    accounts: {
      provider: string;
    }[];
  };
}

export const UserForm = ({ user }: UserFormProps) => {
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isGoogleUser = user.accounts.some(account => account.provider === 'google');

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      const result = await updateUserProfile(null, formData);

      if (result?.error) {
        setMessage({ type: 'error', text: result.error });
      } else if (result?.message) {
        setMessage({ type: 'success', text: result.message });
        setTimeout(() => setMessage(null), 3000);
      }
    });
  };

  const handleDeleteAccount = async (formData: FormData) => {
    setIsDeleting(true);
    try {
      const result = await deleteUserAccount(null, formData);

      if (result?.error) {
        setMessage({ type: 'error', text: result.error });
      } else if (result?.message) {
        setMessage({ type: 'success', text: result.message });
        setTimeout(() => {
          signOut({ callbackUrl: '/' });
        }, 2000);
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete account' });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <Card className="shadow-md">
        <Card.Header>
          <Card.Title className="text-gray-900 dark:text-white text-xl font-bold">Profile Information</Card.Title>
        </Card.Header>
        <Card.Content>
          {message && (
            <div className={`mb-4 p-4 rounded-md ${
              message.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
            }`}>
              {message.text}
            </div>
          )}

          <form action={handleSubmit} className="space-y-6">
            <div className="flex flex-col gap-1">
              <Label className="text-gray-700 dark:text-gray-200 font-medium">Profile Image URL</Label>
              <Input
                type="url"
                name="image"
                defaultValue={user.image || ''}
                placeholder="https://example.com/avatar.jpg"
                fullWidth
                className="border-gray-300 text-gray-900 dark:text-white"
              />
              {user.image && (
                <div className="mt-2">
                  <Image
                    src={user.image}
                    alt="Profile"
                    width={64}
                    height={64}
                    className="rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <Label className="text-gray-700 dark:text-gray-200 font-medium">Name</Label>
              <Input
                type="text"
                name="name"
                defaultValue={user.name || ''}
                required
                fullWidth
                className="border-gray-300 text-gray-900 dark:text-white"
              />
            </div>

            {!isGoogleUser && (
              <div className="flex flex-col gap-1">
                <Label className="text-gray-700 dark:text-gray-200 font-medium">Email</Label>
                <Input
                  type="email"
                  name="email"
                  defaultValue={user.email || ''}
                  required
                  fullWidth
                  className="border-gray-300 text-gray-900 dark:text-white"
                />
              </div>
            )}

            {isGoogleUser && (
              <div className="flex flex-col gap-1">
                <Label className="text-gray-700 dark:text-gray-200 font-medium">Email</Label>
                <div className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-600 dark:text-gray-300">
                  {user.email}
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                    (Managed by Google)
                  </span>
                </div>
              </div>
            )}

            {!isGoogleUser && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Change Password
                </h3>
                <div className="space-y-4">
                  <div className="flex flex-col gap-1">
                    <Label className="text-gray-700 dark:text-gray-200 font-medium">Current Password</Label>
                    <Input
                      type="password"
                      name="currentPassword"
                      placeholder="Enter current password"
                      fullWidth
                      className="border-gray-300 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-gray-700 dark:text-gray-200 font-medium">New Password</Label>
                    <Input
                      type="password"
                      name="newPassword"
                      placeholder="Enter new password"
                      fullWidth
                      className="border-gray-300 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {isGoogleUser && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-md p-4">
                  <h3 className="text-lg font-medium text-purple-900 dark:text-purple-100 mb-2">
                    Google Account
                  </h3>
                  <p className="text-sm text-purple-800 dark:text-purple-200">
                    Your email and password are managed by Google. To change these settings, please visit your{' '}
                    <a
                      href="https://myaccount.google.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-purple-600 dark:hover:text-purple-300"
                    >
                      Google Account settings
                    </a>.
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                type="submit"
                isDisabled={isPending}
              >
                {isPending ? 'Updating...' : 'Update Profile'}
              </Button>
            </div>
          </form>
        </Card.Content>
      </Card>

      <Card className="shadow-md">
        <Card.Header>
          <Card.Title className="text-gray-900 dark:text-white text-xl font-bold">Account Information</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="space-y-4">
            <div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">User ID:</span>
              <p className="text-sm text-gray-900 dark:text-white font-mono">{user.id}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Roles:</span>
              <div className="flex gap-2 mt-1">
                {user.roles.map((role) => (
                  <span
                    key={role}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Status:</span>
              <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                user.isActive
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {user.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </Card.Content>
      </Card>

      <Card className="shadow-md border border-red-200 dark:border-red-800">
        <Card.Header>
          <Card.Title className="text-red-600 dark:text-red-400 text-xl font-bold">Danger Zone</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Once you delete your account, there is no going back. Please be certain.
            </p>

            {isGoogleUser && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Note:</strong> Since you signed in with Google, deleting your account here will only remove your data from this application. Your Google account will remain active.
                </p>
              </div>
            )}

            {!showDeleteConfirm ? (
              <Button
                variant="danger"
                onPress={() => setShowDeleteConfirm(true)}
              >
                Delete Account
              </Button>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                  Are you sure? This action cannot be undone.
                </p>
                <form action={handleDeleteAccount} className="space-y-4">
                  {!isGoogleUser && (
                    <div className="flex flex-col gap-1">
                      <Label className="text-gray-700 dark:text-gray-200 font-medium">Enter your password to confirm</Label>
                      <Input
                        type="password"
                        name="password"
                        required
                        fullWidth
                        className="border-gray-300 text-gray-900 dark:text-white"
                      />
                    </div>
                  )}
                  <div className="flex gap-4">
                    <Button
                      type="submit"
                      variant="danger"
                      isDisabled={isDeleting}
                    >
                      {isDeleting ? 'Deleting...' : 'Yes, delete my account'}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onPress={() => setShowDeleteConfirm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};
