// Fichier : src/app/boutique/page.tsx

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
// ✅ CORRECTION : Imports manquants ajoutés ici
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import CreateProductModal from "@/components/modals/CreateProductModal";
import PromoBanner from "@/components/common/PromoBanner";

// --- L'interface ne change pas ---
interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
  stock?: number;
}

const BoutiquePage = () => {
  // Maintenant que useAuth et useRouter sont importés, ces lignes fonctionneront
  const { user, merchantProfile, isLoading, token, refreshUser } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<
    "profile" | "products" | "settings"
  >("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // ... états du formulaire ...
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [salesGoal, setSalesGoal] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  useEffect(() => {
    if (merchantProfile) {
      setName(merchantProfile.name ?? "");
      setCategory(merchantProfile.category ?? "");
      setAddress(merchantProfile.address ?? "");
      setDescription(merchantProfile.description ?? "");
      setSalesGoal(merchantProfile.salesGoal?.toString() ?? "10000");
    }
  }, [merchantProfile]);

  const fetchProducts = async () => {
    if (!token) return;
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error("Erreur de chargement des produits.");
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      void 0;
    }
  };

  useEffect(() => {
    if (token) {
      fetchProducts();
    }
  }, [token]);

  const handleSaveProduct = async (
    formData: FormData,
    productId?: string
  ): Promise<boolean> => {
    if (!token) {
      return false;
    }
    const url = productId
      ? `${process.env.NEXT_PUBLIC_API_URL}/products/${productId}`
      : `${process.env.NEXT_PUBLIC_API_URL}/products`;
    const method = productId ? "PATCH" : "POST";
    try {
      const response = await fetch(url, {
        method: method,
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "La sauvegarde a échoué.");
      }
      await fetchProducts();
      setIsModalOpen(false);
      setEditingProduct(null);
      return true;
    } catch (error) {
      void 0;
      return false;
    }
  };
  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setSaveErr(null);
    setSaveMsg(null);

    // Préparer les données pour les infos générales
    const generalData = { name, category, address, description };
    // Préparer les données pour l'objectif (s'il est valide)
    const goalData =
      salesGoal && parseFloat(salesGoal) > 0
        ? { salesGoal: parseFloat(salesGoal) }
        : null;

    try {
      // Appel 1: Mise à jour des infos générales
      const generalRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/merchants/me`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(generalData),
        }
      );
      if (!generalRes.ok) throw new Error("Échec mise à jour infos générales");

      // Appel 2: Mise à jour de l'objectif (si valide)
      if (goalData) {
        const goalRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/merchants/me/sales-goal`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(goalData),
          }
        );
        if (!goalRes.ok) throw new Error("Échec mise à jour objectif");
      }

      setSaveMsg("Informations mises à jour ✅");
      await refreshUser(); // Rafraîchit toutes les données du marchand
      setTimeout(() => setSaveMsg(null), 2000);
    } catch (err: any) {
      setSaveErr(err.message || "Erreur inconnue");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || !user || !merchantProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">...</div>
    );
  }

  const needsLocation = !merchantProfile.latitude || !merchantProfile.longitude;
  const storeData = {
    name: merchantProfile.name,
    category: merchantProfile.category || "Non défini",
    address: merchantProfile.address || "Adresse non fournie",
    phone: user.phoneNumber || "Téléphone non fourni",
    email: user.email,
    owner: user.fullName,
  };

  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(
    "/api",
    ""
  );

  return (
    <>
      <CreateProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
        product={editingProduct}
      />

      <main className="p-4 pb-20 bg-gray-50 min-h-screen max-w-md mx-auto">
        {/* ... Tout le reste de ton code ne change pas ... */}
        <header className="mb-6">
          <h1 className="font-bold text-xl text-center">Ma Boutique</h1>
        </header>

        {needsLocation && (
          <div className="mb-5">
            <PromoBanner
              title="Finalisez votre profil !"
              description="Définissez votre emplacement pour être visible."
              emoji="📍"
              actionLabel="Définir mon emplacement"
              action={() => router.push("/boutique/emplacement")}
              bgColor="bg-amber-50"
              textColor="text-amber-800"
            />
          </div>
        )}

        <section className="bg-white rounded-lg p-4 shadow-sm mb-5 text-center">
          <div className="flex flex-col items-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-3xl">
              <span>{storeData.name.charAt(0)}</span>
            </div>
            <div>
              <h2 className="font-bold text-lg">{storeData.name}</h2>
              <p className="text-sm text-gray-500">{storeData.category}</p>
            </div>
          </div>
        </section>

        <div className="flex border-b mb-5">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex-1 py-2 text-center text-sm ${
              activeTab === "profile"
                ? "border-b-2 border-blue-500 font-medium text-blue-600"
                : "text-gray-500"
            }`}
          >
            Informations
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`flex-1 py-2 text-center text-sm ${
              activeTab === "products"
                ? "border-b-2 border-blue-500 font-medium text-blue-600"
                : "text-gray-500"
            }`}
          >
            Produits
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex-1 py-2 text-center text-sm ${
              activeTab === "settings"
                ? "border-b-2 border-blue-500 font-medium text-blue-600"
                : "text-gray-500"
            }`}
          >
            Paramètres
          </button>
        </div>

        {activeTab === "profile" && (
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100 animate-fade-in">
            <h2 className="font-bold text-xl mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Détails de la boutique
            </h2>
            <div className="space-y-5">
              {/* Propriétaire */}
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <span className="text-2xl">👤</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Propriétaire</p>
                    <p className="font-bold text-gray-900">{storeData.owner}</p>
                  </div>
                </div>
              </div>

              {/* Adresse */}
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <span className="text-2xl">📍</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Adresse</p>
                    <p className="font-bold text-gray-900">
                      {(() => {
                        // Raccourcir l'adresse pour n'afficher que les parties essentielles
                        const parts = storeData.address.split(',').map((s: string) => s.trim());
                        // Garder seulement les 2-3 premières parties (rue, ville, code postal)
                        return parts.slice(0, 3).join(', ');
                      })()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <span className="text-2xl">📞</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Contact</p>
                    <p className="font-bold text-gray-900">{storeData.phone}</p>
                    <p className="text-sm text-gray-600 mt-0.5">{storeData.email}</p>
                  </div>
                </div>
              </div>

              {/* Bouton pour modifier l'emplacement */}
              <button
                onClick={() => router.push("/boutique/emplacement")}
                className="w-full mt-2 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                <span>📍</span>
                <span>Modifier mon emplacement</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === "products" && (
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-5 shadow-lg border border-gray-100 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Nos produits
              </h2>
              <button
                onClick={openCreateModal}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all duration-200 font-semibold text-sm flex items-center gap-2"
              >
                <span className="text-lg">+</span>
                <span>Ajouter un produit</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {products.length > 0 ? (
                products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 relative group overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                    <div className="bg-gradient-to-br from-gray-100 to-gray-200 h-32 rounded-xl mb-3 flex items-center justify-center text-gray-400 overflow-hidden">
                      {product.imageUrl ? (
                        <img
                          src={`${API_BASE_URL}${product.imageUrl}`}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-4xl">🛍️</span>
                      )}
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-sm truncate text-gray-900">
                        {product.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-base text-blue-600">
                          {product.price.toFixed(2)} DA
                        </p>
                        {product.stock !== undefined && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            Stock: {product.stock}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditModal(product)}
                        className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-blue-50 transition-colors"
                      >
                        ✏️
                      </button>
                      <button className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-red-50 transition-colors">
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-12">
                  <div className="text-6xl mb-4">📦</div>
                  <p className="font-semibold text-gray-700 mb-2">Aucun produit pour le moment</p>
                  <p className="text-sm text-gray-500 mb-4">Commencez par ajouter vos premiers produits</p>
                  <button
                    onClick={openCreateModal}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-xl hover:shadow-lg transition-all duration-200 font-semibold text-sm inline-flex items-center gap-2"
                  >
                    <span className="text-lg">+</span>
                    <span>Ajouter mon premier produit</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100 animate-fade-in">
            <h2 className="font-bold text-xl mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Paramètres de la boutique
            </h2>
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <label className="block text-sm font-semibold mb-2 text-gray-700 flex items-center gap-2">
                  <span className="text-lg">🏪</span>
                  Nom de la boutique
                </label>
                <input
                  className="w-full p-3 bg-gray-50 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nom de la boutique"
                  required
                />
              </div>
              
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <label className="block text-sm font-semibold mb-2 text-gray-700 flex items-center gap-2">
                  <span className="text-lg">📂</span>
                  Catégorie
                </label>
                <select
                  className="w-full p-3 bg-gray-50 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="restaurant">🍽️ Restaurant</option>
                  <option value="epicerie">🥦 Épicerie</option>
                  <option value="commerce">🛍️ Commerce</option>
                  <option value="mode">👕 Mode</option>
                  <option value="sante">💊 Santé</option>
                  <option value="tech">📱 Tech</option>
                  <option value="loisirs">🎮 Loisirs</option>
                  <option value="autre">📌 Autre</option>
                </select>
              </div>
              
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <label className="block text-sm font-semibold mb-2 text-gray-700 flex items-center gap-2">
                  <span className="text-lg">📍</span>
                  Adresse
                </label>
                <input
                  className="w-full p-3 bg-gray-50 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Adresse complète"
                />
              </div>
              
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <label className="block text-sm font-semibold mb-2 text-gray-700 flex items-center gap-2">
                  <span className="text-lg">📝</span>
                  Description
                </label>
                <textarea
                  className="w-full p-3 bg-gray-50 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Décrivez votre commerce, vos spécialités, vos horaires…"
                />
              </div>
              
              <div id="sales-goal" className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200 shadow-sm">
                <label
                  htmlFor="salesGoal"
                  className="block text-sm font-semibold mb-2 text-gray-700 flex items-center gap-2"
                >
                  <span className="text-lg">🎯</span>
                  Objectif de ventes mensuel (DA)
                </label>
                <input
                  id="salesGoal"
                  type="number"
                  className="w-full p-3 bg-white rounded-lg border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  value={salesGoal}
                  onChange={(e) => setSalesGoal(e.target.value)}
                  placeholder="Ex: 15000"
                  min="0"
                />
                <p className="text-xs text-green-700 mt-2 flex items-center gap-1">
                  <span>💡</span>
                  <span>Définissez un objectif pour suivre vos performances</span>
                </p>
              </div>
              
              {saveErr && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                  <span className="text-lg">❌</span>
                  <span className="text-sm">{saveErr}</span>
                </div>
              )}
              {saveMsg && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2 animate-pulse">
                  <span className="text-lg">✅</span>
                  <span className="text-sm font-medium">{saveMsg}</span>
                </div>
              )}
              
              <button
                type="submit"
                disabled={saving}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold disabled:opacity-50 hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                {saving && <Loader2 className="animate-spin" size={20} />}
                <span>{saving ? "Enregistrement en cours..." : "💾 Enregistrer les modifications"}</span>
              </button>
            </form>
            
            <div className="mt-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-200 shadow-sm">
              <h3 className="font-semibold mb-2 text-gray-800 flex items-center gap-2">
                <span className="text-xl">🗺️</span>
                Localisation sur la carte
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Assurez-vous que votre boutique est visible au bon endroit pour vos clients.
              </p>
              <button
                onClick={() => router.push("/boutique/emplacement")}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                <span>📍</span>
                <span>Modifier ma localisation</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default BoutiquePage;
