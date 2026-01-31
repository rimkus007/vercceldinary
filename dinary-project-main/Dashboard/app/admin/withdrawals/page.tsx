"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Banknote,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Eye,
  Download,
  AlertCircle,
  Calendar,
  User,
  Wallet,
  TrendingDown,
  Building,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Interfaces
interface WithdrawalRequest {
  id: string;
  amount: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
  rejectionReason?: string;
  bankDetails?: {
    accountNumber?: string;
    bankName?: string;
    accountHolder?: string;
    rib?: string;
    fullName?: string;
  };
  user: {
    id: string;
    fullName: string;
    email: string;
    username: string;
    wallet: {
      balance: number;
    };
  };
}

interface WithdrawalStats {
  pending: number;
  approved: number;
  rejected: number;
  totalAmount: number;
  pendingAmount: number;
}

export default function WithdrawalsPage() {
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);
  const [actionModal, setActionModal] = useState<{
    request: WithdrawalRequest | null;
    action: "approve" | "reject" | null;
  }>({ request: null, action: null });
  const [rejectionReason, setRejectionReason] = useState("");
  const { token } = useAuth();

  // Calculer les statistiques
  const stats: WithdrawalStats = useMemo(() => {
    const pending = requests.filter((r) => r.status === "PENDING");
    const approved = requests.filter((r) => r.status === "APPROVED");
    const rejected = requests.filter((r) => r.status === "REJECTED");

    return {
      pending: pending.length,
      approved: approved.length,
      rejected: rejected.length,
      totalAmount: approved.reduce((sum, r) => sum + r.amount, 0),
      pendingAmount: pending.reduce((sum, r) => sum + r.amount, 0),
    };
  }, [requests]);

  // Récupérer les demandes
  const fetchRequests = async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      setError("");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/withdrawals`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error("Erreur de chargement des demandes.");
      const data = await response.json();
      setRequests(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [token]);

  // Traiter une demande (approuver ou rejeter)
  const handleProcessRequest = async () => {
    const { request, action } = actionModal;
    if (!request || !action) return;
    if (action === "reject" && !rejectionReason.trim()) {
      alert("Veuillez fournir un motif de rejet.");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/withdrawals/${request.id}/${action}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reason: rejectionReason }),
        }
      );

      if (!response.ok) throw new Error(`Échec de l'action : ${action}`);

      // Mettre à jour la liste
      setRequests((prev) =>
        prev.map((req) =>
          req.id === request.id
            ? {
                ...req,
                status: action === "approve" ? "APPROVED" : "REJECTED",
                rejectionReason: action === "reject" ? rejectionReason : undefined,
              }
            : req
        )
      );

      // Fermer les modals
      setActionModal({ request: null, action: null });
      setSelectedRequest(null);
      setRejectionReason("");
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Filtrer les demandes
  const filteredRequests = useMemo(() => {
    let filtered = requests;

    // Filtrer par onglet
    if (activeTab === "pending") {
      filtered = filtered.filter((r) => r.status === "PENDING");
    } else {
      filtered = filtered.filter((r) => r.status !== "PENDING");
    }

    // Filtrer par statut (dans l'historique)
    if (activeTab === "history" && statusFilter !== "all") {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    // Filtrer par recherche
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.user.fullName.toLowerCase().includes(term) ||
          r.user.email.toLowerCase().includes(term) ||
          r.user.username.toLowerCase().includes(term) ||
          r.bankDetails?.accountNumber?.toLowerCase().includes(term) ||
          r.bankDetails?.rib?.toLowerCase().includes(term) ||
          r.bankDetails?.bankName?.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [requests, activeTab, statusFilter, searchTerm]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      "ID",
      "Utilisateur",
      "Email",
      "Montant",
      "Solde restant",
      "Banque",
      "N° compte",
      "Statut",
      "Date création",
      "Date traitement",
    ];
    const rows = filteredRequests.map((r) => [
      r.id,
      r.user.fullName,
      r.user.email,
      r.amount,
      r.user.wallet.balance,
      r.bankDetails?.bankName || "N/A",
      r.bankDetails?.accountNumber || r.bankDetails?.rib || "N/A",
      r.status,
      new Date(r.createdAt).toLocaleString("fr-FR"),
      new Date(r.updatedAt).toLocaleString("fr-FR"),
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `retraits-${new Date().toISOString()}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          Gestion des Retraits
        </h1>
        <p className="text-gray-600">
          Gérez les demandes de retrait des utilisateurs et marchands
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <motion.div
          className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-6 text-white shadow-lg"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8" />
            <span className="text-3xl font-bold">{stats.pending}</span>
          </div>
          <p className="text-sm opacity-90">En attente</p>
          <p className="text-xs mt-1 font-semibold">
            {stats.pendingAmount.toLocaleString("fr-DZ")} DZD
          </p>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl p-6 text-white shadow-lg"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8" />
            <span className="text-3xl font-bold">{stats.approved}</span>
          </div>
          <p className="text-sm opacity-90">Approuvées</p>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl p-6 text-white shadow-lg"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between mb-2">
            <XCircle className="w-8 h-8" />
            <span className="text-3xl font-bold">{stats.rejected}</span>
          </div>
          <p className="text-sm opacity-90">Rejetées</p>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl p-6 text-white shadow-lg"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between mb-2">
            <Banknote className="w-8 h-8" />
            <TrendingDown className="w-6 h-6 opacity-80" />
          </div>
          <p className="text-sm opacity-90 mb-1">Montant total retiré</p>
          <p className="text-xl font-bold">
            {stats.totalAmount.toLocaleString("fr-DZ")} DZD
          </p>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl p-6 text-white shadow-lg cursor-pointer"
          whileHover={{ scale: 1.02 }}
          onClick={handleExportCSV}
        >
          <div className="flex items-center justify-between mb-2">
            <Download className="w-8 h-8" />
          </div>
          <p className="text-sm opacity-90">Exporter CSV</p>
          <p className="text-xs mt-1">Télécharger les données</p>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-6 py-3 rounded-xl font-semibold transition-all ${
            activeTab === "pending"
              ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
              : "bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          En attente ({stats.pending})
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-6 py-3 rounded-xl font-semibold transition-all ${
            activeTab === "history"
              ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
              : "bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          Historique ({stats.approved + stats.rejected})
        </button>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white rounded-2xl p-4 shadow-lg mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher par nom, email, banque, compte..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          {activeTab === "history" && (
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white appearance-none cursor-pointer"
              >
                <option value="all">Tous les statuts</option>
                <option value="APPROVED">Approuvées</option>
                <option value="REJECTED">Rejetées</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Loading / Error */}
      {isLoading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-800">Erreur</p>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Liste des demandes */}
      {!isLoading && !error && (
        <>
          {filteredRequests.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Banknote className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-xl font-semibold text-gray-700 mb-2">
                Aucune demande trouvée
              </p>
              <p className="text-gray-500">
                {activeTab === "pending"
                  ? "Il n'y a aucune demande de retrait en attente."
                  : "Aucune demande ne correspond à vos critères."}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredRequests.map((req) => (
                <motion.div
                  key={req.id}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-6 items-center">
                    {/* Utilisateur */}
                    <div className="md:col-span-2">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                          {req.user.fullName[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">
                            {req.user.fullName}
                          </p>
                          <p className="text-xs text-gray-500">{req.user.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Montant */}
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Montant</p>
                      <p className="text-xl font-bold text-red-600">
                        -{req.amount.toLocaleString("fr-DZ")} DZD
                      </p>
                    </div>

                    {/* Solde */}
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Solde actuel</p>
                      <p className="text-lg font-semibold text-gray-700">
                        {req.user.wallet.balance.toLocaleString("fr-DZ")} DZD
                      </p>
                    </div>

                    {/* Date */}
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Date</p>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Calendar className="w-4 h-4" />
                        {new Date(req.createdAt).toLocaleDateString("fr-FR")}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(req.createdAt).toLocaleTimeString("fr-FR")}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      {req.status === "PENDING" ? (
                        <>
                          <button
                            onClick={() =>
                              setActionModal({ request: req, action: "approve" })
                            }
                            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity font-semibold flex items-center justify-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approuver
                          </button>
                          <button
                            onClick={() =>
                              setActionModal({ request: req, action: "reject" })
                            }
                            className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity font-semibold flex items-center justify-center gap-2"
                          >
                            <XCircle className="w-4 h-4" />
                            Rejeter
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center gap-2">
                          {req.status === "APPROVED" ? (
                            <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold flex items-center gap-2">
                              <CheckCircle className="w-4 h-4" />
                              Approuvée
                            </span>
                          ) : (
                            <span className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold flex items-center gap-2">
                              <XCircle className="w-4 h-4" />
                              Rejetée
                            </span>
                          )}
                        </div>
                      )}
                      <button
                        onClick={() => setSelectedRequest(req)}
                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-semibold flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Détails
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal de détails */}
      <AnimatePresence>
        {selectedRequest && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedRequest(null)}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-2xl">
                <h2 className="text-2xl font-bold mb-2">Détails du retrait</h2>
                <p className="text-sm opacity-90">ID: {selectedRequest.id}</p>
              </div>

              {/* Contenu */}
              <div className="p-6 space-y-6">
                {/* Informations utilisateur */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <User className="w-5 h-5 text-purple-600" />
                    Informations utilisateur
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Nom complet</p>
                        <p className="font-semibold">{selectedRequest.user.fullName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Nom d'utilisateur</p>
                        <p className="font-semibold">@{selectedRequest.user.username}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="font-semibold">{selectedRequest.user.email}</p>
                    </div>
                  </div>
                </div>

                {/* Détails du retrait */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-red-600" />
                    Détails du retrait
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Montant demandé</p>
                        <p className="text-2xl font-bold text-red-600">
                          -{selectedRequest.amount.toLocaleString("fr-DZ")} DZD
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Solde actuel</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {selectedRequest.user.wallet.balance.toLocaleString("fr-DZ")} DZD
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Date de demande</p>
                        <p className="font-semibold">
                          {new Date(selectedRequest.createdAt).toLocaleString("fr-FR")}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Dernière mise à jour</p>
                        <p className="font-semibold">
                          {new Date(selectedRequest.updatedAt).toLocaleString("fr-FR")}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Statut</p>
                      <div className="mt-1">
                        {selectedRequest.status === "APPROVED" && (
                          <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold inline-flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Approuvée
                          </span>
                        )}
                        {selectedRequest.status === "REJECTED" && (
                          <span className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold inline-flex items-center gap-2">
                            <XCircle className="w-4 h-4" />
                            Rejetée
                          </span>
                        )}
                        {selectedRequest.status === "PENDING" && (
                          <span className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg font-semibold inline-flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            En attente
                          </span>
                        )}
                      </div>
                    </div>
                    {selectedRequest.rejectionReason && (
                      <div>
                        <p className="text-xs text-gray-500">Motif du rejet</p>
                        <p className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-800 mt-1">
                          {selectedRequest.rejectionReason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Coordonnées bancaires */}
                {selectedRequest.bankDetails && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Building className="w-5 h-5 text-blue-600" />
                      Coordonnées bancaires
                    </h3>
                    <div className="bg-blue-50 rounded-xl p-4 space-y-2">
                      <div>
                        <p className="text-xs text-gray-500">Titulaire du compte</p>
                        <p className="font-semibold">
                          {selectedRequest.bankDetails.accountHolder ||
                            selectedRequest.bankDetails.fullName ||
                            "Non fourni"}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Banque</p>
                          <p className="font-semibold">
                            {selectedRequest.bankDetails.bankName || "Non fourni"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Numéro de compte</p>
                          <p className="font-mono text-sm bg-white px-3 py-1 rounded border">
                            {selectedRequest.bankDetails.accountNumber ||
                              selectedRequest.bankDetails.rib ||
                              "Non fourni"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200">
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de confirmation d'action */}
      <AnimatePresence>
        {actionModal.request && actionModal.action && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setActionModal({ request: null, action: null });
              setRejectionReason("");
            }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div
                className={`p-6 rounded-t-2xl text-white ${
                  actionModal.action === "approve"
                    ? "bg-gradient-to-r from-green-500 to-emerald-500"
                    : "bg-gradient-to-r from-red-500 to-pink-500"
                }`}
              >
                <div className="flex items-center gap-3">
                  {actionModal.action === "approve" ? (
                    <CheckCircle className="w-8 h-8" />
                  ) : (
                    <XCircle className="w-8 h-8" />
                  )}
                  <div>
                    <h2 className="text-xl font-bold">
                      {actionModal.action === "approve"
                        ? "Approuver le retrait"
                        : "Rejeter le retrait"}
                    </h2>
                    <p className="text-sm opacity-90">
                      {actionModal.request.user.fullName}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contenu */}
              <div className="p-6 space-y-4">
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <p className="text-sm text-gray-600">Montant du retrait</p>
                  <p className="text-3xl font-bold text-red-600">
                    -{actionModal.request.amount.toLocaleString("fr-DZ")} DZD
                  </p>
                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-500">Solde actuel</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {actionModal.request.user.wallet.balance.toLocaleString("fr-DZ")} DZD
                    </p>
                  </div>
                </div>

                {actionModal.action === "reject" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Motif du rejet *
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Expliquez la raison du rejet..."
                      rows={4}
                      className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                )}

                <p className="text-sm text-gray-600">
                  {actionModal.action === "approve"
                    ? "Le montant sera transféré vers le compte bancaire de l'utilisateur."
                    : "L'utilisateur sera notifié du rejet de sa demande."}
                </p>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200 flex gap-3">
                <button
                  onClick={() => {
                    setActionModal({ request: null, action: null });
                    setRejectionReason("");
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
                >
                  Annuler
                </button>
                <button
                  onClick={handleProcessRequest}
                  className={`flex-1 text-white px-6 py-3 rounded-xl font-semibold transition-opacity hover:opacity-90 ${
                    actionModal.action === "approve"
                      ? "bg-gradient-to-r from-green-500 to-emerald-500"
                      : "bg-gradient-to-r from-red-500 to-pink-500"
                  }`}
                >
                  {actionModal.action === "approve" ? "Confirmer" : "Rejeter"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
