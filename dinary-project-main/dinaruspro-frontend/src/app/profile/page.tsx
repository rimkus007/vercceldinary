// Fichier : src/app/profile/page.tsx

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// --- NOUVEAU : On ajoute une interface pour les produits ---
interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
}

// --- NOUVEAU : Un composant simple pour afficher chaque produit ---
const ProductItem = React.memo(({ product }: { product: Product }) => (
  <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
    <div>
      <h4 className="font-medium text-sm">{product.name}</h4>
      {product.description && (
        <p className="text-xs text-gray-500">{product.description}</p>
      )}
    </div>
    <div className="text-right">
      <p className="font-semibold text-sm">{product.price.toFixed(2)} DA</p>
    </div>
  </div>
));
ProductItem.displayName = "ProductItem";

// --- Le composant de la modale d'aperçu, maintenant avec les produits ---
const PublicProfilePreview = ({ merchant, user, onClose }) => {
  // ✅ On récupère les produits depuis le profil du marchand
  const products = merchant.products || [];

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 z-[1000] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white w-full max-w-sm mx-auto rounded-2xl p-5 shadow-xl max-h-[90vh] flex flex-col"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4 flex-shrink-0" />

        {/* En-tête */}
        <div className="flex items-start mb-4 flex-shrink-0">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-sm mr-4 bg-gray-900">
            <span className="text-2xl">
              {merchant.category === "restaurant" ? "🍽️" : "🛍️"}
            </span>
          </div>
          <div className="flex-grow">
            <h2 className="font-bold text-xl">{merchant.name}</h2>
            <p className="text-sm text-gray-500">{merchant.description}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 -mt-2 -mr-2 rounded-full hover:bg-gray-100"
          >
            {/* ... icône de fermeture ... */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-3 gap-3 mb-6 flex-shrink-0">
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-500">Statut</p>
            <p className="font-bold text-green-600">Ouvert</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-500">Catégorie</p>
            <p className="font-bold">{merchant.category}</p>
          </div>
        </div>

        {/* ✅ Section des produits, maintenant visible */}
        {products.length > 0 && (
          <div className="mb-6 flex-grow overflow-y-auto">
            <h3 className="font-bold text-lg mb-3">Produits populaires</h3>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="space-y-2 divide-y divide-gray-100">
                {products.map((product) => (
                  <ProductItem key={product.id} product={product} />
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 pb-4 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 bg-black text-white py-3 rounded-xl font-medium"
          >
            Fermer
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// --- La page Profil reste quasiment identique ---
export default function ProfilePage() {
  const router = useRouter();
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const [showPublicPreview, setShowPublicPreview] = useState(false);

  const {
    user,
    merchantProfile,
    token,
    logout,
    isLoading: isAuthLoading,
  } = useAuth();

  const [dashboardData, setDashboardData] = useState<{
    level: number;
    xp: number;
  } | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) {
        setIsLoadingData(false);
        return;
      }
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/merchants/dashboard`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!response.ok) throw new Error("Erreur de chargement des données.");
        const data = await response.json();
        setDashboardData(data);
      } catch (error) {
        void 0;
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchDashboardData();
  }, [token]);

  if (isAuthLoading || isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || !merchantProfile || !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Impossible de charger le profil.</p>
      </div>
    );
  }

  const confirmLogout = () => {
    logout();
  };

  return (
    <>
      <main className="p-4 pb-32 bg-gradient-to-b from-white to-blue-50 min-h-screen max-w-md mx-auto">
        <header className="mb-6 relative">
          <Link
            href="/dashboard"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-md"
          >
            <span className="text-gray-600">←</span>
          </Link>
          <div className="p-6 bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md rounded-lg">
            <h1 className="text-lg font-bold text-center">👤 Mon Profil</h1>
            <p className="text-sm text-center">Gérez vos informations</p>
          </div>
        </header>

        <section className="mb-6 bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {user.fullName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold">{user.fullName}</h2>
              <p className="text-sm text-purple-600">
                Niveau {dashboardData.level} • {dashboardData.xp} points
              </p>
              <p className="text-xs text-gray-500">
                Business • Depuis{" "}
                {new Date(user.createdAt).toLocaleDateString("fr-FR", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
          <div className="px-6 pb-4 flex gap-3">
            <button
              onClick={() => router.push("/boutique")}
              className="flex-1 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium"
            >
              ✏️ Modifier
            </button>
            <button
              onClick={() => setShowPublicPreview(true)}
              className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium"
            >
              👁️ Aperçu public
            </button>
          </div>
        </section>

        {/* SECTION STATISTIQUES */}
        <section className="mb-6 bg-white rounded-xl p-4 shadow-md">
          <h3 className="text-sm font-bold mb-3 text-gray-700">📊 Statistiques</h3>
          <Link
            href="/stats"
            className="flex justify-between items-center p-3 bg-gray-50 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <span className="text-purple-600 text-lg">📈</span>
              <p className="font-medium">Consulter mes statistiques</p>
            </div>
            <span className="text-purple-400">→</span>
          </Link>
        </section>

        <section className="mb-6 bg-white rounded-xl p-4 shadow-md">
          <h3 className="text-sm font-bold mb-3 text-gray-700">
            📋 Informations
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
              <div>
                <p className="text-xs text-gray-500">Nom du commerce</p>
                <p className="font-semibold">{merchantProfile.name}</p>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-semibold">{user.email}</p>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
              <div>
                <p className="text-xs text-gray-500">Téléphone</p>
                <p className="font-semibold">
                  {user.phoneNumber || "Non renseigné"}
                </p>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
              <div>
                <p className="text-xs text-gray-500">ID Boutique</p>
                <p className="font-semibold">
                  {merchantProfile.id.substring(0, 8).toUpperCase()}
                </p>
              </div>
              <button
                onClick={() =>
                  navigator.clipboard.writeText(merchantProfile.id)
                }
                className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded"
              >
                Copier
              </button>
            </div>
          </div>
        </section>

        {/* SECTION SUPPORT */}
        <section className="mb-6 bg-white rounded-xl p-4 shadow-md">
          <h3 className="text-sm font-bold mb-3 text-gray-700">
            🛟 Aide et Support
          </h3>
          <Link
            href="/support"
            className="flex justify-between items-center p-3 bg-green-50 text-green-700 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <span className="text-green-600 text-lg">💬</span>
              <p className="font-medium">Contacter le support</p>
            </div>
            <span className="text-green-400">→</span>
          </Link>
        </section>

        <button
          onClick={() => setShowConfirmLogout(true)}
          className="w-full py-3 bg-red-50 text-red-600 font-medium rounded-xl hover:bg-red-100 transition"
        >
          🚪 Se déconnecter
        </button>
      </main>

      <AnimatePresence>
        {showPublicPreview && (
          <PublicProfilePreview
            merchant={merchantProfile}
            user={user}
            onClose={() => setShowPublicPreview(false)}
          />
        )}
        {showConfirmLogout && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="bg-white rounded-xl p-6 max-w-sm w-full">
              <h3 className="text-lg font-bold mb-2">Déconnexion</h3>
              <p className="text-gray-600 mb-6">
                Êtes-vous sûr de vouloir vous déconnecter ?
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowConfirmLogout(false)}
                  className="flex-1 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmLogout}
                  className="flex-1 py-2 bg-red-500 text-white font-medium rounded-lg"
                >
                  Se déconnecter
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
