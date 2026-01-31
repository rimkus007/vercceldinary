'use client';

import React from 'react';
import { type LucideIcon } from 'lucide-react';
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';

interface MerchantStatCardProps {
  title: string;
  value: number;
  Icon: LucideIcon;
  trend?: number;
  format?: 'number' | 'currency' | 'decimal';
  max?: number;
}

function formatValue(value: number, format?: 'number' | 'currency' | 'decimal', max?: number): string {
  if (format === 'currency') {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }
  
  if (format === 'decimal' && max !== undefined) {
    return `${value.toFixed(1)}/${max}`;
  }
  
  return new Intl.NumberFormat('fr-DZ').format(value);
}

const MerchantStatCard: React.FC<MerchantStatCardProps> = ({
  title,
  value,
  Icon,
  trend,
  format = 'number',
  max,
}) => {
  const formattedValue = formatValue(value, format, max);
  
  return (
    <div className="relative p-6 bg-white rounded-lg border border-gray-200">
      <div className="flex justify-between">
        <div>
          <div className="absolute p-3 bg-dinary-turquoise bg-opacity-10 rounded-lg">
            <Icon className="h-6 w-6 text-dinary-turquoise" />
          </div>
          <p className="ml-16 text-sm font-medium text-gray-600 truncate">
            {title}
          </p>
        </div>
        {trend !== undefined && (
          <div className={`inline-flex items-baseline px-2.5 py-0.5 rounded-full text-sm font-medium md:mt-2 lg:mt-0
            ${trend >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
          >
            {trend >= 0 ? (
              <ArrowUpIcon className="-ml-1 mr-0.5 h-4 w-4 flex-shrink-0 self-center text-green-500" />
            ) : (
              <ArrowDownIcon className="-ml-1 mr-0.5 h-4 w-4 flex-shrink-0 self-center text-red-500" />
            )}
            {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </div>
      <p className="ml-16 mt-2 flex items-baseline">
        <span className="text-2xl font-semibold text-gray-900">
          {formattedValue}
        </span>
      </p>
    </div>
  );
};

export default MerchantStatCard;
