"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface LedgerLine {
  id: string;
  date: string;
  description: string | null;
  type: string;
  amount: number;
  direction: "debit" | "credit";
  counterpart: string;
  runningBalance: number;
}

export default function UserLedgerPage() {
  const { token } = useAuth();
  const params = useParams<{ id: string }>();
  const userId = params?.id;

  const [ledger, setLedger] = useState<LedgerLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLedger = async () => {
      if (!token || !userId) {
        setLoading(false);
        if (!token) setError("Token administrateur manquant.");
        return;
      }
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/ledger/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) {
          throw new Error(
            `Erreur lors du chargement du livret (status ${res.status})`
          );
        }
        const data = await res.json();
        setLedger(data);
      } catch (err: any) {
        setError(err.message || "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    };
    fetchLedger();
  }, [token, userId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Livret de compte</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Chargement du livret...</p>
        </CardContent>
      </Card>
    );
  }
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Livret de compte</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Erreur : {error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Livret de compte</CardTitle>
      </CardHeader>
      <CardContent>
        {ledger.length === 0 ? (
          <p>Aucune transaction à afficher.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">
                    Date
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">
                    Description
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">
                    Contrepartie
                  </th>
                  <th className="px-4 py-2 text-right font-medium text-gray-600">
                    Débit
                  </th>
                  <th className="px-4 py-2 text-right font-medium text-gray-600">
                    Crédit
                  </th>
                  <th className="px-4 py-2 text-right font-medium text-gray-600">
                    Solde courant
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {ledger.map((line) => (
                  <tr key={line.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 whitespace-nowrap">
                      {new Date(line.date).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {line.description || line.type}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {line.counterpart}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-right">
                      {line.direction === "debit"
                        ? (line.amount / 100).toFixed(2)
                        : "-"}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-right">
                      {line.direction === "credit"
                        ? (line.amount / 100).toFixed(2)
                        : "-"}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-right">
                      {(line.runningBalance / 100).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
