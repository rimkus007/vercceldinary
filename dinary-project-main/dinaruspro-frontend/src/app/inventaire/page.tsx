"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import CreateProductModal from "@/components/modals/CreateProductModal"; // Nous allons utiliser un composant modal séparé
import {
  Loader2,
  Plus,
  Search,
  ShoppingCart,
  Edit,
  Trash2,
} from "lucide-react";

// Interface pour correspondre au modèle de produit de la base de données
interface Product {
  id: string;
  name: string;
  price: number;
  description?: string | null;
  category?: string | null;
  // On peut ajouter d'autres champs si le backend les renvoie
  stock?: number; // Supposons que le backend gère le stock
  emoji?: string;
  updatedAt?: string;
  // Champs dérivés pour l'affichage dans l'inventaire
  alerte?: boolean;
  couleur?: string;
}

export default function InventairePage() {
  const { token, merchantProfile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // États pour l'interface
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  // Fonction pour récupérer les produits depuis l'API
  const fetchProducts = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok)
        throw new Error("Erreur de chargement de l'inventaire.");
      const data = await response.json();
      // On adapte les données reçues pour inclure des valeurs par défaut pour l'affichage
      const formattedProducts = data.map((p: any) => ({
        ...p,
        stock: p.stock ?? 0,
        alerte: (p.stock ?? 0) < 10,
        emoji: p.emoji || "📦",
        couleur: (p.stock ?? 0) < 10 ? "red" : "blue",
      }));
      setProducts(formattedProducts);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [token, API_URL]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Gérer la sauvegarde (création ou mise à jour)
  // ✨ CORRECTION : Accepte maintenant FormData et l'envoie directement
  const handleSaveProduct = async (
    formData: FormData, // Accepte directement FormData
    productId?: string // L'ID est toujours optionnel pour la mise à jour
  ): Promise<boolean> => {
    const url = productId
      ? `${API_URL}/products/${productId}`
      : `${API_URL}/products`;
    const method = productId ? "PATCH" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          // NE PAS définir 'Content-Type', le navigateur le fera pour FormData
          Authorization: `Bearer ${token}`,
        },
        body: formData, // Envoyer directement l'objet FormData
      });

      if (!response.ok) {
        // Essayons d'obtenir plus de détails sur l'erreur du backend
        let errorMessage = "Échec de la sauvegarde du produit.";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          // Si le backend ne renvoie pas de JSON valide en cas d'erreur
          errorMessage = `Erreur ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      await fetchProducts(); // Rafraîchir la liste
      setIsModalOpen(false);
      setEditingProduct(null);
      return true;
    } catch (error: any) {
      // Afficher l'erreur à l'utilisateur peut être utile
      void 0;
      setError(error.message || "Une erreur inconnue est survenue.");
      return false;
    }
  };

  // Gérer la suppression
  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?"))
      return;

    try {
      const response = await fetch(`${API_URL}/products/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Échec de la suppression.");
      await fetchProducts(); // Rafraîchir la liste
    } catch (error: any) {
      setError(error.message);
    }
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const filteredProducts = useMemo(
    () =>
      products.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [products, searchTerm]
  );

  const stats = useMemo(
    () => ({
      totalProducts: products.length,
      lowStockProducts: products.filter((p) => p.alerte).length,
      totalValue: products.reduce(
        (sum, p) => sum + p.price * (p.stock ?? 0),
        0
      ),
      totalStock: products.reduce((sum, p) => sum + (p.stock ?? 0), 0),
    }),
    [products]
  );

  return (
    <>
      <main className="p-4 pb-20 bg-gradient-to-b from-white to-blue-50 min-h-screen">
        <header className="mb-5 relative">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-md hover:bg-gray-50 transition"
              >
                <span className="text-gray-600">←</span>
              </Link>
              <h1 className="font-bold text-gray-800">Inventaire</h1>
            </div>
          </div>
        </header>

        {/* Résumé des statistiques */}
        <section className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-white rounded-xl p-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                📦
              </div>{" "}
              <div>
                <p className="text-xs text-gray-500">Total produits</p>
                <p className="font-bold text-lg">{stats.totalProducts}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                ⚠️
              </div>
              <div>
                <p className="text-xs text-gray-500">Stock faible</p>
                <p className="font-bold text-lg">{stats.lowStockProducts}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                🔢
              </div>
              <div>
                <p className="text-xs text-gray-500">Unités en stock</p>
                <p className="font-bold text-lg">{stats.totalStock}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                💰
              </div>
              <div>
                <p className="text-xs text-gray-500">Valeur totale</p>
                <p className="font-bold text-lg">
                  {stats.totalValue.toLocaleString()} DA
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-5">
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white rounded-lg shadow-sm border border-gray-100 focus:outline-none focus:ring-1 focus:ring-purple-400 text-sm"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Search size={16} />
              </span>
            </div>
            <button
              onClick={openCreateModal}
              className="bg-purple-600 text-white px-3 py-2 rounded-lg text-sm shadow-sm hover:bg-purple-700 transition flex items-center gap-1"
            >
              <Plus size={16} /> Produit
            </button>
          </div>
        </section>

        <section>
          {isLoading ? (
            <div className="text-center py-10">
              <Loader2
                className="animate-spin text-purple-600 mx-auto"
                size={32}
              />
            </div>
          ) : error ? (
            <div className="text-center py-10 text-red-500 bg-red-50 p-4 rounded-lg">
              {error}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingCart size={48} className="mx-auto text-gray-300" />
              <h3 className="mt-4 text-lg font-semibold">
                Aucun produit trouvé
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Ajoutez votre premier produit pour commencer.
              </p>
              <button
                onClick={openCreateModal}
                className="mt-4 bg-purple-600 text-white px-5 py-2.5 rounded-lg"
              >
                Ajouter un produit
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white p-3 rounded-lg shadow-sm flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 ${
                        product.couleur === "red"
                          ? "bg-red-100 text-red-600"
                          : "bg-blue-100 text-blue-600"
                      } rounded-full flex items-center justify-center`}
                    >
                      {product.emoji}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {product.name}
                      </p>
                      <div className="text-xs text-gray-500">
                        {product.stock} en stock
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-gray-800">
                      {product.price} DA
                    </p>
                    <button
                      onClick={() => openEditModal(product)}
                      className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <CreateProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
        product={editingProduct}
        // Tu peux passer les catégories ici si le modal en a besoin
        // categories={categories}
      />
    </>
  );
}
