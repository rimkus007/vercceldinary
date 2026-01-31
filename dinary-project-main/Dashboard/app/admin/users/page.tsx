"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import VerificationDetailModal from "@/components/admin/VerificationDetailModal";
import {
  Search,
  Filter,
  MoreHorizontal,
  MessageSquare,
  Shield,
  UserX,
  TrendingUp,
  RefreshCw,
  CreditCard,
  DollarSign,
  User,
  UserCheck,
  BarChart2,
  Mail,
  Phone,
  X,
  Users as UsersIcon,
  Store as StoreIcon,
  Clock,
  Check,
  Activity,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import UserLevelSystem from "@/components/admin/UserLevelSystem";
import { userStats as mockUserStats } from "@/lib/mock-data";

// --- INTERFACES ---

interface VerificationRequest {
  id: string;
  documentType: string;
  frontImageUrl: string;
  backImageUrl?: string | null;
  selfieImageUrl?: string | null;
  selfieInstruction?: string | null;
  user: {
    fullName: string;
    email: string;
    role: "USER" | "MERCHANT";
  };
  createdAt: string;
}

interface UserData {
  id: string;
  email: string;
  username: string;
  fullName: string;
  phoneNumber: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  lastSeen: string | null;
  isVerified: boolean;
  profile: {
    level: number;
    xp: number;
  } | null;
  wallet: {
    _count: {
      sentTransactions: number;
      receivedTransactions: number;
    };
  } | null;
}

// Interface pour les demandes de recharge
interface RechargeRequest {
  id: string;
  amount: number;
  reference: string | null;
  createdAt: string;
  status: string;
  receiver: {
    user: {
      fullName: string;
      email: string;
    };
  };
}

// --- COMPOSANTS INTERNES ---

const VerificationBadge = ({
  isVerified,
}: {
  isVerified: boolean;
}) => {
  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full border ${
        isVerified
          ? "bg-green-100 text-green-800 border-green-200"
          : "bg-orange-100 text-orange-800 border-orange-200"
      }`}
    >
      {isVerified ? "Vérifié" : "Non vérifié"}
    </span>
  );
};

const Tabs = ({
  tabs,
  activeTab,
  setActiveTab,
  rechargeData,
  verificationData,
}: {
  tabs: { id: string; label: string; icon: React.ReactNode }[];
  activeTab: string;
  setActiveTab: (id: string) => void;
  rechargeData: any[];
  verificationData: any[];
}) => (
  <div className="flex space-x-1 overflow-x-auto pb-2 border-b">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        onClick={() => setActiveTab(tab.id)}
        className={`px-4 py-2 flex items-center space-x-2 rounded-t-lg transition-colors ${
          activeTab === tab.id
            ? "bg-white text-dinary-turquoise border-b-2 border-dinary-turquoise font-medium"
            : "text-gray-600 hover:text-dinary-turquoise hover:bg-gray-50"
        }`}
      >
        {tab.icon}
        <span>{tab.label}</span>
      </button>
    ))}
  </div>
);

const UserDetailModal = ({
  user,
  onClose,
}: {
  user: UserData;
  onClose: () => void;
}) => {
  const { token } = useAuth();
  const router = useRouter();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Jamais";
    return format(new Date(dateString), "dd MMM yyyy HH:mm");
  };

  const totalTransactions =
    (user.wallet?._count?.sentTransactions ?? 0) +
    (user.wallet?._count?.receivedTransactions ?? 0);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!token) return;
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const res = await fetch(
          `${API_URL}/admin/users/${user.id}/transactions`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.ok) {
          const data = await res.json();
          setTransactions(data.slice(0, 10)); // Dernières 10 transactions
        }
      } catch (error) {
        /* log removed */
      } finally {
        setLoadingTransactions(false);
      }
    };
    fetchTransactions();
  }, [user.id, token]);

  const handleSendMessage = () => {
    router.push(`/admin/control-center/messaging?userId=${user.id}`);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-dinary-turquoise to-blue-500 px-6 py-4 flex justify-between items-center text-white">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-white text-dinary-turquoise text-xl flex items-center justify-center font-bold shadow-lg">
              {user.fullName.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                {user.fullName}
                <span className="text-sm bg-white/20 px-2 py-1 rounded">
                  #{user.id.substring(0, 8)}
                </span>
              </h2>
              <div className="flex items-center mt-1 text-sm opacity-90">
                <div className="flex items-center mr-4">
                  <Mail size={14} className="mr-1" /> {user.email}
                </div>
                <div className="flex items-center">
                  <Phone size={14} className="mr-1" /> {user.phoneNumber}
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto p-6 flex-grow bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Colonne gauche */}
            <div className="space-y-6">
              {/* Informations générales */}
              <div className="bg-white border rounded-lg p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <User size={18} className="text-dinary-turquoise" />
                  Informations
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Inscrit le</span>
                    <span className="text-sm font-medium">
                      {format(new Date(user.createdAt), "dd MMM yyyy")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Dernière activité</span>
                    <span className="text-sm font-medium">
                      {formatDate(user.lastSeen)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Vérification</span>
                    <VerificationBadge isVerified={user.isVerified} />
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-500">Rôle</span>
                    <span className="text-sm font-medium bg-purple-100 text-purple-800 px-2 py-1 rounded">
                      {user.role}
                    </span>
                  </div>
                </div>
              </div>

              {/* Statistiques */}
              <div className="bg-white border rounded-lg p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <BarChart2 size={18} className="text-dinary-turquoise" />
                  Statistiques
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Transactions</span>
                    <span className="text-lg font-bold text-dinary-turquoise">
                      {totalTransactions}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Niveau</span>
                    <span className="text-lg font-bold text-purple-600">
                      {user.profile?.level ?? 1}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Points XP</span>
                    <span className="text-lg font-bold text-orange-600">
                      {user.profile?.xp ?? 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progression */}
              <UserLevelSystem
                userType="user"
                level={user.profile?.level ?? 1}
                xp={user.profile?.xp ?? 0}
                xpToNextLevel={1000}
                points={user.profile?.xp ?? 0}
                starPoints={0}
                challenges={[]}
              />
            </div>

            {/* Colonne droite - Transactions */}
            <div className="bg-white border rounded-lg p-5 shadow-sm md:col-span-2 flex flex-col">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Activity size={18} className="text-dinary-turquoise" />
                Dernières transactions
              </h3>
              {loadingTransactions ? (
                <div className="flex items-center justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dinary-turquoise"></div>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  <CreditCard size={48} className="mx-auto mb-3 text-gray-300" />
                  <p>Aucune transaction enregistrée</p>
                </div>
              ) : (
                <div className="space-y-2 flex-1 overflow-y-auto pr-2">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {tx.type}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(tx.createdAt), "dd MMM yyyy HH:mm")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString('fr-DZ')} DZD
                        </p>
                        <p className="text-xs text-gray-500">
                          {tx.status || 'Complété'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer avec bouton message uniquement */}
        <div className="bg-white border-t px-6 py-4 flex justify-between items-center">
          <button
            onClick={handleSendMessage}
            className="px-6 py-2.5 bg-gradient-to-r from-dinary-turquoise to-blue-500 text-white rounded-lg flex items-center text-sm font-medium hover:shadow-lg transition-all duration-200"
          >
            <MessageSquare size={16} className="mr-2" /> Envoyer un message
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

const UserStatCard = ({
  title,
  value,
  icon,
  gradient,
  trend,
  trendValue,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  gradient: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}) => (
  <div className="group relative bg-white rounded-xl border border-gray-200 shadow-sm p-6 transition-all hover:shadow-xl hover:-translate-y-1 duration-300 overflow-hidden">
    {/* Fond gradient animé */}
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
    
    {/* Effet de brillance au hover */}
    <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/50 to-white/0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 transform -skew-x-12"></div>
    
    <div className="relative z-10">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">
            {value}
          </p>
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
          <div className="text-white">
            {icon}
          </div>
        </div>
      </div>
      
      {/* Indicateur de tendance */}
      {trend && trendValue && (
        <div className="flex items-center gap-1.5">
          {trend === 'up' && (
            <>
              <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full">
                <TrendingUp size={14} />
                <span className="text-xs font-semibold">{trendValue}</span>
              </div>
              <span className="text-xs text-gray-500">vs hier</span>
            </>
          )}
          {trend === 'down' && (
            <>
              <div className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full">
                <ArrowDown size={14} />
                <span className="text-xs font-semibold">{trendValue}</span>
              </div>
              <span className="text-xs text-gray-500">vs hier</span>
            </>
          )}
          {trend === 'neutral' && (
            <div className="flex items-center gap-1 text-gray-600 bg-gray-50 px-2 py-1 rounded-full">
              <Activity size={14} />
              <span className="text-xs font-semibold">Stable</span>
            </div>
          )}
        </div>
      )}
    </div>
  </div>
);

// --- COMPOSANT LISTE UTILISATEURS AMÉLIORÉ ---
const UsersListSection = ({
  users,
  searchQuery,
  setSearchQuery,
  selectedStatus,
  setSelectedStatus,
  setSelectedUserDetail,
}: {
  users: UserData[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  setSelectedUserDetail: (user: UserData) => void;
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [sortField, setSortField] = useState<keyof UserData | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Tri des utilisateurs
  const sortedUsers = useMemo(() => {
    if (!sortField) return users;
    
    return [...users].sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // Gestion des cas spéciaux
      if (sortField === "profile") {
        aValue = a.profile?.level ?? 0;
        bValue = b.profile?.level ?? 0;
      } else if (sortField === "wallet") {
        const aTransactions = (a.wallet?._count?.sentTransactions ?? 0) + (a.wallet?._count?.receivedTransactions ?? 0);
        const bTransactions = (b.wallet?._count?.sentTransactions ?? 0) + (b.wallet?._count?.receivedTransactions ?? 0);
        aValue = aTransactions;
        bValue = bTransactions;
      } else if (sortField === "createdAt") {
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [users, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedUsers, currentPage, itemsPerPage]);

  // Réinitialiser la page quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatus]);

  const handleSort = (field: keyof UserData) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const SortIcon = ({ field }: { field: keyof UserData }) => {
    if (sortField !== field) return <ArrowUp size={14} className="opacity-0 group-hover:opacity-30" />;
    return sortDirection === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
  };

  return (
    <div className="space-y-4">
      {/* Barre de recherche et filtres */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="relative flex-1 w-full md:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom, email ou téléphone..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-dinary-turquoise focus:ring-2 focus:ring-dinary-turquoise/20 focus:outline-none text-sm transition-all"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-500" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:border-dinary-turquoise focus:ring-2 focus:ring-dinary-turquoise/20 bg-white text-gray-800 text-sm transition-all"
              >
                <option value="all">Tous les statuts</option>
                <option value="verified">Vérifiés</option>
                <option value="unverified">Non vérifiés</option>
              </select>
            </div>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:border-dinary-turquoise focus:ring-2 focus:ring-dinary-turquoise/20 bg-white text-gray-800 text-sm transition-all"
            >
              <option value={10}>10 par page</option>
              <option value={20}>20 par page</option>
              <option value={50}>50 par page</option>
              <option value={100}>100 par page</option>
            </select>
          </div>
        </div>
        <div className="mt-3 text-sm text-gray-600">
          <span className="font-medium">{sortedUsers.length}</span> utilisateur(s) trouvé(s)
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th
                  onClick={() => handleSort("fullName")}
                  className="group px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    Utilisateur
                    <SortIcon field="fullName" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("role")}
                  className="group px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    Rôle
                    <SortIcon field="role" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("isVerified")}
                  className="group px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    Vérification
                    <SortIcon field="isVerified" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("profile")}
                  className="group px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    Niveau
                    <SortIcon field="profile" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("createdAt")}
                  className="group px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    Inscription
                    <SortIcon field="createdAt" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Points XP
                </th>
                <th
                  onClick={() => handleSort("wallet")}
                  className="group px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    Transactions
                    <SortIcon field="wallet" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {paginatedUsers.map((user, index) => (
                <tr
                  key={user.id}
                  onClick={() => setSelectedUserDetail(user)}
                  className={`cursor-pointer hover:bg-gradient-to-r hover:from-dinary-turquoise/5 hover:to-blue-50 transition-all duration-200 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-dinary-turquoise to-blue-500 text-white flex items-center justify-center font-semibold text-sm shadow-md">
                        {user.fullName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {user.fullName}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      user.role === "MERCHANT" 
                        ? "bg-purple-100 text-purple-800" 
                        : "bg-blue-100 text-blue-800"
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <VerificationBadge isVerified={user.isVerified} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-xs shadow">
                        {user.profile?.level ?? 1}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {format(new Date(user.createdAt), "dd MMM yyyy")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-yellow-400"></div>
                      <span className="text-sm font-semibold text-gray-900">
                        {user.profile?.xp ?? 0}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Activity size={14} className="text-dinary-turquoise" />
                      <span className="text-sm font-semibold text-gray-900">
                        {(user.wallet?._count?.sentTransactions ?? 0) +
                          (user.wallet?._count?.receivedTransactions ?? 0)}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-sm text-gray-600">
                Page <span className="font-semibold">{currentPage}</span> sur{" "}
                <span className="font-semibold">{totalPages}</span> •{" "}
                <span className="font-semibold">{sortedUsers.length}</span> résultats
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Premier
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Précédent
                </button>
                
                {/* Numéros de page */}
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                          currentPage === pageNum
                            ? "bg-gradient-to-r from-dinary-turquoise to-blue-500 text-white font-semibold shadow-md"
                            : "border border-gray-300 hover:bg-white"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Suivant
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Dernier
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Message si aucun résultat */}
      {paginatedUsers.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <UsersIcon size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun utilisateur trouvé</h3>
          <p className="text-gray-500">
            Essayez de modifier vos critères de recherche ou vos filtres
          </p>
        </div>
      )}
    </div>
  );
};

