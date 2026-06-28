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
    <div className="bg-white rounded-2xl p-6 shadow-[0px_4px_12px_rgba(0,0,0,0.08)] flex items-center border border-gray-100/50 relative overflow-hidden">
      {/* El bloque de texto se queda fijo en su lugar original */}
      <div className="text-center sm:text-left">
        <p className="text-gray-400 text-sm font-medium">{label}</p>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
      </div>
      
      <div className={`${bgVariants[variant] || bgVariants.default} p-3 rounded-xl ml-auto -mr-2 flex-shrink-0`}>
        <Icon size={32} className={`${iconVariants[variant] || iconVariants.default}`} />
      </div>
    </div>
  );
};