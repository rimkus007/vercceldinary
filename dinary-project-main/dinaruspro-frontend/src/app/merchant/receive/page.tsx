// src/app/merchant/receive/page.tsx
"use client";

import React, { useState } from "react";
import { QrCode } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { QRCodeCanvas } from "qrcode.react";
import PageHeader from "@/components/layouts/PageHeader";

export default function ReceivePaymentPage() {
  const [amount, setAmount] = useState("");
  const [qrValue, setQrValue] = useState<string | null>(null);
  const { user } = useAuth();

  const handleGenerateQr = () => {
    if (!amount || parseFloat(amount) <= 0 || !user) {
      alert("Veuillez entrer un montant valide.");
      return;
    }
    const paymentData = {
      merchantUserId: user.id,
      amount: parseFloat(amount),
    };
    setQrValue(JSON.stringify(paymentData));
  };

  return (
    <div className="bg-white min-h-screen">
      <PageHeader title="Recevoir un paiement" />
      <div className="p-5 flex flex-col items-center">
        {!qrValue ? (
          <>
            <h2 className="text-lg font-semibold text-center mb-4">
              Entrez le montant à recevoir
            </h2>
            <div className="relative w-full max-w-xs mb-6">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full text-4xl font-bold text-center border-b-2 border-gray-300 focus:border-black outline-none p-2"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-2xl text-gray-500">
                DZD
              </span>
            </div>
            <button
              onClick={handleGenerateQr}
              className="w-full max-w-xs bg-black text-white py-3 rounded-xl font-semibold flex items-center justify-center"
            >
              <QrCode className="mr-2" />
              Générer le QR Code
            </button>
          </>
        ) : (
          <>
            <h2 className="text-lg font-semibold text-center mb-2">
              Montant : {parseFloat(amount).toFixed(2)} DZD
            </h2>
            <p className="text-gray-600 mb-4">
              Présentez ce code au client pour le paiement.
            </p>
            <div className="p-4 border rounded-xl shadow-lg">
              <QRCodeCanvas value={qrValue} size={256} />
            </div>
            <button
              onClick={() => setQrValue(null)}
              className="mt-6 text-black font-semibold"
            >
              Générer un autre montant
            </button>
          </>
        )}
      </div>
    </div>
  );
}
