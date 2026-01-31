"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useProfileModal } from "@/components/common/ProfileModalContext";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getLevelTitle } from "@/utils/levelUtils";
import { QRCodeSVG } from "qrcode.react";

export default function ProfileModal() {
  const [showQRModal, setShowQRModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"myQR" | "scanner">("myQR");
  const { isOpen, closeModal, setComingFromProfileModal } = useProfileModal();
  const router = useRouter();

  const { user, gamificationProfile, logout } = useAuth();

  if (!isOpen || !user || !gamificationProfile) {
    return null;
  }

  const xpToNextLevel = gamificationProfile.xpToNextLevel || 1;
  const progressPercentage = (gamificationProfile.xp / xpToNextLevel) * 100;

  const handleLogout = () => {
    closeModal();
    logout();
  };

  const handleProfileLinkClick = (path: string) => {
    setComingFromProfileModal(true);
    closeModal();
    router.push(path);
  };

  const initials = user.fullName
    .split(" ")
    .map((name) => name.charAt(0))
    .join("")
    .toUpperCase();

  const username = user.username;
  const referralLink = `${window.location.origin}/register?referralCode=${
    user.referralCode || ""
  }`;

  // ✅ MODIFICATION 2 : La liste de menu a été simplifiée
  const menuItems = [
    { icon: "👤", label: "Mon Compte", path: "/profile/account" },
    { icon: "❓", label: "Aide", path: "/profile/help" },
  ];

  if (showQRModal) {
    return (
      <AnimatePresence>
        {/* Le code du modal QR reste identique */}
        <motion.div
          className="fixed inset-0 bg-white z-[70] flex flex-col" // z-index augmenté ici aussi
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="p-4 flex justify-between items-center border-b border-gray-200/50 relative z-10 backdrop-blur-sm bg-white/80">
            <motion.button
              onClick={() => setShowQRModal(false)}
              className="p-2 relative"
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-9 h-9 rounded-full bg-black/5 backdrop-blur-sm flex items-center justify-center">
                <span className="text-xl">←</span>
              </div>
            </motion.button>
            <h2 className="text-xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              {activeTab === "myQR" ? "Mon QR Code" : "Scanner un QR code"}
            </h2>
            <div className="w-8"></div>
          </div>

          <div className="flex-grow flex flex-col justify-between relative z-10">
            <div className="flex-1 overflow-y-auto">
              {activeTab === "myQR" ? (
                <motion.div
                  className="flex flex-col items-center justify-center p-6 h-full"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 text-white flex items-center justify-center text-4xl font-bold mb-5 shadow-lg">
                      {initials}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-1 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    {user.fullName}
                  </h3>
                  <p className="text-sm text-gray-600 mb-8">@{username}</p>

                  <motion.div
                    className="relative"
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, type: "spring" }}
                  >
                    <div className="w-72 h-72 bg-gradient-to-br from-blue-50 to-gray-50 rounded-2xl flex items-center justify-center p-4 mb-6 shadow-lg relative overflow-hidden">
                      <div className="w-full h-full bg-white p-3 rounded-xl flex items-center justify-center shadow-inner relative backdrop-blur-sm">
                        <QRCodeSVG
                          value={referralLink}
                          size={240}
                          bgColor={"#ffffff"}
                          fgColor={"#000000"}
                          level={"H"}
                          includeMargin={false}
                          imageSettings={{
                            src: "/favicon.ico",
                            height: 40,
                            width: 40,
                            excavate: true,
                          }}
                        />
                      </div>
                    </div>
                  </motion.div>
                  <p className="text-sm text-center text-gray-600 mb-5 max-w-xs">
                    Partagez ce code avec vos amis pour les inviter sur Dinary !
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  className="flex-grow flex flex-col items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-gray-500">
                    Fonctionnalité de scan à intégrer.
                  </p>
                </motion.div>
              )}
            </div>

            <div className="flex border-t border-gray-200/50 bg-white/80 backdrop-blur-sm relative z-20">
              <button
                className={`flex-1 py-4 text-center text-sm font-medium ${
                  activeTab === "myQR" ? "text-blue-600" : "text-gray-500"
                }`}
                onClick={() => setActiveTab("myQR")}
              >
                Mon Code
              </button>
              <button
                className={`flex-1 py-4 text-center text-sm font-medium ${
                  activeTab === "scanner" ? "text-blue-600" : "text-gray-500"
                }`}
                onClick={() => router.push("/scanner")}
              >
                Scanner
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        // ✅ MODIFICATION 1: Le z-index est passé de z-50 à z-[60] pour être au-dessus de la barre de navigation (qui est à z-50)
        <motion.div
          className="fixed inset-0 z-[60] flex items-start justify-center pt-10 sm:pt-16 px-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className="absolute inset-0 bg-gradient-to-br from-black/50 to-black/60 backdrop-blur-sm"
            onClick={closeModal}
          ></div>

          <motion.div
            className="bg-white/90 backdrop-blur-md rounded-2xl w-full max-w-md mx-auto max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-5 border-b border-gray-200/50 sticky top-0 z-10 backdrop-blur-sm bg-white/80 rounded-t-2xl">
              <h2 className="text-xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Mon Profil
              </h2>
              <motion.button
                onClick={closeModal}
                className="w-8 h-8 rounded-full bg-black/5 backdrop-blur-sm flex items-center justify-center"
              >
                <span className="text-lg">✕</span>
              </motion.button>
            </div>

            <div className="p-5 overflow-y-auto flex-grow relative z-10">
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 text-white flex items-center justify-center text-3xl font-bold mb-4 shadow-lg">
                    {initials}
                  </div>
                </div>
                <div
                  className="flex items-center cursor-pointer"
                  onClick={() => setShowQRModal(true)}
                >
                  <p className="font-medium text-xl text-center bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    {user.fullName}
                  </p>
                </div>
                <p className="text-sm text-gray-600 mb-4">@{username}</p>

                <motion.div
                  className="w-full bg-black text-white px-5 py-3 rounded-xl mb-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center justify-center mb-1">
                    <h1 className="text-lg font-medium">
                      Niveau {gamificationProfile.level}
                    </h1>
                  </div>
                  <p className="text-white/80 text-xs text-center mb-2">
                    {getLevelTitle(gamificationProfile.level)}
                  </p>

                  <div className="flex justify-between text-[10px] text-white/80 px-1 mb-1">
                    <span>Niveau {gamificationProfile.level}</span>
                    <span>
                      {gamificationProfile.xp} / {xpToNextLevel} XP
                    </span>
                    <span>Niveau {gamificationProfile.level + 1}</span>
                  </div>
                  <div className="w-full h-1 bg-white/20 rounded-full">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercentage}%` }}
                      transition={{ duration: 0.8 }}
                      className="h-full bg-white rounded-full"
                    />
                  </div>
                </motion.div>
              </div>

              {/* Les liens du menu sont maintenant filtrés */}
              <div className="divide-y divide-gray-100">
                {menuItems.map((item) => (
                  <div
                    key={item.path}
                    onClick={() => handleProfileLinkClick(item.path)}
                    className="block"
                  >
                    <motion.div
                      className="flex items-center justify-between p-3.5 cursor-pointer"
                      whileHover={{
                        backgroundColor: "rgba(59, 130, 246, 0.05)",
                      }}
                    >
                      <div className="flex items-center min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                          <span className="text-lg">{item.icon}</span>
                        </div>
                        <span className="font-medium truncate text-gray-800">
                          {item.label}
                        </span>
                      </div>
                      <span className="text-blue-500 flex-shrink-0">→</span>
                    </motion.div>
                  </div>
                ))}

                <div onClick={handleLogout} className="block cursor-pointer">
                  <motion.div
                    className="flex items-center justify-between p-3.5"
                    whileHover={{ backgroundColor: "rgba(239, 68, 68, 0.05)" }}
                  >
                    <div className="flex items-center min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-lg">🚪</span>
                      </div>
                      <span className="font-medium truncate text-red-600">
                        Se déconnecter
                      </span>
                    </div>
                    <span className="text-red-500 flex-shrink-0">→</span>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
