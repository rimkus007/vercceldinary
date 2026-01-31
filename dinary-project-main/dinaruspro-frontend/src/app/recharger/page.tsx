"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "@/components/layouts/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { CommissionDisplay } from "@/components/CommissionDisplay";

type RechargeStep = "montant" | "paiement" | "confirmation";
interface WalletData {
  balance: number;
}

export default function RechargerPage() {
  const [currentStep, setCurrentStep] = useState<RechargeStep>("montant");
  const [montant, setMontant] = useState<string>("");
  const [reference, setReference] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [rechargeSuccess, setRechargeSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const { token, user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  // États pour la commission
  const [commission, setCommission] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [rechargeMethod, setRechargeMethod] = useState<string>("virement"); // "virement" ou "merchant"

  const handleCommissionCalculated = (comm: number, total: number) => {
    setCommission(comm);
    setTotalAmount(total);
  };

  useEffect(() => {
    if (!authLoading && user && user.verificationStatus !== "VERIFIED") {
      router.replace("/verification");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!token) return;
    const fetchWallet = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/wallet/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.ok) setWallet(await res.json());
      } catch (e) {
        void 0;
      }
    };
    fetchWallet();
  }, [token]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Vérification...</p>
      </div>
    );
  }

  const formatMontant = (m: string | number) => {
    const num = typeof m === "string" ? parseFloat(m) : m;
    return num.toLocaleString("fr-FR");
  };

  const handleNextStep = () => {
    if (currentStep === "montant" && parseFloat(montant) >= 500) {
      setCurrentStep("paiement");
      setError(null);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep === "paiement") setCurrentStep("montant");
  };

  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (!token) {
      setError("Session expirée.");
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/wallet/recharge`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ amount: parseFloat(montant), reference }),
        }
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "La demande de recharge a échoué.");
      setRechargeSuccess(true);
      setCurrentStep("confirmation");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen pb-20">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 -mb-10 pb-16 pt-6 px-4 rounded-b-3xl shadow-xl">
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all mb-4"
        >
          <span className="text-white text-xl font-bold">←</span>
        </Link>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">
            💰 Recharge Pro
          </h1>
          <p className="text-white/90 text-sm">Alimentez votre compte professionnel</p>
        </div>
      </div>

      <div className="px-4 mt-4">
        <div className="bg-gradient-to-br from-white to-purple-50 p-5 rounded-3xl shadow-2xl border-2 border-purple-200">
          <p className="text-xs text-purple-600 uppercase font-semibold tracking-wide mb-1">Solde professionnel</p>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            {wallet ? `${formatMontant(wallet.balance)} DA` : "..."}
          </h1>
        </div>

        {/* Indicateur d'étapes */}
        <div className="my-6 bg-white rounded-2xl p-4 shadow-md border border-gray-200">
          <div className="flex justify-between text-xs font-semibold mb-2">
            <span className={`${currentStep === "montant" ? "text-purple-600" : "text-gray-400"} transition-colors`}>
              💰 Montant
            </span>
            <span className={`${currentStep === "paiement" ? "text-purple-600" : "text-gray-400"} transition-colors`}>
              💳 Paiement
            </span>
            <span className={`${currentStep === "confirmation" ? "text-purple-600" : "text-gray-400"} transition-colors`}>
              ✅ Confirmation
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-600 to-blue-600"
              initial={{ width: "33%" }}
              animate={{
                width:
                  currentStep === "montant"
                    ? "33%"
                    : currentStep === "paiement"
                    ? "66%"
                    : "100%",
              }}
              transition={{ duration: 0.3 }}
            ></motion.div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {currentStep === "montant" && (
            <motion.div
              key="montant-step"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-6 shadow-2xl border border-gray-200"
            >
              <label className="block text-sm font-bold mb-3 text-gray-800 flex items-center gap-2">
                <span className="text-2xl">💵</span>
                Montant à recharger
              </label>
              <input
                type="number"
                placeholder="0"
                className="w-full p-5 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl text-4xl font-bold text-center text-purple-600 border-2 border-purple-300 focus:border-purple-500 focus:outline-none transition-all"
                value={montant}
                onChange={(e) => setMontant(e.target.value)}
              />
              <p className="text-sm text-gray-500 mt-3 text-center font-medium">💡 Minimum: 500 DA</p>
              
              {/* Affichage de la commission pour la recharge */}
              {parseFloat(montant) >= 500 && (
                <div className="mt-4">
                  <CommissionDisplay
                    action="merchant_recharge_virement"
                    amount={parseFloat(montant)}
                    onCommissionCalculated={handleCommissionCalculated}
                  />
                </div>
              )}
              
              <button
                className="w-full mt-6 py-4 rounded-2xl font-bold text-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-xl hover:shadow-2xl disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                disabled={parseFloat(montant) < 500}
                onClick={handleNextStep}
              >
                {totalAmount > 0 && totalAmount !== parseFloat(montant)
                  ? `→ Continuer (Total: ${totalAmount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DA)`
                  : "→ Continuer"}
              </button>
            </motion.div>
          )}

          {currentStep === "paiement" && (
            <motion.div
              key="paiement-step"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-6 shadow-2xl border border-gray-200"
            >
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-5 rounded-2xl mb-6 border-2 border-purple-200">
                <h3 className="font-bold mb-4 flex items-center gap-2 text-purple-800">
                  <span className="text-2xl">📊</span>
                  Récapitulatif
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Montant à recharger :</span>
                    <span className="font-bold text-gray-900">{formatMontant(montant)} DA</span>
                  </div>
                  {commission > 0 && (
                    <div className="flex justify-between text-purple-600 bg-purple-100 -mx-2 px-2 py-2 rounded-lg">
                      <span className="font-medium">Commission :</span>
                      <span className="font-bold">+{formatMontant(commission)} DA</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-3 border-t-2 border-purple-300 font-bold text-lg">
                    <span className="text-gray-800">Total à virer :</span>
                    <span className="text-purple-600">{formatMontant(totalAmount > 0 ? totalAmount : montant)} DA</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 p-5 rounded-2xl mb-6 border-2 border-blue-200">
                <h3 className="font-bold mb-4 flex items-center gap-2 text-blue-800">
                  <span className="text-2xl">📝</span>
                  Comment procéder
                </h3>
                <ol className="list-decimal list-inside space-y-3 text-sm text-gray-700">
                  <li className="font-medium">
                    Effectuez un virement de{" "}
                    <span className="font-bold text-purple-600 bg-white px-2 py-0.5 rounded">
                      {formatMontant(totalAmount > 0 ? totalAmount : montant)} DA
                    </span>{" "}
                    sur notre RIB
                  </li>
                  <li className="font-medium">
                    Utilisez votre identifiant{" "}
                    <span className="font-mono bg-white px-2 py-1 rounded border border-blue-300 text-blue-700">
                      {user?.username}
                    </span>{" "}
                    comme motif
                  </li>
                  <li className="font-medium">
                    Entrez la référence de transaction ci-dessous
                  </li>
                </ol>
              </div>

              <form onSubmit={handleConfirmPayment} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-800 flex items-center gap-2">
                    <span className="text-xl">🔢</span>
                    Référence de transaction
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: REF123456789"
                    className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-gray-300 focus:border-purple-500 focus:outline-none transition-all font-medium"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    required
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-center text-sm font-medium">
                    {error}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handlePreviousStep}
                    className="flex-1 py-4 bg-gray-200 rounded-2xl font-semibold text-gray-700 hover:bg-gray-300 transition-all"
                  >
                    ← Retour
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !reference}
                    className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    {loading ? "⏳ Vérification..." : "✓ Confirmer"}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {currentStep === "confirmation" && (
            <motion.div
              key="confirmation-step"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center bg-gradient-to-br from-white to-green-50 rounded-3xl p-8 shadow-2xl border-4 border-green-500"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-24 h-24 mx-auto bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mb-5 shadow-lg"
              >
                <span className="text-5xl">✅</span>
              </motion.div>
              <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Demande en cours de traitement
              </h2>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 mb-6 border-2 border-green-200">
                <p className="text-gray-700 font-medium mb-2">
                  Votre demande de recharge de
                </p>
                <p className="text-4xl font-bold text-green-600 mb-2">{formatMontant(montant)} DA</p>
                <p className="text-sm text-gray-600">
                  a été enregistrée et sera traitée rapidement
                </p>
              </div>
              <Link
                href="/dashboard"
                className="block w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all"
              >
                🏠 Retour à l'accueil
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
