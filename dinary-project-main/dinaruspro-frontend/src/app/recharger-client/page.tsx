"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useAuth } from "@/context/AuthContext";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { RefreshCw } from "lucide-react";

interface ScannedData {
  userId: string;
  amount: number;
  rechargeRequestId: string; // On s'attend à recevoir cet ID
}

interface ClientInfo {
  username: string;
  fullName: string;
}

type RechargeStep =
  | "scanning"
  | "confirming"
  | "processing"
  | "success"
  | "error";

export default function RechargerClientPage() {
  const { token } = useAuth();
  const [step, setStep] = useState<RechargeStep>("scanning");
  const [scannedData, setScannedData] = useState<ScannedData | null>(null);
  const [clientInfo, setClientInfo] = useState<ClientInfo | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Nouveaux états pour la gestion de la caméra
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [activeCameraId, setActiveCameraId] = useState<string | null>(null);

  const onScanSuccess = useCallback(
    async (decodedText: string) => {
      if (scannerRef.current?.isScanning) {
        await scannerRef.current.stop();
      }
      try {
        const data: ScannedData = JSON.parse(decodedText);
        // On vérifie la présence du nouvel ID de requête
        if (
          !data.userId ||
          !data.amount ||
          data.amount <= 0 ||
          !data.rechargeRequestId
        ) {
          throw new Error("QR code invalide ou corrompu.");
        }
        setScannedData(data);
        setStep("processing");

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/users/${data.userId}/public`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error("Client introuvable.");

        setClientInfo(await res.json());
        setStep("confirming");
      } catch (error: any) {
        setErrorMessage(error.message || "Erreur de lecture du QR code.");
        setStep("error");
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

      const config = { fps: 10, qrbox: { width: 250, height: 250 } };
      try {
        await scannerRef.current.start(
          { deviceId: { exact: deviceId } },
          config,
          onScanSuccess,
          (err) => {} // Ignore les erreurs de "QR non trouvé"
        );
      } catch (err) {
        setErrorMessage("Impossible de démarrer la caméra.");
        setStep("error");
      }
    },
    [onScanSuccess]
  );

  useEffect(() => {
    let mounted = true;
    
    const initScanner = async () => {
      try {
        scannerRef.current = new Html5Qrcode("qr-reader-container", false);
        
        const devices = await Html5Qrcode.getCameras();
        if (!mounted) return;
        
        if (devices && devices.length) {
          setCameras(devices);
          const rearCamera =
            devices.find((d) => d.label.toLowerCase().includes("back")) ||
            devices[0];
          setActiveCameraId(rearCamera.id);
        }
      } catch (err) {
        if (mounted) {
          setErrorMessage("Impossible d'accéder aux caméras.");
          setStep("error");
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
    if (step === "scanning" && activeCameraId) {
      startScanner(activeCameraId);
    }
  }, [step, activeCameraId, startScanner]);

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
        setErrorMessage("Erreur lors du changement de caméra.");
        setTimeout(() => setErrorMessage(""), 3000);
      }
    }
  };

  // Le reste des fonctions (handleConfirmRecharge, resetFlow) reste inchangé
  const handleConfirmRecharge = async () => {
    if (!scannedData || !token) return;
    setStep("processing");
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/wallet/recharge-by-merchant`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId: scannedData.userId,
            amount: scannedData.amount,
            rechargeRequestId: scannedData.rechargeRequestId, // On envoie l'ID de la requête
          }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "La transaction a échoué.");
      }
      setStep("success");
    } catch (error: any) {
      setErrorMessage(error.message);
      setStep("error");
    }
  };

  const resetFlow = () => {
    setScannedData(null);
    setClientInfo(null);
    setErrorMessage("");
    setStep("scanning");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 -mb-10 pb-16 pt-6 px-4 rounded-b-3xl shadow-xl">
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all mb-4"
        >
          <span className="text-white text-xl font-bold">←</span>
        </Link>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">
            💳 Recharger un client
          </h1>
          <p className="text-white/90 text-sm">Scannez le QR code de recharge</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === "scanning" && (
          <motion.div
            key="scanning"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center px-5 mt-4"
          >
            <div className="w-full max-w-sm aspect-square bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border-4 border-blue-500 relative">
              <div id="qr-reader-container" className="w-full h-full"></div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[70%] h-[70%] border-4 border-white/60 rounded-2xl shadow-lg" style={{animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"}}></div>
              </div>
            </div>
            
            {/* Styles pour masquer l'interface du scanner */}
            <style jsx global>{`
              #qr-reader-container {
                border: none !important;
              }
              #qr-reader-container > div:first-child {
                display: none !important;
              }
              #qr-reader-container video {
                width: 100% !important;
                height: 100% !important;
                object-fit: cover !important;
                border-radius: 0 !important;
              }
              #qr-reader-container__dashboard_section {
                display: none !important;
              }
              #qr-reader-container__dashboard_section_csr {
                display: none !important;
              }
              #qr-reader-container__dashboard_section_swaplink {
                display: none !important;
              }
              #qr-reader-container__scan_region {
                border: none !important;
              }
              #qr-shaded-region {
                border: none !important;
              }
            `}</style>
            
            <p className="text-center text-gray-600 mt-6 font-medium">
              Positionnez le QR code du client dans le cadre
            </p>
            
            {errorMessage && step === "scanning" && (
              <div className="mt-4 bg-red-100 border-2 border-red-300 text-red-700 px-4 py-3 rounded-2xl text-center text-sm font-medium max-w-sm">
                {errorMessage}
              </div>
            )}
            
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
          </motion.div>
        )}

        {(step === "confirming" ||
          step === "success" ||
          step === "error" ||
          step === "processing") && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
            {step === "confirming" && clientInfo && scannedData && (
              <motion.div
                key="confirming"
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl border-4 border-blue-500"
              >
                <div className="text-6xl mb-4">💳</div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
                  Confirmer la recharge
                </h2>
                
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-5 mb-6 border-2 border-blue-200">
                  <p className="text-xs text-gray-600 font-medium mb-2">Client</p>
                  <p className="text-xl font-bold text-gray-900">
                    {clientInfo.fullName}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    @{clientInfo.username}
                  </p>
                </div>
                
                <div className="bg-white rounded-2xl p-5 mb-6 shadow-md border-2 border-gray-200">
                  <p className="text-sm text-gray-600 font-medium mb-2">Montant à créditer</p>
                  <p className="text-4xl font-bold text-green-600">
                    {scannedData.amount.toLocaleString("fr-FR")} DA
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={resetFlow}
                    className="flex-1 py-4 bg-gray-200 text-gray-700 rounded-2xl font-semibold hover:bg-gray-300 transition-all"
                  >
                    ✕ Annuler
                  </button>
                  <button
                    onClick={handleConfirmRecharge}
                    className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all"
                  >
                    ✓ Confirmer
                  </button>
                </div>
              </motion.div>
            )}
            
            {step === "processing" && (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="mt-6 text-white font-bold text-lg">
                  Traitement en cours...
                </p>
              </motion.div>
            )}
            
            {step === "success" && (
              <motion.div
                key="success"
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
                  <span className="text-5xl">✅</span>
                </motion.div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
                  Recharge réussie !
                </h2>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 mb-6 border-2 border-green-200">
                  <p className="text-sm text-gray-700 mb-2">
                    Le compte de
                  </p>
                  <p className="text-xl font-bold text-gray-900">
                    {clientInfo?.fullName}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    a été crédité avec succès
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
            
            {step === "error" && (
              <motion.div
                key="error"
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-white to-red-50 rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl border-4 border-red-500"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-24 h-24 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg"
                >
                  <span className="text-5xl">❌</span>
                </motion.div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-4">
                  Échec de la recharge
                </h2>
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 mb-6">
                  <p className="text-red-700 font-medium">
                    {errorMessage}
                  </p>
                </div>
                <button
                  onClick={resetFlow}
                  className="w-full py-4 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all"
                >
                  🔄 Réessayer
                </button>
              </motion.div>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
