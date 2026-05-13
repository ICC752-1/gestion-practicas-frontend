import { useState } from 'react';

export const OrganizationInfoForm = ({ onNext, onBack, initialData = {} }) => {
  const [formData, setFormData] = useState({
    organizationName: initialData.organizationName || '',
    sector: initialData.sector || '',
    address: initialData.address || '',
    phone: initialData.phone || '',
    website: initialData.website || '',
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
      <h2 className="text-3xl font-bold text-black mb-10">Información de la organización</h2>
      
      <form className="space-y-8" onSubmit={handleSubmit}>
        {/* Organización */}
        <div className="space-y-3">
          <label className="block text-2xl font-bold text-black">Organización</label>
          <input 
            type="text" 
            name="organizationName"
            value={formData.organizationName}
            onChange={handleChange}
            placeholder="Nombre Organización S.A"
            className="w-full h-16 px-6 bg-white border border-gray-300 rounded-[20px] text-xl text-gray-700 focus:border-[#b13168] focus:ring-1 focus:ring-[#b13168] outline-none transition-all"
          />
        </div>

        {/* Rubro */}
        <div className="space-y-3">
          <label className="block text-2xl font-bold text-black">Rubro</label>
          <input 
            type="text" 
            name="sector"
            value={formData.sector}
            onChange={handleChange}
            placeholder="Rubro en que opera la empresa"
            className="w-full h-16 px-6 bg-white border border-gray-300 rounded-[20px] text-xl text-gray-700 focus:border-[#b13168] focus:ring-1 focus:ring-[#b13168] outline-none transition-all"
          />
        </div>

        {/* Dirección casa matriz */}
        <div className="space-y-3">
          <label className="block text-2xl font-bold text-black">Dirección casa matriz</label>
          <input 
            type="text" 
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Av. Francisco Salazar 01145, Temuco..."
            className="w-full h-16 px-6 bg-white border border-gray-300 rounded-[20px] text-xl text-gray-700 focus:border-[#b13168] focus:ring-1 focus:ring-[#b13168] outline-none transition-all"
          />
        </div>

        {/* Teléfono */}
        <div className="space-y-3">
          <label className="block text-2xl font-bold text-black">Teléfono</label>
          <input 
            type="tel" 
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="123456789"
            className="w-full h-16 px-6 bg-white border border-gray-300 rounded-[20px] text-xl text-gray-700 focus:border-[#b13168] focus:ring-1 focus:ring-[#b13168] outline-none transition-all"
          />
        </div>

        {/* Página web */}
        <div className="space-y-3">
          <label className="block text-2xl font-bold text-black">Página web</label>
          <input 
            type="url" 
            name="website"
            value={formData.website}
            onChange={handleChange}
            placeholder="https://fica.ufro.cl/"
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
