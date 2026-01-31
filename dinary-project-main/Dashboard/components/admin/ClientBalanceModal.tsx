"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Download, X, Calendar, DollarSign, ArrowUpRight, ArrowDownLeft, FileText } from 'lucide-react';

interface Transaction {
  id: string;
  amount: number;
  createdAt: string;
  status: string;
  type: 'sent' | 'received';
  otherParty?: {
    fullName: string;
    email: string;
  };
}

interface ClientBalanceData {
  client: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber?: string;
    createdAt: string;
  };
  summary: {
    totalSent: number;
    totalReceived: number;
    transactionCount: number;
    balance: number;
    averageTransaction: number;
  };
  transactions: Transaction[];
}

interface ClientBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  clientName: string;
  token: string;
}

const ClientBalanceModal: React.FC<ClientBalanceModalProps> = ({
  isOpen,
  onClose,
  clientId,
  clientName,
  token,
}) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ClientBalanceData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');

  useEffect(() => {
    if (isOpen && clientId) {
      fetchClientBalance();
    }
  }, [isOpen, clientId]);

  const fetchClientBalance = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${baseUrl}/admin/users/${clientId}/balance`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Impossible de récupérer le bilan du client');
      }

      const balanceData = await response.json();
      setData(balanceData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les transactions selon la période sélectionnée
  const filteredData = useMemo(() => {
    if (!data) return null;

    if (selectedPeriod === 'all') {
      return data;
    }

    const now = new Date();
    let startDate: Date;

    switch (selectedPeriod) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '6m':
        startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        return data;
    }

    const filteredTransactions = data.transactions.filter(tx => 
      new Date(tx.createdAt) >= startDate
    );

    // Recalculer les totaux
    const totalSent = filteredTransactions
      .filter(tx => tx.type === 'sent')
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    const totalReceived = filteredTransactions
      .filter(tx => tx.type === 'received')
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    const balance = totalReceived - totalSent;
    const averageTransaction = filteredTransactions.length > 0 
      ? (totalSent + totalReceived) / filteredTransactions.length 
      : 0;

    return {
      ...data,
      summary: {
        totalSent: parseFloat(totalSent.toFixed(2)),
        totalReceived: parseFloat(totalReceived.toFixed(2)),
        transactionCount: filteredTransactions.length,
        balance: parseFloat(balance.toFixed(2)),
        averageTransaction: parseFloat(averageTransaction.toFixed(2)),
      },
      transactions: filteredTransactions,
    };
  }, [data, selectedPeriod]);

  const handleDownloadCSV = () => {
    if (!filteredData) return;

    const headers = ['Date', 'Heure', 'Type', 'Montant (DZD)', 'Contrepartie', 'Email', 'Statut'];
    const rows = filteredData.transactions.map(tx => [
      new Date(tx.createdAt).toLocaleDateString('fr-FR'),
      new Date(tx.createdAt).toLocaleTimeString('fr-FR'),
      tx.type === 'sent' ? 'Envoyé' : 'Reçu',
      `${tx.type === 'sent' ? '-' : '+'}${tx.amount}`,
      tx.otherParty?.fullName || 'Inconnu',
      tx.otherParty?.email || '',
      tx.status === 'completed' ? 'Complété' : tx.status === 'pending' ? 'En attente' : 'Échoué'
    ]);

    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
    });

    // Ajouter résumé en bas
    csvContent += '\n';
    csvContent += '"Résumé",,,,,\n';
    csvContent += `"Total Reçu","${filteredData.summary.totalReceived} DZD",,,,\n`;
    csvContent += `"Total Envoyé","${filteredData.summary.totalSent} DZD",,,,\n`;
    csvContent += `"Solde Net","${filteredData.summary.balance} DZD",,,,\n`;
    csvContent += `"Nombre de Transactions","${filteredData.summary.transactionCount}",,,,\n`;
    csvContent += `"Moyenne par Transaction","${filteredData.summary.averageTransaction} DZD",,,,\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `bilan_${clientName.replace(/\s+/g, '_')}_${selectedPeriod}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPDF = () => {
    if (!filteredData) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const periodLabel = selectedPeriod === 'all' ? 'Toutes les périodes' : 
                        selectedPeriod === '7d' ? '7 derniers jours' :
                        selectedPeriod === '30d' ? '30 derniers jours' :
                        selectedPeriod === '90d' ? '90 derniers jours' :
                        selectedPeriod === '6m' ? '6 derniers mois' :
                        selectedPeriod === '1y' ? '1 an' : '';

    const doc = printWindow.document;
    doc.open();
    doc.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Bilan Comptable - ${filteredData.client.fullName}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; max-width: 1200px; margin: 0 auto; }
    .header { text-align: center; border-bottom: 3px solid #14B8A6; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { color: #14B8A6; margin: 0 0 10px 0; }
    .header p { color: #6b7280; margin: 5px 0; }
    .summary { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 30px; }
    .summary-card { border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; }
    .summary-card h3 { color: #6b7280; font-size: 14px; margin: 0 0 10px 0; text-transform: uppercase; }
    .summary-card .value { font-size: 24px; font-weight: bold; color: #1f2937; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th { background-color: #f3f4f6; padding: 12px; text-align: left; border: 1px solid #e5e7eb; }
    td { padding: 12px; border: 1px solid #e5e7eb; }
    tr:nth-child(even) { background-color: #f9fafb; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Bilan Comptable</h1>
    <p><strong>${filteredData.client.fullName}</strong></p>
    <p>${filteredData.client.email}</p>
    ${filteredData.client.phoneNumber ? `<p>${filteredData.client.phoneNumber}</p>` : ''}
    <p>Client depuis le ${new Date(filteredData.client.createdAt).toLocaleDateString('fr-FR')}</p>
    <p style="color: #14B8A6; font-weight: bold;">Période : ${periodLabel}</p>
  </div>
  <div class="summary">
    <div class="summary-card">
      <h3>Total Reçu</h3>
      <div class="value">${filteredData.summary.totalReceived.toLocaleString('fr-DZ')} DZD</div>
    </div>
    <div class="summary-card">
      <h3>Total Envoyé</h3>
      <div class="value">${filteredData.summary.totalSent.toLocaleString('fr-DZ')} DZD</div>
    </div>
    <div class="summary-card">
      <h3>Solde Net</h3>
      <div class="value">${filteredData.summary.balance.toLocaleString('fr-DZ')} DZD</div>
    </div>
    <div class="summary-card">
      <h3>Transactions</h3>
      <div class="value">${filteredData.summary.transactionCount}</div>
    </div>
  </div>
  <h2>Historique des Transactions</h2>
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Type</th>
        <th>Montant</th>
        <th>Contrepartie</th>
        <th>Statut</th>
      </tr>
    </thead>
    <tbody>
      ${filteredData.transactions.map(tx => `
        <tr>
          <td>${new Date(tx.createdAt).toLocaleDateString('fr-FR')} ${new Date(tx.createdAt).toLocaleTimeString('fr-FR')}</td>
          <td>${tx.type === 'sent' ? 'Envoyé' : 'Reçu'}</td>
          <td>${tx.type === 'sent' ? '-' : '+'}${tx.amount.toLocaleString('fr-DZ')} DZD</td>
          <td>${tx.otherParty?.fullName || 'Inconnu'}</td>
          <td>${tx.status === 'completed' ? 'Complété' : tx.status === 'pending' ? 'En attente' : 'Échoué'}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  <div class="footer">
    <p>Document généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
    <p>© ${new Date().getFullYear()} Dinary - Tous droits réservés</p>
  </div>
