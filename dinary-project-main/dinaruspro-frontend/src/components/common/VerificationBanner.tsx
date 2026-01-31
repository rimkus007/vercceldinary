"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { AlertTriangle, Clock } from "lucide-react";

export default function VerificationBanner() {
  const { user } = useAuth();

  // N'affiche rien si l'utilisateur n'est pas chargé ou s'il est déjà vérifié
  if (!user || user.verificationStatus === "VERIFIED") {
    return null;
  }

  // Affiche un message si la vérification est en cours
  if (user.verificationStatus === "PENDING") {
    return (
      <div className="mx-4 my-4 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start">
        <Clock className="text-blue-500 mr-3 mt-1 flex-shrink-0" />
        <div>
          <h3 className="font-bold text-blue-800">Vérification en cours</h3>
          <p className="text-sm text-blue-700">
            Vos documents sont en cours d'examen par notre équipe. Ce processus
            peut prendre jusqu'à 24 heures.
          </p>
        </div>
      </div>
    );
  }

  // Affiche une alerte cliquable si la vérification est nécessaire ou a été rejetée
  return (
    <Link href="/verification" className="block mx-4 my-4">
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start cursor-pointer hover:bg-yellow-100">
        <AlertTriangle className="text-yellow-500 mr-3 mt-1 flex-shrink-0" />
        <div>
          <h3 className="font-bold text-yellow-800">
            Action requise : Vérifiez votre compte
          </h3>
          <p className="text-sm text-yellow-700">
            Pour pouvoir encaisser des paiements et accéder à toutes les
            fonctionnalités, vous devez faire vérifier votre identité. Cliquez
            ici pour commencer.
          </p>
        </div>
      </div>
    </Link>
  );
}
