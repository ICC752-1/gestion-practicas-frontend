import React from 'react';
import { ChevronRight } from 'lucide-react';

export const ActionCard = ({ title, description, Icon, onClick }) => {
  return (
    <div onClick={onClick} className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 flex items-center group cursor-pointer hover:shadow-lg transition-all duration-300">
      <div className="mr-6 p-4 bg-gray-50 rounded-2xl group-hover:bg-ufro-primary group-hover:text-white transition-colors duration-300">
        <Icon size={32} className="text-ufro-primary group-hover:text-white transition-colors duration-300" />
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-400 font-medium">{description}</p>
      </div>
      <ChevronRight className="text-gray-300 group-hover:text-ufro-primary transition-colors duration-300" />
    </div>
  );
};
