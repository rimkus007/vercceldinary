"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

interface SuggestCommerceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CommerceSubmission) => void;
  referralReward?: number;
}

export interface CommerceSubmission {
  name: string;
  address: string;
  category: string;
  contactName?: string;
  contactPhone?: string;
  notes?: string;
}

const categories = [
  { id: "restaurant", name: "Restaurant", emoji: "🍽️" },
  { id: "groceries", name: "Épicerie", emoji: "🥬" },
  { id: "retail", name: "Boutique", emoji: "🛍️" },
  { id: "fashion", name: "Mode", emoji: "👕" },
  { id: "health", name: "Santé", emoji: "💊" },
  { id: "tech", name: "Tech", emoji: "📱" },
  { id: "loisirs", name: "Loisirs", emoji: "🎮" },
  { id: "other", name: "Autre", emoji: "📌" },
];

export default function SuggestCommerceModal({
  isOpen,
  onClose,
  onSubmit,
  referralReward = 500,
}: SuggestCommerceModalProps) {
  const [formData, setFormData] = useState<CommerceSubmission>({
    name: "",
    address: "",
    category: "other",
    contactName: "",
    contactPhone: "",
    notes: "",
  });

  const [step, setStep] = useState<1 | 2>(1);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [selectedCategory, setSelectedCategory] = useState<string>("other");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setFormData((prev) => ({ ...prev, category }));
  };

  const handleNextStep = () => {
    // Validation basique
    if (!formData.name || !formData.address) {
      alert("Merci de remplir tous les champs obligatoires");
      return;
    }
    setStep(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus("submitting");

    // Simulation d'envoi à l'API
    setTimeout(() => {
      onSubmit(formData);
      setSubmitStatus("success");
      // Ne plus fermer automatiquement - l'utilisateur doit cliquer pour fermer
    }, 1000);
  };

  const handleCloseSuccess = () => {
    // Réinitialiser le formulaire et fermer
    setFormData({
      name: "",
      address: "",
      category: "other",
      contactName: "",
      contactPhone: "",
      notes: "",
    });
    setStep(1);
    setSubmitStatus("idle");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-2xl w-full max-w-lg p-5 mx-4"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {" "}
        {submitStatus === "success" ? (
          <div className="py-10 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-6">
              <span className="text-green-600 text-3xl">✓</span>
            </div>
            <h2 className="text-xl font-bold mb-2">
              Merci pour votre suggestion!
            </h2>
            <p className="text-gray-600 mb-4">
              Nous allons étudier votre proposition et contacter ce commerçant
              pour l'inviter à rejoindre Dinary.
            </p>

            {/* Information sur les points étoilés */}
            <div className="bg-yellow-50 rounded-lg p-4 mb-6 text-left">
              <div className="flex items-center mb-2">
                <span className="text-xl mr-2">⭐</span>
                <h3 className="font-bold">Récompense de parrainage</h3>
              </div>
              <p className="text-sm text-gray-700">
                Si ce commerçant rejoint Dinary, vous recevrez{" "}
                <span className="font-bold text-lg text-amber-600">
                  {referralReward.toLocaleString("fr-FR")} DA
                </span>{" "}
                en récompense de parrainage !
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  window.location.href = "/suggestions";
                }}
                className="w-full bg-gray-100 hover:bg-gray-200 text-black py-3 rounded-xl font-semibold transition-colors"
              >
                Voir mes suggestions
              </button>
              <button
                onClick={handleCloseSuccess}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-xl font-semibold transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">
                {step === 1
                  ? "Suggérer un commerçant"
                  : "Informations complémentaires"}
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100"
              >
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

            <form onSubmit={handleSubmit}>
              {step === 1 ? (
                <>
                  <div className="mb-4">
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="name"
                    >
                      Nom du commerce <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Ex: Café des Amis"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="address"
                    >
                      Adresse <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Ex: 15 rue des Oliviers, Alger"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">
                      Catégorie <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {categories.map((category) => (
                        <button
                          type="button"
                          key={category.id}
                          onClick={() => handleCategorySelect(category.id)}
                          className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center transition-colors ${
                            selectedCategory === category.id
                              ? "bg-black text-white"
                              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                          }`}
                        >
                          <span className="text-xl mb-1">{category.emoji}</span>
                          <span className="text-xs font-medium">
                            {category.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="bg-black text-white py-3 px-5 rounded-xl font-medium"
                    >
                      Continuer
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-600 mb-4">
                    Ces informations sont facultatives mais nous aideront à
                    contacter le commerçant plus facilement.
                  </p>

                  <div className="mb-4">
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="contactName"
                    >
                      Nom du contact (facultatif)
                    </label>
                    <input
                      type="text"
                      id="contactName"
                      name="contactName"
                      value={formData.contactName}
                      onChange={handleChange}
                      placeholder="Ex: Ahmed Benali"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>

                  <div className="mb-4">
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="contactPhone"
                    >
                      Téléphone du contact (facultatif)
                    </label>
                    <input
                      type="tel"
                      id="contactPhone"
                      name="contactPhone"
                      value={formData.contactPhone}
                      onChange={handleChange}
                      placeholder="Ex: 05 XX XX XX XX"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>

                  <div className="mb-6">
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="notes"
                    >
                      Notes ou informations complémentaires
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Ex: Commerçant spécialisé dans les produits bio, très apprécié dans le quartier..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 bg-gray-100 text-gray-800 py-3 rounded-xl font-medium"
                    >
                      Retour
                    </button>
                    <button
                      type="submit"
                      disabled={submitStatus === "submitting"}
                      className="flex-1 bg-black text-white py-3 rounded-xl font-medium flex items-center justify-center"
                    >
                      {submitStatus === "submitting" ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Envoi...
                        </>
                      ) : (
                        "Envoyer la suggestion"
                      )}
                    </button>
                  </div>
                </>
              )}
            </form>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
