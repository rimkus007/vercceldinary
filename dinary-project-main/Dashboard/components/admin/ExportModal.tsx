"use client";

import { useState } from "react";
import { X, Download, FileText, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: 'csv' | 'pdf') => void;
  title?: string;
}

export default function ExportModal({
  isOpen,
  onClose,
  onExport,
  title = "Exporter les données",
}: ExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'pdf' | null>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    if (selectedFormat) {
      onExport(selectedFormat);
      onClose();
      setSelectedFormat(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-4 mb-6">
            <p className="text-sm text-gray-600 mb-4">
              Choisissez le format d'export souhaité :
            </p>

            {/* CSV Option */}
            <button
              onClick={() => setSelectedFormat('csv')}
              className={`w-full p-4 border-2 rounded-lg transition-all ${
                selectedFormat === 'csv'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${
                  selectedFormat === 'csv' ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <FileSpreadsheet className={`h-6 w-6 ${
                    selectedFormat === 'csv' ? 'text-blue-600' : 'text-gray-600'
                  }`} />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-medium text-gray-900">Format CSV</h4>
                  <p className="text-sm text-gray-500">
                    Compatible Excel, Google Sheets
                  </p>
                </div>
                {selectedFormat === 'csv' && (
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </button>

            {/* PDF Option */}
            <button
              onClick={() => setSelectedFormat('pdf')}
              className={`w-full p-4 border-2 rounded-lg transition-all ${
                selectedFormat === 'pdf'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${
                  selectedFormat === 'pdf' ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <FileText className={`h-6 w-6 ${
                    selectedFormat === 'pdf' ? 'text-blue-600' : 'text-gray-600'
                  }`} />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-medium text-gray-900">Format PDF</h4>
                  <p className="text-sm text-gray-500">
                    Document imprimable et partageable
                  </p>
                </div>
                {selectedFormat === 'pdf' && (
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              onClick={handleExport}
              disabled={!selectedFormat}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

