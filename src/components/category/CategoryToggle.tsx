"use client";

import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

interface CategoryToggleProps {
  children: React.ReactNode;
}

export const CategoryToggle = ({ children }: CategoryToggleProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      {/* Toggle Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
      >
        <div className="flex items-center space-x-3">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Categories
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Click to {isExpanded ? 'hide' : 'show'}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {isExpanded ? (
            <ChevronUpIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          ) : (
            <ChevronDownIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          )}
        </div>
      </button>

      {/* Collapsible Content */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden`}
      >
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}; 