import { useState } from 'react';

export const OrganizationInfoForm = ({ onNext, onBack, initialData = {} }) => {
  const [formData, setFormData] = useState({
    org_name: initialData.org_name || '',
    sector: initialData.sector || '',
    address: initialData.address || '',
    city: initialData.city || '',
    org_phone: initialData.org_phone || '',
    web: initialData.web || '',
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

    if (!formData.org_name.trim()) {
      newErrors.org_name = 'El nombre de la organización es obligatorio.';
    }

    if (!formData.sector.trim()) {
      newErrors.sector = 'El rubro de la organización es obligatorio.';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'La dirección es obligatoria.';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'La ciudad es obligatoria.';
    }

    if (!formData.org_phone.trim()) {
      newErrors.org_phone = 'El teléfono es obligatorio.';
    } else if (!phonePattern.test(formData.org_phone.trim())) {
      newErrors.org_phone = 'Ingrese un teléfono válido. Puede incluir + al inicio.';
    }

    if (!formData.web.trim()) {
      newErrors.web = 'La página web es obligatoria.';
    } else if (!/^[a-zA-Z0-9]+([.-]?[a-zA-Z0-9]+)*\.[a-zA-Z]{2,}(.*)?$/i.test(formData.web.trim())) {
      newErrors.web = 'Ingrese una URL válida (ej: empresa.cl o https://empresa.cl)';
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
    <div className="bg-white rounded-3xl shadow-[0px_4px_26px_#00000012] p-8 md:p-10 w-full max-w-[580px] mx-auto border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Información de la organización</h2>
      
      <form className="space-y-5" onSubmit={handleSubmit}>
        {/* Organización */}
        <div className="space-y-2">
          <label className="block text-base font-bold text-gray-800">Nombre de la organización</label>
          <input 
            type="text" 
            name="org_name"
            value={formData.org_name}
            onChange={handleChange}
            placeholder="Ej: Organización S.A"
            className={`w-full h-13 px-5 bg-white rounded-2xl text-base text-gray-700 focus:border-[#d22864] focus:ring-1 focus:ring-[#d22864] outline-none transition-all ${errors.org_name ? 'border border-red-500' : 'border border-gray-300'}`}
          />
          {errors.org_name && <p className="text-xs text-red-600">{errors.org_name}</p>}
        </div>

        {/* Rubro */}
        <div className="space-y-2">
          <label className="block text-base font-bold text-gray-800">Rubro de la organización</label>
          <input 
            type="text" 
            name="sector"
            value={formData.sector}
            onChange={handleChange}
            placeholder="Ej: Consultoría tecnológica"
            className={`w-full h-13 px-5 bg-white rounded-2xl text-base text-gray-700 focus:border-[#d22864] focus:ring-1 focus:ring-[#d22864] outline-none transition-all ${errors.sector ? 'border border-red-500' : 'border border-gray-300'}`}
          />
          {errors.sector && <p className="text-xs text-red-600">{errors.sector}</p>}
        </div>

        {/* Dirección casa matriz */}
        <div className="space-y-2">
          <label className="block text-base font-bold text-gray-800">Dirección de la casa matriz</label>
          <input 
            type="text" 
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Calle y número. Ej. Av. Francisco Salazar 01145"
            className={`w-full h-13 px-5 bg-white rounded-2xl text-base text-gray-700 focus:border-[#d22864] focus:ring-1 focus:ring-[#d22864] outline-none transition-all ${errors.address ? 'border border-red-500' : 'border border-gray-300'}`}
          />
          {errors.address && <p className="text-xs text-red-600">{errors.address}</p>}
        </div>

        {/* Ciudad */}
        <div className="space-y-2">
          <label className="block text-base font-bold text-gray-800">Ciudad donde se encuentra la casa matriz</label>
          <input 
            type="text" 
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="Ej: Temuco"
            className={`w-full h-13 px-5 bg-white rounded-2xl text-base text-gray-700 focus:border-[#d22864] focus:ring-1 focus:ring-[#d22864] outline-none transition-all ${errors.city ? 'border border-red-500' : 'border border-gray-300'}`}
          />
          {errors.city && <p className="text-xs text-red-600">{errors.city}</p>}
        </div>

        {/* Teléfono */}
        <div className="space-y-2">
          <label className="block text-base font-bold text-gray-800">Teléfono de la organización</label>
          <input 
            type="tel" 
            name="org_phone"
            value={formData.org_phone}
            onChange={handleChange}
            placeholder="Ej: +56912356789"
            className={`w-full h-13 px-5 bg-white rounded-2xl text-base text-gray-700 focus:border-[#d22864] focus:ring-1 focus:ring-[#d22864] outline-none transition-all ${errors.org_phone ? 'border border-red-500' : 'border border-gray-300'}`}
          />
          {errors.org_phone && <p className="text-xs text-red-600">{errors.org_phone}</p>}
        </div>

        {/* Página web */}
        <div className="space-y-2">
          <label className="block text-base font-bold text-gray-800">Página web</label>
          <input 
            type="text" 
            name="web"
            value={formData.web}
            onChange={handleChange}
            placeholder="Ej: empresa.cl o https://empresa.cl"
            className={`w-full h-13 px-5 bg-white rounded-2xl text-base text-gray-700 focus:border-[#d22864] focus:ring-1 focus:ring-[#d22864] outline-none transition-all ${errors.web ? 'border border-red-500' : 'border border-gray-300'}`}
          />
          {errors.web && <p className="text-xs text-red-600">{errors.web}</p>}
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-4">
          <button 
            type="button"
            onClick={onBack}
            className="flex-1 h-13 bg-white text-[#d22864] border border-[#d22864] text-lg font-bold rounded-2xl hover:bg-[#f9f4f7] transition-all cursor-pointer"
          >
            Anterior
          </button>
          <button 
            type="submit"
            className="flex-1 h-13 bg-[#d22864] text-white text-lg font-bold rounded-2xl hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
          >
            Siguiente
          </button>
        </div>
      </form>
    </div>
  );
};