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
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    const phonePattern = /^\+?[0-9]+$/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (!formData.supervisorName.trim()) {
      newErrors.supervisorName = 'El nombre del supervisor es obligatorio.';
    }

    if (!formData.supervisorProfession.trim()) {
      newErrors.supervisorProfession = 'La profesión es obligatoria.';
    }

    if (!formData.supervisorPosition.trim()) {
      newErrors.supervisorPosition = 'El cargo es obligatorio.';
    }

    if (!formData.supervisorDepartment.trim()) {
      newErrors.supervisorDepartment = 'El departamento es obligatorio.';
    }

    if (!formData.supervisorEmail.trim()) {
      newErrors.supervisorEmail = 'El correo electrónico es obligatorio.';
    } else if (!emailPattern.test(formData.supervisorEmail.trim())) {
      newErrors.supervisorEmail = 'Ingrese un correo válido (ej: supervisor@empresa.cl).';
    }

    if (!formData.supervisorPhone.trim()) {
      newErrors.supervisorPhone = 'El teléfono es obligatorio.';
    } else if (!phonePattern.test(formData.supervisorPhone.trim())) {
      newErrors.supervisorPhone = 'El teléfono solo puede contener números y opcionalmente + al inicio.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onNext?.(formData);
    }
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
            placeholder="Ej: Pedro Gonzalez Neira"
            className={`w-full h-16 px-6 bg-white rounded-[20px] text-xl text-gray-700 focus:border-[#d22864] focus:ring-1 focus:ring-[#d22864] outline-none transition-all ${errors.supervisorName ? 'border border-red-500' : 'border border-gray-300'}`}
          />
          {errors.supervisorName && <p className="text-sm text-red-600">{errors.supervisorName}</p>}
        </div>

        {/* Profesión */}
        <div className="space-y-3">
          <label className="block text-xl font-bold text-black">Ingrese profesión del Supervisor de Práctica</label>
          <input 
            type="text" 
            name="supervisorProfession"
            value={formData.supervisorProfession}
            onChange={handleChange}
            placeholder="Ej: Ingeniero en Informática"
            className={`w-full h-16 px-6 bg-white rounded-[20px] text-xl text-gray-700 focus:border-[#d22864] focus:ring-1 focus:ring-[#d22864] outline-none transition-all ${errors.supervisorProfession ? 'border border-red-500' : 'border border-gray-300'}`}
          />
          {errors.supervisorProfession && <p className="text-sm text-red-600">{errors.supervisorProfession}</p>}
        </div>

        {/* Cargo */}
        <div className="space-y-3">
          <label className="block text-xl font-bold text-black">Ingrese cargo del Supervisor de Práctica</label>
          <input 
            type="text" 
            name="supervisorPosition"
            value={formData.supervisorPosition}
            onChange={handleChange}
            placeholder="Ej: Jefe de Departamento"
            className={`w-full h-16 px-6 bg-white rounded-[20px] text-xl text-gray-700 focus:border-[#d22864] focus:ring-1 focus:ring-[#d22864] outline-none transition-all ${errors.supervisorPosition ? 'border border-red-500' : 'border border-gray-300'}`}
          />
          {errors.supervisorPosition && <p className="text-sm text-red-600">{errors.supervisorPosition}</p>}
        </div>

        {/* Departamento */}
        <div className="space-y-3">
          <label className="block text-xl font-bold text-black">Departamento o Sección donde se desempeña el Supervisor de Práctica</label>
          <input 
            type="text" 
            name="supervisorDepartment"
            value={formData.supervisorDepartment}
            onChange={handleChange}
            placeholder="Ej: Departamento de Informática"
            className={`w-full h-16 px-6 bg-white rounded-[20px] text-xl text-gray-700 focus:border-[#d22864] focus:ring-1 focus:ring-[#d22864] outline-none transition-all ${errors.supervisorDepartment ? 'border border-red-500' : 'border border-gray-300'}`}
          />
          {errors.supervisorDepartment && <p className="text-sm text-red-600">{errors.supervisorDepartment}</p>}
        </div>

        {/* Email */}
        <div className="space-y-3">
          <label className="block text-xl font-bold text-black">Ingrese correo electrónico del Supervisor de Práctica</label>
          <input 
            type="email" 
            name="supervisorEmail"
            value={formData.supervisorEmail}
            onChange={handleChange}
            placeholder="Ej: pedro.gonzalez@empresa.cl"
            className={`w-full h-16 px-6 bg-white rounded-[20px] text-xl text-gray-700 focus:border-[#d22864] focus:ring-1 focus:ring-[#d22864] outline-none transition-all ${errors.supervisorEmail ? 'border border-red-500' : 'border border-gray-300'}`}
          />
          {errors.supervisorEmail && <p className="text-sm text-red-600">{errors.supervisorEmail}</p>}
        </div>

        {/* Teléfono */}
        <div className="space-y-3">
          <label className="block text-xl font-bold text-black">Ingrese número de teléfono del Supervisor de Práctica</label>
          <input 
            type="tel" 
            name="supervisorPhone"
            value={formData.supervisorPhone}
            onChange={handleChange}
            placeholder="Ej: +56912345678"
            className={`w-full h-16 px-6 bg-white rounded-[20px] text-xl text-gray-700 focus:border-[#d22864] focus:ring-1 focus:ring-[#d22864] outline-none transition-all ${errors.supervisorPhone ? 'border border-red-500' : 'border border-gray-300'}`}
          />
          {errors.supervisorPhone && <p className="text-sm text-red-600">{errors.supervisorPhone}</p>}
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-4">
          <button 
            type="button"
            onClick={onBack}
            className="flex-1 h-16 bg-white text-[#d22864] border border-[#d22864] text-2xl font-bold rounded-[20px] hover:bg-[#f9f4f7] transition-all shadow-sm cursor-pointer"
          >
            Anterior
          </button>
          <button 
            type="submit"
            className="flex-1 h-16 bg-[#d22864] text-white text-2xl font-bold rounded-[20px] hover:opacity-90 transition-opacity shadow-md cursor-pointer"
          >
            Siguiente
          </button>
        </div>
      </form>
    </div>
  );
};
