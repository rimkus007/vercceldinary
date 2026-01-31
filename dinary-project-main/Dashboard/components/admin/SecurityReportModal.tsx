import { useState } from 'react';
import { Report } from '@/types/security';
import { X, CheckCircle, AlertTriangle } from 'lucide-react';

interface SecurityReportModalProps {
  report: Report;
  onClose: () => void;
  onResolve: (reportId: string, resolution: { action: 'blocked' | 'warning' | 'none'; note: string }) => void;
}

export default function SecurityReportModal({
  report,
  onClose,
  onResolve
}: SecurityReportModalProps) {
  const [resolution, setResolution] = useState({
    action: 'none' as const,
    note: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onResolve(report.id, resolution);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            Détails du Rapport de Sécurité
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Information du rapport */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Type</p>
              <p className="font-medium">{report.type}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Priorité</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                ${report.priority === 'critical' ? 'bg-red-100 text-red-800' :
                  report.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                  report.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                {report.priority}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date de création</p>
              <p className="font-medium">
                {new Date(report.createdAt).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Statut</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                ${report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  report.status === 'investigating' ? 'bg-blue-100 text-blue-800' :
                  report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                {report.status}
              </span>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">Description</p>
            <p className="text-gray-800 bg-gray-50 p-3 rounded">
              {report.description}
            </p>
          </div>

          {report.evidence && report.evidence.length > 0 && (
            <div>
              <p className="text-sm text-gray-500 mb-2">Preuves</p>
              <div className="space-y-2">
                {report.evidence.map((url, index) => (
                  <a
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-primary-600 hover:text-primary-700 truncate"
                  >
                    {url}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Formulaire de résolution */}
          {report.status !== 'resolved' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Action
                </label>
                <select
                  value={resolution.action}
                  onChange={(e) => setResolution({
                    ...resolution,
                    action: e.target.value as 'blocked' | 'warning' | 'none'
                  })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="none">Aucune action</option>
                  <option value="warning">Avertissement</option>
                  <option value="blocked">Bloquer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note de résolution
                </label>
                <textarea
                  value={resolution.note}
                  onChange={(e) => setResolution({
                    ...resolution,
                    note: e.target.value
                  })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 h-32"
                  placeholder="Ajoutez une note expliquant la résolution..."
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 rounded-lg flex items-center gap-2"
                >
                  <CheckCircle size={16} />
                  Résoudre
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
