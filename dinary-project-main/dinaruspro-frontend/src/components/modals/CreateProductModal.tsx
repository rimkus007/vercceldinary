"use client";

import React, { useState, useEffect } from "react";
import { Loader2, UploadCloud } from "lucide-react";

// Interface pour le type de données du produit
interface Product {
  id: string;
  name: string;
  price: number;
  description?: string | null;
  category?: string | null;
  stock?: number;
  emoji?: string;
  imageUrl?: string | null; // Champ pour l'URL de l'image
}

// Interface pour les props du modal
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  // onSave accepte maintenant FormData pour pouvoir envoyer des fichiers
  // L'ID est optionnel (pour la mise à jour)
  onSave: (data: FormData, productId?: string) => Promise<boolean>;
  product: Product | null; // Le produit à modifier, ou null pour une création
}

export default function CreateProductModal({
  isOpen,
  onClose,
  onSave,
  product,
}: ModalProps) {
  // État pour les champs du formulaire
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    stock: "",
    category: "",
    emoji: "📦",
  });

  // États pour la gestion de l'image
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Pré-remplir le formulaire si on est en mode édition
  useEffect(() => {
    if (isOpen) {
      if (product) {
        setFormData({
          name: product.name,
          price: product.price.toString(),
          description: product.description || "",
          stock: product.stock?.toString() || "",
          category: product.category || "",
          emoji: product.emoji || "📦",
        });
        // Affiche l'image existante du produit
        setImagePreview(product.imageUrl || null);
      } else {
        // Réinitialise tout pour une création
        setFormData({
          name: "",
          price: "",
          description: "",
          stock: "",
          category: "",
          emoji: "📦",
        });
        setImagePreview(null);
      }
      setImageFile(null);
      setError("");
    }
  }, [product, isOpen]);

  // Gère les changements dans les champs de texte
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Gère la sélection d'un fichier image
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      // Crée une URL locale pour l'aperçu instantané de l'image
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Gère la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || parseFloat(formData.price) <= 0) {
      setError("Veuillez remplir le nom et un prix valide.");
      return;
    }
    setIsLoading(true);
    setError("");

    // On utilise FormData pour pouvoir envoyer le fichier image
    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("price", formData.price);
    formDataToSend.append("description", formData.description || "");
    formDataToSend.append("stock", formData.stock || "0");
    formDataToSend.append("category", formData.category || "");
    formDataToSend.append("emoji", formData.emoji || "📦");

    // On ajoute le fichier image seulement s'il a été sélectionné
    if (imageFile) {
      formDataToSend.append("image", imageFile);
    }

    // On appelle onSave en passant l'ID du produit s'il existe (pour une mise à jour)
    const success = await onSave(formDataToSend, product?.id);

    setIsLoading(false);
    if (!success) {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } else {
      onClose(); // Ferme le modal en cas de succès
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl p-5 w-full max-w-md max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">
            {product ? "Modifier le produit" : "Nouveau produit"}
          </h2>
          <button onClick={onClose} className="text-gray-400">
            ✕
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 overflow-y-auto pr-2"
        >
          {/* --- Section pour l'upload d'image --- */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image du produit
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Aperçu"
                    className="mx-auto h-24 w-auto rounded-md object-cover"
                  />
                ) : (
                  <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                )}
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500"
                  >
                    <span>Téléverser un fichier</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      onChange={handleFileChange}
                      accept="image/*"
                    />
                  </label>
                  <p className="pl-1">ou glissez-déposez</p>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF jusqu'à 2MB
                </p>
              </div>
            </div>
          </div>

          {/* --- Reste du formulaire --- */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom du produit
            </label>
            <input
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prix (DA)
              </label>
              <input
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg"
                required
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock
              </label>
              <input
                name="stock"
                type="number"
                value={formData.stock}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg"
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optionnel)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg flex items-center disabled:opacity-50"
            >
              {isLoading && <Loader2 className="animate-spin mr-2" size={16} />}
              {isLoading ? "Sauvegarde..." : "Sauvegarder"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
