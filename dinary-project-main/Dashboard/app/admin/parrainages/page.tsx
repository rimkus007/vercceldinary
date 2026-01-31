// parrainages/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, TrendingUp, Gift } from "lucide-react";

export default function ParrainagesPage() {
  const [activeTab, setActiveTab] = useState("tous");
  const [stats, setStats] = useState<any>(null);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      // --- 1. Récupérer le jeton JWT ---
      const token = localStorage.getItem("dinary_admin_access_token");

      if (!token) {
        setError(
          "Accès refusé. Veuillez vous connecter en tant qu'administrateur."
        );
        setLoading(false);
        return; // Arrête l'exécution si le jeton n'est pas trouvé
      }

      // --- 2. Préparer les en-têtes de la requête ---
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        
        const statsRes = await fetch(
          `${baseUrl}/admin/referral-stats`,
          {
            headers: headers, // Ajoute les en-têtes ici
          }
        );
        if (!statsRes.ok)
          throw new Error("Erreur lors du chargement des statistiques");
        const statsData = await statsRes.json();
        setStats(statsData);

        const referralsRes = await fetch(
          `${baseUrl}/admin/referrals`,
          {
            headers: headers, // Ajoute les en-têtes ici
          }
        );
        if (!referralsRes.ok)
          throw new Error("Erreur lors du chargement des parrainages");
        const referralsData = await referralsRes.json();
        setReferrals(referralsData);
      } catch (err: any) {
        /* log removed */
        setError(err.message || "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredReferrals = referrals.filter((referral) => {
    if (activeTab === "en_attente" && referral.status !== "pending")
      return false;
    if (activeTab === "completes" && referral.status !== "completed")
      return false;
    if (activeTab === "recompenses" && referral.status !== "rewarded")
      return false;
    if (activeTab === "annules" && referral.status !== "cancelled")
      return false;
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "rewarded":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Complété";
      case "rewarded":
        return "Récompensé";
      case "pending":
        return "En attente";
      case "cancelled":
        return "Annulé";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="col-span-4 text-center py-10 text-gray-500">
          Chargement des statistiques...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="col-span-4 text-center py-10 text-red-500">{error}</div>
      </div>
    );
  }

  const topReferrers = stats?.topReferrers || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Gestion des Parrainages
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Suivez et gérez les parrainages, les conversions et les récompenses
          </p>
        </div>
        <a
          href="/admin/parrainages/config"
          className="inline-flex items-center px-4 py-2 bg-dinary-turquoise text-white rounded-lg hover:bg-opacity-90 transition-colors"
        >
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Configuration
        </a>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 font-medium">
              Parrainages Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-800">
                  {stats.totalReferrals}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  <span className="text-green-600 font-medium">
                    {stats.conversionRate}%
                  </span>{" "}
                  taux de conversion
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <UserPlus className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 font-medium">
              En Attente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-800">
                  {stats.pendingReferrals}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  <span className="text-orange-600 font-medium">
                    {stats.totalReferrals > 0
                      ? Math.round(
                          (stats.pendingReferrals / stats.totalReferrals) * 100
                        )
                      : 0}
                    %
                  </span>{" "}
                  du total
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 font-medium">
              Récompensés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-800">
                  {stats.rewardedReferrals}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  <span className="text-green-600 font-medium">
                    {stats.completedReferrals > 0
                      ? Math.round(
                          (stats.rewardedReferrals / stats.completedReferrals) *
                            100
                        )
                      : 0}
                    %
                  </span>{" "}
                  des complétés
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Gift className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 font-medium">
              Récompenses Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-800">
                  {stats.totalRewards.toLocaleString()} DA
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  <span className="text-blue-600 font-medium">
                    {stats.rewardedReferrals > 0
                      ? Math.round(
                          stats.totalRewards / stats.rewardedReferrals
                        ).toLocaleString()
                      : 0}
                  </span>{" "}
                  par parrainage
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Referrers */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Top Parrains</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="pb-3 font-medium text-gray-600">Parrain</th>
                    <th className="pb-3 font-medium text-gray-600 text-right">
                      Parrainages
                    </th>
                    <th className="pb-3 font-medium text-gray-600 text-right">
                      Gains
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topReferrers.map((referrer: any, index: number) => (
                    <tr
                      key={referrer.id}
                      className={
                        index !== topReferrers.length - 1
                          ? "border-b border-gray-100"
                          : ""
                      }
                    >
                      <td className="py-3">
                        <div className="flex items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                              index === 0
                                ? "bg-yellow-500"
                                : index === 1
                                ? "bg-gray-400"
                                : index === 2
                                ? "bg-amber-700"
                                : "bg-blue-500"
                            }`}
                          >
                            {index + 1}
                          </div>
                          <span className="ml-3 font-medium">
                            {referrer.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 text-right font-medium">
                        {referrer.referrals}
                      </td>
                      <td className="py-3 text-right font-medium">
                        {referrer.rewards.toLocaleString()} DA
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Onglets de Filtrage */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={activeTab === "tous" ? "default" : "outline"}
          onClick={() => setActiveTab("tous")}
        >
          Tous ({referrals.length})
        </Button>
        <Button
          variant={activeTab === "en_attente" ? "default" : "outline"}
          onClick={() => setActiveTab("en_attente")}
        >
          En Attente ({referrals.filter(r => r.status === 'pending').length})
        </Button>
        <Button
          variant={activeTab === "completes" ? "default" : "outline"}
          onClick={() => setActiveTab("completes")}
        >
          Complétés ({referrals.filter(r => r.status === 'completed').length})
        </Button>
        <Button
          variant={activeTab === "recompenses" ? "default" : "outline"}
          onClick={() => setActiveTab("recompenses")}
        >
          Récompensés ({referrals.filter(r => r.status === 'rewarded').length})
        </Button>
      </div>

      {/* Liste des Parrainages */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Parrainages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Parrain
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Filleul
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Code
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Statut
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Récompense
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredReferrals.map((referral: any) => (
                  <tr key={referral.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{referral.referrerName}</td>
                    <td className="py-3 px-4">{referral.refereeName}</td>
                    <td className="py-3 px-4 font-mono">
                      {referral.referralCode}
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={getStatusBadge(referral.status)}>
                        {getStatusText(referral.status)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      {new Date(referral.dateCreated).toLocaleDateString(
                        "fr-FR"
                      )}
                    </td>
                    <td className="py-3 px-4">{referral.rewardAmount} DA</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredReferrals.length === 0 && (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucun parrainage trouvé</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
