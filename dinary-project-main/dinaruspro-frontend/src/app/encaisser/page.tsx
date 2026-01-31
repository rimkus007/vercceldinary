// app/encaisser/page.tsx
"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "@/context/AuthContext";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchCommissionRules, getCommissionDetails } from "@/lib/commissions";

// --- Interfaces ---
interface Product {
  id: string;
  name: string;
  price: number;
  category?: string;
  description?: string;
}
interface CartItem extends Product {
  quantity: number;
}

export default function EncaisserPage() {
  const { user, token, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  // --- États pour la logique de la page ---
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // État pour le montant libre
  const [customAmount, setCustomAmount] = useState<string>("");

  // États pour les modales
  const [showProductModal, setShowProductModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);

  // États pour la recherche et le QR code
  const [searchTerm, setSearchTerm] = useState("");
  const [qrValue, setQrValue] = useState<string | null>(null);
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);
  const pollingRef = useRef<NodeJS.Timeout>();

  // États pour la commission marchand
  const [merchantCommission, setMerchantCommission] = useState<number>(0);
  const [merchantNetAmount, setMerchantNetAmount] = useState<number>(0);

  // Redirection si l'utilisateur n'est pas un commerçant vérifié
  useEffect(() => {
    if (
      !isAuthLoading &&
      (!user ||
        user.role !== "MERCHANT" ||
        user.verificationStatus !== "VERIFIED")
    ) {
      router.push("/dashboard"); // ou une page d'erreur appropriée
    }
  }, [isAuthLoading, user, router]);

  // Chargement des produits du commerçant
  useEffect(() => {
    const fetchProducts = async () => {
      if (!token) return;
      setIsLoadingProducts(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/products`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.ok) setProducts(await response.json());
      } catch (error) {
        void 0;
      } finally {
        setIsLoadingProducts(false);
      }
    };
    fetchProducts();
  }, [token]);

  // Détection du paiement (polling)
  useEffect(() => {
    if (!showQRModal || !currentRequestId || !token) {
      if (pollingRef.current) clearInterval(pollingRef.current);
      return;
    }
    pollingRef.current = setInterval(async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/wallet/payment-status/${currentRequestId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!response.ok) return;
        const data = await response.json();
        if (data.status === "completed") {
          clearInterval(pollingRef.current!);
          setShowQRModal(false);
          setPaymentComplete(true);
        }
      } catch (error) {
        void 0;
      }
    }, 2500);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [showQRModal, currentRequestId, token]);

  const totalAmount = useMemo(() => {
    const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const customTotal = parseFloat(customAmount) || 0;
    return cartTotal + customTotal;
  }, [cart, customAmount]);

  // Calcul de la commission marchand quand le total change
  useEffect(() => {
    async function calculateMerchantCommission() {
      if (totalAmount <= 0 || !token) {
        setMerchantCommission(0);
        setMerchantNetAmount(totalAmount);
        return;
      }
      
      try {
        await fetchCommissionRules(token, 'MERCHANT');
        const details = getCommissionDetails('merchant_payment', totalAmount);
        setMerchantCommission(details.commission);
        // Pour le marchand, le net est le total MOINS la commission
        setMerchantNetAmount(totalAmount - details.commission);
      } catch (error) {
        void 0;
        setMerchantCommission(0);
        setMerchantNetAmount(totalAmount);
      }
    }
    
    calculateMerchantCommission();
  }, [totalAmount, token]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleGenerateQR = () => {
    if (totalAmount <= 0 || !user) return;

    const paymentRequestId = uuidv4();
    const paymentData = {
      merchantUserId: user.id,
      amount: parseFloat(totalAmount.toFixed(2)),
      paymentRequestId: paymentRequestId,
      // Ne pas inclure cart s'il est vide
      ...(cart.length > 0 && {
        cart: cart.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        }))
      })
    };

    // Générer le QR code localement avec les données de paiement
    setQrValue(JSON.stringify(paymentData));
    setCurrentRequestId(paymentRequestId);
    setShowQRModal(true);
  };

  const startNewSale = () => {
    setPaymentComplete(false);
    setCart([]);
    setCustomAmount("");
    setQrValue(null);
    setCurrentRequestId(null);
  };

  const filteredProducts = products.filter((p) =>
    searchTerm ? p.name.toLowerCase().includes(searchTerm.toLowerCase()) : true
  );

  if (isAuthLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <main className="p-4 pb-32 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen max-w-md mx-auto">
      <header className="mb-6 relative bg-gradient-to-r from-blue-600 to-purple-600 -mx-4 -mt-4 p-6 rounded-b-3xl shadow-xl">
        <Link
          href="/dashboard"
          className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all"
        >
          <span className="text-white text-xl font-bold">←</span>
        </Link>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-1">
            💰 Encaissement
          </h1>
          <p className="text-white/80 text-sm">Scannez pour recevoir un paiement</p>
        </div>
      </header>

      {/* Section du Panier */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-5 shadow-lg border border-gray-200 mb-6">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-2xl">🛒</span>
          <h2 className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Panier
          </h2>
        </div>
        {cart.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-3">🛍️</div>
            <p className="text-sm text-gray-500 font-medium">
              Le panier est vide
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Ajoutez des produits pour commencer
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-60 overflow-y-auto mb-4 pr-2">
            {cart.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                    <p className="text-xs text-blue-600 font-medium mt-0.5">{item.price.toFixed(2)} DA × {item.quantity}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center bg-gray-100 rounded-lg overflow-hidden border border-gray-300">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="px-3 py-1.5 text-gray-700 hover:bg-red-100 hover:text-red-600 transition-colors font-bold"
                      >
                        −
                      </button>
                      <span className="px-3 text-sm font-bold text-gray-900 min-w-[2rem] text-center bg-white">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="px-3 py-1.5 text-gray-700 hover:bg-green-100 hover:text-green-600 transition-colors font-bold"
                      >
                        +
                      </button>
                    </div>
                    <p className="font-bold text-gray-900 min-w-[4rem] text-right">
                      {(item.price * item.quantity).toFixed(2)} DA
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {cart.length > 0 && (
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 space-y-3 border border-blue-200">
            <div className="flex justify-between text-sm text-gray-700">
              <span className="font-medium">Total transaction :</span>
              <span className="font-bold">{totalAmount.toFixed(2)} DA</span>
            </div>
            {merchantCommission > 0 && (
              <div className="flex justify-between text-sm text-orange-700 bg-orange-50 -mx-2 px-2 py-2 rounded-lg">
                <span className="font-medium">Commission plateforme :</span>
                <span className="font-bold">-{merchantCommission.toFixed(2)} DA</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg pt-2 border-t-2 border-blue-300">
              <span className="text-gray-800">Vous recevrez :</span>
              <span className="text-green-600 text-xl">{merchantNetAmount.toFixed(2)} DA</span>
            </div>
          </div>
        )}
      </div>

      {/* Section Montant Libre */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-5 shadow-lg border border-gray-200 mb-6">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-2xl">💰</span>
          <h2 className="font-bold text-lg bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Montant Libre
          </h2>
        </div>
        
        <div className="space-y-4">
          <div className="relative">
            <input
              type="number"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-3 text-lg font-bold text-center bg-white border-2 border-gray-300 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
              min="0"
              step="0.01"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
              DA
            </div>
          </div>
          
          {parseFloat(customAmount) > 0 && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 border border-green-200">
              <div className="flex justify-between text-sm font-medium text-green-800">
                <span>Montant libre :</span>
                <span>{parseFloat(customAmount).toFixed(2)} DA</span>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-3 gap-2">
            {[100, 500, 1000].map((amount) => (
              <button
                key={amount}
                onClick={() => setCustomAmount(amount.toString())}
                className="py-2 px-3 bg-gray-100 hover:bg-green-100 hover:text-green-700 rounded-lg text-sm font-medium transition-colors"
              >
                {amount} DA
              </button>
            ))}
          </div>
          
          {customAmount && (
            <button
              onClick={() => setCustomAmount("")}
              className="w-full py-2 text-sm text-gray-600 hover:text-red-600 transition-colors"
            >
              Effacer le montant
            </button>
          )}
        </div>
      </div>

      {/* Boutons d'action */}
      <div className="space-y-4 mb-6">
        <button
          onClick={() => setShowProductModal(true)}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 p-5 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center text-white font-semibold border-2 border-blue-400"
        >
          <span className="text-3xl mr-3">📦</span>
          <span className="text-lg">Ajouter depuis l'inventaire</span>
        </button>

        <button
          onClick={handleGenerateQR}
          disabled={totalAmount <= 0}
          className="w-full py-5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-3"
        >
          <span className="text-2xl">📱</span>
          <span>
            {totalAmount > 0 
              ? `Générer QR Code • ${merchantNetAmount.toFixed(2)} DA`
              : "Encaisser"}
          </span>
        </button>
      </div>

      {/* Modale pour choisir les produits */}
      <AnimatePresence>
        {showProductModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ y: 50, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 50, opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col"
            >
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-5 text-white">
                <h2 className="font-bold text-xl text-center flex items-center justify-center gap-2">
                  <span className="text-2xl">📦</span>
                  Mon inventaire
                </h2>
              </div>
              <div className="p-4 border-b bg-gray-50">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="🔍 Rechercher un produit..."
                    className="w-full px-4 py-3 rounded-xl bg-white border-2 border-gray-200 text-sm focus:border-blue-500 focus:outline-none transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                {isLoadingProducts ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="animate-spin text-blue-600 mb-3" size={32} />
                    <p className="text-gray-500 text-sm">Chargement...</p>
                  </div>
                ) : filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => addToCart(product)}
                        className="bg-white border-2 border-gray-200 rounded-xl p-3 cursor-pointer hover:border-blue-500 hover:shadow-lg transition-all active:scale-95"
                      >
                        <div className="text-center mb-2">
                          <span className="text-3xl">🛍️</span>
                        </div>
                        <div className="font-semibold text-sm text-gray-900 text-center mb-1 line-clamp-2">
                          {product.name}
                        </div>
                        <div className="text-blue-600 font-bold text-center">
                          {product.price.toFixed(2)} DA
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-3">📭</div>
                    <p className="text-gray-500 font-medium">
                      Aucun produit trouvé
                    </p>
                  </div>
                )}
              </div>
              <div className="p-4 border-t bg-white">
                <button
                  onClick={() => setShowProductModal(false)}
                  className="w-full py-3 bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  ✓ Terminer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modale QR Code */}
      <AnimatePresence>
        {showQRModal && qrValue && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-3xl text-center shadow-2xl w-full max-w-sm border-4 border-blue-500"
            >
              <div className="mb-4">
                <div className="text-5xl mb-2">📱</div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Scannez pour payer
                </h2>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-4 mb-4 border-2 border-blue-200">
                <p className="text-sm text-gray-600 font-medium">Total de la transaction</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{totalAmount.toFixed(2)} DA</p>
                {merchantCommission > 0 && (
                  <div className="mt-2 pt-2 border-t border-blue-200">
                    <p className="text-xs text-orange-600">Commission : -{merchantCommission.toFixed(2)} DA</p>
                    <p className="text-sm text-green-700 font-bold mt-1">Vous recevrez : {merchantNetAmount.toFixed(2)} DA</p>
                  </div>
                )}
              </div>
              <div className="p-5 bg-white rounded-2xl shadow-lg inline-block border-2 border-gray-200 mb-4">
                <QRCodeSVG value={qrValue} size={200} />
              </div>
              <div className="bg-blue-50 rounded-xl p-3 mb-4 border border-blue-200">
                <div className="flex items-center justify-center text-blue-700">
                  <Loader2 className="animate-spin mr-2" size={18} />
                  <span className="text-sm font-semibold">En attente du paiement...</span>
                </div>
              </div>
              <button
                onClick={() => setShowQRModal(false)}
                className="w-full py-3 bg-gradient-to-r from-gray-600 to-gray-800 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                ✕ Annuler
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modale Paiement Réussi */}
      <AnimatePresence>
        {paymentComplete && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-gradient-to-br from-white to-green-50 p-8 rounded-3xl text-center shadow-2xl w-full max-w-sm border-4 border-green-500"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg"
              >
                <span className="text-white text-5xl">✓</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Paiement reçu !
                </h2>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 mb-5 border-2 border-green-200">
                  <p className="text-sm text-gray-600 font-medium mb-1">Montant total</p>
                  <p className="text-3xl font-bold text-gray-900">{totalAmount.toFixed(2)} DA</p>
                  {merchantCommission > 0 && (
                    <div className="mt-3 pt-3 border-t border-green-200">
                      <p className="text-xs text-orange-600">Commission prélevée : -{merchantCommission.toFixed(2)} DA</p>
                      <p className="text-base text-green-700 font-bold mt-1">Crédité sur votre compte : {merchantNetAmount.toFixed(2)} DA</p>
                    </div>
                  )}
                </div>
                <button
                  onClick={startNewSale}
                  className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all"
                >
                  🔄 Nouvelle vente
                </button>
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
