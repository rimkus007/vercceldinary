// Fichier : dinaruspro-seller/src/components/layouts/BottomNavbar.tsx

"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const BottomNavbar = () => {
  const pathname = usePathname();

  // On garde tes liens et icônes originaux.
  // J'ai juste adapté le premier lien pour pointer vers /dashboard au lieu de /
  const navItems = [
    { path: "/dashboard", label: "Accueil", icon: "🏠" },
    { path: "/boutique", label: "Boutique", icon: "🛒" },
    { path: "/rewards", label: "Récompenses", icon: "🎖️" },
    { path: "/profile", label: "Profil", icon: "👤" },
  ];

  return (
    <footer className="w-full fixed bottom-0 z-50">
      <div className="mx-auto max-w-md px-4 pb-2 pt-1">
        <nav className="backdrop-blur-md bg-white/80 shadow-lg rounded-full border border-gray-100 px-2 py-1">
          <div className="flex justify-around items-center relative">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`
                    flex flex-col items-center justify-center py-2 px-3 rounded-full
                    transition-all duration-300 ease-in-out relative
                    ${
                      isActive
                        ? "text-white scale-110"
                        : "text-gray-500 hover:text-purple-500 hover:scale-105"
                    }
                  `}
                >
                  {/* Cercle d'arrière-plan animé pour l'élément actif */}
                  {isActive && (
                    <span className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 animate-pulse"></span>
                  )}

                  {/* Contenu de l'élément de navigation */}
                  <span
                    className={`text-xl relative z-10 ${
                      isActive ? "animate-bounce-subtle" : ""
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span
                    className={`text-xs font-medium relative z-10 mt-0.5 ${
                      isActive ? "font-bold" : ""
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </footer>
  );
};

export default BottomNavbar;
