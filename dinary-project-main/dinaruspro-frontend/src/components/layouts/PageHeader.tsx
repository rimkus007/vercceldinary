"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface PageHeaderProps {
  title: string;
  emoji?: string;
  hasBackButton?: boolean;
  backTo?: string;
}

export default function PageHeader({
  title,
  emoji,
  hasBackButton = false,
  backTo = "/",
}: PageHeaderProps) {
  const router = useRouter();

  return (
    <header className="flex items-center justify-between p-4 bg-white sticky top-0 z-10">
      <div className="flex items-center">
        {hasBackButton && (
          <button
            onClick={() => router.push(backTo)}
            className="mr-3 p-2 rounded-full hover:bg-gray-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}
        <h1 className="text-xl font-bold">
          {emoji && <span className="mr-2">{emoji}</span>}
          {title}
        </h1>
      </div>
    </header>
  );
}
