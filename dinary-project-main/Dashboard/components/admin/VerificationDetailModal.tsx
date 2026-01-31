// dans @/components/admin/VerificationDetailModal.tsx

"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, CheckCircle, XCircle, Eye } from "lucide-react";
import { API_URL } from "@/lib/api";

// --- INTERFACES ---
interface VerificationRequest {
  id: string;
  documentType: string;
  frontImageUrl: string;
  backImageUrl?: string | null;
  selfieImageUrl?: string | null;
  selfieInstruction?: string | null;
  taxNumber?: string | null; // Numéro d'impôt (pour les marchands)
  user: {
    fullName: string;
    email: string;
    role?: string;
  };
  createdAt: string;
}

interface ModalProps {
  request: VerificationRequest | null;
  onClose: () => void;
  onAction: () => void;
  token: string | null;
}

// --- COMPOSANT POUR L'AGRANDISSEMENT (MODIFIÉ) ---
const ImageViewer = ({
  src,
  onClose,
  token,
}: {
  src: string;
  onClose: () => void;
  token: string | null;
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageBlobUrl, setImageBlobUrl] = useState<string | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    // Charger l'image via fetch avec le token d'authentification
    const loadImage = async () => {
      if (!src || !token) {
        setImageError(true);
        setIsLoading(false);
        return;
      }

      // Nettoyer l'ancienne URL blob si elle existe
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }

      try {
        setIsLoading(true);
        setImageError(false);

        const response = await fetch(src, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        blobUrlRef.current = blobUrl;
        setImageBlobUrl(blobUrl);
        setIsLoading(false);
      } catch (error) {
        /* log removed */
        setImageError(true);
        setIsLoading(false);
      }
    };

    loadImage();

    // Nettoyer l'URL blob quand le composant est démonté ou quand src change
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [src, token]);

  return (
    <div
      className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-3xl z-[110] hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center"
      >
        &times;
      </button>
      {isLoading && !imageError && (
        <div className="text-white text-lg">Chargement de l'image...</div>
      )}
      {imageError ? (
        <div className="text-white text-center">
          <p className="text-lg mb-2">❌ Erreur de chargement de l'image</p>
          <p className="text-sm text-gray-300 mb-4">URL: {src}</p>
          <button
            onClick={() => {
              setImageError(false);
              setIsLoading(true);
            }}
            className="px-4 py-2 bg-white text-black rounded hover:bg-gray-200"
          >
            Réessayer
          </button>
        </div>
      ) : (
        imageBlobUrl && (
          <img
            src={imageBlobUrl}
            alt="Document en grand"
            className="max-w-[90vw] max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
            onError={(e) => {
              /* log removed */
              setImageError(true);
            }}
          />
        )
      )}
    </div>
  );
};

