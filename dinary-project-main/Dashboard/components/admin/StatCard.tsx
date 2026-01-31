// src/components/admin/StatCard.tsx
import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isAlert?: boolean;
  icon: ReactNode;
}

export default function StatCard({
  title,
  value,
  change,
  isAlert = false,
  icon,
}: StatCardProps) {
  // Détermine la couleur du texte de changement
  const changeColor =
    change && change.startsWith("+") ? "text-green-600" : "text-red-600";

  // N'affiche le changement que s'il est pertinent
  const hasValidChange = change && !change.includes("NaN");

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className="text-gray-400">{icon}</div>
      </div>
      <div>
        <p
          className={`text-2xl font-bold ${
            isAlert ? "text-orange-500" : "text-gray-800"
          }`}
        >
          {value}
        </p>
        {hasValidChange && (
          <p
            className={`text-xs mt-1 ${
              isAlert ? "text-orange-500" : changeColor
            }`}
          >
            {change}
          </p>
        )}
      </div>
    </div>
  );
}
