// components/modals/TransactionReceipt.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { QRCodeCanvas } from "qrcode.react";

// J'ajoute la propriété 'cart' à l'interface
export interface TransactionDetails {
  id: string;
  type: string;
  category: string;
  icon: string;
  bgColor: string;
  name: string;
  date: string;
  amount: string;
  isPositive: boolean;
  points: string;
  commission?: number;
  reference?: string;
  time?: string;
  description?: string;
  merchant?: {
    name: string;
    address?: string;
    phone?: string;
  };
  cart?: any[]; // 👈 AJOUT : Pour contenir les articles du panier
}

interface TransactionReceiptProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: TransactionDetails | null;
}

export default function TransactionReceipt({
  isOpen,
  onClose,
  transaction,
}: TransactionReceiptProps) {
  const [isVisible, setIsVisible] = useState(false);
  const { token } = useAuth();
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => setIsVisible(true), 10);
    } else {
      document.body.style.overflow = "auto";
      setIsVisible(false);
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const handleDownload = async () => {
    if (!transaction || !token) return;
    setIsDownloading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/wallet/transaction/${transaction.id}/invoice`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: "Le téléchargement de la facture a échoué.",
        }));
        throw new Error(errorData.message);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `facture-dinary-${transaction.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      void 0;
      alert(`Erreur lors du téléchargement: ${error.message}`);
    } finally {
      setIsDownloading(false);
    }
  };

  const generateReference = (id: string) => {
    return `TXN-${id.substring(0, 6).toUpperCase()}`;
  };

  const handleReceiptClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (!transaction || !isOpen) return null;

  const reference = transaction.reference || generateReference(transaction.id);
  const refundQrValue = JSON.stringify({ transactionId: transaction.id });

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-200 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />
      <div
        className={`fixed inset-0 flex items-center justify-center z-50 px-4 py-6 sm:p-5 overflow-y-auto transition-opacity duration-200 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      >
        <div
          className={`relative bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/50 w-full max-w-md max-h-[90vh] flex flex-col transition-all duration-300 ${
            isVisible ? "scale-100 translate-y-0" : "scale-90 translate-y-5"
          }`}
          onClick={handleReceiptClick}
        >
          <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-xl"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-gradient-to-br from-amber-500/10 to-pink-500/10 blur-xl"></div>

          <div className="relative pt-6 px-4 sm:px-6 pb-4 border-b border-gray-200/50">
            <div className="absolute top-4 right-4">
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center hover:bg-black/10 transition-colors"
                aria-label="Fermer"
              >
                <span className="text-sm">✕</span>
              </button>
            </div>
            <div className="flex items-start">
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 ${transaction.bgColor} rounded-xl sm:rounded-2xl flex items-center justify-center mr-3 sm:mr-4`}
              >
                <span className="text-xl sm:text-2xl">{transaction.icon}</span>
              </div>
              <div className="flex-grow">
                <h2 className="text-lg sm:text-xl font-bold">
                  {transaction.name}
                </h2>
                <div className="flex items-center mt-1 flex-wrap">
                  <span className="text-xs text-gray-500">{reference}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-grow overflow-y-auto">
            {/* Détails de la transaction */}
            <div className="px-4 sm:px-6 py-4 space-y-3 border-b border-gray-200/50">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Date</span>
                <span className="text-sm font-medium">{transaction.date}</span>
              </div>
              {transaction.time && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Heure</span>
                  <span className="text-sm font-medium">{transaction.time}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Montant</span>
                <span className={`text-lg font-bold ${transaction.isPositive ? 'text-green-600' : 'text-gray-900'}`}>
                  {transaction.amount} DA
                </span>
              </div>
              {typeof transaction.commission !== "undefined" && transaction.commission > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Commission</span>
                  <span className="text-sm font-semibold text-amber-600">
                    {transaction.commission} DA
                  </span>
                </div>
              )}
              {transaction.points && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Points</span>
                  <span className="text-sm font-medium text-purple-600">
                    {transaction.points}
                  </span>
                </div>
              )}
              {transaction.merchant && (
                <div className="pt-3 border-t border-gray-200/50">
                  <p className="text-xs text-gray-500 mb-2">Commerçant</p>
                  <p className="text-sm font-semibold">{transaction.merchant.name}</p>
                  {transaction.merchant.address && (
                    <p className="text-xs text-gray-500 mt-1">{transaction.merchant.address}</p>
                  )}
                  {transaction.merchant.phone && (
                    <p className="text-xs text-gray-500">{transaction.merchant.phone}</p>
                  )}
                </div>
              )}
              {transaction.description && (
                <div className="pt-3 border-t border-gray-200/50">
                  <p className="text-xs text-gray-500 mb-1">Description</p>
                  <p className="text-sm">{transaction.description}</p>
                </div>
              )}
            </div>

            {/* Détail des achats */}
            {transaction.cart && transaction.cart.length > 0 && (
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200/50">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  📦 Détail des achats
                </h3>
                <div className="space-y-2">
                  {transaction.cart.map((item: any, index: number) => (
                    <div
                      key={item.id || index}
                      className="flex justify-between text-sm items-center"
                    >
                      <span
                        className={`text-gray-600 ${
                          item.refunded ? "line-through" : ""
                        }`}
                      >
                        {item.name} (x{item.quantity})
                      </span>
                      <div className="flex items-center">
                        <span
                          className={`font-medium ${
                            item.refunded ? "line-through" : ""
                          }`}
                        >
                          {(item.price * item.quantity).toLocaleString("fr-FR")}{" "}
                          DA
                        </span>
                        {item.refunded && (
                          <span className="ml-2 text-xs text-red-600 bg-red-100 px-1.5 py-0.5 rounded-full">
                            Remboursé
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* QR Code de remboursement - uniquement pour les paiements */}
            {transaction.type === "payment" && (
              <div className="px-4 sm:px-6 py-4 text-center border-b border-gray-200/50">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  🔄 Besoin d'un remboursement ?
                </h3>
                <p className="text-xs text-gray-500 mb-3">
                  Présentez ce QR code au commerçant.
                </p>
                <div className="p-3 border-2 border-gray-200 rounded-xl shadow-sm inline-block bg-white">
                  <QRCodeCanvas value={refundQrValue} size={140} />
                </div>
              </div>
            )}
          </div>

          <div className="px-4 sm:px-6 py-4 border-t border-gray-200/50">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold text-sm hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center disabled:opacity-50"
            >
              {isDownloading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin mr-2"></div>
                  <span>Génération...</span>
                </>
              ) : (
                <>
                  <span className="mr-2">📄</span>
                  <span>Télécharger la facture détaillée</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
