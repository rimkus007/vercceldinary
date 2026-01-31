"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import PageHeader from "@/components/layouts/PageHeader";
import { motion, AnimatePresence } from "framer-motion";
// ÉTAPE 1: Importer les bibliothèques pour le PDF
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Transaction {
  id: string;
  createdAt: string;
  amount: number;
  type: string;
  description: string;
  sender?: { id: string; userId: string; user?: { username: string } };
  receiver?: { id: string; userId: string; user?: { username: string } };
  commission?: number;
}

export default function ExpensesPage() {
  const { user, token, isLoading } = useAuth();
  const [monthlyData, setMonthlyData] = useState<{
    [month: string]: {
      expenses: number;
      entries: number;
      transactions: Transaction[];
    };
  }>({});
  const [error, setError] = useState<string | null>(null);
  // Nouvel état pour gérer l'ouverture du menu déroulant
  const [downloadOptionsOpen, setDownloadOptionsOpen] = useState<string | null>(
    null
  );

  useEffect(() => {
    // Logique de récupération des données (inchangée)
    const fetchTransactions = async () => {
      if (!token || !user) return;
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/wallet/transactions`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok)
          throw new Error("Impossible de récupérer les transactions.");

        const data: Transaction[] = await res.json();
        const grouped: {
          [month: string]: {
            expenses: number;
            entries: number;
            transactions: Transaction[];
          };
        } = {};

        data.forEach((tx) => {
          const date = new Date(tx.createdAt);
          const month = date.toLocaleString("fr-FR", {
            month: "long",
            year: "numeric",
          });
          if (!grouped[month]) {
            grouped[month] = { expenses: 0, entries: 0, transactions: [] };
          }

          const isSender = tx.sender?.user?.username === user.username;
          const isReceiver = tx.receiver?.user?.username === user.username;

          if (
            isSender &&
            ["payment", "transfer", "withdrawal"].includes(tx.type)
          ) {
            grouped[month].expenses += tx.amount + (tx.commission ?? 0);
          } else if (isReceiver) {
            grouped[month].entries += tx.amount;
          }
          grouped[month].transactions.push(tx);
        });
        setMonthlyData(grouped);
      } catch (err: any) {
        setError(err.message);
      }
    };
    if (!isLoading) fetchTransactions();
  }, [isLoading, token, user]);

  const chartData = Object.keys(monthlyData)
    .map((month) => ({
      month:
        month.split(" ")[0].charAt(0).toUpperCase() +
        month.split(" ")[0].slice(1),
      Dépenses: monthlyData[month].expenses,
      Entrées: monthlyData[month].entries,
    }))
    .reverse();

  // Logique de génération CSV (inchangée)
  const generateCsv = (month: string) => {
    const items = monthlyData[month]?.transactions || [];
    let csvContent = "Date,Type,Description,Montant (DA)\n";
    items.forEach((tx) => {
      const date = new Date(tx.createdAt).toLocaleDateString("fr-FR");
      const isExpense = tx.sender?.user?.username === user?.username;
      const amount = (isExpense ? -1 : 1) * tx.amount;
      csvContent += `${date},${tx.type},"${
        tx.description?.replace(/"/g, '""') || tx.type
      }",${amount}\n`;
    });
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `releve-dinary-${month.replace(/\s+/g, "-")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // --- ÉTAPE 2 : Nouvelle fonction pour générer le PDF ---
  const generatePdf = (month: string) => {
    const monthData = monthlyData[month];
    if (!monthData || !user) return;

    const doc = new jsPDF();

    // En-tête du document
    doc.setFontSize(20);
    doc.text("Dinary - Relevé de Compte", 14, 22);
    doc.setFontSize(14);
    doc.text(month, 14, 30);
    doc.setFontSize(10);
    doc.text(`Pour: ${user.fullName} (@${user.username})`, 14, 36);

    // Résumé
    doc.setFontSize(12);
    doc.text(
      `Total des entrées: +${monthData.entries.toLocaleString("fr-FR")} DA`,
      14,
      50
    );
    doc.text(
      `Total des sorties: -${monthData.expenses.toLocaleString("fr-FR")} DA`,
      14,
      58
    );

    // Tableau des transactions
    const tableColumn = ["Date", "Description", "Type", "Montant (DA)"];
    const tableRows: (string | number)[][] = [];

    monthData.transactions.forEach((tx) => {
      const isExpense = tx.sender?.user?.username === user.username;
      const amount =
        (isExpense ? "-" : "+") + tx.amount.toLocaleString("fr-FR");
      const txData = [
        new Date(tx.createdAt).toLocaleDateString("fr-FR"),
        tx.description || tx.type,
        tx.type,
        amount,
      ];
      tableRows.push(txData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 70,
    });

    // Sauvegarde
    doc.save(`releve-dinary-${month.replace(/\s+/g, "-")}.pdf`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Chargement des dépenses...
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen mb-16">
      <PageHeader
        title="Mes dépenses"
        emoji="💸"
        showBackButton={true}
        backTo="/dashboard"
      />

      {chartData.length > 0 && (
        <div className="p-5 border-b border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Résumé Visuel</h3>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="month"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: "rgba(243, 244, 246, 0.5)" }}
                  contentStyle={{
                    borderRadius: "12px",
                    borderColor: "#e5e7eb",
                  }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: "14px" }}
                />
                <Bar dataKey="Dépenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Entrées" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      )}

      <div className="p-5 space-y-6">
        {error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-xl">{error}</div>
        ) : Object.keys(monthlyData).length === 0 && !isLoading ? (
          <div className="text-gray-600 text-center py-10">
            <p className="text-4xl mb-4">📂</p>
            <h3 className="font-semibold">Aucune transaction</h3>
            <p className="text-sm">
              Commencez à utiliser Dinary pour voir vos dépenses ici.
            </p>
          </div>
        ) : (
          Object.keys(monthlyData)
            .sort(/*... inchangé ...*/)
            .map((month) => (
              <motion.div key={month} /*... inchangé ...*/>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold capitalize">{month}</h3>
                  {/* --- ÉTAPE 3 : Remplacer le bouton par le menu déroulant --- */}
                  <div className="relative">
                    <button
                      onClick={() =>
                        setDownloadOptionsOpen(
                          downloadOptionsOpen === month ? null : month
                        )
                      }
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center"
                    >
                      Télécharger <span className="ml-1 text-xs">▼</span>
                    </button>
                    <AnimatePresence>
                      {downloadOptionsOpen === month && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          className="absolute right-0 mt-2 w-40 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10"
                        >
                          <div className="py-1">
                            <button
                              onClick={() => {
                                generatePdf(month);
                                setDownloadOptionsOpen(null);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Format PDF 📄
                            </button>
                            <button
                              onClick={() => {
                                generateCsv(month);
                                setDownloadOptionsOpen(null);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Format CSV 📊
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                {/* Le reste de l'affichage des totaux reste inchangé */}
                <div className="flex justify-between text-sm mb-1">
                  <span>Total des sorties :</span>
                  <span className="font-medium text-red-600">
                    -{" "}
                    {monthlyData[month].expenses.toLocaleString("fr-FR", {
                      minimumFractionDigits: 2,
                    })}{" "}
                    DA
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total des entrées :</span>
                  <span className="font-medium text-green-600">
                    +{" "}
                    {monthlyData[month].entries.toLocaleString("fr-FR", {
                      minimumFractionDigits: 2,
                    })}{" "}
                    DA
                  </span>
                </div>
              </motion.div>
            ))
        )}
      </div>
    </div>
  );
}
