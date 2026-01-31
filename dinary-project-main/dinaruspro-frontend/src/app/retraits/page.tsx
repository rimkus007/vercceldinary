// app/retraits/page.tsx (Pour l'application Vendeur)
"use client";

import React, { useState } from "react";
import PageHeader from "@/components/layouts/PageHeader"; // Assurez-vous que ce chemin est correct pour l'app vendeur
import { useAuth } from "@/context/AuthContext"; // Assurez-vous que ce chemin est correct pour l'app vendeur
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle } from "lucide-react";
import { CommissionDisplay } from "@/components/CommissionDisplay";

export default function RetraitsPage() {
  const [amount, setAmount] = useState("");
  const [rib, setRib] = useState("");
  const [fullName, setFullName] = useState("");
  const [bankName, setBankName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [commission, setCommission] = useState(0);
  const [totalWithdrawal, setTotalWithdrawal] = useState(0);
  const { token, wallet } = useAuth();
  const router = useRouter();

  const handleCommissionCalculated = (comm: number, total: number) => {
    setCommission(comm);
    setTotalWithdrawal(total);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0 || !rib || !fullName || !bankName) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    if (wallet && parseFloat(amount) > wallet.balance) {
      setError("Le montant du retrait ne peut pas dépasser votre solde.");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/wallet/request-withdrawal`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            amount: parseFloat(amount),
            bankDetails: {
              rib,
              fullName,
              bankName,
              accountNumber: rib,
              accountHolder: fullName,
            },
          }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "La demande a échoué.");
      }
      setSuccess(data.message);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white min-h-screen p-5 text-center flex flex-col justify-center">
        <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
        <h1 className="text-xl font-bold">Demande Envoyée</h1>
        <p className="text-gray-600 mt-2 mb-6">{success}</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="w-full py-3 bg-black text-white rounded-xl"
        >
          Retour à l'accueil
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen mb-16">
      <PageHeader title="Demander un retrait" emoji="💰" hasBackButton />
      <div className="p-5">
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl mb-6">
          <h3 className="font-bold text-blue-800 mb-1">Comment ça marche ?</h3>
          <p className="text-sm text-blue-700">
            Votre demande sera examinée par notre équipe. Une fois approuvée,
            les fonds seront transférés sur votre compte bancaire dans un délai
            de 24 à 48 heures ouvrées.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Montant à retirer (DZD)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full p-3 border border-gray-300 rounded-lg"
              required
            />
            {wallet && (
              <p className="text-xs text-gray-500 mt-1">
                Solde disponible: {wallet.balance.toFixed(2)} DZD
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom complet du titulaire du compte
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Prénom NOM"
              className="w-full p-3 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom de la banque
            </label>
            <input
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="Ex. Banque Nationale d'Algérie"
              className="w-full p-3 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Numéro d'Identité Bancaire (RIB)
            </label>
            <input
              type="text"
              value={rib}
              onChange={(e) => setRib(e.target.value)}
              placeholder="Votre numéro de RIB"
              className="w-full p-3 border border-gray-300 rounded-lg"
              required
            />
          </div>

          {/* Affichage de la commission */}
          {amount && parseFloat(amount) > 0 && (
            <CommissionDisplay
              action="merchant_withdrawal"
              amount={parseFloat(amount)}
              onCommissionCalculated={handleCommissionCalculated}
            />
          )}

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-black text-white rounded-xl font-medium flex items-center justify-center disabled:opacity-50"
          >
            {isLoading && <Loader2 className="animate-spin mr-2" />}
            {isLoading 
              ? "Envoi..." 
              : totalWithdrawal > 0 
                ? `Demander (${totalWithdrawal.toLocaleString('fr-DZ')} DZD seront déduits)`
                : "Envoyer la demande"
            }
          </button>
        </form>
      </div>
    </div>
  );
}