</body>
</html>`);
    doc.close();
    
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      
      <div className="relative z-50 bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-6 py-4 border-b flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-semibold">Bilan Comptable - {clientName}</h2>
            <p className="text-sm text-gray-500 mt-1">Historique complet des transactions et analyse financière</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCSV}
              disabled={!filteredData || loading}
              className="inline-flex items-center px-3 py-2 border border-dinary-turquoise text-dinary-turquoise rounded-lg text-sm font-medium bg-white hover:bg-dinary-turquoise hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FileText className="h-4 w-4 mr-2" />
              CSV
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={!filteredData || loading}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4 mr-2" />
              PDF
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dinary-turquoise"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              <p>{error}</p>
            </div>
          )}

          {data && !loading && (
            <>
              {/* Sélecteur de période */}
              <div className="mb-6 flex items-center gap-3 flex-wrap">
                <span className="text-sm font-medium text-gray-700">Période :</span>
                {[
                  { value: 'all', label: 'Tout' },
                  { value: '7d', label: '7 jours' },
                  { value: '30d', label: '30 jours' },
                  { value: '90d', label: '90 jours' },
                  { value: '6m', label: '6 mois' },
                  { value: '1y', label: '1 an' },
                ].map((period) => (
                  <button
                    key={period.value}
                    onClick={() => setSelectedPeriod(period.value)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      selectedPeriod === period.value
                        ? 'bg-dinary-turquoise text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            </>
          )}

          {filteredData && !loading && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-dinary-turquoise to-blue-500 text-white p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-2">{filteredData.client.fullName}</h3>
                <p className="text-sm opacity-90">{filteredData.client.email}</p>
                {filteredData.client.phoneNumber && <p className="text-sm opacity-90">{filteredData.client.phoneNumber}</p>}
                <p className="text-sm opacity-75 mt-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Client depuis le {new Date(filteredData.client.createdAt).toLocaleDateString('fr-FR')}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-green-700 font-medium">Total Reçu</p>
                    <ArrowDownLeft className="h-5 w-5 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-green-900">
                    {filteredData.summary.totalReceived.toLocaleString('fr-DZ')} DZD
                  </p>
                </div>

                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-red-700 font-medium">Total Envoyé</p>
                    <ArrowUpRight className="h-5 w-5 text-red-600" />
                  </div>
                  <p className="text-2xl font-bold text-red-900">
                    {filteredData.summary.totalSent.toLocaleString('fr-DZ')} DZD
                  </p>
                </div>

                <div className={`${filteredData.summary.balance >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'} border p-4 rounded-lg`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className={`text-sm font-medium ${filteredData.summary.balance >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>Solde Net</p>
                    <DollarSign className={`h-5 w-5 ${filteredData.summary.balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
                  </div>
                  <p className={`text-2xl font-bold ${filteredData.summary.balance >= 0 ? 'text-blue-900' : 'text-orange-900'}`}>
                    {filteredData.summary.balance.toLocaleString('fr-DZ')} DZD
                  </p>
                </div>

                <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-purple-700 font-medium">Transactions</p>
                  </div>
                  <p className="text-2xl font-bold text-purple-900">{filteredData.summary.transactionCount}</p>
                  <p className="text-xs text-purple-600 mt-1">Moy: {filteredData.summary.averageTransaction.toLocaleString('fr-DZ')} DZD</p>
                </div>
              </div>

              <div className="bg-white border rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b">
                  <h3 className="text-lg font-semibold text-gray-800">Historique des Transactions ({filteredData.transactions.length})</h3>
                </div>
                
                <div className="overflow-x-auto max-h-96">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Montant</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contrepartie</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredData.transactions.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Aucune transaction pour cette période</td>
                        </tr>
                      ) : (
                        filteredData.transactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(tx.createdAt).toLocaleDateString('fr-FR')}
                              <span className="text-gray-400 ml-2 text-xs">{new Date(tx.createdAt).toLocaleTimeString('fr-FR')}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {tx.type === 'sent' ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  <ArrowUpRight className="h-3 w-3 mr-1" />Envoyé
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <ArrowDownLeft className="h-3 w-3 mr-1" />Reçu
                                </span>
                              )}
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-semibold ${tx.type === 'sent' ? 'text-red-600' : 'text-green-600'}`}>
                              {tx.type === 'sent' ? '-' : '+'}{tx.amount.toLocaleString('fr-DZ')} DZD
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {tx.otherParty?.fullName || 'Inconnu'}
                              {tx.otherParty?.email && <div className="text-xs text-gray-400">{tx.otherParty.email}</div>}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {tx.status === 'completed' ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Complété</span>
                              ) : tx.status === 'pending' ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">En attente</span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Échoué</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientBalanceModal;
