'use client'

import { useState, useTransition } from "react";
import { updateUserProfile, deleteUserAccount } from "@/actions/user-actions";
import { signOut } from "next-auth/react";
import Image from "next/image";

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
  
  // Check if user signed in with Google
  const isGoogleUser = user.accounts.some(account => account.provider === 'google');

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      const result = await updateUserProfile(null, formData);
      
      if (result?.error) {
        setMessage({ type: 'error', text: result.error });
      } else if (result?.message) {
        setMessage({ type: 'success', text: result.message });
        // Clear message after 3 seconds
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
        // Sign out and redirect after successful deletion
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
      {/* Profile Information Form */}
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Profile Information
        </h2>

        {/* Message Display */}
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
          {/* Profile Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Profile Image URL
            </label>
            <input
              type="url"
              name="image"
              defaultValue={user.image || ''}
              placeholder="https://example.com/avatar.jpg"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
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

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Name
            </label>
            <input
              type="text"
              name="name"
              defaultValue={user.name || ''}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Email - Only show for non-Google users */}
          {!isGoogleUser && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                defaultValue={user.email || ''}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          )}

          {/* Email display for Google users */}
          {isGoogleUser && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <div className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-600 dark:text-gray-300">
                {user.email}
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                  (Managed by Google)
                </span>
              </div>
            </div>
          )}

          {/* Password Change Section - Only show for non-Google users */}
          {!isGoogleUser && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Change Password
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    placeholder="Enter current password"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    placeholder="Enter new password"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Google Account Notice */}
          {isGoogleUser && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
                <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Google Account
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Your email and password are managed by Google. To change these settings, please visit your{' '}
                  <a 
                    href="https://myaccount.google.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline hover:text-blue-600 dark:hover:text-blue-300"
                  >
                    Google Account settings
                  </a>.
                </p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {isPending ? 'Updating...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>

      {/* Account Information */}
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Account Information
        </h2>
        
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
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
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
      </div>

                {/* Danger Zone */}
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 border border-red-200 dark:border-red-800">
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-6">
              Danger Zone
            </h2>
            
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
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Delete Account
            </button>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                Are you sure? This action cannot be undone.
              </p>
              <form action={handleDeleteAccount} className="space-y-4">
                {!isGoogleUser && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Enter your password to confirm
                    </label>
                    <input
                      type="password"
                      name="password"
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                )}
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={isDeleting}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    {isDeleting ? 'Deleting...' : 'Yes, delete my account'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 