import React from 'react';

export const SupervisorSection = ({ data, onChange }) => {
  return (
    <section className="bg-white rounded-2xl p-6 md:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-50 mb-10">
      <div className="mb-8">
        <h3 className="text-[#d22864] font-bold text-xl mb-1">Información del supervisor</h3>
        <p className="text-gray-500 text-sm font-medium">Por favor, ingrese los datos de contacto de su supervisor/a de práctica.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <label className="block text-gray-700 font-bold text-sm ml-1">
            Nombre completo del Supervisor/a <span className="text-red-500">*</span>
          </label>
          <input 
            type="text"
            name="supervisorName"
            value={data.supervisorName}
            onChange={onChange}
            placeholder="Ej: Juan Pérez"
            className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d22864]/20 focus:border-[#d22864] focus:bg-white transition-all text-gray-800 placeholder:text-gray-400"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="block text-gray-700 font-bold text-sm ml-1">
            Correo electrónico <span className="text-red-500">*</span>
          </label>
          <input 
            type="email"
            name="supervisorEmail"
            value={data.supervisorEmail}
            onChange={onChange}
            placeholder="ejemplo@correo.com"
            className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d22864]/20 focus:border-[#d22864] focus:bg-white transition-all text-gray-800 placeholder:text-gray-400"
            required
          />
        </div>
      </div>
    </section>
  );
};
