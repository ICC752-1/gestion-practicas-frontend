import { useState } from 'react';

export const ActivitiesForm = ({ onNext, onBack, initialData = {} }) => {
  const [formData, setFormData] = useState({
    activities: initialData.activities || '',
    benefits: initialData.benefits || [],
    paymentAmount: initialData.paymentAmount || '',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox' && name === 'benefits') {
      const newBenefits = checked 
        ? [...formData.benefits, value] 
        : formData.benefits.filter(b => b !== value);
      setFormData(prev => ({ ...prev, benefits: newBenefits }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext?.(formData);
  };

  const benefitOptions = [
    { id: 'locomocion', label: 'Bono locomoción' },
    { id: 'movilizacion', label: 'Movilización organización' },
    { id: 'colacion_bono', label: 'Bono colación' },
    { id: 'colacion_org', label: 'Colación organización' },
    { id: 'alojamiento', label: 'Bono alojamiento' },
    { id: 'ayuda', label: 'Ayuda económica' },
  ];

  return (
    <div className="bg-white rounded-[40px] shadow-[0px_4px_30px_#00000015] p-12 w-full max-w-[650px]">
      <h2 className="text-3xl font-bold text-black mb-10 text-center">Actividades a Realizar y Beneficios de la organización</h2>
      
      <form className="space-y-10" onSubmit={handleSubmit}>
        {/* Actividades */}
        <div className="space-y-4">
          <label className="block text-xl font-bold text-black text-center">Mencione las principales actividades a realizar en su práctica</label>
          <p className="text-gray-500 text-sm text-center">Recuerde que las actividades a realizar deben tributar a los resultados de aprendizaje del programa de asignatura de su práctica</p>
          <textarea 
            name="activities"
            value={formData.activities}
            onChange={handleChange}
            placeholder="Recuerde que las actividades..."
            className="w-full h-40 p-6 bg-white border border-gray-300 rounded-[20px] text-xl text-gray-700 focus:border-[#b13168] focus:ring-1 focus:ring-[#b13168] outline-none transition-all resize-none"
          />
        </div>

        {/* Beneficios */}
        <div className="space-y-6">
          <label className="block text-xl font-bold text-black text-center leading-tight">Seleccione el o los beneficios que se le entregarán por parte de la Organización (sólo si los hay)</label>
          <div className="space-y-3">
            {benefitOptions.map(benefit => (
              <label key={benefit.id} className="flex items-center gap-3 p-4 border border-gray-300 rounded-[20px] cursor-pointer hover:bg-gray-50 transition-colors">
                <input 
                  type="checkbox" 
                  name="benefits" 
                  value={benefit.id} 
                  checked={formData.benefits.includes(benefit.id)}
                  onChange={handleChange}
                  className="w-6 h-6 accent-[#b13168]"
                />
                <span className="text-xl text-gray-700">{benefit.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Cantidad de dinero */}
        <div className="space-y-4">
          <label className="block text-xl font-bold text-black text-center">Ingrese una cantidad de dinero</label>
          <input 
            type="text" 
            name="paymentAmount"
            value={formData.paymentAmount}
            onChange={handleChange}
            placeholder="$XYZ"
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
