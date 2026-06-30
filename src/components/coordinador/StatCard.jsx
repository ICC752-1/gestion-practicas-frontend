import React from 'react';

export const StatCard = ({ label, value, Icon, variant = 'default' }) => {
  const iconVariants = {
    default: 'text-gray-500',
    progress: 'text-blue-500',
    alert: 'text-amber-500',
    success: 'text-emerald-500',
  };

  const bgVariants = {
    default: 'bg-gray-50',
    progress: 'bg-blue-50',
    alert: 'bg-amber-50',
    success: 'bg-emerald-50',
  };

  return (
    <div className="relative flex min-h-[116px] flex-col justify-between gap-3 overflow-hidden rounded-2xl border border-gray-100/50 bg-white p-3 shadow-[0px_4px_12px_rgba(0,0,0,0.08)] sm:min-h-0 sm:flex-row sm:items-center sm:p-6">
      {/* El bloque de texto se queda fijo en su lugar original */}
      <div className="min-w-0 text-left">
        <p className="text-xs font-medium leading-tight text-gray-400 sm:text-sm">{label}</p>
        <p className="mt-1 text-2xl font-bold text-gray-800 sm:text-3xl">{value}</p>
      </div>
      
      <div className={`${bgVariants[variant] || bgVariants.default} ml-auto flex-shrink-0 rounded-xl p-2 sm:-mr-2 sm:p-3`}>
        <Icon size={28} className={`${iconVariants[variant] || iconVariants.default}`} />
      </div>
    </div>
  );
};
