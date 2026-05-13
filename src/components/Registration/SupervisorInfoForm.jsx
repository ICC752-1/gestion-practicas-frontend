import { useState } from 'react';

export const SupervisorInfoForm = ({ onNext, onBack, initialData = {} }) => {
  const [formData, setFormData] = useState({
    supervisorName: initialData.supervisorName || '',
    supervisorProfession: initialData.supervisorProfession || '',
    supervisorPosition: initialData.supervisorPosition || '',
    supervisorDepartment: initialData.supervisorDepartment || '',
    supervisorEmail: initialData.supervisorEmail || '',
    supervisorPhone: initialData.supervisorPhone || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext?.(formData);
  };

  return (
    <div className="bg-white rounded-[40px] shadow-[0px_4px_30px_#00000015] p-12 w-full max-w-[650px]">
      <h2 className="text-3xl font-bold text-black mb-10">Información del supervisor/a</h2>
      
      <form className="space-y-8" onSubmit={handleSubmit}>
        {/* Nombre completo */}
        <div className="space-y-3">
          <label className="block text-xl font-bold text-black">Ingrese nombre completo del Supervisor de Práctica</label>
          <input 
            type="text" 
            name="supervisorName"
            value={formData.supervisorName}
            onChange={handleChange}
            placeholder="Nombre supervisor/a"
            className="w-full h-16 px-6 bg-white border border-gray-300 rounded-[20px] text-xl text-gray-700 focus:border-[#b13168] focus:ring-1 focus:ring-[#b13168] outline-none transition-all"
          />
        </div>

        {/* Profesión */}
        <div className="space-y-3">
          <label className="block text-xl font-bold text-black">Ingrese profesión del Supervisor de Práctica</label>
          <input 
            type="text" 
            name="supervisorProfession"
            value={formData.supervisorProfession}
            onChange={handleChange}
            placeholder="Profesión supervisor/a"
            className="w-full h-16 px-6 bg-white border border-gray-300 rounded-[20px] text-xl text-gray-700 focus:border-[#b13168] focus:ring-1 focus:ring-[#b13168] outline-none transition-all"
          />
        </div>

        {/* Cargo */}
        <div className="space-y-3">
          <label className="block text-xl font-bold text-black">Ingrese cargo del Supervisor de Práctica</label>
          <input 
            type="text" 
            name="supervisorPosition"
            value={formData.supervisorPosition}
            onChange={handleChange}
            placeholder="Cargo supervisor/a"
            className="w-full h-16 px-6 bg-white border border-gray-300 rounded-[20px] text-xl text-gray-700 focus:border-[#b13168] focus:ring-1 focus:ring-[#b13168] outline-none transition-all"
          />
        </div>

        {/* Departamento */}
        <div className="space-y-3">
          <label className="block text-xl font-bold text-black">Departamento o Sección donde se desempeña el Supervisor de Práctica</label>
          <input 
            type="text" 
            name="supervisorDepartment"
            value={formData.supervisorDepartment}
            onChange={handleChange}
            placeholder="Departamento Supervisor/a"
            className="w-full h-16 px-6 bg-white border border-gray-300 rounded-[20px] text-xl text-gray-700 focus:border-[#b13168] focus:ring-1 focus:ring-[#b13168] outline-none transition-all"
          />
        </div>

        {/* Email */}
        <div className="space-y-3">
          <label className="block text-xl font-bold text-black">Ingrese correo electrónico del Supervisor de Práctica</label>
          <input 
            type="email" 
            name="supervisorEmail"
            value={formData.supervisorEmail}
            onChange={handleChange}
            placeholder="Correo electrónico supervisor/a"
            className="w-full h-16 px-6 bg-white border border-gray-300 rounded-[20px] text-xl text-gray-700 focus:border-[#b13168] focus:ring-1 focus:ring-[#b13168] outline-none transition-all"
          />
        </div>

        {/* Teléfono */}
        <div className="space-y-3">
          <label className="block text-xl font-bold text-black">Ingrese número de teléfono del Supervisor de Práctica</label>
          <input 
            type="tel" 
            name="supervisorPhone"
            value={formData.supervisorPhone}
            onChange={handleChange}
            placeholder="Número de teléfono supervisor/a"
            className="w-full h-16 px-6 bg-white border border-gray-300 rounded-[20px] text-xl text-gray-700 focus:border-[#b13168] focus:ring-1 focus:ring-[#b13168] outline-none transition-all"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-4">
          <button 
            type="button"
            onClick={onBack}
            className="flex-1 h-16 bg-[#b13168] text-white text-2xl font-bold rounded-[20px] hover:opacity-90 transition-opacity shadow-md cursor-pointer"
          >
            Anterior
          </button>
          <button 
            type="submit"
            className="flex-1 h-16 bg-[#b13168] text-white text-2xl font-bold rounded-[20px] hover:opacity-90 transition-opacity shadow-md cursor-pointer"
          >
            Siguiente
          </button>
        </div>
      </form>
    </div>
  );
};
