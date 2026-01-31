"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Star,
  Award,
  TrendingUp,
  CreditCard,
  Calendar,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  Users,
  Store,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import UserLevelSystem from "./UserLevelSystem";
import { useAuth } from "@/contexts/AuthContext";

// 1. Définition du type de données que l'on reçoit de l'API
interface MerchantDetails {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  category?: string;
  status?: string;
  registered?: string;
  lastActive?: string;
  balance?: number;
  points?: number;
  level?: number;
  starPoints?: number; // Ce champ n'est pas encore dans le backend
  transactions?: {
    id: string;
    amount: number;
    date: string;
    senderName: string;
  }[];
  rating?: number;
}

// Les props initiales ne changent presque pas
interface MerchantProps {
  merchant: { id: string; name: string }; // On a juste besoin de l'ID et du nom au début
  onClose: () => void;
}

const MerchantDetailModal: React.FC<MerchantProps> = ({
  merchant,
  onClose,
}) => {
  const { token } = useAuth();
  const [details, setDetails] = useState<MerchantDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 2. Logique de récupération des données
  useEffect(() => {
    const fetchDetails = async () => {
      if (!token || !merchant) return;
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/merchants/${merchant.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!response.ok) throw new Error("Impossible de charger les détails.");
        const data = await response.json();
        setDetails(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [merchant, token]);

  // Fonctions utilitaires (prises de ton code original)
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "dd MMM yyyy", { locale: fr });
  };

  const renderStars = (rating: number = 0) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) {
        stars.push(
          <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
        );
      } else {
        stars.push(<Star key={i} className="h-4 w-4 text-gray-300" />);
      }
    }
    return stars;
  };

  // 3. Logique de rendu conditionnel (chargement, erreur, succès)
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-dinary-turquoise" />
          <p className="ml-4 text-gray-600">
            Chargement des détails du commerçant...
          </p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-6 text-center text-red-500">Erreur : {error}</div>
      );
    }

    if (!details) {
      return (
        <div className="p-6 text-center text-gray-500">
          Aucun détail trouvé.
        </div>
      );
    }

    // Le JSX ci-dessous est ton design original, mais connecté aux données de 'details'
    return (
      <>
        {/* Header */}
        <div className="bg-gray-50 border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-amber-500 text-white text-xl flex items-center justify-center font-medium">
              <Store className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                {details.name}
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full
                  ${
                    details.status === "verified"
                      ? "bg-green-100 text-green-800 border border-green-200"
                      : "bg-red-100 text-red-800 border border-red-200"
                  }`}
                >
                  {details.status || "N/A"}
                </span>
                <span className="text-sm text-gray-500">
                  #{details.id.substring(0, 8)}
                </span>
              </h2>
              <div className="flex flex-wrap items-center mt-1 gap-x-4 gap-y-1 text-sm text-gray-600">
                <div className="flex items-center">
                  <Mail size={14} className="mr-1" /> {details.email}
                </div>
                <div className="flex items-center">
                  <Phone size={14} className="mr-1" /> {details.phone}
                </div>
                <div className="flex items-center">
                  <MapPin size={14} className="mr-1" />{" "}
                  {details.address || "Non spécifiée"}
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content area with scroll */}
        <div className="overflow-y-auto p-6 flex-grow">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Colonne 1 - Infos générales et système de niveaux */}
            <div className="space-y-6">
              <div className="bg-white border rounded-lg p-5 shadow-sm">
                <h3 className="text-lg font-medium text-gray-800 mb-4">
                  Informations générales
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Catégorie</span>
                    <span className="text-sm font-medium">
                      {details.category}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Inscrit le</span>
                    <span className="text-sm font-medium">
                      {formatDate(details.registered)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">
                      Dernière activité
                    </span>
                    <span className="text-sm font-medium">
                      {formatDate(details.lastActive)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Transactions</span>
                    <span className="text-sm font-medium">
                      {details.transactions?.length?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Note</span>
                    <span className="flex items-center">
                      {renderStars(details.rating)}
                      <span className="ml-1 text-sm font-medium">
                        {details.rating}
                      </span>
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Solde</span>
                    <span className="text-sm font-medium">
                      {details.balance?.toFixed(2)} DZD
                    </span>
                  </div>
                </div>
              </div>
              <UserLevelSystem
                userType="merchant"
                level={details.level || 0}
                points={details.points || 0}
                starPoints={details.starPoints || 0}
                challenges={[]} // Les challenges peuvent être ajoutés dynamiquement plus tard
              />
            </div>

            {/* Colonne 2 & 3 - Placeholder pour les stats et l'activité */}
            {/* Ces données ne sont pas encore dans le backend, on laisse des placeholders */}
            <div className="bg-white border rounded-lg p-5 shadow-sm">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Statistiques (Exemple)
              </h3>
              <p className="text-sm text-gray-500">
                Les statistiques détaillées (panier moyen, clientèle...) seront
                bientôt disponibles.
              </p>
            </div>
            <div className="bg-white border rounded-lg p-5 shadow-sm">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Dernières Transactions
              </h3>
              <div className="space-y-3">
                {details.transactions && details.transactions.length > 0 ? (
                  details.transactions.map((tx) => (
                    <div key={tx.id} className="flex items-start space-x-3">
                      <div className="bg-green-100 p-1.5 rounded-full">
                        <CreditCard size={14} className="text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-medium">
                            {tx.amount.toFixed(2)} DZD
                          </span>{" "}
                          de {tx.senderName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(tx.date)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">
                    Aucune transaction récente.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer avec actions */}
        <div className="bg-gray-50 border-t px-6 py-4 flex justify-between items-center sticky bottom-0">
          {/* Les boutons restent pour l'instant statiques */}
          <div className="flex space-x-2">
            <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center text-sm">
              <ExternalLink size={16} className="mr-2" /> Espace commerçant
            </button>
            <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-md flex items-center text-sm hover:bg-blue-100">
              <Mail size={16} className="mr-2" /> Contacter
            </button>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {renderContent()}
      </div>
    </div>
  );
};

export default MerchantDetailModal;
