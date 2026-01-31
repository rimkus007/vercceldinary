"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Composant optimisé pour chaque élément de navigation
const NavItem = React.memo(
  ({ item, isActive }: { item: NavItemType; isActive: boolean }) => (
    <Link
      href={item.href}
      key={item.href}
      prefetch={false} // Préchargement contrôlé uniquement pour les liens probables
      className={`flex flex-col items-center justify-center relative ${
        isActive ? "text-blue-600" : "text-gray-500 hover:text-gray-800"
      }`}
    >
      {/* Arrière-plan icône - redesign plus compact */}
      <div
        className={`w-10 h-10 flex items-center justify-center rounded-lg ${
          isActive ? "bg-blue-50" : "bg-transparent hover:bg-gray-50"
        } transition-colors`}
      >
        <div className="text-xl">{item.emoji}</div>
      </div>

      <span
        className={`text-[10px] mt-0.5 font-medium ${
          isActive ? "text-blue-600" : ""
        }`}
      >
        {item.label}
      </span>

      {/* Indicateur actif - design plus subtil */}
      {isActive && (
        <div className="absolute -bottom-2 h-1 w-6 rounded-full bg-blue-600" />
      )}
    </Link>
  ),
  // Ajout d'une fonction de comparaison personnalisée pour éviter les re-rendus inutiles
  (prevProps, nextProps) => {
    return (
      prevProps.isActive === nextProps.isActive &&
      prevProps.item.href === nextProps.item.href
    );
  }
);

NavItem.displayName = "NavItem";

// Type pour les éléments de navigation
interface NavItemType {
  label: string;
  href: string;
  emoji: string;
}

export default function BottomNavbar() {
  const pathname = usePathname();
  const noNavPages = ["/login", "/register"];
  if (noNavPages.includes(pathname)) {
    return null;
  }

  // Définition des éléments de navigation avec emojis iOS
  const navItems = useMemo(
    () => [
      {
        label: "Accueil",
        href: "/dashboard",
        emoji: "🏠",
      },
      {
        label: "Carte",
        href: "/carte",
        emoji: "📍",
      },
      {
        label: "Scanner",
        href: "/scanner",
        emoji: "📷",
      },
      {
        label: "Dépenses",
        href: "/expenses",
        emoji: "💸",
      },
      {
        label: "Support",
        href: "/support",
        emoji: "💬",
      },
      {
        label: "Rewards",
        href: "/rewards",
        emoji: "🎁",
      },
    ],
    []
  );

  // Mémoisation du rendu des éléments de navigation
  const navItemComponents = useMemo(() => {
    return navItems.map((item) => {
      const isActive = pathname === item.href;
      return <NavItem key={item.href} item={item} isActive={isActive} />;
    });
  }, [navItems, pathname]);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 border-t border-gray-200 backdrop-blur-sm"
      data-bottom-navbar
    >
      <div className="flex justify-around items-center px-4 py-2">
        {navItemComponents}
      </div>
    </nav>
  );
}
