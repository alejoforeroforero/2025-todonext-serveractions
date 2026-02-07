import Link from "next/link";
import { Card } from "@heroui/react";

export const UnauthenticatedUser = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <Card className="max-w-xl text-center">
        <Card.Content className="py-12 px-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">Welcome!</h1>
          <p className="mb-8 text-lg text-gray-700 dark:text-gray-300">
            This is a <span className="font-semibold text-purple-600 dark:text-purple-400">demo todo app</span> created in <span className="font-semibold">NextJS</span>, <span className="font-semibold">Prisma</span>, and <span className="font-semibold">Postgres</span>.<br />
            This website is a demo that lets you create, read, update, and delete tasks. It&apos;s designed to showcase how I work with this technologies and to demonstrate my skills as a developer. You can view the code on GitHub: https://github.com/alejoforeroforero/2025-todonext-serveractions
          </p>
          <Link
            href="/api/auth/signin"
            className="inline-block px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold text-lg shadow transition-colors duration-200"
          >
            Sign up / Sign in
          </Link>
        </Card.Content>
      </Card>
    </div>
  );
};
