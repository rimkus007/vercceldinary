"use client";
import React from "react";

interface PageHeaderProps {
  title: string;
  emoji?: string;
  description?: string;
}

export default function PageHeader({
  title,
  emoji,
  description,
}: PageHeaderProps) {
  return (
    <div className="border-b border-gray-200 bg-white py-5 px-4 sm:px-6 lg:px-8 mb-6">
      <div className="flex items-center space-x-3">
        {emoji && (
          <span className="text-3xl" role="img" aria-label={title}>
            {emoji}
          </span>
        )}
        <h1 className="text-2xl font-bold leading-6 text-gray-900">{title}</h1>
      </div>
      {description && (
        <p className="mt-2 text-sm text-gray-600">{description}</p>
      )}
    </div>
  );
}
