"use client";

import { useAuth } from "@/contexts/AuthContext";

export default function AdminHeader() {
  const { user } = useAuth();

  if (!user) {
    return (
      <header className="h-16 border-b bg-white flex items-center justify-end px-6 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="w-24 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </header>
    );
  }

  const getInitials = (name: string) => {
    if (!name) return "AD";
    const names = name.split(" ");
    return names
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <header className="h-16 border-b bg-white flex items-center justify-end px-6 sticky top-0 z-10 shadow-sm">
      {/* Section Profil uniquement */}
      <div className="flex items-center space-x-3">
        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-dinary-turquoise to-blue-500 flex items-center justify-center text-white font-semibold shadow-md">
          {getInitials(user.fullName)}
        </div>
        <div className="hidden md:block">
          <p className="text-sm font-semibold text-gray-900">{user.username}</p>
          <p className="text-xs text-gray-500">Administrateur</p>
        </div>
      </div>
    </header>
  );
}
