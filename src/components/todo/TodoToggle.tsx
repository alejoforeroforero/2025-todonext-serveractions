"use client";

import { ReactNode, useState } from "react";

interface TodoToggleProps {
  children: ReactNode;
}

export const TodoToggle = ({ children }: TodoToggleProps) => {
  const [showCompleted, setShowCompleted] = useState(true);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Todo List
        </h2>
        <div className="flex items-center space-x-2">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={(e) => setShowCompleted(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Show completed
            </span>
          </label>
        </div>
      </div>
      
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}; 