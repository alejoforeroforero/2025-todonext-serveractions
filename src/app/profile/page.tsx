import { auth } from "@/auth";
import { getUserProfile } from "@/actions/user-actions";
import { UserForm } from "@/components/user/UserForm";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await auth();

  if (!session) {
    redirect('/');
  }

  const user = await getUserProfile();

  if (!user) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Profile Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Manage your account information and preferences
          </p>
        </div>

        {/* User Form */}
        <UserForm user={user} />
      </div>
    </div>
  );
} 