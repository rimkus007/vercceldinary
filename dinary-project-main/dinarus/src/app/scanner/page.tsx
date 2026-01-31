// src/app/scanner/page.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PageHeader from "@/components/layouts/PageHeader";
import { motion } from "framer-motion";
import { RefreshCw, CheckCircle } from "lucide-react";
import { CommissionDisplay } from "@/components/CommissionDisplay";
import { fetchCommissionRules, getCommissionDetails } from "@/lib/commissions";

// --- Composants de Confirmation et de Succès (inchangés) ---
const PaymentConfirmation = ({
  paymentData,
  onConfirm,
  onCancel,
  merchantName,
  commission,
  totalAmount,
}: {
  paymentData: any;
  onConfirm: () => void;
  onCancel: () => void;
  merchantName: string;
  commission: number;
  totalAmount: number;
}) => (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
    <motion.div
      initial={{ y: 50, opacity: 0, scale: 0.95 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 w-full max-w-sm shadow-2xl border-4 border-blue-500"
    >
      <div className="text-center mb-6">
        <div className="text-6xl mb-3">💳</div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Confirmer le paiement
        </h2>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-5 mb-6 border-2 border-blue-200">
        <p className="text-xs text-gray-600 font-medium mb-2">Vous payez</p>
        <p className="text-xl font-bold text-gray-900 mb-1">{merchantName}</p>
      </div>

      {/* Affichage du détail avec commission */}
      <div className="bg-white rounded-2xl p-5 mb-6 shadow-md border-2 border-gray-200 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 font-medium">Montant :</span>
          <span className="font-bold text-gray-900">
            {paymentData.amount.toLocaleString("fr-FR", {
              minimumFractionDigits: 2,
            })}{" "}
            DA
          </span>
        </div>
        {commission > 0 && (
          <div className="flex justify-between text-sm bg-blue-50 -mx-2 px-2 py-2 rounded-lg">
            <span className="text-blue-700 font-medium">Commission :</span>
            <span className="font-bold text-blue-600">
              +{commission.toLocaleString("fr-FR", {
                minimumFractionDigits: 2,
              })}{" "}
              DA
            </span>
          </div>
        )}
        <div className="flex justify-between pt-3 border-t-2 border-gray-300">
          <span className="font-bold text-gray-800">Total à payer :</span>
          <span className="font-bold text-2xl text-blue-600">
            {(totalAmount || paymentData.amount).toLocaleString("fr-FR", {
              minimumFractionDigits: 2,
            })}{" "}
            DA
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={onConfirm}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all"
        >
          ✓ Confirmer et Payer
        </button>
        <button
          onClick={onCancel}
          className="bg-gray-200 text-gray-700 py-4 rounded-2xl font-semibold hover:bg-gray-300 transition-colors"
        >
          ✕ Annuler
        </button>
      </div>
    </motion.div>
  </div>
);

const PaymentSuccess = ({ amount, merchantName, onDone }: { amount: number; merchantName: string; onDone: () => void }) => (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
    <motion.div
      initial={{ scale: 0.8, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ type: "spring", duration: 0.5 }}
      className="bg-gradient-to-br from-white to-green-50 rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl border-4 border-green-500"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg"
      >
        <CheckCircle className="w-14 h-14 text-white" />
      </motion.div>
      <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
        Paiement réussi !
      </h2>
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 mb-6 border-2 border-green-200">
        <p className="text-sm text-gray-600 font-medium mb-2">
          Vous avez payé
        </p>
        <p className="text-4xl font-bold text-green-600 mb-3">
          {amount.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} DA
        </p>
        <div className="flex items-center justify-center gap-2 text-gray-700">
          <span>à</span>
          <span className="font-bold bg-white px-3 py-1 rounded-full border border-green-300">
            {merchantName}
          </span>
        </div>
      </div>
      <button
        onClick={onDone}
        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all"
      >
        ✓ Terminé
      </button>
    </motion.div>
  </div>
);

// --- Page Principale du Scanner ---
export default function ScannerPage() {
  const [paymentData, setPaymentData] = useState<any | null>(null);
  const [merchantName, setMerchantName] = useState("");
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const { token } = useAuth();
  const router = useRouter();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  // Référence supprimée pour la sélection de fichier : le scan se fait uniquement via la caméra
  const [cameras, setCameras] = useState<any[]>([]);
  const [activeCameraId, setActiveCameraId] = useState<string | null>(null);
  
  // États pour la commission
  const [commission, setCommission] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);

  // Calcul de la commission quand paymentData change
  useEffect(() => {
    async function calculateCommission() {
      if (!paymentData || !token) return;
      
      try {
        await fetchCommissionRules(token, 'USER');
        const details = getCommissionDetails('merchant_payment_client', paymentData.amount);
        setCommission(details.commission);
        setTotalAmount(details.total);
      } catch (error) {
        void 0;
        setCommission(0);
        setTotalAmount(paymentData.amount);
      }
    }
    
    calculateCommission();
  }, [paymentData, token]);

  const onScanSuccess = useCallback(
    async (decodedText: string) => {
      if (scannerRef.current?.isScanning) {
        await scannerRef.current.stop();
      }
      try {
        const data = JSON.parse(decodedText);
        if (data.merchantUserId && data.amount) {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/users/${data.merchantUserId}/public`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (!res.ok) throw new Error("Commerçant non trouvé.");
          const merchantInfo = await res.json();
          setMerchantName(merchantInfo.fullName || merchantInfo.username);
          setPaymentData(data);
        } else {
          throw new Error("QR Code non reconnu par Dinary.");
        }
      } catch (e: any) {
        setError(e.message || "QR Code invalide.");
        setTimeout(() => setError(""), 3000);
      }
    },
    [token]
  );

  const startScanner = useCallback(
    async (deviceId: string) => {
      if (!scannerRef.current) return;
      
      // Si le scanner est déjà en cours, on l'arrête d'abord
      if (scannerRef.current.isScanning) {
        try {
          await scannerRef.current.stop();
        } catch (err) {
          // Ignore l'erreur si le scanner n'était pas vraiment en cours
        }
      }
      
      setError("");

      const config = { fps: 10, qrbox: { width: 250, height: 250 } };

      try {
        await scannerRef.current.start(
          { deviceId: { exact: deviceId } },
          config,
          onScanSuccess,
          (err) => {}
        );
      } catch (err) {
        setError("Impossible de démarrer la caméra.");
      }
    },
    [onScanSuccess]
  );

  useEffect(() => {
    let mounted = true;
    
    const initScanner = async () => {
      try {
        scannerRef.current = new Html5Qrcode("qr-reader", false);
        
        const devices = await Html5Qrcode.getCameras();
        if (!mounted) return;
        
        if (devices && devices.length) {
          setCameras(devices);
          const rearCamera =
            devices.find((d) => d.label.toLowerCase().includes("back")) ||
            devices[0];
          setActiveCameraId(rearCamera.id);
        } else {
          setError("Aucune caméra n'a été trouvée.");
        }
      } catch (err) {
        if (mounted) {
          setError("Erreur d'accès aux caméras.");
        }
      }
    };

    initScanner();

    return () => {
      mounted = false;
      if (scannerRef.current) {
        const scanner = scannerRef.current;
        if (scanner.isScanning) {
          scanner.stop().then(() => {
            scanner.clear();
          }).catch(() => {});
        } else {
          scanner.clear();
        }
        scannerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (activeCameraId && !paymentData && !isSuccess) {
      startScanner(activeCameraId);
    }
  }, [activeCameraId, paymentData, isSuccess, startScanner]);

  const handleCameraToggle = async () => {
    if (cameras.length > 1 && scannerRef.current && activeCameraId) {
      const currentIndex = cameras.findIndex((c) => c.id === activeCameraId);
      const nextIndex = (currentIndex + 1) % cameras.length;

      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        setActiveCameraId(cameras[nextIndex].id);
      } catch (err) {
        setError("Erreur lors du changement de caméra.");
        setTimeout(() => setError(""), 3000);
      }
    }
  };

  // La fonction handleFileChange et l'upload ont été retirés pour ne permettre que l'utilisation de la caméra

  const handleConfirmPayment = async () => {
    if (!paymentData || !token) return;
    try {
      // Préparer les données de paiement en s'assurant qu'elles correspondent au DTO
      const paymentPayload: any = {
        merchantUserId: paymentData.merchantUserId,
        amount: parseFloat(paymentData.amount),
        paymentRequestId: paymentData.paymentRequestId,
      };

      // Ajouter le panier seulement s'il existe et n'est pas vide
      if (paymentData.cart && Array.isArray(paymentData.cart) && paymentData.cart.length > 0) {
        paymentPayload.cart = paymentData.cart;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/wallet/pay-qr`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(paymentPayload),
        }
      );
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error('Erreur de paiement:', errorData);
        throw new Error(errorData.message || "Le paiement a échoué.");
      }

      // On met à jour l'état pour afficher l'écran de succès
      setIsSuccess(true);
    } catch (e: any) {
      setError(e.message);
      setPaymentData(null); // On remet le scanner en marche en cas d'erreur
    }
  };

  if (isSuccess) {
    return (
      <PaymentSuccess
        amount={paymentData.amount}
        merchantName={merchantName}
        onDone={() => router.push("/dashboard")}
      />
    );
  }
  if (paymentData) {
    return (
      <PaymentConfirmation
        paymentData={paymentData}
        merchantName={merchantName}
        commission={commission}
        totalAmount={totalAmount}
        onConfirm={handleConfirmPayment}
        onCancel={() => {
          setPaymentData(null);
          setError("");
          setCommission(0);
          setTotalAmount(0);
        }}
      />
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen pb-20">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 -mb-10 pb-16 pt-6 px-4 rounded-b-3xl shadow-xl">
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all mb-4"
        >
          <span className="text-white text-xl font-bold">←</span>
        </Link>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">
            📱 Scanner QR Code
          </h1>
          <p className="text-white/90 text-sm">Payez rapidement chez les marchands</p>
        </div>
      </div>

      <div className="px-5 flex flex-col items-center mt-4">
        {/* Le carré de scan */}
        <div className="w-full max-w-sm aspect-square bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border-4 border-blue-500 relative">
          <div id="qr-reader" className="h-full w-full"></div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[70%] h-[70%] border-4 border-white/60 rounded-2xl shadow-lg" style={{animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"}}></div>
          </div>
        </div>
        
        {/* Styles pour masquer l'interface du scanner */}
        <style jsx global>{`
          #qr-reader {
            border: none !important;
          }
          #qr-reader > div:first-child {
            display: none !important;
          }
          #qr-reader video {
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
            border-radius: 0 !important;
          }
          #qr-reader__dashboard_section {
            display: none !important;
          }
          #qr-reader__dashboard_section_csr {
            display: none !important;
          }
          #qr-reader__dashboard_section_swaplink {
            display: none !important;
          }
          #qr-reader__scan_region {
            border: none !important;
          }
          #qr-shaded-region {
            border: none !important;
          }
        `}</style>

        <p className="text-center text-gray-600 mt-6 font-medium">
          Positionnez le QR code dans le cadre
        </p>

        {error && (
          <div className="mt-4 bg-red-100 border-2 border-red-300 text-red-700 px-4 py-3 rounded-2xl text-center text-sm font-medium w-full max-w-sm">
            {error}
          </div>
        )}

        {/* Les boutons de contrôle : uniquement le changement de caméra */}
        <div className="mt-6 w-full max-w-sm">
          <button
            onClick={handleCameraToggle}
            disabled={cameras.length <= 1}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-2xl shadow-xl hover:shadow-2xl disabled:opacity-40 disabled:cursor-not-allowed transition-all font-semibold"
          >
            <RefreshCw size={24} className={cameras.length > 1 ? "animate-spin-slow" : ""} />
            <span>Changer de caméra</span>
          </button>
        </div>
      </div>
    </div>
  );
}
