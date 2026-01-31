"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "@/components/layouts/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { v4 as uuidv4 } from "uuid"; // Import pour générer un ID unique
import { CommissionDisplay } from "@/components/CommissionDisplay";

type RechargeStep =
  | "choix"
  | "montant"
  | "paiement"
  | "confirmation"
  | "qr_code";
interface WalletData {
  balance: number;
  currency: string;
}

// Composant pour les menus dépliants de la FAQ
const FaqItem = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
    <details className="group">
      <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
        <span>{title}</span>
        <span className="transition group-open:rotate-180">▼</span>
      </summary>
      <div className="text-gray-600 mt-3 group-open:animate-fadeIn text-sm">
        {children}
      </div>
    </details>
  </div>
);

export default function RechargerPage() {
  const [currentStep, setCurrentStep] = useState<RechargeStep>("choix");
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
  const [rechargeMethod, setRechargeMethod] = useState<"virement" | "commercant" | null>(null);

  // --- NOUVEAUX ÉTATS POUR L'EXPÉRIENCE UTILISATEUR ---
  const [rechargeRequestId, setRechargeRequestId] = useState<string | null>(
    null
  );
  const [isWaitingForPayment, setIsWaitingForPayment] = useState(false);
  const [rechargeSuccessData, setRechargeSuccessData] = useState<{
    merchantName: string;
  } | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!authLoading && user && user.verificationStatus !== "VERIFIED") {
      router.replace("/profile/verification");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("http://localhost:3001/api/wallet/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data: WalletData = await res.json();
        if (!cancelled) setWallet(data);
      } catch (e) {
        void 0;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  // --- NOUVELLE LOGIQUE : Attente de la confirmation de recharge ---
  useEffect(() => {
    if (isWaitingForPayment && rechargeRequestId) {
      pollingRef.current = setInterval(async () => {
        try {
          const res = await fetch(
            `http://localhost:3001/api/wallet/recharge-status/${rechargeRequestId}`
          );
          if (res.ok) {
            const data = await res.json();
            if (data.status === "completed") {
              clearInterval(pollingRef.current!);
              setIsWaitingForPayment(false);
              setRechargeSuccessData({
                merchantName: data.merchantName || "un commerçant",
              });
            }
          }
        } catch (error) {
          void 0;
        }
      }, 3000); // Vérifie toutes les 3 secondes
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [isWaitingForPayment, rechargeRequestId]);

  // Récupérer la méthode de recharge depuis sessionStorage au montage
  useEffect(() => {
    const savedMethod = sessionStorage.getItem("rechargeMethod") as "virement" | "commercant" | null;
    if (savedMethod) {
      setRechargeMethod(savedMethod);
    }
  }, []);

  // --- FONCTION UTILITAIRE ---
  const formatMontant = (m: string | number) => {
    if (!m) return "0";
    const num = typeof m === "string" ? parseFloat(m) : m;
    return num.toLocaleString("fr-FR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  // --- TOUS LES RETURNS CONDITIONNELS EN PREMIER ---
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Vérification de votre session...</p>
      </div>
    );
  }
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Veuillez vous connecter.</p>
      </div>
    );
  }
  if (user.verificationStatus !== "VERIFIED") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Redirection vers la vérification...</p>
      </div>
    );
  }

  // --- AFFICHAGE DU POP-UP DE SUCCÈS ---
  if (rechargeSuccessData) {
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl p-6 w-full max-w-sm text-center shadow-xl"
        >
          <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl">✅</span>
          </div>
          <h2 className="text-xl font-bold">Recharge réussie !</h2>
          <p className="text-gray-600 mt-2">
            Félicitations, <strong>{rechargeSuccessData.merchantName}</strong> a
            bien rechargé votre compte de{" "}
            <strong>{formatMontant(montant)} DA</strong>.
          </p>
          <Link
            href="/dashboard"
            className="block w-full mt-6 py-3 bg-gray-800 text-white rounded-xl font-semibold"
          >
            Terminé
          </Link>
        </motion.div>
      </div>
    );
  }

  // --- FONCTIONS ET CONSTANTES ---
  const montantsPredefinits = ["500", "1000", "2000", "5000"];

  const handleNextStep = () => {
    if (currentStep === "montant" && parseFloat(montant) >= 100) {
      if (sessionStorage.getItem("rechargeMethod") === "commercant") {
        const newId = uuidv4(); // Génère un ID unique pour la requête
        setRechargeRequestId(newId);
        setIsWaitingForPayment(true); // Active le mode "attente"
        setCurrentStep("qr_code");
      } else {
        setCurrentStep("paiement");
      }
      setError(null);
    }
  };

  const handlePreviousStep = () => {
    // Si on annule le QR code, on arrête l'attente
    if (currentStep === "qr_code") {
      setIsWaitingForPayment(false);
      if (pollingRef.current) clearInterval(pollingRef.current);
    }
    if (currentStep === "paiement" || currentStep === "qr_code")
      setCurrentStep("montant");
    else if (currentStep === "montant") setCurrentStep("choix");
  };

  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (!token) {
      setError("Session expirée. Veuillez vous reconnecter.");
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(
        "http://localhost:3001/api/wallet/recharge",
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
      setLoading(false);
    }
  };

  const handleMethodChoice = (method: "virement" | "commercant") => {
    sessionStorage.setItem("rechargeMethod", method);
    setRechargeMethod(method);
    setCurrentStep("montant");
  };

  const handleCommissionCalculated = (comm: number, total: number) => {
    setCommission(comm);
    setTotalAmount(total);
  };

  return (
    <div className="bg-white min-h-screen mb-16">
      <PageHeader title="Recharger" emoji="💰" hasBackButton={true} />

      <div className="px-4">
        <div className="my-3 bg-gradient-to-r from-gray-700 to-gray-800 text-white p-4 rounded-2xl shadow-md">
          <p className="text-xs opacity-80">Solde actuel</p>
          <h1 className="text-2xl font-bold mt-1 mb-1">
            {wallet
              ? `${formatMontant(wallet.balance)} ${wallet.currency}`
              : "Chargement..."}
          </h1>
        </div>

        <AnimatePresence mode="wait">
          {currentStep === "choix" && (
            <motion.div
              key="choix-step"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4 my-8"
            >
              <h2 className="text-lg font-semibold text-center mb-4">
                Choisissez une méthode de recharge
              </h2>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => handleMethodChoice("virement")}
                className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center"
              >
                <div className="relative w-10 h-10 mr-4">
                  <Image
                    src="/icons/nouvelle-banque.svg"
                    alt="Nouvelle Banque"
                    layout="fill"
                    className="object-contain"
                  />
                </div>
                <div>
                  <p className="text-md font-medium text-left">
                    Virement Bancaire
                  </p>
                  <p className="text-xs text-gray-600 text-left">
                    Via BaridiMob ou autre application bancaire.
                  </p>
                </div>
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => handleMethodChoice("commercant")}
                className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center"
              >
                <span className="text-3xl mr-4">🏪</span>
                <div>
                  <p className="text-md font-medium text-left">
                    Chez un commerçant
                  </p>
                  <p className="text-xs text-gray-600 text-left">
                    Faites scanner un QR code par un marchand partenaire.
                  </p>
                </div>
              </motion.button>
            </motion.div>
          )}

          {currentStep === "montant" && (
            <motion.div
              key="montant-step"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium mb-2">
                  Montant à recharger
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    className="w-full p-4 bg-gray-50 rounded-xl text-2xl font-semibold focus:outline-none focus:ring-2 focus:ring-gray-500 text-center"
                    value={montant}
                    onChange={(e) =>
                      setMontant(e.target.value.replace(/[^0-9]/g, ""))
                    }
                  />
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                    DA
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  {montantsPredefinits.map((preset) => (
                    <button
                      key={preset}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      onClick={() => setMontant(preset)}
                    >
                      {formatMontant(preset)} DA
                    </button>
                  ))}
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  Min: 100 DA 
                </p>
              </div>

              {/* Affichage de la commission selon la méthode de recharge */}
              {montant && parseFloat(montant) > 0 && rechargeMethod && (
                <CommissionDisplay
                  action={
                    rechargeMethod === "virement"
                      ? "recharge_virement"
                      : "recharge_merchant"
                  }
                  amount={parseFloat(montant)}
                  onCommissionCalculated={handleCommissionCalculated}
                />
              )}

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handlePreviousStep}
                  className="flex-1 py-3 bg-gray-100 rounded-xl font-medium"
                  disabled={loading}
                >
                  Retour
                </button>
                <button
                  className={`flex-1 py-4 rounded-xl font-medium ${
                    parseFloat(montant) >= 100
                      ? "bg-gray-800 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                  disabled={parseFloat(montant) < 100}
                  onClick={handleNextStep}
                >
                  {commission > 0
                    ? `Continuer (Total: ${formatMontant((parseFloat(montant) + commission).toString())} DA)`
                    : "Continuer"}
                </button>
              </div>
            </motion.div>
          )}

          {currentStep === "paiement" && (
            <motion.div
              key="paiement-step"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700">Montant:</span>
                  <span className="font-semibold">
                    {formatMontant(montant)} DA
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Méthode:</span>
                  <span className="font-medium">Nouvelle Banque</span>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl">
                <h3 className="font-medium mb-3">Comment procéder</h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-gray-200 text-gray-700 rounded-full flex items-center justify-center text-xs mr-3 flex-shrink-0">
                      1
                    </div>
                    <p className="text-sm">
                      Effectuez un virement de{" "}
                      <span className="font-medium">
                        {formatMontant(montant)} DA
                      </span>{" "}
                      sur notre RIB.
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-gray-200 text-gray-700 rounded-full flex items-center justify-center text-xs mr-3 flex-shrink-0">
                      2
                    </div>
                    <p className="text-sm">
                      Dans le détail de votre virement, utilisez votre nom
                      d'utilisateur Dinary ({user?.username}) comme motif.
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-gray-200 text-gray-700 rounded-full flex items-center justify-center text-xs mr-3 flex-shrink-0">
                      3
                    </div>
                    <p className="text-sm">
                      Entrez la référence de la transaction ci-dessous, puis
                      cliquez sur confirmer.
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleConfirmPayment}>
                <label className="block text-sm font-medium mb-2">
                  Référence de transaction
                </label>
                <input
                  type="text"
                  placeholder="Ex: REF123456789"
                  className="w-full p-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 mb-4"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  required
                />

                {error && (
                  <p className="text-red-500 text-center text-sm mb-4">
                    {error}
                  </p>
                )}

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={handlePreviousStep}
                    className="flex-1 py-3 bg-gray-100 rounded-xl font-medium"
                    disabled={loading}
                  >
                    Retour
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !reference}
                    className="flex-1 py-3 bg-gray-800 text-white rounded-xl font-medium"
                  >
                    {loading ? "Vérification..." : "Confirmer"}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {currentStep === "qr_code" && (
            <motion.div
              key="qr_code-step"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5 text-center pt-5"
            >
              <h2 className="text-lg font-semibold">
                Présentez ce code au commerçant
              </h2>
              <div className="bg-white p-4 rounded-lg border border-gray-200 inline-block shadow-lg">
                <QRCodeSVG
                  value={JSON.stringify({
                    userId: user.id,
                    amount: parseFloat(montant),
                    rechargeRequestId,
                  })}
                  size={240}
                  bgColor={"#ffffff"}
                  fgColor={"#000000"}
                  level={"H"}
                  includeMargin={true}
                />
              </div>

              <div className="flex items-center justify-center gap-3 text-gray-600 bg-gray-50 p-3 rounded-xl">
                <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                <span>
                  En attente de la recharge de{" "}
                  <strong>{formatMontant(montant)} DA</strong>...
                </span>
              </div>

              <button
                type="button"
                onClick={handlePreviousStep}
                className="w-full py-3 bg-gray-100 rounded-xl font-medium mt-4"
              >
                Annuler
              </button>
            </motion.div>
          )}

          {currentStep === "confirmation" && (
            <motion.div
              key="confirmation-step"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 text-center"
            >
              {/* ... (votre JSX de confirmation pour le virement) ... */}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* --- SECTION FAQ --- */}
      <div className="px-4 mt-12 pb-6">
        <h2 className="text-xl font-semibold mb-4 text-center">
          Besoin d'aide ?
        </h2>
        <div className="space-y-3">
          <FaqItem title="Comment fonctionne la recharge par commerçant ?">
            <p>
              1. Choisissez "Chez un commerçant" et entrez le montant désiré.
              <br />
              2. Présentez le QR code généré au marchand partenaire.
              <br />
              3. Le marchand scanne votre code et valide la recharge. Votre
              compte est instantanément crédité !
            </p>
          </FaqItem>
          <FaqItem title="Y a-t-il des frais ?">
            <p>
              Des frais de transaction peuvent s'appliquer selon le mode de recharge choisi.
              Le montant exact des frais est affiché avant de confirmer votre recharge.
              Les frais bancaires de votre établissement pour le virement initial peuvent également s'appliquer.
            </p>
          </FaqItem>
          <FaqItem title="Que faire si la recharge échoue ?">
            <p>
              Si le marchand rencontre un problème, un message d'erreur
              s'affichera sur son terminal. Vous pouvez simplement annuler et
              générer un nouveau QR code pour réessayer.
            </p>
          </FaqItem>
        </div>
      </div>
    </div>
  );
}
