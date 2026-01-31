"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import PageHeader from "@/components/layouts/PageHeader";
import { useReferral } from "@/components/common/ReferralContext";
import { QRCodeSVG } from "qrcode.react";
import { useReferralRules } from "@/hooks/useReferralRules";

export default function InviterPage() {
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showSteps, setShowSteps] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);

  const {
    stats,
    referrals,
    referralLink,
    copyReferralLink,
  } = useReferral();

  // 🎯 Récupérer les règles de parrainage depuis le backend
  const { userToUserReward, userToMerchantReward, loading: rulesLoading } = useReferralRules('USER');

  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  const handleCopy = async () => {
    await copyReferralLink();
  };

  const handleShowQRCode = () => {
    setShowQRCode(true);
  };

  return (
    <div className="bg-white min-h-screen mb-16">
      <PageHeader title="Inviter" emoji="👥" showBackButton={true} />

      <div className="px-5">
        {/* ... (votre JSX pour la section récompense, code, etc. reste inchangé) ... */}

        {/* 👇 LE MODAL DU QR CODE EST MAINTENANT MODIFIÉ 👇 */}
        {showQRCode && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-5">
            <div className="bg-white rounded-xl max-w-sm w-full overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-lg">Votre QR Code</h3>
                  <button
                    onClick={() => setShowQRCode(false)}
                    className="text-gray-500 p-1"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6 flex flex-col items-center">
                <div className="bg-white p-3 rounded-lg border border-gray-200 mb-4">
                  {/* On utilise le composant pour générer le vrai QR Code */}
                  <QRCodeSVG
                    value={referralLink} // Le lien de parrainage complet
                    size={256} // Taille du QR code en pixels
                    bgColor={"#ffffff"}
                    fgColor={"#000000"}
                    level={"H"} // Niveau de correction d'erreur (H = High)
                    includeMargin={true}
                    imageSettings={{
                      src: "/favicon.ico", // Votre logo au centre
                      x: undefined,
                      y: undefined,
                      height: 40,
                      width: 40,
                      excavate: true,
                    }}
                  />
                </div>

                <p className="text-sm text-center text-gray-600 mb-4">
                  Scannez ce code pour vous inscrire avec mon code de
                  parrainage.
                </p>

                <div className="flex flex-col w-full space-y-3">
                  <button
                    onClick={() => setShowQRCode(false)}
                    className="w-full bg-black text-white py-3 rounded-lg flex items-center justify-center font-medium"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ... (le reste de votre page JSX reste inchangé) ... */}
        <div className="my-4 relative bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-5 rounded-xl overflow-hidden">
          <div className="absolute right-0 top-0 w-40 h-40 rounded-full bg-gradient-to-br from-white/20 to-white/5 -mr-20 -mt-20 blur-xl"></div>
          <div className="absolute left-0 bottom-0 w-40 h-40 rounded-full bg-gradient-to-br from-yellow-700/30 to-yellow-800/30 -ml-20 -mb-20 blur-xl"></div>
          <div className="relative z-10">
            <div className="flex items-center mb-3">
              <span className="text-2xl mr-3">🎁</span>
              <h2 className="text-xl font-bold">Programme de parrainage</h2>
            </div>
            <p className="mb-4 text-sm text-yellow-50">
              Parrainez vos amis et gagnez <strong>{userToUserReward} DA</strong> par ami et{" "}
              <strong>{userToMerchantReward} DA</strong> par commerçant!
            </p>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm opacity-80">Total gagné</p>
                <h3 className="text-2xl font-bold">
                  {formatNumber(stats.totalEarned)} DA
                </h3>
                {stats.pendingRewards > 0 && (
                  <p className="text-xs text-yellow-100">
                    +{formatNumber(stats.pendingRewards)} DA en attente
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowSteps(!showSteps)}
                className="bg-white text-yellow-600 px-3 py-2 rounded-lg text-sm font-medium"
              >
                Comment ça marche
              </button>
            </div>
          </div>
        </div>
        {showSteps && (
          <motion.div
            className="my-4 bg-yellow-50 p-4 rounded-xl"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="font-semibold mb-3 text-yellow-800">
              Comment ça marche
            </h3>
            <ol className="space-y-3">
              <li className="flex">
                <span className="bg-yellow-200 text-yellow-800 w-5 h-5 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                  1
                </span>
                <p className="text-sm text-yellow-800">
                  Partagez votre code de parrainage avec vos amis ou invitez
                  directement des commerçants
                </p>
              </li>
              <li className="flex">
                <span className="bg-yellow-200 text-yellow-800 w-5 h-5 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                  2
                </span>
                <p className="text-sm text-yellow-800">
                  Lorsqu'ils s'inscrivent avec votre code, ils reçoivent un
                  bonus de bienvenue
                </p>
              </li>
              <li className="flex">
                <span className="bg-yellow-200 text-yellow-800 w-5 h-5 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                  3
                </span>
                <p className="text-sm text-yellow-800">
                  Après leur première transaction, vous recevez votre
                  récompense: {userToUserReward} DA par ami, {userToMerchantReward} DA par commerçant
                </p>
              </li>
            </ol>
            <button
              className="w-full mt-3 py-2 text-sm text-yellow-800 border border-yellow-300 rounded-lg"
              onClick={() => setShowSteps(false)}
            >
              Fermer
            </button>
          </motion.div>
        )}
        <div className="my-4 bg-gray-50 p-4 rounded-xl">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold">Votre code de parrainage</h3>
            <span className="text-sm text-gray-500">
              {stats.totalInvited} invitations
            </span>
          </div>
          <div className="flex items-center bg-white border border-gray-200 rounded-lg p-3 mb-4">
            <span className="text-lg mr-3">🏷️</span>
            <div className="flex-grow">
              <p className="font-bold tracking-wider">{stats.referralCode}</p>
            </div>
            <button
              onClick={handleCopy}
              className="text-sm text-blue-600 font-medium"
            >
              Copier
            </button>
          </div>
          <div className="mb-4">
            <button
              onClick={handleShowQRCode}
              className="w-full bg-blue-600 text-white py-3 rounded-lg flex items-center justify-center font-medium"
            >
              <span className="mr-2">📱</span>QR Code
            </button>
          </div>
        </div>
        <div className="my-6">
          <h3 className="font-semibold mb-3">Mes invitations</h3>
          <div className="space-y-3">
            {referrals && referrals.length > 0 ? (
              referrals.map((referral) => (
                <div
                  key={referral.id}
                  className="bg-gray-50 rounded-xl p-3 flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-blue-700 font-semibold">
                        {referral.name ? referral.name.charAt(0) : "?"}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">
                        {referral.name || "Utilisateur Anonyme"}
                      </p>
                      <p className="text-xs text-gray-500">
                        Inscrit le{" "}
                        {new Date(referral.date).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>

                  {/* On affiche le statut dynamiquement */}
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      referral.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {referral.status === "completed"
                      ? "Complété"
                      : "En attente"}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                Vous n'avez pas encore parrainé d'amis.
              </p>
            )}
          </div>
        </div>
        {successMessage && (
          <div className="my-4 bg-green-50 border border-green-100 text-green-800 p-3 rounded-lg">
            <div className="flex items-center">
              <span className="text-lg mr-2">✓</span>
              <p>{successMessage}</p>
            </div>
          </div>
        )}
        {errorMessage && (
          <div className="my-4 bg-red-50 border border-red-100 text-red-800 p-3 rounded-lg">
            <div className="flex items-center">
              <span className="text-lg mr-2">⚠️</span>
              <p>{errorMessage}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
