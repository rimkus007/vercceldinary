"use client";

import React, { useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Loader2,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  Camera,
  Shield,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

// Instructions aléatoires pour le selfie
const selfieInstructions = [
  "Tenez votre pièce d'identité à la verticale à côté de votre visage.",
  "Tenez votre pièce d'identité à l'horizontale sous votre menton.",
  "Montrez le chiffre 3 avec les doigts de votre main libre.",
  "Faites un signe 'pouce en l'air' avec votre main libre.",
];

export default function MerchantVerificationPage() {
  const { user, token, refreshUser } = useAuth();
  const [documentType, setDocumentType] = useState("ID_CARD");
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [selfieImage, setSelfieImage] = useState<File | null>(null);
  const [taxNumber, setTaxNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Générer une instruction aléatoire et la mémoriser
  const selfieInstruction = useMemo(() => {
    return selfieInstructions[
      Math.floor(Math.random() * selfieInstructions.length)
    ];
  }, []);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "front" | "back" | "selfie"
  ) => {
    if (e.target.files && e.target.files[0]) {
      if (type === "front") setFrontImage(e.target.files[0]);
      if (type === "back") setBackImage(e.target.files[0]);
      if (type === "selfie") setSelfieImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !frontImage ||
      (documentType !== "PASSPORT" && !backImage) ||
      !selfieImage
    ) {
      setError("Veuillez fournir toutes les images requises.");
      return;
    }

    if (!taxNumber || taxNumber.trim() === "") {
      setError("Le numéro d'impôt est obligatoire pour les marchands.");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    const formData = new FormData();
    formData.append("documentType", documentType);
    formData.append("selfieInstruction", selfieInstruction);
    formData.append("taxNumber", taxNumber.trim());
    if (frontImage) formData.append("frontImage", frontImage);
    if (backImage) formData.append("backImage", backImage);
    if (selfieImage) formData.append("selfieImage", selfieImage);

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
    if (!user) return null;

    if (user.verificationStatus === "VERIFIED") {
      return (
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 flex items-start">
          <CheckCircle className="text-green-600 mr-4 flex-shrink-0" size={28} />
          <div>
            <h3 className="font-bold text-green-900 text-lg">Compte vérifié ✅</h3>
            <p className="text-green-700 mt-1">
              Votre identité a été vérifiée avec succès. Vous avez accès à toutes les fonctionnalités.
            </p>
          </div>
        </div>
      );
    }

    if (user.verificationStatus === "PENDING") {
      return (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 flex items-start">
          <Clock className="text-blue-600 mr-4 flex-shrink-0" size={28} />
          <div>
            <h3 className="font-bold text-blue-900 text-lg">Vérification en cours ⏳</h3>
            <p className="text-blue-700 mt-1">
              Vos documents sont en cours de vérification par notre équipe. Vous serez notifié sous peu.
            </p>
          </div>
        </div>
      );
    }

    if (user.verificationStatus === "REJECTED") {
      return (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 flex items-start">
          <XCircle className="text-red-600 mr-4 flex-shrink-0" size={28} />
          <div>
            <h3 className="font-bold text-red-900 text-lg">Vérification refusée ❌</h3>
            <p className="text-red-700 mt-1">
              Votre demande a été refusée. Veuillez soumettre de nouveaux documents conformes.
            </p>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Retour au tableau de bord
          </Link>
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-4 rounded-2xl">
              <Shield className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Vérification d'identité
              </h1>
              <p className="text-gray-600 mt-1">
                Sécurisez votre compte marchand et accédez à toutes les fonctionnalités
              </p>
            </div>
          </div>
        </div>

        {/* Statut */}
        {renderStatus()}

        {/* Formulaire de soumission */}
        {user?.verificationStatus !== "VERIFIED" &&
          user?.verificationStatus !== "PENDING" && (
            <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Soumettre vos documents
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Type de document */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de document
                  </label>
                  <select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="ID_CARD">Carte d'identité nationale</option>
                    <option value="PASSPORT">Passeport</option>
                    <option value="DRIVER_LICENSE">Permis de conduire</option>
                  </select>
                </div>

                {/* Numéro d'impôt */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numéro d'impôt <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={taxNumber}
                    onChange={(e) => setTaxNumber(e.target.value)}
                    placeholder="Entrez votre numéro d'impôt"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Le numéro d'impôt est obligatoire pour les marchands.
                  </p>
                </div>

                {/* Recto */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Photo Recto
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "front")}
                      className="hidden"
                      id="front-upload"
                    />
                    <label
                      htmlFor="front-upload"
                      className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
                    >
                      {frontImage ? (
                        <div className="text-center">
                          <CheckCircle className="mx-auto text-green-600 mb-2" size={32} />
                          <p className="text-sm font-medium text-gray-700">{frontImage.name}</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                          <p className="text-sm text-gray-600">
                            Cliquez pour télécharger le recto
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Verso (si pas passeport) */}
                {documentType !== "PASSPORT" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Photo Verso
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, "back")}
                        className="hidden"
                        id="back-upload"
                      />
                      <label
                        htmlFor="back-upload"
                        className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
                      >
                        {backImage ? (
                          <div className="text-center">
                            <CheckCircle className="mx-auto text-green-600 mb-2" size={32} />
                            <p className="text-sm font-medium text-gray-700">{backImage.name}</p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                            <p className="text-sm text-gray-600">
                              Cliquez pour télécharger le verso
                            </p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                )}

                {/* Selfie avec instruction */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selfie de vérification
                  </label>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-3">
                    <div className="flex items-start">
                      <Camera className="text-blue-600 mr-3 flex-shrink-0" size={20} />
                      <div>
                        <p className="text-sm font-medium text-blue-900">
                          Instruction importante :
                        </p>
                        <p className="text-sm text-blue-700 mt-1">
                          {selfieInstruction}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "selfie")}
                      className="hidden"
                      id="selfie-upload"
                    />
                    <label
                      htmlFor="selfie-upload"
                      className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
                    >
                      {selfieImage ? (
                        <div className="text-center">
                          <CheckCircle className="mx-auto text-green-600 mb-2" size={32} />
                          <p className="text-sm font-medium text-gray-700">{selfieImage.name}</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Camera className="mx-auto text-gray-400 mb-2" size={32} />
                          <p className="text-sm text-gray-600">
                            Cliquez pour prendre un selfie
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Messages d'erreur/succès */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start">
                    <XCircle className="text-red-600 mr-3 flex-shrink-0" size={20} />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start">
                    <CheckCircle className="text-green-600 mr-3 flex-shrink-0" size={20} />
                    <p className="text-sm text-green-700">{success}</p>
                  </div>
                )}

                {/* Bouton de soumission */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={20} />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2" size={20} />
                      Soumettre pour vérification
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

        {/* Informations de sécurité */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 mt-8">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center">
            <Shield className="mr-2 text-blue-600" size={20} />
            Vos données sont sécurisées
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <CheckCircle className="mr-2 text-green-600 flex-shrink-0 mt-0.5" size={16} />
              <span>Toutes les données sensibles sont chiffrées avec AES-256-GCM</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="mr-2 text-green-600 flex-shrink-0 mt-0.5" size={16} />
              <span>Les documents originaux sont supprimés après vérification</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="mr-2 text-green-600 flex-shrink-0 mt-0.5" size={16} />
              <span>Seuls les administrateurs autorisés peuvent accéder aux archives</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
