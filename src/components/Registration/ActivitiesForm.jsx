import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { BENEFIT_OPTIONS } from '../../constants/benefits';

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
            name="act_description"
            value={formData.act_description}
            onChange={handleChange}
            placeholder="Describa las actividades que realizará..."
            className={`w-full h-40 p-6 bg-white rounded-[20px] text-xl text-gray-700 focus:border-[#d22864] focus:ring-1 focus:ring-[#d22864] outline-none transition-all resize-none ${errors.activities ? 'border border-red-500' : 'border border-gray-300'}`}
          />
          {errors.act_description && <p className="text-sm text-red-600">{errors.act_description}</p>}
        </div>

        {/* Beneficios */}
        <div className="space-y-4">
          <label className="block text-xl font-bold text-black">
            Seleccione los beneficios que entregará la organización (opcional)
          </label>
          <div className="space-y-3">
            {BENEFIT_OPTIONS.map(benefit => (
              <div
                key={benefit.id}
                onClick={() => {
                  const currentBenefits = Array.isArray(formData.ben_description) 
                    ? formData.ben_description 
                    : [];
                  const newBenefits = currentBenefits.includes(benefit.id)
                    ? currentBenefits.filter(b => b !== benefit.id)
                    : [...currentBenefits, benefit.id];
                  setFormData(prev => ({ ...prev, ben_description: newBenefits }));
                }}
                className={`flex items-center gap-3 p-4 rounded-[20px] cursor-pointer transition-colors border ${
                  formData.ben_description.includes(benefit.id)
                    ? 'border-[#d22864] bg-[#ffe7f0]'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                  formData.ben_description.includes(benefit.id)
                    ? 'bg-[#d22864] border-[#d22864]'
                    : 'bg-white border-gray-400'
                }`}>
                  {formData.ben_description.includes(benefit.id) && (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-xl text-gray-700">{benefit.label}</span>
              </div>
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
            name="amount"
            value={formData.amount}
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
            disabled={isSubmitting}
            className="flex-1 h-16 bg-white text-[#d22864] border border-[#d22864] text-2xl font-bold rounded-[20px] hover:bg-[#f9f4f7] transition-all shadow-sm cursor-pointer"
          >
            Anterior
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 h-16 bg-[#d22864] text-white text-2xl font-bold rounded-[20px] hover:opacity-90 transition-opacity shadow-md cursor-pointer disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin" size={22} />
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
