"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  User,
  Shield,
  Bell,
  HelpCircle,
  LogOut,
} from "lucide-react";
import Link from "next/link";

// Composant pour les liens du menu
const ProfileLink = ({ icon, title, href }) => (
  <Link href={href}>
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
      <div className="flex items-center">
        <div className="mr-4">{icon}</div>
        <span className="font-medium">{title}</span>
      </div>
      <ChevronRight className="text-gray-400" />
    </div>
  </Link>
);

export default function ProfilePage() {
  const { user, wallet, gamificationProfile, isLoading, logout } = useAuth();
  const router = useRouter();

  if (isLoading || !user || !wallet || !gamificationProfile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // --- Logique pour les initiales (inchangée) ---
  const getInitials = (name: string) => {
    if (!name) return "?";
    const names = name.split(" ");
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // ✅ CORRECTION : Utilisation de la valeur dynamique du backend
  const xpRequiredForNextLevel = gamificationProfile.xpToNextLevel;
  const progressPercentage =
    xpRequiredForNextLevel > 0
      ? (gamificationProfile.xp / xpRequiredForNextLevel) * 100
      : 0;

  const formatBalance = (balance) => {
    return new Intl.NumberFormat("fr-DZ", {
      style: "currency",
      currency: "DZD",
      minimumFractionDigits: 2,
    }).format(balance);
  };

  return (
    <div className="p-4 pb-24">
      {/* Section principale du profil */}
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-4">
          <div className="w-24 h-24 rounded-full bg-purple-600 text-white flex items-center justify-center text-4xl font-bold">
            {getInitials(user.fullName)}
          </div>
        </div>
        <h1 className="text-2xl font-bold">{user.fullName}</h1>
        <p className="text-gray-500">@{user.username}</p>
        <div className="mt-4 bg-white shadow-md rounded-xl p-4 w-full max-w-sm">
          <p className="text-sm text-gray-500">Solde disponible</p>
          <p className="text-3xl font-bold text-purple-600">
            {formatBalance(wallet.balance)}
          </p>
        </div>
      </div>

      {/* Section Gamification */}
      <div className="mt-8">
        <h2 className="font-bold mb-4">Ma progression</h2>
        <div className="bg-white p-4 rounded-xl shadow-md">
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-purple-600">
              Niveau {gamificationProfile.level}
            </span>
            <span className="text-sm text-gray-500">
              {/* ✅ CORRIGÉ : Affiche la bonne valeur maximale d'XP */}
              {gamificationProfile.xp} / {xpRequiredForNextLevel} XP
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-purple-600 h-2.5 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Menu de navigation */}
      <div className="mt-8 space-y-3">
        <ProfileLink
          icon={<User className="text-purple-600" />}
          title="Compte"
          href="/profile/account"
        />
        <ProfileLink
          icon={<Shield className="text-purple-600" />}
          title="Sécurité"
          href="/profile/security"
        />
        <ProfileLink
          icon={<Bell className="text-purple-600" />}
          title="Notifications"
          href="/profile/notifications"
        />
        <ProfileLink
          icon={<HelpCircle className="text-purple-600" />}
          title="Aide & Support"
          href="/profile/help"
        />
      </div>

      {/* Bouton de déconnexion */}
      <div className="mt-8">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center p-4 bg-gray-50 rounded-lg text-red-500 font-medium hover:bg-red-50"
        >
          <LogOut className="mr-2" size={20} />
          Se déconnecter
        </button>
      </div>
    </div>
  );
}
