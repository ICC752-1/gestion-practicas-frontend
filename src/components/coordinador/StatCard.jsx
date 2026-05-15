import React from 'react';

export const StatCard = ({ label, value, Icon, variant = 'default' }) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-[0px_4px_12px_rgba(0,0,0,0.08)] flex items-center justify-between border border-gray-100/50">
      <div className="text-center sm:text-left">
        <p className="text-gray-400 text-sm font-medium">{label}</p>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
      </div>
      <div className="bg-gray-50 p-2 rounded-xl">
        <Icon size={44} className="text-ufro-primary" />
      </div>
    </div>
  );
};
