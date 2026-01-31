'use client';

import React from 'react';

interface PromoBannerProps {
  title: string;
  description: string;
  emoji: string;
  bgColor?: string;
  textColor?: string;
  action?: () => void;
  actionLabel?: string;
}

export default function PromoBanner({
  title,
  description,
  emoji,
  bgColor = 'bg-green-50',
  textColor = 'text-green-800',
  action,
  actionLabel
}: PromoBannerProps) {
  return (
    <div className={`${bgColor} rounded-xl p-4 flex items-center shadow-sm`}>
      <span className="text-2xl mr-3">{emoji}</span>
      <div className="flex-grow">
        <h3 className={`font-bold ${textColor} text-lg`}>{title}</h3>
        <p className={`text-sm ${textColor.replace('800', '700')}`}>
          {description}
        </p>
        {action && actionLabel && (
          <button 
            onClick={action}
            className="mt-2 px-4 py-1 bg-white rounded-full text-sm font-medium shadow-sm"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}