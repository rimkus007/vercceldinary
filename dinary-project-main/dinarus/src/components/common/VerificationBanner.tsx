// components/common/VerificationBanner.tsx

"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { AlertTriangle, Clock } from "lucide-react";

export default function VerificationBanner() {
  const { user } = useAuth();

  if (!user || user.verificationStatus === "VERIFIED") {
    return null;
  }

  if (user.verificationStatus === "PENDING") {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start">
        <Clock className="text-blue-500 mr-3" />
        <div>
          <h3 className="font-bold text-blue-800">Vérification en cours</h3>
          <p className="text-sm text-blue-700">
            Vos documents sont en cours de vérification. Vous serez notifié une
            fois le processus terminé.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Link href="/profile/verification">
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start cursor-pointer">
        <AlertTriangle className="text-yellow-500 mr-3" />
        <div>
          <h3 className="font-bold text-yellow-800">Action requise</h3>
          <p className="text-sm text-yellow-700">
            Vérifiez votre identité pour recharger votre compte et accéder à
            toutes les fonctionnalités. Cliquez ici.
          </p>
        </div>
      </div>
    </Link>
  );
}
