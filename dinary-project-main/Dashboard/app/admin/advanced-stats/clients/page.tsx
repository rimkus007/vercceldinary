"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import ChartComponent from "@/components/admin/ChartComponent";
import ClientBalanceModal from "@/components/admin/ClientBalanceModal";
import { Search, ArrowUp, ArrowDown, RefreshCw, Download, FileText } from "lucide-react";

// Définition du type retourné par l'API /admin/users/stats
interface UserStat {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  role: string;
  totalSent: number;
  totalReceived: number;
  transactionCount: number;
}

/**
 * Page des statistiques clients.
 *
 * Cette page interroge le backend via l'endpoint `/admin/users/stats` pour récupérer
 * les agrégats financiers par utilisateur (sommes envoyées, reçues et nombre de transactions).
 * Elle affiche des cartes récapitulatives, un graphique des meilleurs clients et un tableau détaillé.
 */
export default function ClientStatsPage() {
  const { token } = useAuth();
  const [data, setData] = useState<UserStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<
    "totalReceived" | "totalSent" | "transactionCount"
  >("totalReceived");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // États pour la modal de bilan
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<{ id: string; name: string } | null>(null);

  // Récupère les données au chargement ou lorsque le token change
  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/users/stats`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) {
          throw new Error(
            "Erreur lors du chargement des statistiques des utilisateurs."
          );
        }
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  // Rafraîchissement manuel des données
  const handleRefresh = () => {
    setIsRefreshing(true);
    if (!token) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch(() => {})
      .finally(() => setIsRefreshing(false));
  };

  // Filtrage des données en fonction du champ de recherche
  const filteredData = useMemo(() => {
    const search = searchTerm.toLowerCase();
    return data.filter((u) => {
      return (
        u.fullName?.toLowerCase().includes(search) ||
        u.email?.toLowerCase().includes(search) ||
        (u.phoneNumber ?? "").toLowerCase().includes(search)
      );
    });
  }, [data, searchTerm]);

  // Tri des données selon le champ choisi
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortField, sortDirection]);

  // Agrégats globaux
  const totalSentSum = useMemo(
    () => filteredData.reduce((sum, u) => sum + u.totalSent, 0),
    [filteredData]
  );
  const totalReceivedSum = useMemo(
    () => filteredData.reduce((sum, u) => sum + u.totalReceived, 0),
    [filteredData]
  );
  const totalTransactionCount = useMemo(
    () => filteredData.reduce((sum, u) => sum + u.transactionCount, 0),
    [filteredData]
  );

  // Top 5 clients par volume reçu
  const topClients = useMemo(() => {
    return [...data]
      .sort((a, b) => b.totalReceived - a.totalReceived)
      .slice(0, 5);
  }, [data]);
  const chartData = useMemo(() => {
    return {
      labels: topClients.map((u) => u.fullName),
      datasets: [
        {
          data: topClients.map((u) => u.totalReceived),
          backgroundColor: [
            "#4DD0E1",
            "#66BB6A",
            "#FFA726",
            "#9575CD",
            "#EF5350",
          ],
          borderWidth: 1,
          borderColor: "#fff",
        },
      ],
    };
  }, [topClients]);

  // Gestion du changement de tri
  const toggleSort = (
    field: "totalReceived" | "totalSent" | "transactionCount"
  ) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Ouvrir la modal de bilan pour un client
  const handleClientClick = (client: UserStat) => {
    setSelectedClient({ id: client.id, name: client.fullName });
    setIsBalanceModalOpen(true);
  };

  // Fermer la modal
  const handleCloseModal = () => {
    setIsBalanceModalOpen(false);
    setSelectedClient(null);
  };

  if (loading) {
    return <div className="p-6">Chargement...</div>;
  }
  if (error) {
    return <div className="p-6 text-red-500">Erreur : {error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Titre et actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Statistiques des clients
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Analyse des volumes envoyés et reçus par client
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            disabled={isRefreshing}
          >
            <RefreshCw
              size={18}
              className={`text-gray-600 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </button>
          <button className="flex items-center px-3 py-2 bg-dinary-turquoise hover:bg-dinary-turquoise/90 text-white rounded-lg">
            <Download size={16} className="mr-2" />
            Exporter
          </button>
        </div>
      </div>
      {/* Cartes récapitulatives */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-5 border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Total reçu</p>
          <h3 className="text-xl font-bold">
            {totalReceivedSum.toLocaleString("fr-DZ", {
              style: "currency",
              currency: "DZD",
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </h3>
        </div>
        <div className="bg-white rounded-lg shadow p-5 border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Total envoyé</p>
          <h3 className="text-xl font-bold">
            {totalSentSum.toLocaleString("fr-DZ", {
              style: "currency",
              currency: "DZD",
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </h3>
        </div>
        <div className="bg-white rounded-lg shadow p-5 border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">
            Nombre total de transactions
          </p>
          <h3 className="text-xl font-bold">
            {totalTransactionCount.toLocaleString()}
          </h3>
        </div>
      </div>
      {/* Graphique top clients */}
      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-5 border border-gray-100">
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-800">
              Top clients par volume reçu
            </h3>
            <p className="text-sm text-gray-500">
              Cinq meilleurs clients en DZD
            </p>
          </div>
          <div className="h-64">
            <ChartComponent
              type="bar"
              data={chartData}
              options={{
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "bottom",
                    labels: {
                      boxWidth: 12,
                      padding: 15,
                      usePointStyle: true,
                    },
                  },
                },
                scales: {
                  y: {
                    ticks: {
                      callback: function (value: any) {
                        return value.toLocaleString("fr-DZ") + " DZD";
                      },
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
      {/* Table des clients */}
      <div className="bg-white rounded-lg shadow p-5 border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-5">
          <h3 className="text-lg font-medium text-gray-800">
            Liste des clients
          </h3>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Rechercher..."
                className="pl-10 pr-3 py-2 border rounded-lg w-full md:w-64 focus:ring-2 focus:ring-dinary-turquoise focus:border-dinary-turquoise"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Téléphone
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => toggleSort("totalReceived")}
                >
                  <div className="flex items-center">
                    Total Reçu
                    {sortField === "totalReceived" &&
                      (sortDirection === "asc" ? (
                        <ArrowUp size={14} className="ml-1" />
                      ) : (
                        <ArrowDown size={14} className="ml-1" />
                      ))}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => toggleSort("totalSent")}
                >
                  <div className="flex items-center">
                    Total Envoyé
                    {sortField === "totalSent" &&
                      (sortDirection === "asc" ? (
                        <ArrowUp size={14} className="ml-1" />
                      ) : (
                        <ArrowDown size={14} className="ml-1" />
                      ))}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => toggleSort("transactionCount")}
                >
                  <div className="flex items-center">
                    Transactions
                    {sortField === "transactionCount" &&
                      (sortDirection === "asc" ? (
                        <ArrowUp size={14} className="ml-1" />
                      ) : (
                        <ArrowDown size={14} className="ml-1" />
                      ))}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedData.map((u) => (
                <tr key={u.id} className="hover:bg-blue-50 transition-colors cursor-pointer">
                  <td 
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium"
                    onClick={() => handleClientClick(u)}
                  >
                    {u.fullName}
                  </td>
                  <td 
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                    onClick={() => handleClientClick(u)}
                  >
                    {u.email}
                  </td>
                  <td 
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                    onClick={() => handleClientClick(u)}
                  >
                    {u.phoneNumber || "-"}
                  </td>
                  <td 
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                    onClick={() => handleClientClick(u)}
                  >
                    {u.totalReceived.toLocaleString("fr-DZ", {
                      style: "currency",
                      currency: "DZD",
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td 
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                    onClick={() => handleClientClick(u)}
                  >
                    {u.totalSent.toLocaleString("fr-DZ", {
                      style: "currency",
                      currency: "DZD",
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td 
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                    onClick={() => handleClientClick(u)}
                  >
                    {u.transactionCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClientClick(u);
                      }}
                      className="inline-flex items-center px-3 py-1.5 border border-dinary-turquoise text-dinary-turquoise rounded-lg hover:bg-dinary-turquoise hover:text-white transition-colors"
                      title="Voir le bilan comptable"
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      Bilan
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de bilan comptable */}
      {selectedClient && token && (
        <ClientBalanceModal
          isOpen={isBalanceModalOpen}
          onClose={handleCloseModal}
          clientId={selectedClient.id}
          clientName={selectedClient.name}
          token={token}
        />
      )}
    </div>
  );
}
