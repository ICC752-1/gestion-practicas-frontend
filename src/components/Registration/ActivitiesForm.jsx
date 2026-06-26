import { useState } from 'react';
import { Loader2 } from 'lucide-react';

export const ActivitiesForm = ({ onNext, onBack, initialData = {}, isSubmitting = false }) => {
  const [formData, setFormData] = useState({
    act_description: initialData.act_description || '',
    ben_description: Array.isArray(initialData.ben_description) ? initialData.ben_description : [],
    amount: initialData.amount || '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox' && name === 'benefits') {
      const currentBenefits = Array.isArray(formData.ben_description)
        ? formData.ben_description
        : [];
      const newBenefits = checked
        ? [...currentBenefits, value]
        : currentBenefits.filter(b => b !== value);
      setFormData(prev => ({ ...prev, ben_description: newBenefits }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.act_description.trim()) {
      newErrors.act_description = 'La descripción de las actividades es obligatoria.';
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
    { id: 'sin_beneficio', label: 'Sin beneficios' },
    { id: 'locomocion', label: 'Bono locomoción' },
    { id: 'movilizacion', label: 'Movilización organización' },
    { id: 'colacion_bono', label: 'Bono colación' },
    { id: 'colacion_org', label: 'Colación organización' },
    { id: 'alojamiento', label: 'Bono alojamiento' },
    { id: 'ayuda', label: 'Ayuda económica' },
  ];

  const handleBenefitClick = (id) => {
    const current = Array.isArray(formData.ben_description) ? formData.ben_description : [];
    if (id === 'sin_beneficio') {
      const next = current.includes('sin_beneficio') ? [] : ['sin_beneficio'];
      setFormData(prev => ({ ...prev, ben_description: next }));
      return;
    }
    const withoutNone = current.filter(b => b !== 'sin_beneficio');
    const next = withoutNone.includes(id)
      ? withoutNone.filter(b => b !== id)
      : [...withoutNone, id];
    setFormData(prev => ({ ...prev, ben_description: next }));
  };

  return (
    <div className="bg-white rounded-3xl shadow-[0px_4px_26px_#00000012] p-8 md:p-10 w-full max-w-[580px] mx-auto border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Actividades y Beneficios</h2>

      <form className="space-y-5" onSubmit={handleSubmit}>
        {/* Actividades */}
        <div className="space-y-2">
          <label className="block text-base font-bold text-gray-800">
            Actividades a realizar en su práctica
          </label>
          <p className="text-gray-500 text-sm">
            Las actividades deben tributar a los resultados de aprendizaje del programa de asignatura.
          </p>
          <textarea
            name="act_description"
            value={formData.act_description}
            onChange={handleChange}
            placeholder="Describa las actividades que realizará..."
            className={`w-full h-32 px-4 py-3 bg-white rounded-2xl text-base text-gray-700 focus:border-[#d22864] focus:ring-1 focus:ring-[#d22864] outline-none transition-all resize-none ${errors.act_description ? 'border border-red-500' : 'border border-gray-300'}`}
          />
          {errors.act_description && <p className="text-xs text-red-600">{errors.act_description}</p>}
        </div>

        {/* Beneficios */}
        <div className="space-y-2">
          <label className="block text-base font-bold text-gray-800">
            Beneficios que entregará la organización (opcional)
          </label>
          <div className="space-y-2">
            {benefitOptions.map(benefit => {
              const isChecked = formData.ben_description.includes(benefit.id);
              const isNone = benefit.id === 'sin_beneficio';
              return (
                <div
                  key={benefit.id}
                  onClick={() => handleBenefitClick(benefit.id)}
                  className={`flex items-center gap-4 p-3.5 rounded-2xl cursor-pointer transition-colors border ${
                    isChecked
                      ? isNone
                        ? 'border-gray-400 bg-gray-100'
                        : 'border-[#d22864] bg-[#ffe7f0]/40'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                    isChecked
                      ? isNone ? 'bg-gray-500 border-gray-500' : 'bg-[#d22864] border-[#d22864]'
                      : 'bg-white border-gray-400'
                  }`}>
                    {isChecked && (
                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-base ${isNone ? 'text-gray-500 italic' : 'text-gray-700'}`}>
                    {benefit.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Monto */}
        <div className="space-y-2">
          <label className="block text-base font-bold text-gray-800">
            Monto de apoyo económico
          </label>
          <p className="text-gray-500 text-sm">
            Si no existe apoyo monetario, ingrese 0.
          </p>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="0"
            min="0"
            className="w-full h-13 px-5 bg-white border border-gray-300 rounded-2xl text-base text-gray-700 focus:border-[#d22864] focus:ring-1 focus:ring-[#d22864] outline-none transition-all"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            className="flex-1 h-13 bg-white text-[#d22864] border border-[#d22864] text-lg font-bold rounded-2xl hover:bg-[#f9f4f7] transition-all cursor-pointer"
          >
            Anterior
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 h-13 bg-[#d22864] text-white text-lg font-bold rounded-2xl hover:opacity-90 transition-opacity shadow-sm cursor-pointer disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin" size={18} />
                Registrando
              </span>
            ) : (
              'Finalizar'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};