"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { FaBell, FaUserCircle } from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Header() {
  const { user, isLoading } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bonjour";
    if (hour < 18) return "Bon après-midi";
    return "Bonsoir";
  };

  return (
    <header className="flex justify-between items-center p-4 bg-white shadow-md">
      <div>
        <h1 className="text-lg font-bold text-gray-800">
          {/* Affiche le nom uniquement si le chargement est fini et que l'utilisateur existe */}
          {!isLoading && user
            ? `${getGreeting()}, ${user.username} !`
            : `${getGreeting()} !`}
        </h1>
      </div>
      <div className="flex items-center space-x-4">
        {/* Affiche le lien du tableau de bord seulement si l'utilisateur est un ADMIN */}
        {user?.role === "ADMIN" && (
          <Link
            href="/admin/dashboard"
            className="text-sm font-medium text-gray-700 hover:text-blue-600"
          >
            Tableau de bord Admin
          </Link>
        )}
        <button
          className="relative p-2 rounded-full bg-yellow-100 hover:bg-yellow-200 transition-colors"
          onClick={() =>
            window.openNotificationsModal && window.openNotificationsModal()
          }
        >
          <FaBell className="text-yellow-600" size={20} />
        </button>
        <button>
          <FaUserCircle className="text-gray-600" size={24} />
        </button>
      </div>
    </header>
  );
}
