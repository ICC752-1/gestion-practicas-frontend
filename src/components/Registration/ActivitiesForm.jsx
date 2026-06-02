import { useState } from 'react';

export const ActivitiesForm = ({ onNext, onBack, initialData = {} }) => {
  const [formData, setFormData] = useState({
    activities: initialData.activities || '',
    benefits: Array.isArray(initialData.benefits)
      ? initialData.benefits
      : initialData.benefits
        ? initialData.benefits.split(", ")
        : [],
    paymentAmount: initialData.paymentAmount || '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox' && name === 'benefits') {
      const newBenefits = checked
        ? [...formData.benefits, value]
        : formData.benefits.filter(b => b !== value);
      setFormData(prev => ({ ...prev, benefits: newBenefits }));
      setErrors(prev => ({ ...prev, benefits: '' }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.activities.trim()) {
      newErrors.activities = 'La descripción de las actividades es obligatoria.';
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
      <h2 className="text-3xl font-bold text-black mb-10">Actividades a Realizar y Beneficios</h2>

      <form className="space-y-10" onSubmit={handleSubmit}>
        {/* Actividades */}
        <div className="space-y-4">
          <label className="block text-xl font-bold text-black">
            Mencione las principales actividades a realizar en su práctica
          </label>
          <p className="text-gray-500 text-sm">
            Recuerde que las actividades deben tributar a los resultados de aprendizaje del programa de asignatura de su práctica.
          </p>
          <textarea
            name="activities"
            value={formData.activities}
            onChange={handleChange}
            placeholder="Describa las actividades que realizará..."
            className={`w-full h-40 p-6 bg-white rounded-[20px] text-xl text-gray-700 focus:border-[#d22864] focus:ring-1 focus:ring-[#d22864] outline-none transition-all resize-none ${errors.activities ? 'border border-red-500' : 'border border-gray-300'}`}
          />
          {errors.activities && <p className="text-sm text-red-600">{errors.activities}</p>}
        </div>

        {/* Beneficios */}
        <div className="space-y-4">
          <label className="block text-xl font-bold text-black">
            Seleccione los beneficios que entregará la organización (opcional)
          </label>
          <div className="space-y-3">
            {benefitOptions.map(benefit => (
              <label
                key={benefit.id}
                className={`flex items-center gap-3 p-4 rounded-[20px] cursor-pointer transition-colors border ${
                  formData.benefits.includes(benefit.id)
                    ? 'border-[#d22864] bg-[#ffe7f0]'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  name="benefits"
                  value={benefit.id}
                  checked={formData.benefits.includes(benefit.id)}
                  onChange={handleChange}
                  className="w-6 h-6 accent-[#d22864]"
                />
                <span className="text-xl text-gray-700">{benefit.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Monto */}
        <div className="space-y-4">
          <label className="block text-xl font-bold text-black">
            Ingrese el monto de apoyo económico
          </label>
          <p className="text-gray-500 text-sm">
            Si no existe apoyo monetario, ingrese 0.
          </p>
          <input
            type="number"
            name="paymentAmount"
            value={formData.paymentAmount}
            onChange={handleChange}
            placeholder="0"
            min="0"
            className="w-full h-16 px-6 bg-white border border-gray-300 rounded-[20px] text-xl text-gray-700 focus:border-[#d22864] focus:ring-1 focus:ring-[#d22864] outline-none transition-all"
          />
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
            Finalizar
          </button>
        </div>
      </form>
    </div>
  );
};