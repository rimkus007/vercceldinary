"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import ChartComponent from "@/components/admin/ChartComponent";
import { 
  Search, 
  ArrowUp, 
  ArrowDown, 
  RefreshCw, 
  Download, 
  FileText, 
  Table2,
  Filter,
  X,
  Calendar,
  TrendingUp,
  TrendingDown,
  Activity
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface TransactionRecord {
  id: string;
  amount: number;
  type: string;
  status: string | null;
  createdAt: string;
  senderName: string | null;
  senderEmail: string | null;
  receiverName: string | null;
  receiverEmail: string | null;
  description: string | null;
}

export default function TransactionsPage() {
  const { token } = useAuth();
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<"createdAt" | "amount">("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // États des filtres
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [filterAmountMin, setFilterAmountMin] = useState("");
  const [filterAmountMax, setFilterAmountMax] = useState("");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Chargement initial
  useEffect(() => {
    if (!token) return;
    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/transactions`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error("Erreur lors du chargement des transactions.");
        const json = await res.json();
        setTransactions(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [token]);

  // Rafraîchissement
  const handleRefresh = () => {
    setIsRefreshing(true);
    if (!token) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/transactions`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((json) => setTransactions(json))
      .catch(() => {})
      .finally(() => setIsRefreshing(false));
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setFilterType("all");
    setFilterStatus("all");
    setFilterDateFrom("");
    setFilterDateTo("");
    setFilterAmountMin("");
    setFilterAmountMax("");
    setSearchTerm("");
  };

  // Types uniques pour le filtre
  const uniqueTypes = useMemo(() => {
    const types = new Set(transactions.map(t => t.type));
    return Array.from(types).sort();
  }, [transactions]);

  // Filtrage avancé
  const filtered = useMemo(() => {
    let result = transactions;

    // Recherche textuelle
    if (searchTerm) {
    const search = searchTerm.toLowerCase();
      result = result.filter((t) =>
        t.id.toLowerCase().includes(search) ||
        (t.senderName ?? "").toLowerCase().includes(search) ||
        (t.receiverName ?? "").toLowerCase().includes(search) ||
        (t.description ?? "").toLowerCase().includes(search)
      );
    }

    // Filtre par type
    if (filterType !== "all") {
      result = result.filter(t => t.type === filterType);
    }

    // Filtre par statut
    if (filterStatus !== "all") {
      result = result.filter(t => t.status === filterStatus);
    }

    // Filtre par date
    if (filterDateFrom) {
      const fromDate = new Date(filterDateFrom);
      result = result.filter(t => new Date(t.createdAt) >= fromDate);
    }
    if (filterDateTo) {
      const toDate = new Date(filterDateTo);
      toDate.setHours(23, 59, 59, 999);
      result = result.filter(t => new Date(t.createdAt) <= toDate);
    }

    // Filtre par montant
    if (filterAmountMin) {
      result = result.filter(t => t.amount >= parseFloat(filterAmountMin));
    }
    if (filterAmountMax) {
      result = result.filter(t => t.amount <= parseFloat(filterAmountMax));
    }

    return result;
  }, [transactions, searchTerm, filterType, filterStatus, filterDateFrom, filterDateTo, filterAmountMin, filterAmountMax]);

  // Tri
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let valA: number | string = a[sortField];
      let valB: number | string = b[sortField];
      if (sortField === "createdAt") {
        valA = new Date(a.createdAt).getTime();
        valB = new Date(b.createdAt).getTime();
      }
      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [filtered, sortField, sortDirection]);

  // Pagination
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sorted.slice(startIndex, startIndex + itemsPerPage);
  }, [sorted, currentPage]);

  const totalPages = Math.ceil(sorted.length / itemsPerPage);

  // Statistiques
  const stats = useMemo(() => {
    const total = filtered.reduce((sum, t) => sum + t.amount, 0);
    const count = filtered.length;
    const avg = count > 0 ? total / count : 0;
    const max = count > 0 ? Math.max(...filtered.map(t => t.amount)) : 0;
    const min = count > 0 ? Math.min(...filtered.map(t => t.amount)) : 0;
    
    return { total, count, avg, max, min };
  }, [filtered]);

  // Répartition par type
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of filtered) {
      counts[t.type] = (counts[t.type] || 0) + 1;
    }
    return counts;
  }, [filtered]);

  const typeChartData = useMemo(() => {
    const labels = Object.keys(typeCounts);
    const values = labels.map((label) => typeCounts[label]);
    return {
      labels,
      datasets: [{
          data: values,
        backgroundColor: [
          "#4DD0E1", "#66BB6A", "#FFA726", "#9575CD", 
          "#EF5350", "#26A69A", "#FF7043", "#42A5F5"
        ],
        borderWidth: 2,
          borderColor: "#fff",
      }],
    };
  }, [typeCounts]);

  // Export CSV
  const exportToCSV = () => {
    const headers = ["ID", "Date", "Type", "Montant", "Expéditeur", "Destinataire", "Description", "Statut"];
    const rows = sorted.map(t => [
      t.id,
      new Date(t.createdAt).toLocaleString("fr-FR"),
      t.type,
      t.amount.toFixed(2),
      t.senderName || "-",
      t.receiverName || "-",
      t.description || "-",
      t.status || "-"
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `transactions_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  // Export PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // En-tête
    doc.setFontSize(18);
    doc.setTextColor(20, 184, 166);
    doc.text("Rapport de Transactions", 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Généré le ${new Date().toLocaleString("fr-FR")}`, 14, 30);
    doc.text(`Total: ${stats.count} transactions`, 14, 36);
    doc.text(`Montant total: ${stats.total.toLocaleString("fr-DZ")} DZD`, 14, 42);
    
    // Tableau
    autoTable(doc, {
      startY: 50,
      head: [["Date", "Type", "Montant (DZD)", "Expéditeur", "Destinataire"]],
      body: sorted.map(t => [
        new Date(t.createdAt).toLocaleDateString("fr-FR"),
        t.type,
        t.amount.toFixed(2),
        t.senderName || "-",
        t.receiverName || "-"
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [20, 184, 166] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });
    
    doc.save(`transactions_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Changement de tri
  const toggleSort = (field: "createdAt" | "amount") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  if (loading) return <div className="p-6">Chargement...</div>;
  if (error) return <div className="p-6 text-red-500">Erreur : {error}</div>;

  const activeFiltersCount = [
    filterType !== "all",
    filterStatus !== "all",
    filterDateFrom,
    filterDateTo,
    filterAmountMin,
    filterAmountMax
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Transactions</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestion et analyse des transactions de la plateforme
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            disabled={isRefreshing}
          >
            <RefreshCw size={18} className={`text-gray-600 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              showFilters ? "bg-dinary-turquoise text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Filter size={16} />
            Filtres
            {activeFiltersCount > 0 && (
              <span className="bg-white text-dinary-turquoise text-xs font-bold px-2 py-0.5 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>
          <div className="flex gap-2">
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Table2 size={16} />
              CSV
            </button>
            <button
              onClick={exportToPDF}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <FileText size={16} />
              PDF
            </button>
          </div>
        </div>
      </div>

      {/* Filtres avancés */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Filtres avancés</h3>
            <button
              onClick={resetFilters}
              className="text-sm text-dinary-turquoise hover:text-dinary-turquoise/80 flex items-center gap-1"
            >
              <X size={14} />
              Réinitialiser
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dinary-turquoise focus:border-dinary-turquoise"
              >
                <option value="all">Tous les types</option>
                {uniqueTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Statut */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dinary-turquoise focus:border-dinary-turquoise"
              >
                <option value="all">Tous les statuts</option>
                <option value="completed">Complété</option>
                <option value="pending">En attente</option>
                <option value="failed">Échoué</option>
              </select>
            </div>

            {/* Date début */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date début</label>
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dinary-turquoise focus:border-dinary-turquoise"
              />
            </div>

            {/* Date fin */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date fin</label>
              <input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dinary-turquoise focus:border-dinary-turquoise"
              />
            </div>

            {/* Montant min */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Montant min (DZD)</label>
              <input
                type="number"
                value={filterAmountMin}
                onChange={(e) => setFilterAmountMin(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dinary-turquoise focus:border-dinary-turquoise"
              />
            </div>

            {/* Montant max */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Montant max (DZD)</label>
              <input
                type="number"
                value={filterAmountMax}
                onChange={(e) => setFilterAmountMax(e.target.value)}
                placeholder="∞"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dinary-turquoise focus:border-dinary-turquoise"
              />
            </div>
          </div>
        </div>
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-5 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm opacity-90">Volume total</p>
            <TrendingUp size={20} className="opacity-80" />
          </div>
          <h3 className="text-2xl font-bold">
            {stats.total.toLocaleString("fr-DZ", {
              style: "currency",
              currency: "DZD",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </h3>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-5 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm opacity-90">Transactions</p>
            <Activity size={20} className="opacity-80" />
          </div>
          <h3 className="text-2xl font-bold">{stats.count.toLocaleString()}</h3>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md p-5 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm opacity-90">Moyenne</p>
            <TrendingDown size={20} className="opacity-80" />
          </div>
          <h3 className="text-xl font-bold">
            {stats.avg.toLocaleString("fr-DZ", {
              style: "currency",
              currency: "DZD",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </h3>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-md p-5 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm opacity-90">Maximum</p>
            <ArrowUp size={20} className="opacity-80" />
          </div>
          <h3 className="text-xl font-bold">
            {stats.max.toLocaleString("fr-DZ", {
              style: "currency",
              currency: "DZD",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </h3>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-md p-5 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm opacity-90">Minimum</p>
            <ArrowDown size={20} className="opacity-80" />
          </div>
          <h3 className="text-xl font-bold">
            {stats.min.toLocaleString("fr-DZ", {
              style: "currency",
              currency: "DZD",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </h3>
        </div>
      </div>

      {/* Graphique */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Répartition par type</h3>
        <div className="h-80">
            <ChartComponent
              type="doughnut"
              data={typeChartData}
              options={{
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                  position: "right",
                    labels: {
                    boxWidth: 15,
                      padding: 15,
                      usePointStyle: true,
                    },
                  },
                },
              }}
            />
          </div>
        </div>

      {/* Tableau */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-5">
          <h3 className="text-lg font-semibold text-gray-800">
            Liste des transactions ({sorted.length})
          </h3>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
              placeholder="Rechercher par ID, nom, description..."
              className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg w-full md:w-80 focus:ring-2 focus:ring-dinary-turquoise focus:border-dinary-turquoise"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                  onClick={() => toggleSort("createdAt")}
                >
                  <div className="flex items-center gap-1">
                    Date
                    {sortField === "createdAt" && (
                      sortDirection === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                  onClick={() => toggleSort("amount")}
                >
                  <div className="flex items-center gap-1">
                    Montant
                    {sortField === "amount" && (
                      sortDirection === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expéditeur</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destinataire</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-900 font-mono">{t.id.substring(0, 8)}...</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(t.createdAt).toLocaleString("fr-FR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    {t.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                    {t.amount.toLocaleString("fr-DZ", {
                      style: "currency",
                      currency: "DZD",
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{t.senderName || "-"}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{t.receiverName || "-"}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{t.description || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Page {currentPage} sur {totalPages} • {sorted.length} résultats
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Précédent
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      currentPage === pageNum
                        ? "bg-dinary-turquoise text-white"
                        : "border border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              {totalPages > 5 && <span className="px-3 py-1">...</span>}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
