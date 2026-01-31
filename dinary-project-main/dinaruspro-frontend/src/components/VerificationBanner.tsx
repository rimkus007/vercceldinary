"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { AlertTriangle, Clock, CheckCircle } from "lucide-react";

export default function MerchantVerificationBanner() {
  const { user } = useAuth();

  // Si vérifié, ne rien afficher
  if (!user || user.verificationStatus === "VERIFIED") {
    return null;
  }

  // Si en attente
  if (user.verificationStatus === "PENDING") {
    return (
      <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <Clock className="text-blue-600 flex-shrink-0" size={28} />
          <div className="flex-1">
            <h3 className="font-bold text-blue-900 text-base mb-1">
              🔒 Vérification en cours
            </h3>
            <p className="text-sm text-blue-800">
              Vos documents sont en cours de vérification par notre équipe. 
              Vous serez notifié dès qu'une décision sera prise.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Si non vérifié - Blocage complet
  return (
    <Link href="/verification">
      <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 rounded-xl p-5 shadow-xl cursor-pointer hover:shadow-2xl transition-all animate-pulse">
        <div className="flex items-start gap-3">
          <AlertTriangle className="text-red-600 flex-shrink-0" size={32} />
          <div className="flex-1">
            <h3 className="font-bold text-red-900 text-lg mb-2 flex items-center gap-2">
              🚫 Accès restreint
            </h3>
            <p className="text-sm text-red-800 mb-3">
              Vous devez vérifier votre identité pour utiliser toutes les fonctionnalités de l'application.
              Cette étape est obligatoire et sécurisée.
            </p>
            <div className="bg-white/60 rounded-lg px-3 py-2 border border-red-200">
              <p className="text-xs font-semibold text-red-900">
                👆 Cliquez ici pour soumettre vos documents
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

