// src/app/profile/verification/page.tsx

"use client";

import React, { useState, useMemo } from "react"; // Ajout de useMemo
import { useAuth } from "@/context/AuthContext";
import PageHeader from "@/components/layouts/PageHeader";
import {
  Loader2,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  Camera,
} from "lucide-react";

// Instructions aléatoires pour le selfie
const selfieInstructions = [
  "Tenez votre pièce d'identité à la verticale à côté de votre visage.",
  "Tenez votre pièce d'identité à l'horizontale sous votre menton.",
  "Montrez le chiffre 3 avec les doigts de votre main libre.",
  "Faites un signe 'pouce en l'air' avec votre main libre.",
];

export default function VerificationPage() {
  const { user, token, refreshUser } = useAuth();
  const [documentType, setDocumentType] = useState("ID_CARD");
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [selfieImage, setSelfieImage] = useState<File | null>(null); // NOUVEAU: état pour le selfie
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // NOUVEAU: Générer une instruction aléatoire et la mémoriser
  const selfieInstruction = useMemo(() => {
    return selfieInstructions[
      Math.floor(Math.random() * selfieInstructions.length)
    ];
  }, []);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "front" | "back" | "selfie" // NOUVEAU: ajout de 'selfie'
  ) => {
    if (e.target.files && e.target.files[0]) {
      if (type === "front") setFrontImage(e.target.files[0]);
      if (type === "back") setBackImage(e.target.files[0]);
      if (type === "selfie") setSelfieImage(e.target.files[0]); // NOUVEAU: gestion du selfie
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !frontImage ||
      (documentType !== "PASSPORT" && !backImage) ||
      !selfieImage // NOUVEAU: validation du selfie
    ) {
      setError("Veuillez fournir toutes les images requises.");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    const formData = new FormData();
    formData.append("documentType", documentType);
    formData.append("selfieInstruction", selfieInstruction); // NOUVEAU: on envoie l'instruction
    if (frontImage) formData.append("frontImage", frontImage);
    if (backImage) formData.append("backImage", backImage);
    if (selfieImage) formData.append("selfieImage", selfieImage); // NOUVEAU: ajout du selfie

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/identity/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Une erreur est survenue.");
      }

      setSuccess("Vos documents ont été soumis avec succès !");
      refreshUser();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStatus = () => {
    // ... (votre code existant pour renderStatus, pas de changement)
    if (!user) return null;
    switch (user.verificationStatus) {
      case "VERIFIED":
        return (
          <div className="bg-green-50 text-center p-6 rounded-xl">
            <CheckCircle className="mx-auto text-green-500" size={48} />
            <h2 className="text-xl font-bold mt-4">Identité vérifiée</h2>
            <p className="text-gray-600 mt-2">
              Votre compte est entièrement fonctionnel.
            </p>
          </div>
        );
      case "PENDING":
        return (
          <div className="bg-blue-50 text-center p-6 rounded-xl">
            <Clock className="mx-auto text-blue-500" size={48} />
            <h2 className="text-xl font-bold mt-4">Vérification en cours</h2>
            <p className="text-gray-600 mt-2">
              Nos équipes examinent vos documents.
            </p>
          </div>
        );
      case "REJECTED":
        return (
          <div className="bg-red-50 text-center p-6 rounded-xl">
            <XCircle className="mx-auto text-red-500" size={48} />
            <h2 className="text-xl font-bold mt-4">Vérification rejetée</h2>
            <p className="text-gray-600 mt-2">
              Vos documents n'ont pas pu être validés. Veuillez réessayer.
            </p>
          </div>
        );
      default:
        return (
          <div className="bg-yellow-50 text-center p-6 rounded-xl">
            <Upload className="mx-auto text-yellow-500" size={48} />
            <h2 className="text-xl font-bold mt-4">Vérifiez votre identité</h2>
            <p className="text-gray-600 mt-2">
              Soumettez vos documents pour accéder à toutes les fonctionnalités.
            </p>
          </div>
        );
    }
  };

  const showForm =
    !user ||
    user.verificationStatus === "NOT_SUBMITTED" ||
    user.verificationStatus === "REJECTED";

  return (
    <div className="bg-white min-h-screen mb-16">
      <PageHeader
        title="Vérification"
        emoji="🛡️"
        hasBackButton={true}
        backTo="/profile"
      />
      <div className="px-5 py-4">
        <div className="mb-6">{renderStatus()}</div>

        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ... (champs type de document, recto, verso restent inchangés) ... */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de document
              </label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="ID_CARD">Carte d'identité</option>
                <option value="DRIVER_LICENSE">Permis de conduire</option>
                <option value="PASSPORT">Passeport</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recto du document
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "front")}
                className="w-full text-sm"
              />
              {frontImage && (
                <span className="text-xs text-green-600">
                  Fichier: {frontImage.name}
                </span>
              )}
            </div>
            {documentType !== "PASSPORT" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Verso du document
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "back")}
                  className="w-full text-sm"
                />
                {backImage && (
                  <span className="text-xs text-green-600">
                    Fichier: {backImage.name}
                  </span>
                )}
              </div>
            )}

            {/* --- NOUVELLE SECTION POUR LE SELFIE --- */}
            <div className="border-t pt-4 space-y-2">
              <h3 className="text-base font-semibold text-gray-800">
                Étape finale : Selfie de vérification
              </h3>
              <div className="bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded-lg text-sm">
                <p>
                  Pour confirmer votre identité, veuillez prendre une photo de
                  vous en suivant cette instruction :
                </p>
                <p className="font-bold mt-2 text-center">
                  "{selfieInstruction}"
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Camera size={14} className="inline mr-1" />
                  Téléverser votre selfie
                </label>
                <input
                  type="file"
                  accept="image/*"
                  capture="user" // Ouvre la caméra frontale sur mobile
                  onChange={(e) => handleFileChange(e, "selfie")}
                  className="w-full text-sm"
                />
                {selfieImage && (
                  <span className="text-xs text-green-600">
                    Fichier: {selfieImage.name}
                  </span>
                )}
              </div>
            </div>
            {/* --- FIN DE LA NOUVELLE SECTION --- */}

            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && <p className="text-green-500 text-sm">{success}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-black text-white rounded-xl font-medium disabled:opacity-50 flex items-center justify-center"
            >
              {isLoading && <Loader2 className="mr-2 animate-spin" size={16} />}
              {isLoading ? "Envoi en cours..." : "Soumettre les documents"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
