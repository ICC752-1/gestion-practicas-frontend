import React from 'react';

export const ReflectionSection = ({ data, onChange }) => {
  return (
    <section className="space-y-10 mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="border-l-4 border-[#d22864] pl-4">
        <h3 className="text-[#d22864] font-bold text-2xl uppercase tracking-tight">Reflexión General</h3>
        <p className="text-gray-500 text-sm font-medium mt-1">Identifique sus fortalezas y áreas de mejora durante este periodo.</p>
      </div>
      
      <div className="grid grid-cols-1 gap-8">
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-gray-800 font-bold text-sm ml-1">
            <span className="flex items-center justify-center w-6 h-6 bg-[#d22864] text-white rounded-full text-[10px]">1</span>
            Mencione las principales fortalezas que identificó durante su práctica <span className="text-red-500">*</span>
          </label>
          <textarea 
            name="strengths"
            value={data.strengths}
            onChange={onChange}
            placeholder="Describa sus puntos fuertes, habilidades aplicadas y logros..."
            className="w-full h-44 px-6 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#d22864]/20 focus:border-[#d22864] resize-none transition-all text-gray-700 leading-relaxed"
            required
          />
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-2 text-gray-800 font-bold text-sm ml-1">
            <span className="flex items-center justify-center w-6 h-6 bg-gray-400 text-white rounded-full text-[10px]">2</span>
            Mencione las principales debilidades o áreas de mejora identificadas
          </label>
          <textarea 
            name="weaknesses"
            value={data.weaknesses}
            onChange={onChange}
            placeholder="¿En qué aspectos siente que puede mejorar? ¿Qué desafíos enfrentó?"
            className="w-full h-44 px-6 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#d22864]/20 focus:border-[#d22864] resize-none transition-all text-gray-700 leading-relaxed"
          />
        </div>
      </div>
    </section>
  );
};
