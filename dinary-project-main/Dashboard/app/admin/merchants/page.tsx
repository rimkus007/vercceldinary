"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Mail, Phone, Store, Calendar, CreditCard, Activity, MessageSquare, Shield } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { API_URL } from "@/lib/api";
import MerchantSuggestionForm from "@/components/admin/MerchantSuggestionForm";
import VerificationDetailModal from "@/components/admin/VerificationDetailModal";

// --- INTERFACES ---
interface Merchant {
  id: string;
  name: string;
  category: string;
  status: "active" | "inactive" | "pending";
  updatedAt: string;
  user: {
    email: string;
  };
}

interface MerchantDetail {
  id: string;
  name: string;
  status: "active" | "inactive" | "pending";
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    phoneNumber: string;
    createdAt: string;
  };
  wallet?: {
    balance: number;
    _count: {
      sentTransactions: number;
      receivedTransactions: number;
    };
  };
}

interface Suggestion {
  id: string;
  name: string;
  address: string;
  category: string;
  latitude: number;
  longitude: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  contactName?: string;
  contactPhone?: string;
  suggestedBy: {
    fullName: string;
    email: string;
    phoneNumber: string;
  };
}

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
    role: "USER" | "MERCHANT";
  };
  createdAt: string;
}

// --- COMPOSANT PRINCIPAL ---
export default function MerchantsPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSuggestion, setSelectedSuggestion] =
    useState<Suggestion | null>(null);
  const [selectedMerchantDetail, setSelectedMerchantDetail] =
    useState<MerchantDetail | null>(null);
  const [selectedVerification, setSelectedVerification] =
    useState<VerificationRequest | null>(null);
  const [loadingMerchantDetail, setLoadingMerchantDetail] = useState(false);
  const [isLoadingVerifications, setIsLoadingVerifications] = useState(false);

  const fetchMerchantsAndSuggestions = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const [merchantsRes, suggestionsRes] = await Promise.all([
        fetch(`${API_URL}/admin/merchants`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/admin/suggestions`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!merchantsRes.ok || !suggestionsRes.ok) {
        throw new Error("Erreur lors du chargement des données.");
      }
      const merchantsData = await merchantsRes.json();
      const suggestionsData = await suggestionsRes.json();

      setMerchants(merchantsData);
      setSuggestions(suggestionsData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchMerchantsAndSuggestions();
  }, [fetchMerchantsAndSuggestions]);

  const fetchVerifications = useCallback(async () => {
    if (!token) return;
    setIsLoadingVerifications(true);
    try {
      // ✅ CORRECTION: Ajouter le paramètre role=MERCHANT pour ne récupérer que les marchands
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(
        `${API_URL}/admin/identity/pending?role=MERCHANT`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        const data: VerificationRequest[] = await res.json();
        /* log removed */
        setVerifications(data);
      } else {
        /* log removed */
      }
    } catch (err) {
      /* log removed */
    } finally {
      setIsLoadingVerifications(false);
    }
  }, [token]);

  useEffect(() => {
    if (activeTab === "verifications") {
      fetchVerifications();
    }
  }, [activeTab, fetchVerifications]);

  const handleSuggestionDelete = async (id: string) => {
    if (
      !window.confirm(
        "Voulez-vous vraiment supprimer ce commerçant suggéré ? Il sera définitivement retiré."
      )
    )
      return;
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(
        `${API_URL}/admin/suggestions/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error("La suppression a échoué.");
      fetchMerchantsAndSuggestions();
    } catch (err: any) {
      alert(`Erreur: ${err.message}`);
    }
  };

  const handleSuggestionAction = async (
    id: string,
    action: "approve" | "reject"
  ) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(
        `${API_URL}/admin/suggestions/${id}/${action}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error(`L'action a échoué.`);
      if (action === "approve") {
        setActiveTab("approved_suggestions");
      }
      fetchMerchantsAndSuggestions();
    } catch (err: any) {
      alert(`Erreur: ${err.message}`);
    }
  };

  const handleViewMerchantDetail = async (merchantId: string) => {
    if (!merchantId) return;
    
    setLoadingMerchantDetail(true);
    try {
      /* log removed */
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(
        `${API_URL}/admin/merchants/${merchantId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        /* log removed */
        throw new Error(errorData.message || "Impossible de charger les détails");
      }
      const data = await response.json();
      /* log removed */
      setSelectedMerchantDetail(data);
    } catch (err: any) {
      // Gérer les erreurs silencieusement sans déconnecter l'utilisateur
      console.warn('Erreur lors du chargement des détails du commerçant:', err.message);
      // Ne pas afficher d'alerte pour ne pas perturber l'utilisateur
      // L'erreur est déjà gérée par le backend avec un message clair
    } finally {
      setLoadingMerchantDetail(false);
    }
  };

  const pendingSuggestions = suggestions.filter((s) => s.status === "pending");
  const approvedSuggestions = suggestions.filter(
    (s) => s.status === "approved"
  );

  const filteredMerchants = merchants.filter((merchant) => {
    const query = searchQuery.toLowerCase();
    const nameMatch = merchant.name.toLowerCase().includes(query);
    const emailMatch = merchant.user.email.toLowerCase().includes(query);
    const categoryMatch = merchant.category.toLowerCase().includes(query);
    return nameMatch || emailMatch || categoryMatch;
  });

  if (loading) return <div className="p-6">Chargement...</div>;
  if (error) return <div className="p-6 text-red-500">Erreur : {error}</div>;

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center mb-6">
          <div className="sm:flex-auto">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-dinary-turquoise to-blue-600 bg-clip-text text-transparent">
              Gestion des Commerçants
            </h1>
            <p className="mt-2 text-base text-gray-600">
              Visualisez et gérez tous les commerçants et leurs suggestions.
            </p>
          </div>
        </div>

        {/* Tabs modernes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="flex gap-2 p-2">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === "overview"
                  ? "bg-gradient-to-r from-dinary-turquoise to-blue-500 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              📊 Commerçants Actifs
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                activeTab === "overview" 
                  ? "bg-white/20 text-white" 
                  : "bg-gray-200 text-gray-700"
              }`}>
                {merchants.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("approved_suggestions")}
              className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === "approved_suggestions"
                  ? "bg-gradient-to-r from-dinary-turquoise to-blue-500 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              ✅ Commerçants Suggérés
              {approvedSuggestions.length > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  activeTab === "approved_suggestions" 
                    ? "bg-white/20 text-white" 
                    : "bg-green-100 text-green-700"
                }`}>
                  {approvedSuggestions.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("suggestions")}
              className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === "suggestions"
                  ? "bg-gradient-to-r from-dinary-turquoise to-blue-500 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              ⏳ En Attente de Validation
              {pendingSuggestions.length > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  activeTab === "suggestions" 
                    ? "bg-white/20 text-white animate-pulse" 
                    : "bg-orange-100 text-orange-700 animate-pulse"
                }`}>
                  {pendingSuggestions.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("verifications")}
              className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === "verifications"
                  ? "bg-gradient-to-r from-dinary-turquoise to-blue-500 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              🔐 Vérifications
              {verifications.length > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  activeTab === "verifications" 
                    ? "bg-white/20 text-white animate-pulse" 
                    : "bg-amber-100 text-amber-700 animate-pulse"
                }`}>
                  {verifications.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Contenu des onglets */}
        <div>
          {activeTab === "overview" && (
            <div className="mt-6">
              <div className="mt-6 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                <div className="w-full sm:max-w-xs relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full rounded-md border-gray-300 pl-10 focus:border-dinary-turquoise focus:ring-dinary-turquoise sm:text-sm"
                    placeholder="Rechercher par nom, email ou catégorie..."
                  />
                </div>
              </div>
              <div className="mt-8 flex flex-col">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="inline-block min-w-full py-2 align-middle">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead>
                        <tr>
                          <th
                            scope="col"
                            className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 lg:pl-8"
                          >
                            Commerçant
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                          >
                            Catégorie
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                          >
                            Email
                          </th>
                          <th
                            scope="col"
                            className="relative py-3.5 pl-3 pr-4 sm:pr-6 lg:pr-8"
                          >
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {filteredMerchants.map((merchant) => (
                          <tr 
                            key={merchant.id} 
                            className="hover:bg-gray-50 cursor-pointer transition-colors"
                            onClick={() => handleViewMerchantDetail(merchant.id)}
                          >
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8">
                              {merchant.name}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {merchant.category}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {merchant.user.email}
                            </td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 lg:pr-8">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewMerchantDetail(merchant.id);
                                }}
                                className="text-dinary-turquoise hover:text-dinary-turquoise-dark font-semibold"
                              >
                                Voir détails
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "approved_suggestions" && (
            <div className="mt-6">
              <div className="mt-8 flex flex-col">
                {approvedSuggestions.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    Aucun commerçant suggéré et approuvé.
                  </p>
                ) : (
                  <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle">
                      <table className="min-w-full divide-y divide-gray-300">
                        <thead>
                          <tr>
                            <th
                              scope="col"
                              className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 lg:pl-8"
                            >
                              Commerçant
                            </th>
                            <th
                              scope="col"
                              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                            >
                              Catégorie
                            </th>
                            <th
                              scope="col"
                              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                            >
                              Adresse
                            </th>
                            <th
                              scope="col"
                              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                            >
                              Date d'Approbation
                            </th>
                            <th
                              scope="col"
                              className="relative py-3.5 pl-3 pr-4 sm:pr-6 lg:pr-8"
                            >
                              <span className="sr-only">Actions</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {approvedSuggestions.map((suggestion) => (
                            <tr key={suggestion.id}>
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8">
                                {suggestion.name}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  {suggestion.category}
                                </span>
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                {suggestion.address}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                {format(
                                  new Date(suggestion.createdAt),
                                  "dd/MM/yyyy"
                                )}
                              </td>
                              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 lg:pr-8">
                                <button
                                  onClick={() =>
                                    handleSuggestionDelete(suggestion.id)
                                  }
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Supprimer
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "suggestions" && (
            <div className="mt-6">
              {pendingSuggestions.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Aucune suggestion en attente.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pendingSuggestions.map((suggestion) => (
                    <div
                      key={suggestion.id}
                      className="bg-white border rounded-lg shadow-sm p-5 flex flex-col justify-between cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => setSelectedSuggestion(suggestion)}
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-lg">
                            {suggestion.name}
                          </h3>
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                            En attente
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {suggestion.address}
                        </p>
                        <p className="text-sm text-gray-500 capitalize">
                          {suggestion.category}
                        </p>
                        <div className="mt-4 border-t pt-3">
                          <p className="text-xs text-gray-500 mb-1">
                            Suggéré par :
                          </p>
                          <p className="font-medium">
                            {suggestion.suggestedBy.fullName}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "verifications" && (
            <div className="mt-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <h2 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
                    <Shield size={20} className="text-amber-600" />
                    Demandes de vérification d'identité
                  </h2>
                  {isLoadingVerifications ? (
                    <p className="text-center text-gray-500 py-8">Chargement...</p>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-sm text-gray-500 border-b">
                          <th className="p-3">Commerçant</th>
                          <th className="p-3">Date de soumission</th>
                          <th className="p-3">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {verifications.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="text-center p-8 text-gray-500">
                              Aucune demande en attente.
                            </td>
                          </tr>
                        ) : (
                          verifications.map((req) => (
                            <tr key={req.id} className="border-b hover:bg-gray-50 transition-colors">
                              <td className="p-3">
                                <div className="font-medium text-gray-900">{req.user.fullName}</div>
                                <div className="text-xs text-gray-500">{req.user.email}</div>
                                {/* Afficher le numéro d'impôt si c'est un marchand */}
                                {req.user.role === 'MERCHANT' && req.taxNumber && (
                                  <div className="text-xs text-indigo-600 font-medium mt-1">
                                    🧾 Impôt: {req.taxNumber}
                                  </div>
                                )}
                              </td>
                              <td className="p-3 text-sm text-gray-600">
                                {new Date(req.createdAt).toLocaleDateString("fr-FR")}
                              </td>
                              <td className="p-3">
                                <button
                                  onClick={() => setSelectedVerification(req)}
                                  className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                                >
                                  Examiner
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedSuggestion && (
        <MerchantSuggestionForm
          suggestion={{
            ...selectedSuggestion,
            suggestedAt: selectedSuggestion.createdAt,
            location: {
              lat: selectedSuggestion.latitude,
              lng: selectedSuggestion.longitude,
            },
            suggestedBy: {
              id: "",
              name: selectedSuggestion.suggestedBy.fullName,
              phone: selectedSuggestion.suggestedBy.phoneNumber || "Non fourni",
            },
          }}
          onClose={() => setSelectedSuggestion(null)}
          onApprove={() => {
            handleSuggestionAction(selectedSuggestion.id, "approve");
            setSelectedSuggestion(null);
          }}
          onReject={() => {
            handleSuggestionAction(selectedSuggestion.id, "reject");
            setSelectedSuggestion(null);
          }}
        />
      )}

      {/* Modal Détails Commerçant */}
      {selectedMerchantDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header avec gradient */}
            <div className="sticky top-0 bg-gradient-to-r from-dinary-turquoise to-blue-600 text-white p-6 rounded-t-2xl flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Store size={32} className="text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{selectedMerchantDetail.name}</h2>
                  <p className="text-sm text-white/80">{selectedMerchantDetail.user.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMerchantDetail(null)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Contenu du modal */}
            <div className="p-6 space-y-6">
              {/* Informations générales */}
              <div className="bg-gradient-to-br from-gray-50 to-white border rounded-xl p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Store size={20} className="text-dinary-turquoise" />
                  Informations du commerçant
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Mail size={18} className="text-gray-400 mt-1" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-medium">Email</p>
                      <p className="text-sm font-medium text-gray-900">{selectedMerchantDetail.user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone size={18} className="text-gray-400 mt-1" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-medium">Téléphone</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedMerchantDetail.user.phoneNumber || "Non renseigné"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar size={18} className="text-gray-400 mt-1" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-medium">Inscription</p>
                      <p className="text-sm font-medium text-gray-900">
                        {format(new Date(selectedMerchantDetail.user.createdAt), "dd MMM yyyy")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Store size={18} className="text-gray-400 mt-1" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-medium">Nom complet</p>
                      <p className="text-sm font-medium text-gray-900">{selectedMerchantDetail.user.fullName}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistiques Wallet */}
              {selectedMerchantDetail.wallet && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-green-600 uppercase font-medium mb-1">Solde</p>
                        <p className="text-2xl font-bold text-green-700">
                          {selectedMerchantDetail.wallet.balance.toLocaleString("fr-DZ")} DZD
                        </p>
                      </div>
                      <CreditCard size={32} className="text-green-400" />
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-purple-600 uppercase font-medium mb-1">Ventes / Encaissements</p>
                        <p className="text-2xl font-bold text-purple-700">
                          {selectedMerchantDetail.wallet._count.receivedTransactions}
                        </p>
                      </div>
                      <Activity size={32} className="text-purple-400" />
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-blue-600 uppercase font-medium mb-1">Total de transactions</p>
                        <p className="text-2xl font-bold text-blue-700">
                          {selectedMerchantDetail.wallet._count.sentTransactions + selectedMerchantDetail.wallet._count.receivedTransactions}
                        </p>
                      </div>
                      <Activity size={32} className="text-blue-400" />
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    router.push(`/admin/control-center/messaging?userId=${selectedMerchantDetail.user.id}`);
                    setSelectedMerchantDetail(null);
                  }}
                  className="flex-1 bg-gradient-to-r from-dinary-turquoise to-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <MessageSquare size={20} />
                  Envoyer un message
                </button>
                <button
                  onClick={() => setSelectedMerchantDetail(null)}
                  className="px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de vérification d'identité */}
      {selectedVerification && (
        <VerificationDetailModal
          request={selectedVerification}
          onClose={() => setSelectedVerification(null)}
          onAction={() => {
            fetchVerifications();
            setSelectedVerification(null);
          }}
          token={token}
        />
      )}
    </>
  );
}