// --- COMPOSANT PRINCIPAL DE LA PAGE ---
export default function UsersPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationTypeFilter, setVerificationTypeFilter] = useState<
    "USER" | "MERCHANT"
  >("USER");
  const [users, setUsers] = useState<UserData[]>([]);
  const [stats, setStats] = useState({
    ...mockUserStats,
    totalUsers: 0,
    activeUsers: 0,
    newUsersToday: 0,
    pendingVerifications: 0,
  });
  const [rechargeRequests, setRechargeRequests] = useState<RechargeRequest[]>(
    []
  );
  const [selectedUserDetail, setSelectedUserDetail] = useState<UserData | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [selectedVerification, setSelectedVerification] =
    useState<VerificationRequest | null>(null);
  const [isLoadingVerifications, setIsLoadingVerifications] = useState(false);

  const { token, logout } = useAuth();

  const fetchData = useCallback(async () => {
    if (!token) {
      setError("Authentification requise.");
      setLoading(false);
      return;
    }
    setError(null);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const [
        usersResponse,
        statsResponse,
        rechargeResponse,
        verificationsResponse,
      ] = await Promise.all([
        fetch(`${API_URL}/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/admin/recharges/pending`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/admin/identity/pending`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (
        [
          usersResponse,
          statsResponse,
          rechargeResponse,
          verificationsResponse,
        ].some((res) => res.status === 401)
      ) {
        logout();
        throw new Error("Session expirée. Veuillez vous reconnecter.");
      }

      if (
        !usersResponse.ok ||
        !statsResponse.ok ||
        !rechargeResponse.ok ||
        !verificationsResponse.ok
      ) {
        throw new Error("Échec du chargement des données.");
      }

      const usersData: UserData[] = await usersResponse.json();
      const statsData = await statsResponse.json();
      const rechargeData: RechargeRequest[] = await rechargeResponse.json();
      const verificationsData = await verificationsResponse.json();

      // Filtrer pour ne garder que les clients (role USER), pas les marchands
      const clientsOnly = usersData.filter((user) => user.role === "USER");
      setUsers(clientsOnly || []);
      setRechargeRequests(rechargeData || []);
      setVerifications(verificationsData || []);

      setStats((prev) => ({
        ...prev,
        totalUsers: statsData.totalUsers,
        activeUsers: usersData.filter((u) => u.isVerified).length,
        newUsersToday: statsData.newUsersToday,
        inactiveUsers: usersData.filter((u) => !u.isVerified).length,
        pendingRecharges: rechargeData.filter((r) => r.status === "PENDING")
          .length,
        pendingVerifications: verificationsData.length,
      }));
    } catch (err: any) {
      setError(err.message);
    }
  }, [token, logout]);

  const fetchVerifications = useCallback(async () => {
    // ... (fonction inchangée)
  }, [token, verificationTypeFilter, logout]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
  };

  const handleProcessRecharge = async (
    id: string,
    action: "approve" | "reject"
  ) => {
    const reason =
      action === "reject" ? prompt("Veuillez entrer le motif du rejet :") : "";
    if (action === "reject" && !reason) {
      alert("Un motif est obligatoire pour rejeter une demande.");
      return;
    }

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(
        `${API_URL}/admin/recharges/${id}/${action}`,
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
        throw new Error(errorData.message || `L'action a échoué.`);
      }

      alert(
        `La demande a été ${action === "approve" ? "approuvée" : "rejetée"}.`
      );
      handleRefresh(); // Recharger toutes les données pour mettre à jour les listes et stats
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchData().finally(() => setLoading(false));
  }, [fetchData]);

  useEffect(() => {
    if (activeTab === "verifications") {
      fetchVerifications();
    }
  }, [activeTab, fetchVerifications]);

  const filteredUsers = useMemo(
    () =>
      users.filter((user) => {
        const searchMatch =
          user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.phoneNumber.includes(searchQuery);
        let statusMatch = true;
        if (selectedStatus === "verified") statusMatch = user.isVerified;
        if (selectedStatus === "unverified") statusMatch = !user.isVerified;
        return searchMatch && statusMatch;
      }),
    [users, searchQuery, selectedStatus]
  );

  const tabs = [
    { id: "overview", label: "Vue d'ensemble", icon: <BarChart2 size={18} /> },
    { id: "users-list", label: "Liste utilisateurs", icon: <User size={18} /> },
    {
      id: "manual-recharge",
      label: "Rechargement libre",
      icon: <DollarSign size={18} />,
    },
    {
      id: "verifications",
      label: "Vérifications",
      icon: <UserCheck size={18} />,
    },
  ];

  if (loading)
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dinary-turquoise"></div>
      </div>
    );
  if (error)
    return (
      <div className="p-4 bg-red-50 text-red-600 text-center rounded-lg">
        {error}
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">
          Gestion des utilisateurs
        </h1>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="bg-dinary-turquoise text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors flex items-center space-x-2 disabled:opacity-50"
        >
          <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
          <span>{isRefreshing ? "Chargement..." : "Actualiser"}</span>
        </button>
      </div>

      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        rechargeData={rechargeRequests}
        verificationData={verifications}
      />

      <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-8 border border-gray-200 shadow-sm">
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* En-tête avec titre et sous-titre */}
            <div className="text-center">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-dinary-turquoise via-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Vue d'ensemble des utilisateurs
              </h2>
              <p className="text-gray-500 text-sm">
                Suivi en temps réel des statistiques clés de votre plateforme
              </p>
            </div>

            {/* Grille de statistiques */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <UserStatCard
                title="Total utilisateurs"
                value={stats.totalUsers?.value ?? stats.totalUsers}
                icon={<UsersIcon className="h-6 w-6" />}
                gradient="from-blue-500 to-blue-600"
                trend="up"
                trendValue="+12%"
              />
              <UserStatCard
                title="Utilisateurs vérifiés"
                value={stats.activeUsers?.value ?? stats.activeUsers}
                icon={<UserCheck className="h-6 w-6" />}
                gradient="from-green-500 to-emerald-600"
                trend="up"
                trendValue="+8%"
              />
              <UserStatCard
                title="Nouveaux aujourd'hui"
                value={stats.newUsersToday?.value ?? stats.newUsersToday}
                icon={<TrendingUp className="h-6 w-6" />}
                gradient="from-purple-500 to-purple-600"
                trend="neutral"
              />
            </div>

            {/* Deuxième rangée - Actions en attente */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Clock className="text-amber-500" size={20} />
                Actions en attente
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <UserStatCard
                  title="Recharges en attente"
                  value={stats.pendingRecharges?.value ?? stats.pendingRecharges}
                  icon={<CreditCard className="h-6 w-6" />}
                  gradient="from-amber-500 to-orange-600"
                  trend={stats.pendingRecharges > 0 ? "up" : "neutral"}
                  trendValue={stats.pendingRecharges > 0 ? `${stats.pendingRecharges} demandes` : undefined}
                />
                <UserStatCard
                  title="Vérifications en attente"
                  value={stats.pendingVerifications?.value ?? stats.pendingVerifications}
                  icon={<Shield className="h-6 w-6" />}
                  gradient="from-yellow-500 to-amber-600"
                  trend={stats.pendingVerifications > 0 ? "up" : "neutral"}
                  trendValue={stats.pendingVerifications > 0 ? `${stats.pendingVerifications} demandes` : undefined}
                />
              </div>
            </div>

            {/* Barre d'action rapide */}
            <div className="mt-6 p-6 bg-gradient-to-r from-dinary-turquoise/10 via-blue-50 to-purple-50 rounded-xl border border-dinary-turquoise/20">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white rounded-lg shadow-sm">
                    <Activity className="text-dinary-turquoise" size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Actions rapides</h4>
                    <p className="text-sm text-gray-600">Gérez vos utilisateurs efficacement</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setActiveTab("users-list")}
                    className="px-4 py-2 bg-white text-dinary-turquoise rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2 border border-dinary-turquoise/20"
                  >
                    <UsersIcon size={18} />
                    Voir tous les utilisateurs
                  </button>
                  <button
                    onClick={() => setActiveTab("verifications")}
                    className="px-4 py-2 bg-gradient-to-r from-dinary-turquoise to-blue-500 text-white rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2"
                  >
                    <Shield size={18} />
                    Vérifications
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "users-list" && (
          <UsersListSection 
            users={filteredUsers}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            setSelectedUserDetail={setSelectedUserDetail}
          />
        )}

        {activeTab === "manual-recharge" && (
          <div>
            <h2 className="text-lg font-medium text-gray-800 mb-4">
              Rechargement libre
            </h2>
            <form
              className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow"
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const phone = (
                  form.elements.namedItem("phone") as HTMLInputElement
                ).value;
                const amount = (
                  form.elements.namedItem("amount") as HTMLInputElement
                ).value;
                const reference = (
                  form.elements.namedItem("reference") as HTMLInputElement
                ).value;
                if (!phone) {
                  alert("Veuillez renseigner un numéro de téléphone.");
                  return;
                }
                if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
                  alert("Veuillez entrer un montant valide.");
                  return;
                }
                try {
                  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
                  const res = await fetch(
                    `${API_URL}/admin/recharges/manual`,
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify({
                        phone,
                        amount: Number(amount),
                        reference,
                      }),
                    }
                  );
                  const data = await res.json();
                  if (res.ok) {
                    alert("Recharge effectuée avec succès !");
                    form.reset();
                  } else {
                    alert(data.message || "Erreur lors du rechargement.");
                  }
                } catch (err) {
                  alert("Erreur réseau ou serveur.");
                }
              }}
            >
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Numéro de téléphone
                </label>
                <input
                  name="phone"
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  placeholder="Numéro de téléphone"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Montant
                </label>
                <input
                  name="amount"
                  type="number"
                  min="1"
                  className="w-full border rounded px-3 py-2"
                  placeholder="Montant à recharger"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Référence (optionnel)
                </label>
                <input
                  name="reference"
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  placeholder="Référence"
                />
              </div>
              <button
                type="submit"
                className="bg-dinary-turquoise text-white px-4 py-2 rounded hover:bg-opacity-90"
              >
                Recharger
              </button>
            </form>
          </div>
        )}

        {activeTab === "verifications" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Demandes de vérification</h2>
              <div className="flex p-1 bg-gray-100 rounded-lg">
                <button
                  onClick={() => setVerificationTypeFilter("USER")}
                  className={`px-3 py-1 text-sm rounded-md flex items-center ${
                    verificationTypeFilter === "USER" ? "bg-white shadow" : ""
                  }`}
                >
                  <UsersIcon size={16} className="mr-2" /> Clients
                </button>
                <button
                  onClick={() => setVerificationTypeFilter("MERCHANT")}
                  className={`px-3 py-1 text-sm rounded-md flex items-center ${
                    verificationTypeFilter === "MERCHANT"
                      ? "bg-white shadow"
                      : ""
                  }`}
                >
                  <StoreIcon size={16} className="mr-2" /> Vendeurs
                </button>
              </div>
            </div>
            {isLoadingVerifications ? (
              <p>Chargement...</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500">
                    <th className="p-2">Utilisateur</th>
                    <th className="p-2">Date de soumission</th>
                    <th className="p-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {verifications.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center p-4 text-gray-500">
                        Aucune demande en attente.
                      </td>
                    </tr>
                  ) : (
                    verifications.map((req) => (
                      <tr key={req.id} className="border-t">
                        <td className="p-2">
                          <div className="font-medium">{req.user.fullName}</div>
                          <div className="text-xs text-gray-500">
                            {req.user.email}
                          </div>
                        </td>
                        <td className="p-2 text-sm">
                          {new Date(req.createdAt).toLocaleDateString("fr-FR")}
                        </td>
                        <td className="p-2">
                          <button
                            onClick={() => setSelectedVerification(req)}
                            className="text-blue-500 hover:underline text-sm"
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
        )}
      </div>

      {selectedUserDetail && (
        <UserDetailModal
          user={selectedUserDetail}
          onClose={() => setSelectedUserDetail(null)}
        />
      )}
      <VerificationDetailModal
        request={selectedVerification}
        onClose={() => setSelectedVerification(null)}
        onAction={fetchVerifications}
        token={token}
      />
    </div>
  );
}
