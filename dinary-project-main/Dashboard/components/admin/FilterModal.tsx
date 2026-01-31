"use client";

import { useState } from "react";
import { X, Filter as FilterIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface FilterOption {
  id: string;
  label: string;
  type: 'checkbox' | 'range' | 'select';
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  value?: any;
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: Record<string, any>) => void;
  filters: FilterOption[];
  title?: string;
}

export default function FilterModal({
  isOpen,
  onClose,
  onApply,
  filters,
  title = "Filtres",
}: FilterModalProps) {
  const [selectedFilters, setSelectedFilters] = useState<Record<string, any>>({});

  if (!isOpen) return null;

  const handleFilterChange = (filterId: string, value: any) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterId]: value,
    }));
  };

  const handleApply = () => {
    onApply(selectedFilters);
    onClose();
  };

  const handleReset = () => {
    setSelectedFilters({});
  };

  const activeFiltersCount = Object.keys(selectedFilters).filter(
    key => selectedFilters[key] !== undefined && selectedFilters[key] !== ''
  ).length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <FilterIcon className="h-5 w-5 text-gray-600" />
              <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
              {activeFiltersCount > 0 && (
                <Badge className="bg-blue-100 text-blue-800">
                  {activeFiltersCount}
                </Badge>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Filters */}
          <div className="space-y-6 mb-6">
            {filters.map((filter) => (
              <div key={filter.id}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {filter.label}
                </label>

                {filter.type === 'checkbox' && filter.options && (
                  <div className="space-y-2">
                    {filter.options.map((option) => (
                      <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedFilters[filter.id]?.includes(option.value) || false}
                          onChange={(e) => {
                            const currentValues = selectedFilters[filter.id] || [];
                            const newValues = e.target.checked
                              ? [...currentValues, option.value]
                              : currentValues.filter((v: string) => v !== option.value);
                            handleFilterChange(filter.id, newValues.length > 0 ? newValues : undefined);
                          }}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                )}

                {filter.type === 'select' && filter.options && (
                  <select
                    value={selectedFilters[filter.id] || ''}
                    onChange={(e) => handleFilterChange(filter.id, e.target.value || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Tous</option>
                    {filter.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}

                {filter.type === 'range' && (
                  <div>
                    <input
                      type="range"
                      min={filter.min || 0}
                      max={filter.max || 100}
                      value={selectedFilters[filter.id] || filter.min || 0}
                      onChange={(e) => handleFilterChange(filter.id, parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{filter.min || 0}</span>
                      <span className="font-medium text-blue-600">
                        {selectedFilters[filter.id] || filter.min || 0}
                      </span>
                      <span>{filter.max || 100}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex-1"
              disabled={activeFiltersCount === 0}
            >
              Réinitialiser
            </Button>
            <Button
              onClick={handleApply}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Appliquer
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

