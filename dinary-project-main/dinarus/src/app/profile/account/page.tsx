"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "@/components/layouts/PageHeader";
import { useAuth } from "@/context/AuthContext";

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  field: string;
  value: string;
  onSave: (value: string) => void;
  type?: string;
  placeholder?: string;
}

const EditModal: React.FC<EditModalProps> = ({
  isOpen,
  onClose,
  title,
  field,
  value,
  onSave,
  type = "text",
  placeholder
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!inputValue.trim()) return;
    
    setIsLoading(true);
    try {
      await onSave(inputValue);
      onClose();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-semibold mb-4">{title}</h3>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {field}
              </label>
              <input
                type={type}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={placeholder}
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading || !inputValue.trim()}
                className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Sauvegarde..." : "Sauvegarder"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default function AccountPage() {
  const { user, token } = useAuth();
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    field: string;
    title: string;
    value: string;
    type?: string;
    placeholder?: string;
  }>({
    isOpen: false,
    field: "",
    title: "",
    value: "",
    type: "text",
    placeholder: ""
  });

  const [userInfo, setUserInfo] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.username || "",
    birthDate: "",
    address: "",
    city: "",
    postalCode: ""
  });

  const openEditModal = (field: string, title: string, value: string, type = "text", placeholder = "") => {
    setEditModal({
      isOpen: true,
      field,
      title,
      value,
      type,
      placeholder
    });
  };

  const closeEditModal = () => {
    setEditModal(prev => ({ ...prev, isOpen: false }));
  };

  const handleSave = async (value: string) => {
    try {
      // Simulation simple pour le moment
      console.log('Sauvegarde de:', editModal.field, '=', value);
      
      // Attendre un peu pour simuler l'API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mettre à jour l'état local
      setUserInfo(prev => ({
        ...prev,
        [editModal.field]: value
      }));

      // Message de succès
      alert("Informations mises à jour avec succès !");
      
    } catch (error: any) {
      console.error("Erreur:", error);
      alert("Erreur lors de la mise à jour. Veuillez réessayer.");
      throw error;
    }
  };

  return (
    <div className="bg-white min-h-screen mb-16">
      <PageHeader
        title="Informations personnelles"
        emoji="👤"
        hasBackButton={true}
        openProfileModalOnBack={true}
      />

      <div className="px-5 py-4">
        {/* Informations de base */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">
            Informations de base
          </h2>
          
          <div className="space-y-4">
            {/* Nom complet */}
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Nom complet</h3>
                  <p className="font-semibold text-gray-900">
                    {userInfo.fullName || "Non renseigné"}
                  </p>
                </div>
                <button
                  onClick={() => openEditModal("fullName", "Modifier le nom complet", userInfo.fullName, "text", "Entrez votre nom complet")}
                  className="ml-4 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Modifier
                </button>
              </div>
            </div>

            {/* Email */}
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Adresse email</h3>
                  <p className="font-semibold text-gray-900">
                    {userInfo.email || "Non renseigné"}
                  </p>
                </div>
                <button
                  onClick={() => openEditModal("email", "Modifier l'email", userInfo.email, "email", "exemple@email.com")}
                  className="ml-4 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Modifier
                </button>
              </div>
            </div>

            {/* Téléphone */}
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Numéro de téléphone</h3>
                  <p className="font-semibold text-gray-900">
                    {userInfo.phone ? `+213 ${userInfo.phone}` : "Non renseigné"}
                  </p>
                </div>
                <button
                  onClick={() => openEditModal("phone", "Modifier le téléphone", userInfo.phone, "tel", "0X XX XX XX XX")}
                  className="ml-4 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Modifier
                </button>
              </div>
            </div>

            {/* Date de naissance */}
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Date de naissance</h3>
                  <p className="font-semibold text-gray-900">
                    {userInfo.birthDate || "Non renseigné"}
                  </p>
                </div>
                <button
                  onClick={() => openEditModal("birthDate", "Modifier la date de naissance", userInfo.birthDate, "date")}
                  className="ml-4 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Modifier
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Adresse */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">
            Adresse
          </h2>
          
          <div className="space-y-4">
            {/* Adresse complète */}
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Adresse complète</h3>
                  <p className="font-semibold text-gray-900">
                    {userInfo.address || "Non renseigné"}
                  </p>
                </div>
                <button
                  onClick={() => openEditModal("address", "Modifier l'adresse", userInfo.address, "text", "123 Rue Example, Quartier")}
                  className="ml-4 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Modifier
                </button>
              </div>
            </div>

            {/* Ville */}
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Ville</h3>
                  <p className="font-semibold text-gray-900">
                    {userInfo.city || "Non renseigné"}
                  </p>
                </div>
                <button
                  onClick={() => openEditModal("city", "Modifier la ville", userInfo.city, "text", "Alger, Oran, Constantine...")}
                  className="ml-4 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Modifier
                </button>
              </div>
            </div>

            {/* Code postal */}
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Code postal</h3>
                  <p className="font-semibold text-gray-900">
                    {userInfo.postalCode || "Non renseigné"}
                  </p>
                </div>
                <button
                  onClick={() => openEditModal("postalCode", "Modifier le code postal", userInfo.postalCode, "text", "16000")}
                  className="ml-4 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Modifier
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Note informative */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start">
            <span className="text-blue-500 text-lg mr-3">ℹ️</span>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">
                Pourquoi ces informations ?
              </h3>
              <p className="text-sm text-blue-800">
                Ces informations nous permettent de personnaliser votre expérience et de vous contacter si nécessaire. Toutes vos données sont sécurisées et protégées.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de modification */}
      <EditModal
        isOpen={editModal.isOpen}
        onClose={closeEditModal}
        title={editModal.title}
        field={editModal.field}
        value={editModal.value}
        onSave={handleSave}
        type={editModal.type}
        placeholder={editModal.placeholder}
      />
    </div>
  );
}
