"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Search,
  Eye,
  FileText,
  Calendar,
  User,
  Mail,
  Phone,
  CreditCard,
  MapPin,
  Lock,
  Unlock,
  Download,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Archive {
  id: string;
  userId: string;
  userFullName: string;
  userEmail: string;
  userPhone: string | null;
  documentType: string;
  verifiedAt: string;
  verifiedBy: string;
  archivedAt: string;
  notes: string | null;
  hasEncryptedData: boolean;
}

interface ArchiveDetail extends Archive {
  sensitiveData?: {
    documentNumber?: string;
    dateOfBirth?: string;
    address?: string;
    nationality?: string;
    expirationDate?: string;
    issueDate?: string;
    placeOfBirth?: string;
    taxNumber?: string; // Numéro d'impôt pour les marchands
    [key: string]: any;
  };
}

interface Stats {
  total: number;
  last30Days: number;
  byDocumentType: Array<{ type: string; count: number }>;
}

export default function ArchivesPage() {
  const [archives, setArchives] = useState<Archive[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArchive, setSelectedArchive] = useState<ArchiveDetail | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [pendingArchiveId, setPendingArchiveId] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    fetchAll();
  }, [token]);

  const fetchAll = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [archivesRes, statsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/verification-archives`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/verification-archives/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (archivesRes.ok) setArchives(await archivesRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
    } catch (error) {
      /* log removed */
    } finally {
      setLoading(false);
    }
  };

  const unlockArchive = (archiveId: string) => {
    setPendingArchiveId(archiveId);
    setIsPasswordModalOpen(true);
  };

  const handlePasswordSubmit = async () => {
    if (!token || !pendingArchiveId || !password) return;

    setIsUnlocking(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/verification-archives/${pendingArchiveId}/unlock`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ password }),
        }
      );

      if (response.ok) {
        const detail = await response.json();
        setSelectedArchive(detail);
        setIsDetailModalOpen(true);
        setIsPasswordModalOpen(false);
        setPassword("");
        setPendingArchiveId(null);
      } else {
        const error = await response.json();
        alert(error.message || "Mot de passe incorrect");
      }
    } catch (error) {
      /* log removed */
      alert("Erreur lors du déchiffrement de l'archive");
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleExportCSV = async () => {
    if (!token) return;
    setIsExporting(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/verification-archives/export/csv`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const { filename, content } = await response.json();
        
        // Créer un blob et télécharger le fichier
        const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
      } else {
        alert("Erreur lors de l'export CSV");
      }
    } catch (error) {
      /* log removed */
      alert("Erreur lors de l'export CSV");
    } finally {
      setIsExporting(false);
    }
  };

  const filteredArchives = archives.filter(
    (archive) =>
      archive.userFullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      archive.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDocumentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      ID_CARD: "Carte d'identité",
      PASSPORT: "Passeport",
      DRIVER_LICENSE: "Permis de conduire",
    };
    return labels[type] || type;
  };

  const getDocumentTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      ID_CARD: "bg-blue-100 text-blue-800 border-blue-300",
      PASSPORT: "bg-purple-100 text-purple-800 border-purple-300",
      DRIVER_LICENSE: "bg-green-100 text-green-800 border-green-300",
    };
    return colors[type] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              🔐 Archives de Vérification
            </h1>
            <p className="text-gray-600">
              Consultez les données de vérification d'identité archivées et chiffrées
            </p>
          </div>
          <button
            onClick={handleExportCSV}
            disabled={isExporting || archives.length === 0}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 font-bold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Export en cours...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Exporter CSV
              </>
            )}
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-2xl shadow-lg text-white"
            >
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-8 h-8" />
                <p className="text-sm font-medium opacity-90">Total Archives</p>
              </div>
              <p className="text-4xl font-bold">{stats.total}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-purple-500 to-pink-600 p-6 rounded-2xl shadow-lg text-white"
            >
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-8 h-8" />
                <p className="text-sm font-medium opacity-90">30 Derniers Jours</p>
              </div>
              <p className="text-4xl font-bold">{stats.last30Days}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-orange-500 to-red-600 p-6 rounded-2xl shadow-lg text-white"
            >
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-8 h-8" />
                <p className="text-sm font-medium opacity-90">Types de Documents</p>
              </div>
              <div className="space-y-1 mt-2">
                {stats.byDocumentType.map((item) => (
                  <div key={item.type} className="flex justify-between text-sm">
                    <span>{getDocumentTypeLabel(item.type)}</span>
                    <span className="font-bold">{item.count}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-indigo-600 to-purple-600">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                    Document
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                    Date de Vérification
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-white uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredArchives.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center gap-4"
                      >
                        <Shield className="w-16 h-16 text-gray-400" />
                        <div>
                          <p className="text-xl font-bold text-gray-900 mb-2">
                            Aucune archive trouvée
                          </p>
                          <p className="text-gray-600">
                            Les archives de vérification apparaîtront ici une fois créées.
                          </p>
                        </div>
                      </motion.div>
                    </td>
                  </tr>
                ) : (
                  filteredArchives.map((archive, index) => (
                    <motion.tr
                      key={archive.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                            {archive.userFullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{archive.userFullName}</p>
                            <p className="text-sm text-gray-500">ID: {archive.userId.slice(0, 8)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700">{archive.userEmail}</span>
                          </div>
                          {archive.userPhone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-700">{archive.userPhone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 text-xs font-bold rounded-full border ${getDocumentTypeColor(
                            archive.documentType
                          )}`}
                        >
                          {getDocumentTypeLabel(archive.documentType)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="font-semibold text-gray-900">
                            {new Date(archive.verifiedAt).toLocaleDateString("fr-FR")}
                          </p>
                          <p className="text-gray-500">
                            {new Date(archive.verifiedAt).toLocaleTimeString("fr-FR")}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => unlockArchive(archive.id)}
                          disabled={isUnlocking}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 font-bold shadow-md transition-all disabled:opacity-50"
                        >
                          <Unlock className="w-4 h-4" />
                          Déverrouiller
                        </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {isDetailModalOpen && selectedArchive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={() => setIsDetailModalOpen(false)}
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex-shrink-0">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Lock className="w-6 h-6 text-white" />
                    <h2 className="text-2xl font-bold text-white">
                      Données Déchiffrées
                    </h2>
                  </div>
                  <button
                    onClick={() => setIsDetailModalOpen(false)}
                    className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto flex-1">
                <div className="space-y-6">
                  {/* User Info */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border-2 border-indigo-200">
                    <h3 className="font-bold text-lg text-indigo-900 mb-3 flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Informations Utilisateur
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Nom complet</p>
                        <p className="font-bold text-gray-900">{selectedArchive.userFullName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-bold text-gray-900">{selectedArchive.userEmail}</p>
                      </div>
                      {selectedArchive.userPhone && (
                        <div>
                          <p className="text-sm text-gray-600">Téléphone</p>
                          <p className="font-bold text-gray-900">{selectedArchive.userPhone}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sensitive Data */}
                  {selectedArchive.sensitiveData && (
                    <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-xl border-2 border-red-200">
                      <h3 className="font-bold text-lg text-red-900 mb-3 flex items-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        Données Sensibles (Chiffrées)
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        {selectedArchive.sensitiveData.documentNumber && (
                          <div>
                            <p className="text-sm text-gray-600">Numéro de document</p>
                            <p className="font-bold text-gray-900">
                              {selectedArchive.sensitiveData.documentNumber}
                            </p>
                          </div>
                        )}
                        {selectedArchive.sensitiveData.dateOfBirth && (
                          <div>
                            <p className="text-sm text-gray-600">Date de naissance</p>
                            <p className="font-bold text-gray-900">
                              {selectedArchive.sensitiveData.dateOfBirth}
                            </p>
                          </div>
                        )}
                        {selectedArchive.sensitiveData.address && (
                          <div className="col-span-2">
                            <p className="text-sm text-gray-600">Adresse</p>
                            <p className="font-bold text-gray-900">
                              {selectedArchive.sensitiveData.address}
                            </p>
                          </div>
                        )}
                        {selectedArchive.sensitiveData.nationality && (
                          <div>
                            <p className="text-sm text-gray-600">Nationalité</p>
                            <p className="font-bold text-gray-900">
                              {selectedArchive.sensitiveData.nationality}
                            </p>
                          </div>
                        )}
                        {selectedArchive.sensitiveData.issueDate && (
                          <div>
                            <p className="text-sm text-gray-600">Date d'émission</p>
                            <p className="font-bold text-gray-900">
                              {selectedArchive.sensitiveData.issueDate}
                            </p>
                          </div>
                        )}
                        {selectedArchive.sensitiveData.expirationDate && (
                          <div>
                            <p className="text-sm text-gray-600">Date d'expiration</p>
                            <p className="font-bold text-gray-900">
                              {selectedArchive.sensitiveData.expirationDate}
                            </p>
                          </div>
                        )}
                        {selectedArchive.sensitiveData.placeOfBirth && (
                          <div>
                            <p className="text-sm text-gray-600">Lieu de naissance</p>
                            <p className="font-bold text-gray-900">
                              {selectedArchive.sensitiveData.placeOfBirth}
                            </p>
                          </div>
                        )}
                        {selectedArchive.sensitiveData.taxNumber && (
                          <div className="col-span-2">
                            <p className="text-sm text-gray-600">Numéro d'impôt 🏢</p>
                            <p className="font-bold text-indigo-700 text-lg">
                              {selectedArchive.sensitiveData.taxNumber}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {selectedArchive.notes && (
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-xl border-2 border-yellow-200">
                      <h3 className="font-bold text-lg text-yellow-900 mb-3 flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Notes
                      </h3>
                      <p className="text-gray-700">{selectedArchive.notes}</p>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="bg-gray-50 p-4 rounded-xl border-2 border-gray-200">
                    <h3 className="font-bold text-lg text-gray-900 mb-3">Métadonnées</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Type de document</p>
                          <p className="font-bold text-gray-900">
                            {getDocumentTypeLabel(selectedArchive.documentType)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Vérifié le</p>
                          <p className="font-bold text-gray-900">
                            {new Date(selectedArchive.verifiedAt).toLocaleString("fr-FR")}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Archivé le</p>
                          <p className="font-bold text-gray-900">
                            {new Date(selectedArchive.archivedAt).toLocaleString("fr-FR")}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm mb-1">Vérifié par (Admin ID)</p>
                        <div className="bg-white px-3 py-2 rounded-lg border border-gray-300">
                          <p className="font-mono text-xs text-gray-800 break-all">
                            {selectedArchive.verifiedBy}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Warning */}
                  <div className="bg-red-100 border-2 border-red-400 p-4 rounded-xl">
                    <p className="text-red-800 font-semibold text-sm">
                      ⚠️ Ces données sont hautement sensibles et protégées par la loi RGPD. 
                      L'accès à ces informations est audité et enregistré.
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 flex justify-end border-t border-gray-200 flex-shrink-0">
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 font-bold shadow-lg transition-all"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Password Modal */}
      <AnimatePresence>
        {isPasswordModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={() => {
              setIsPasswordModalOpen(false);
              setPassword("");
              setPendingArchiveId(null);
            }}
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Vérification de Sécurité
                  </h2>
                  <p className="text-sm text-gray-600">
                    Saisissez votre mot de passe admin
                  </p>
                </div>
              </div>

              {/* Warning */}
              <div className="bg-red-50 border-2 border-red-200 p-3 rounded-xl mb-4">
                <p className="text-sm text-red-800 font-semibold">
                  🔐 Accès aux données sensibles
                </p>
                <p className="text-xs text-red-700 mt-1">
                  Cette archive contient des informations hautement confidentielles. 
                  Votre accès sera enregistré dans les logs d'audit.
                </p>
              </div>

              {/* Password Input */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mot de passe *
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handlePasswordSubmit();
                  }}
                  placeholder="Entrez votre mot de passe"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  autoFocus
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIsPasswordModalOpen(false);
                    setPassword("");
                    setPendingArchiveId(null);
                  }}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 font-semibold transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={handlePasswordSubmit}
                  disabled={!password || isUnlocking}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 font-bold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isUnlocking ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Vérification...
                    </>
                  ) : (
                    <>
                      <Unlock className="w-5 h-5" />
                      Déverrouiller
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

