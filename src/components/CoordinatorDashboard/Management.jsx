import React from 'react';
import { useCoordinatorState } from '../../hooks/useCoordinatorState';
import { StudentTable } from '../coordinador/StudentTable';

const Management = ({ students }) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-[0px_4px_12px_rgba(0,0,0,0.08)] border border-gray-100/50">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Gestión de Prácticas</h2>
        <button className="bg-ufro-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-all">
          Export Report
        </button>
      </div>
      <StudentTable students={students} />
    </div>
  );
};

export default Management;
