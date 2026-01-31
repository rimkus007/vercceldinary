// rembourser/page.tsx
"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Html5Qrcode } from "html5-qrcode";
import { Loader2, CheckCircle, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

export default function RembourserPage() {
  const [transactionDetails, setTransactionDetails] = useState<any | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { token } = useAuth();
  const [activeCameraId, setActiveCameraId] = useState<string | null>(null);
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  // Nouvel état : un objet pour stocker les quantités à rembourser par article
  const [refundQuantities, setRefundQuantities] = useState<{
    [itemId: string]: number;
  }>({});
  
  // État pour le montant de remboursement manuel
  const [manualRefundEnabled, setManualRefundEnabled] = useState(false);
  const [manualRefundAmount, setManualRefundAmount] = useState<string>('');

  // Calcule la liste des articles à rembourser pour l'envoi à l'API
  const refundItems = useMemo(() => {
    if (!transactionDetails?.cart) return [];
    return Object.entries(refundQuantities)
      .map(([itemId, quantity]) => {
        if (quantity > 0) {
          const itemDetails = transactionDetails.cart.find(
            (i: any) => i.id === itemId
          );
          return { ...itemDetails, quantity };
        }
        return null;
      })
      .filter(Boolean); // Retire les éléments nulls
  }, [refundQuantities, transactionDetails]);

  // Calcule le montant total à rembourser
  const calculatedRefundAmount = useMemo(() => {
    // Si la transaction n'a pas de panier (saisie manuelle), utiliser le montant total
    if (!transactionDetails?.cart || transactionDetails.cart.length === 0) {
      return transactionDetails?.amount || 0;
    }
    
    // Sinon, calculer à partir des articles sélectionnés
    return refundItems.reduce(
      (total, item) => total + (item.price * item.quantity),
      0
    );
  }, [refundItems, transactionDetails]);
  
  // Utilise le montant manuel si activé, sinon utilise le montant calculé
  const refundAmount = manualRefundEnabled && manualRefundAmount !== '' 
    ? Number(manualRefundAmount)
    : calculatedRefundAmount;

  const onScanSuccess = useCallback(
    async (decodedText: string) => {
      if (scannerRef.current?.isScanning) {
        await scannerRef.current.stop();
      }
      try {
        let transactionId: string | null = null;

        // 1) Essayer de parser un JSON contenant { transactionId }
        try {
          const data = JSON.parse(decodedText);
          if (data && typeof data === "object" && (data as any).transactionId) {
            transactionId = (data as any).transactionId as string;
          }
        } catch {
          // Ce n'est pas du JSON, on continue
        }

        const rawText = decodedText.trim();

        // 2) Si rien trouvé, essayer d'extraire depuis une URL (ex: facture)
        if (!transactionId) {
          try {
            const url = new URL(rawText);
            // a) chemin de type /wallet/transaction/{id}/...
            const match = url.pathname.match(/\/wallet\/transaction\/([^/]+)/);
            if (match && match[1]) {
              transactionId = match[1];
            } else {
              // b) ou paramètre query ?transactionId=...
              const fromQuery = url.searchParams.get("transactionId");
              if (fromQuery) {
                transactionId = fromQuery;
              }
            }
          } catch {
            // pas une URL valide, on continue
          }
        }

        // 3) Si toujours rien, si le texte brut ressemble à un UUID / identifiant long, on le prend tel quel
        if (!transactionId && /^[0-9a-fA-F-]{20,}$/.test(rawText)) {
          transactionId = rawText;
        }

        if (!transactionId || !token) {
          throw new Error("QR Code non reconnu par Dinary.");
        }

        setIsLoading(true);
        setError("");
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/wallet/transaction/${transactionId}/details`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(
            errorData.message || "Impossible de récupérer les détails."
          );
        }
        const details = await res.json();
        if (details.status === "refunded") {
          throw new Error(
            "Cette transaction a déjà été entièrement remboursée."
          );
        }
        setTransactionDetails(details);
      } catch (e: any) {
        setError(e.message || "QR Code invalide.");
        setTimeout(() => setError(""), 4000);
        if (activeCameraId) startScanner(activeCameraId);
      } finally {
        setIsLoading(false);
      }
    },
    [token, activeCameraId]
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
        setError(
          "Impossible de démarrer la caméra. Vérifiez les autorisations."
        );
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
    if (activeCameraId && !transactionDetails && !success) {
      startScanner(activeCameraId);
    }
  }, [activeCameraId, transactionDetails, success, startScanner]);

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

  // Fonction pour gérer le changement de quantité
  const handleQuantityChange = (item: any, delta: number) => {
    const currentQty = refundQuantities[item.id] || 0;
    const maxRefundable = item.quantity - (item.refundedQuantity || 0);
    let newQty = currentQty + delta;

    // S'assurer que la nouvelle quantité est entre 0 et le maximum remboursable
    if (newQty < 0) newQty = 0;
    if (newQty > maxRefundable) newQty = maxRefundable;

    setRefundQuantities((prev) => ({ ...prev, [item.id]: newQty }));
  };

  const handleRefund = async () => {
    if (
      !transactionDetails?.id ||
      (!manualRefundEnabled && refundItems.length === 0) ||
      !token
    )
      return;

    // Si le remboursement manuel est activé mais qu'aucun montant n'est saisi
    if (
      manualRefundEnabled &&
      (manualRefundAmount === "" || Number(manualRefundAmount) <= 0)
    ) {
      setError("Veuillez saisir un montant valide pour le remboursement.");
      return;
    }
    setIsLoading(true);
    try {
      const payloadItems = refundItems.map((item: any) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
      }));

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/wallet/refund/items`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            transactionId: transactionDetails.id,
            items: manualRefundEnabled ? [] : payloadItems,
            manualAmount: manualRefundEnabled
              ? Number(manualRefundAmount)
              : undefined,
          }),
        }
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Le remboursement a échoué.");
      setSuccess(data.message);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

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
            🔄 Remboursement
          </h1>
          <p className="text-white/90 text-sm">Scannez le reçu du client</p>
        </div>
      </div>

      <div className="px-5 flex flex-col items-center">
        {success ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-8 w-full max-w-sm bg-gradient-to-br from-white to-green-50 rounded-3xl shadow-2xl p-8 border-4 border-green-500 mt-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-5"
            >
              <CheckCircle className="text-white" size={48} />
            </motion.div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">
              Remboursement Réussi !
            </h2>
            <p className="text-gray-700 font-medium mb-6">{success}</p>
            <Link
              href="/dashboard"
              className="block w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all"
            >
              ✓ Terminé
            </Link>
          </motion.div>
        ) : transactionDetails ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-3xl w-full max-w-sm shadow-2xl border border-gray-200 mt-4"
          >
            <h3 className="font-bold mb-5 text-center text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Articles à rembourser
            </h3>
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-2xl mb-5 border border-blue-200 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">👤</span>
                <div>
                  <p className="text-xs text-gray-600">Client</p>
                  <p className="font-semibold text-gray-900">
                    {transactionDetails.clientName}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-blue-200">
                <span className="text-2xl">📅</span>
                <div>
                  <p className="text-xs text-gray-600">Date</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(transactionDetails.date).toLocaleDateString(
                      "fr-FR",
                      { day: "numeric", month: "long", year: "numeric" }
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-5">
              {transactionDetails.cart?.map((item: any) => {
                const refundedQty = item.refundedQuantity || 0;
                const remainingQty = item.quantity - refundedQty;
                const currentRefundQty = refundQuantities[item.id] || 0;

                return (
                  <div key={item.id} className="bg-white p-4 rounded-2xl border-2 border-gray-200 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex-grow">
                        <p
                          className={`font-semibold text-sm ${
                            remainingQty === 0
                              ? "line-through text-gray-400"
                              : "text-gray-900"
                          }`}
                        >
                          {item.name}
                        </p>
                        <p className="text-xs text-blue-600 font-medium mt-0.5">
                          {item.price.toFixed(2)} DA / unité
                        </p>
                        {refundedQty > 0 && (
                          <p className="text-xs text-red-600 font-medium mt-1 bg-red-50 inline-block px-2 py-0.5 rounded-full">
                            {refundedQty}/{item.quantity} remboursé(s)
                          </p>
                        )}
                      </div>
                      {remainingQty > 0 ? (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-300">
                            <button
                              onClick={() => handleQuantityChange(item, -1)}
                              className="px-3 py-2 text-gray-700 hover:bg-red-100 hover:text-red-600 transition-colors font-bold"
                            >
                              −
                            </button>
                            <span className="px-3 text-sm font-bold text-gray-900 min-w-[2rem] text-center bg-white">
                              {currentRefundQty}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item, 1)}
                              className="px-3 py-2 text-gray-700 hover:bg-green-100 hover:text-green-600 transition-colors font-bold"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
                          ✓ Remboursé
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-4 border-2 border-blue-200 mb-5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-800">Total à rembourser :</span>
                <span className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {refundAmount.toLocaleString("fr-FR")} DA
                </span>
              </div>
              
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  id="manualRefund"
                  checked={manualRefundEnabled}
                  onChange={(e) => {
                    setManualRefundEnabled(e.target.checked);
                    if (!e.target.checked) {
                      setManualRefundAmount('');
                    }
                  }}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="manualRefund" className="ml-2 text-sm font-medium text-gray-700">
                  Définir manuellement le montant
                </label>
              </div>
              
              {manualRefundEnabled && (
                <div className="mt-2">
                  <label htmlFor="refundAmount" className="block text-sm font-medium text-gray-700 mb-1">
                    Montant du remboursement (DA)
                  </label>
                  <input
                    type="number"
                    id="refundAmount"
                    value={manualRefundAmount}
                    onChange={(e) => {
                      // Ne mettre à jour que si la valeur est vide ou un nombre valide
                      const value = e.target.value;
                      if (value === '' || /^\d*\.?\d*$/.test(value)) {
                        setManualRefundAmount(value);
                      }
                    }}
                    onBlur={(e) => {
                      // Formater la valeur lorsqu'on quitte le champ
                      const value = e.target.value;
                      if (value !== '') {
                        const numValue = parseFloat(value);
                        setManualRefundAmount(isNaN(numValue) ? '' : numValue.toFixed(2));
                      }
                    }}
                    min="0"
                    step="0.01"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Entrez le montant"
                  />
                  {manualRefundAmount !== '' && Number(manualRefundAmount) > calculatedRefundAmount && (
                    <p className="mt-1 text-xs text-yellow-600">
                      Attention : Le montant saisi est supérieur au montant calculé ({calculatedRefundAmount.toLocaleString("fr-FR")} DA)
                    </p>
                  )}
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-center text-sm mb-4">
                {error}
              </div>
            )}

            <button
              onClick={handleRefund}
              disabled={isLoading || (refundItems.length === 0 && (!manualRefundEnabled || manualRefundAmount === '' || Number(manualRefundAmount) <= 0))}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Traitement...</span>
                </>
              ) : (
                <>
                  <span>🔄</span>
                  <span>Rembourser {refundAmount.toLocaleString("fr-FR")} DA</span>
                </>
              )}
            </button>
            <button
              onClick={() => {
                setTransactionDetails(null);
                setError("");
                setRefundQuantities({});
              }}
              className="w-full mt-3 py-3 bg-gray-100 text-gray-700 rounded-2xl font-semibold hover:bg-gray-200 transition-all"
            >
              📱 Scanner un autre code
            </button>
          </motion.div>
        ) : (
          <>
            <div className="w-full max-w-sm aspect-square bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border-4 border-blue-500 relative mt-4">
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
              Positionnez le QR code du reçu dans le cadre
            </p>
            {error && (
              <div className="mt-4 bg-red-100 border-2 border-red-300 text-red-700 px-4 py-3 rounded-2xl text-center text-sm font-medium max-w-sm">
                {error}
              </div>
            )}
            {isLoading && (
              <div className="mt-8 flex flex-col items-center gap-3">
                <Loader2 className="animate-spin text-blue-600" size={32} />
                <p className="text-gray-600 font-medium">Chargement des détails...</p>
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
          </>
        )}
      </div>
    </div>
  );
}

