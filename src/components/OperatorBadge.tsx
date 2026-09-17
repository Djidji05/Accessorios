import React from 'react';
import { OperatorCode } from '../types';

interface OperatorBadgeProps {
  operator: OperatorCode;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const OPERATOR_CONFIG: Record<
  OperatorCode, 
  { name: string; bg: string; text: string; border: string; badgeBg: string; logoText: string }
> = {
  moncash: {
    name: 'MonCash',
    bg: 'bg-rose-600',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-200',
    badgeBg: 'text-rose-700 dark:text-rose-400',
    logoText: 'MC',
  },
  natcash: {
    name: 'Natcash',
    bg: 'bg-blue-600',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-200',
    badgeBg: 'text-blue-700 dark:text-blue-400',
    logoText: 'NC',
  },
  digicel: {
    name: 'Digicel',
    bg: 'bg-red-600',
    text: 'text-red-600 dark:text-red-400',
    border: 'border-red-200',
    badgeBg: 'text-red-700 dark:text-red-400',
    logoText: 'DIGI',
  },
  natcom: {
    name: 'Natcom',
    bg: 'bg-sky-600',
    text: 'text-sky-600 dark:text-sky-400',
    border: 'border-sky-200',
    badgeBg: 'text-sky-700 dark:text-sky-400',
    logoText: 'NAT',
  },
  claro: {
    name: 'Claro',
    bg: 'bg-red-500',
    text: 'text-red-500 dark:text-red-400',
    border: 'border-red-200',
    badgeBg: 'text-red-700 dark:text-red-400',
    logoText: 'CLA',
  },
  altice: {
    name: 'Altice',
    bg: 'bg-orange-500',
    text: 'text-orange-500 dark:text-orange-400',
    border: 'border-orange-200',
    badgeBg: 'text-orange-700 dark:text-orange-400',
    logoText: 'ALT',
  },
  zelle: {
    name: 'Zelle Pay',
    bg: 'bg-purple-600',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-200',
    badgeBg: 'text-purple-700 dark:text-purple-400',
    logoText: 'ZEL',
  },
};

export const OperatorBadge: React.FC<OperatorBadgeProps> = ({ operator, showText = true, size = 'md' }) => {
  const config = OPERATOR_CONFIG[operator] || {
    name: operator,
    bg: 'bg-slate-700',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-200',
    badgeBg: 'text-slate-800 dark:text-slate-200',
    logoText: operator ? operator.substring(0, 2).toUpperCase() : 'OP',
  };

  const sizeClasses = {
    sm: 'text-xs font-extrabold',
    md: 'text-xs font-black',
    lg: 'text-sm font-black',
  }[size];

  return (
    <span className={`inline-block ${config.text} ${sizeClasses} tracking-tight`}>
      {config.name}
    </span>
  );
};