// --- COMPOSANT PRINCIPAL (MODIFIÉ) ---
export default function VerificationDetailModal({
  request,
  onClose,
  onAction,
  token,
}: ModalProps) {
  const [imageToView, setImageToView] = useState<string | null>(null);
  const [showDataForm, setShowDataForm] = useState(false);
  const [sensitiveData, setSensitiveData] = useState({
    documentNumber: "",
    dateOfBirth: "",
    address: "",
    nationality: "",
    issueDate: "",
    expirationDate: "",
    placeOfBirth: "",
    taxNumber: "", // Ajout du numéro d'impôt
  });
  const [notes, setNotes] = useState("");

  if (!request) return null;

  const handleApproveClick = () => {
    setShowDataForm(true);
  };

  const handleSubmitApproval = async () => {
    // Vérifier si au moins un champ est rempli
    const hasAnyData = Object.values(sensitiveData).some(value => value && value.trim());
    
    if (!hasAnyData && !notes.trim()) {
      const confirm = window.confirm(
        "⚠️ Aucune donnée n'a été saisie.\n\nÊtes-vous sûr de vouloir approuver sans archiver de données sensibles ?\n\n(L'archive sera créée mais vide)"
      );
      if (!confirm) return;
    }

    try {
      const response = await fetch(
        `${API_URL}/admin/identity/${request.id}/approve`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            sensitiveData,
            notes,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Échec de l'approbation`);
      }

      alert("La vérification a été approuvée et les données ont été archivées de manière sécurisée.");
      onAction();
      onClose();
    } catch (error) {
      /* log removed */
      alert(
        `Une erreur est survenue : ${
          error instanceof Error ? error.message : "Erreur inconnue"
        }`
      );
    }
  };

  const handleReject = async () => {
    const reason = prompt("Veuillez indiquer la raison du rejet :");
    if (!reason) return;

    try {
      const response = await fetch(
        `${API_URL}/admin/identity/${request.id}/reject`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reason }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Échec du rejet`);
      }

      alert("La vérification a été rejetée.");
      onAction();
      onClose();
    } catch (error) {
      /* log removed */
      alert(
        `Une erreur est survenue : ${
          error instanceof Error ? error.message : "Erreur inconnue"
        }`
      );
    }
  };

  // Construire les URLs des images via l'endpoint API sécurisé
  const buildImageUrl = (imageType: 'front' | 'back' | 'selfie') => {
    return `${API_URL}/identity/image/${request.id}/${imageType}`;
  };

  const frontImageUrl = buildImageUrl('front');
  const backImageUrl = request.backImageUrl ? buildImageUrl('back') : null;
  const selfieImageUrl = request.selfieImageUrl ? buildImageUrl('selfie') : null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl p-6 my-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Vérification d'identité</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-800"
            >
              <X size={24} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Colonne de gauche : Informations */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Utilisateur
                </h3>
                <p>{request.user.fullName}</p>
                <p className="text-xs text-gray-400">{request.user.email}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Type de document
                </h3>
                <p>{request.documentType.replace("_", " ")}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Date de soumission
                </h3>
                <p>{new Date(request.createdAt).toLocaleDateString("fr-FR")}</p>
              </div>
              {/* Afficher le numéro d'impôt si c'est un marchand */}
              {request.user.role === 'MERCHANT' && request.taxNumber && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Numéro d'impôt
                  </h3>
                  <p className="font-semibold text-indigo-700">{request.taxNumber}</p>
                </div>
              )}
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Instruction pour le selfie
                </h3>
                <p className="p-2 bg-blue-50 border border-blue-200 text-blue-800 rounded-md mt-1 text-sm">
                  {request.selfieInstruction || "Aucune instruction"}
                </p>
              </div>
            </div>

            {/* Colonne de droite : Boutons pour voir les images */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-500">
                Documents Soumis
              </h3>
              <button
                onClick={() => setImageToView(frontImageUrl)}
                className="w-full ..."
              >
                <Eye className="mr-2" size={16} /> Voir l'image Recto
              </button>
              {backImageUrl && (
                <button
                  onClick={() => setImageToView(backImageUrl)}
                  className="w-full ..."
                >
                  <Eye className="mr-2" size={16} /> Voir l'image Verso
                </button>
              )}
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-500">
                Selfie de vérification
              </h3>
              {selfieImageUrl ? (
                <button
                  onClick={() => setImageToView(selfieImageUrl)}
                  className="w-full ..."
                >
                  <Eye className="mr-2" size={16} /> Voir le selfie
                </button>
              ) : (
                <p className="text-sm text-gray-400">Aucun selfie fourni.</p>
              )}
            </div>
          </div>

          {/* Formulaire de données sensibles (s'affiche après clic sur Approuver) */}
          {showDataForm && (
            <div className="mt-6 border-t pt-4">
              <h3 className="text-lg font-bold mb-2 text-indigo-900">
                📝 Données du document (à archiver)
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Ces données seront chiffrées et stockées de manière sécurisée. Remplissez au moins les informations importantes.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Numéro de document 🔢
                  </label>
                  <input
                    type="text"
                    value={sensitiveData.documentNumber}
                    onChange={(e) => setSensitiveData({...sensitiveData, documentNumber: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Ex: AB123456"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date de naissance 🎂
                  </label>
                  <input
                    type="text"
                    value={sensitiveData.dateOfBirth}
                    onChange={(e) => setSensitiveData({...sensitiveData, dateOfBirth: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Ex: 01/01/1990"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nationalité 🌍
                  </label>
                  <input
                    type="text"
                    value={sensitiveData.nationality}
                    onChange={(e) => setSensitiveData({...sensitiveData, nationality: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Ex: Française"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lieu de naissance 📍
                  </label>
                  <input
                    type="text"
                    value={sensitiveData.placeOfBirth}
                    onChange={(e) => setSensitiveData({...sensitiveData, placeOfBirth: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Ex: Paris"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse 🏠
                  </label>
                  <input
                    type="text"
                    value={sensitiveData.address}
                    onChange={(e) => setSensitiveData({...sensitiveData, address: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Ex: 123 Rue Exemple, 75001 Paris"
                  />
                </div>
                {/* Champ Numéro d'impôt - affiché seulement pour les marchands */}
                {request.user.role === 'MERCHANT' && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Numéro d'impôt 🧾
                    </label>
                    <input
                      type="text"
                      value={sensitiveData.taxNumber}
                      onChange={(e) => setSensitiveData({...sensitiveData, taxNumber: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Ex: 1234567890123"
                    />
                    <p className="text-xs text-gray-500 mt-1">
      Numéro d'identification fiscale du commerçant
    </p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date d'émission 📅
                  </label>
                  <input
                    type="text"
                    value={sensitiveData.issueDate}
                    onChange={(e) => setSensitiveData({...sensitiveData, issueDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Ex: 01/01/2020"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date d'expiration ⏰
                  </label>
                  <input
                    type="text"
                    value={sensitiveData.expirationDate}
                    onChange={(e) => setSensitiveData({...sensitiveData, expirationDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Ex: 01/01/2030"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (optionnel) 📝
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Notes additionnelles..."
                    rows={2}
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-3">
                <button
                  onClick={() => setShowDataForm(false)}
                  className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSubmitApproval}
                  className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 font-medium flex items-center"
                >
                  <CheckCircle size={16} className="mr-2" /> Confirmer et Archiver
                </button>
              </div>
            </div>
          )}

          {/* Actions (uniquement si le formulaire n'est pas affiché) */}
          {!showDataForm && (
            <div className="mt-6 flex justify-end space-x-3 border-t pt-4">
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-md flex items-center hover:bg-red-100"
              >
                <XCircle size={16} className="mr-2" /> Rejeter
              </button>
              <button
                onClick={handleApproveClick}
                className="px-4 py-2 bg-green-50 text-green-600 rounded-md flex items-center hover:bg-green-100"
              >
                <CheckCircle size={16} className="mr-2" /> Approuver
              </button>
            </div>
          )}
        </div>
      </div>

      {imageToView && (
        <ImageViewer 
          src={imageToView} 
          onClose={() => setImageToView(null)}
          token={token}
        />
      )}
    </>
  );
}
